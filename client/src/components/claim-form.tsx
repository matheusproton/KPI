
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';
import { apiRequest } from '@/lib/queryClient';
import { Upload, X } from 'lucide-react';

interface ClaimFormProps {
  isOpen: boolean;
  onClose: () => void;
  claim?: any;
}

export function ClaimForm({ isOpen, onClose, claim }: ClaimFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      customerName: '',
      defectType: '',
      customerClaimNo: '',
      qualityAlarmNo: '',
      claimDate: new Date().toISOString().split('T')[0],
      gasClaimSapNo: '',
      detectionLocation: '',
      gasPartName: '',
      gasPartRefNo: '',
      nokQuantity: '',
      claimType: 'QUALITY',
      costAmount: '',
      currency: 'EUR',
      status: 'OPEN',
      issueDescription: '',
      ppmType: '',
      claimRelatedDepartment: 'Quality',
      customerRefNo: '',
      gpqNo: '',
      gpqResponsiblePerson: '',
      supplierName: '',
      hbrNo: '',
      priority: 'MEDIUM'
    }
  });

  useEffect(() => {
    if (claim) {
      Object.keys(claim).forEach(key => {
        if (key === 'claimDate') {
          setValue(key, new Date(claim[key]).toISOString().split('T')[0]);
        } else {
          setValue(key, claim[key] || '');
        }
      });
    } else {
      reset();
    }
  }, [claim, setValue, reset]);

  const createClaimMutation = useMutation({
    mutationFn: async (data: any) => {
      const url = claim ? `/api/claims/${claim.id}` : '/api/claims';
      const method = claim ? 'PUT' : 'POST';
      
      const response = await apiRequest(method, url, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/claims'] });
      queryClient.invalidateQueries({ queryKey: ['/api/claims/stats'] });
      toast({
        title: 'Başarılı',
        description: claim ? 'Şikayet güncellendi' : 'Yeni şikayet oluşturuldu',
      });
      onClose();
      reset();
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message || 'İşlem sırasında hata oluştu',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: any) => {
    createClaimMutation.mutate({
      ...data,
      claimCreator: user?.id,
      nokQuantity: data.nokQuantity ? parseInt(data.nokQuantity) : null,
      costAmount: data.costAmount ? parseFloat(data.costAmount) : null,
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {claim ? 'Şikayet Düzenle' : 'Yeni Şikayet Oluştur'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Temel Bilgiler</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerName">Müşteri Adı *</Label>
                <Input
                  id="customerName"
                  {...register('customerName', { required: 'Müşteri adı gerekli' })}
                />
                {errors.customerName && (
                  <p className="text-sm text-red-600">{errors.customerName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="customerClaimNo">Müşteri Şikayet No *</Label>
                <Input
                  id="customerClaimNo"
                  {...register('customerClaimNo', { required: 'Şikayet numarası gerekli' })}
                />
                {errors.customerClaimNo && (
                  <p className="text-sm text-red-600">{errors.customerClaimNo.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="defectType">Hata Tipi *</Label>
                <Input
                  id="defectType"
                  {...register('defectType', { required: 'Hata tipi gerekli' })}
                />
                {errors.defectType && (
                  <p className="text-sm text-red-600">{errors.defectType.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="qualityAlarmNo">Kalite Alarm No</Label>
                <Input
                  id="qualityAlarmNo"
                  {...register('qualityAlarmNo')}
                />
              </div>

              <div>
                <Label htmlFor="claimDate">Şikayet Tarihi *</Label>
                <Input
                  id="claimDate"
                  type="date"
                  {...register('claimDate', { required: 'Tarih gerekli' })}
                />
                {errors.claimDate && (
                  <p className="text-sm text-red-600">{errors.claimDate.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="gasClaimSapNo">GAS Claim SAP No</Label>
                <Input
                  id="gasClaimSapNo"
                  {...register('gasClaimSapNo')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Part Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Parça Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gasPartName">GAS Parça Adı</Label>
                <Input
                  id="gasPartName"
                  {...register('gasPartName')}
                />
              </div>

              <div>
                <Label htmlFor="gasPartRefNo">GAS Parça Ref No</Label>
                <Input
                  id="gasPartRefNo"
                  {...register('gasPartRefNo')}
                />
              </div>

              <div>
                <Label htmlFor="nokQuantity">NOK Miktar</Label>
                <Input
                  id="nokQuantity"
                  type="number"
                  {...register('nokQuantity')}
                />
              </div>

              <div>
                <Label htmlFor="supplierName">Tedarikçi Adı</Label>
                <Input
                  id="supplierName"
                  {...register('supplierName')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Claim Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Şikayet Detayları</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="claimType">Şikayet Tipi *</Label>
                  <Select onValueChange={(value) => setValue('claimType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Şikayet tipi seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WARRANTY">Garanti</SelectItem>
                      <SelectItem value="QUALITY">Kalite</SelectItem>
                      <SelectItem value="DELIVERY">Teslimat</SelectItem>
                      <SelectItem value="OTHER">Diğer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority">Öncelik</Label>
                  <Select onValueChange={(value) => setValue('priority', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Öncelik seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Düşük</SelectItem>
                      <SelectItem value="MEDIUM">Orta</SelectItem>
                      <SelectItem value="HIGH">Yüksek</SelectItem>
                      <SelectItem value="CRITICAL">Kritik</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="claimRelatedDepartment">İlgili Departman *</Label>
                  <Select onValueChange={(value) => setValue('claimRelatedDepartment', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Departman seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Quality">Kalite</SelectItem>
                      <SelectItem value="Production">Üretim</SelectItem>
                      <SelectItem value="Logistics">Lojistik</SelectItem>
                      <SelectItem value="Engineering">Mühendislik</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="costAmount">Maliyet Tutarı</Label>
                  <Input
                    id="costAmount"
                    type="number"
                    step="0.01"
                    {...register('costAmount')}
                  />
                </div>

                <div>
                  <Label htmlFor="currency">Para Birimi</Label>
                  <Select onValueChange={(value) => setValue('currency', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Para birimi seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="TL">TL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="issueDescription">Sorun Açıklaması *</Label>
                <Textarea
                  id="issueDescription"
                  rows={4}
                  {...register('issueDescription', { required: 'Açıklama gerekli' })}
                />
                {errors.issueDescription && (
                  <p className="text-sm text-red-600">{errors.issueDescription.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Additional Fields */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ek Bilgiler</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="detectionLocation">Tespit Yeri</Label>
                <Input
                  id="detectionLocation"
                  {...register('detectionLocation')}
                />
              </div>

              <div>
                <Label htmlFor="ppmType">PPM Tipi</Label>
                <Input
                  id="ppmType"
                  {...register('ppmType')}
                />
              </div>

              <div>
                <Label htmlFor="customerRefNo">Müşteri Ref No</Label>
                <Input
                  id="customerRefNo"
                  {...register('customerRefNo')}
                />
              </div>

              <div>
                <Label htmlFor="gpqNo">GPQ No</Label>
                <Input
                  id="gpqNo"
                  {...register('gpqNo')}
                />
              </div>

              <div>
                <Label htmlFor="gpqResponsiblePerson">GPQ Sorumlusu</Label>
                <Input
                  id="gpqResponsiblePerson"
                  {...register('gpqResponsiblePerson')}
                />
              </div>

              <div>
                <Label htmlFor="hbrNo">HBR No</Label>
                <Input
                  id="hbrNo"
                  {...register('hbrNo')}
                />
              </div>
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dosya Ekleri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Dosya yüklemek için tıklayın veya sürükleyin
                      </span>
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                        onChange={handleFileUpload}
                      />
                    </label>
                  </div>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Yüklenen dosyalar:
                    </h4>
                    <div className="space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm text-gray-700">{file.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onClose}>
              İptal
            </Button>
            <Button 
              type="submit" 
              disabled={createClaimMutation.isPending}
            >
              {createClaimMutation.isPending 
                ? 'Kaydediliyor...' 
                : (claim ? 'Güncelle' : 'Oluştur')
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
