
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';
import { apiRequest } from '@/lib/queryClient';
import { 
  Calendar, 
  User, 
  DollarSign, 
  MessageSquare, 
  FileText, 
  Clock,
  Edit,
  Download
} from 'lucide-react';

interface ClaimDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  claim?: any;
}

export function ClaimDetails({ isOpen, onClose, claim }: ClaimDetailsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');
  const [newStatus, setNewStatus] = useState('');

  const { data: claimComments = [] } = useQuery({
    queryKey: ['/api/claims', claim?.id, 'comments'],
    enabled: !!claim?.id,
  });

  const { data: claimWorkflow = [] } = useQuery({
    queryKey: ['/api/claims', claim?.id, 'workflow'],
    enabled: !!claim?.id,
  });

  const { data: claimAttachments = [] } = useQuery({
    queryKey: ['/api/claims', claim?.id, 'attachments'],
    enabled: !!claim?.id,
  });

  const addCommentMutation = useMutation({
    mutationFn: async (commentData: any) => {
      const response = await apiRequest('POST', `/api/claims/${claim.id}/comments`, commentData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/claims', claim?.id, 'comments'] });
      setNewComment('');
      toast({
        title: 'Başarılı',
        description: 'Yorum eklendi',
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (statusData: any) => {
      const response = await apiRequest('PUT', `/api/claims/${claim.id}/status`, statusData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/claims'] });
      queryClient.invalidateQueries({ queryKey: ['/api/claims', claim?.id, 'workflow'] });
      toast({
        title: 'Başarılı',
        description: 'Durum güncellendi',
      });
    },
  });

  const handleAddComment = () => {
    if (newComment.trim()) {
      addCommentMutation.mutate({
        comment: newComment,
        commentBy: user?.id,
        isInternal: false,
      });
    }
  };

  const handleStatusUpdate = () => {
    if (newStatus && newStatus !== claim?.status) {
      updateStatusMutation.mutate({
        fromStatus: claim?.status,
        toStatus: newStatus,
        changedBy: user?.id,
        changeReason: `Durum ${claim?.status}'dan ${newStatus}'a güncellendi`,
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'OPEN': return 'destructive';
      case 'UNDER_REVIEW': return 'default';
      case 'RESOLVED': return 'secondary';
      case 'CLOSED': return 'outline';
      default: return 'default';
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'destructive';
      case 'HIGH': return 'destructive';
      case 'MEDIUM': return 'default';
      case 'LOW': return 'secondary';
      default: return 'default';
    }
  };

  if (!claim) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Şikayet Detayları - {claim.customerClaimNo}</span>
            <div className="flex gap-2">
              <Badge variant={getStatusBadgeVariant(claim.status)}>
                {claim.status}
              </Badge>
              <Badge variant={getPriorityBadgeVariant(claim.priority)}>
                {claim.priority}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Detaylar</TabsTrigger>
            <TabsTrigger value="comments">Yorumlar</TabsTrigger>
            <TabsTrigger value="workflow">Süreç</TabsTrigger>
            <TabsTrigger value="attachments">Dosyalar</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Temel Bilgiler</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Müşteri:</span>
                    <span>{claim.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Şikayet No:</span>
                    <span>{claim.customerClaimNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Hata Tipi:</span>
                    <span>{claim.defectType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Kalite Alarm No:</span>
                    <span>{claim.qualityAlarmNo || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Tarih:</span>
                    <span>{new Date(claim.claimDate).toLocaleDateString('tr-TR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Departman:</span>
                    <span>{claim.claimRelatedDepartment}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Cost and Financial */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Mali Bilgiler</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Maliyet:</span>
                    <span className="font-bold text-red-600">
                      {claim.costAmount 
                        ? `${claim.costAmount} ${claim.currency}`
                        : 'Belirlenmedi'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">GAS SAP No:</span>
                    <span>{claim.gasClaimSapNo || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Müşteri Ref No:</span>
                    <span>{claim.customerRefNo || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">GPQ No:</span>
                    <span>{claim.gpqNo || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">GPQ Sorumlusu:</span>
                    <span>{claim.gpqResponsiblePerson || '-'}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Part Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Parça Bilgileri</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Parça Adı:</span>
                    <span>{claim.gasPartName || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Parça Ref No:</span>
                    <span>{claim.gasPartRefNo || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">NOK Miktar:</span>
                    <span>{claim.nokQuantity || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Tedarikçi:</span>
                    <span>{claim.supplierName || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">HBR No:</span>
                    <span>{claim.hbrNo || '-'}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ek Bilgiler</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Tespit Yeri:</span>
                    <span>{claim.detectionLocation || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">PPM Tipi:</span>
                    <span>{claim.ppmType || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Şikayet Tipi:</span>
                    <span>{claim.claimType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Oluşturan:</span>
                    <span>{claim.claimCreatorName || user?.name}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Issue Description */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sorun Açıklaması</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {claim.issueDescription}
                </p>
              </CardContent>
            </Card>

            {/* Status Management */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Durum Yönetimi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-2">
                      Yeni Durum
                    </label>
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Durum seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OPEN">Açık</SelectItem>
                        <SelectItem value="UNDER_REVIEW">İncelemede</SelectItem>
                        <SelectItem value="RESOLVED">Çözüldü</SelectItem>
                        <SelectItem value="CLOSED">Kapandı</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    onClick={handleStatusUpdate}
                    disabled={!newStatus || newStatus === claim.status}
                  >
                    Durumu Güncelle
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comments" className="space-y-4">
            {/* Add Comment */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Yeni Yorum Ekle</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Yorumunuzu yazın..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                  />
                  <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Yorum Ekle
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Comments List */}
            <div className="space-y-4">
              {claimComments.map((comment: any) => (
                <Card key={comment.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="font-medium">{comment.commentByName}</span>
                        {comment.isInternal && (
                          <Badge variant="outline" className="text-xs">İç Görüş</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="h-3 w-3" />
                        {new Date(comment.createdAt).toLocaleString('tr-TR')}
                      </div>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{comment.comment}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="workflow" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Süreç Geçmişi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {claimWorkflow.map((item: any, index: number) => (
                    <div key={item.id} className="flex items-start gap-4 pb-4 border-b last:border-b-0">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">
                            {item.fromStatus ? `${item.fromStatus} → ${item.toStatus}` : `Başlangıç: ${item.toStatus}`}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(item.changedAt).toLocaleString('tr-TR')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{item.changeReason}</p>
                        <p className="text-xs text-gray-500">Değiştiren: {item.changedByName}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attachments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ekli Dosyalar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {claimAttachments.map((attachment: any) => (
                    <div key={attachment.id} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-5 w-5 text-blue-500" />
                        <span className="font-medium truncate">{attachment.fileName}</span>
                      </div>
                      <div className="text-sm text-gray-500 mb-2">
                        <p>Boyut: {(attachment.fileSize / 1024).toFixed(1)} KB</p>
                        <p>Yükleyen: {attachment.uploadedByName}</p>
                        <p>Tarih: {new Date(attachment.uploadedAt).toLocaleDateString('tr-TR')}</p>
                      </div>
                      <Button variant="outline" size="sm" className="w-full">
                        <Download className="mr-2 h-4 w-4" />
                        İndir
                      </Button>
                    </div>
                  ))}
                  {claimAttachments.length === 0 && (
                    <p className="text-gray-500 col-span-full text-center py-8">
                      Henüz dosya eklenmemiş
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
