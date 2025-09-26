import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';
import { apiRequest } from '@/lib/queryClient';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Eye, 
  Edit, 
  MessageSquare,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Calendar,
  Users,
  BarChart3
} from 'lucide-react';
import { ClaimsDashboard } from '@/components/claims-dashboard';
import { ClaimForm } from '@/components/claim-form';
import { ClaimDetails } from '@/components/claim-details';
import { ThemeToggle } from "@/components/theme-toggle";

export default function ClaimsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedClaim, setSelectedClaim] = useState<any>(null);
  const [isClaimFormOpen, setIsClaimFormOpen] = useState(false);
  const [isClaimDetailsOpen, setIsClaimDetailsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');

  const { data: claims = [] } = useQuery({
    queryKey: ['/api/claims'],
    refetchInterval: 60000,
  });

  const { data: claimStats } = useQuery({
    queryKey: ['/api/claims/stats'],
    refetchInterval: 60000,
  });

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

  const filteredClaims = claims.filter((claim: any) => {
    const matchesSearch = (claim.customerName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (claim.customerClaimNo?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (claim.gasPartName?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || claim.status === statusFilter;
    const matchesDepartment = departmentFilter === 'ALL' || claim.claimRelatedDepartment === departmentFilter;

    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const handleViewClaim = (claim: any) => {
    setSelectedClaim(claim);
    setIsClaimDetailsOpen(true);
  };

  const handleEditClaim = (claim: any) => {
    setSelectedClaim(claim);
    setIsClaimFormOpen(true);
  };

  const handleNewClaim = () => {
    setSelectedClaim(null);
    setIsClaimFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <AlertTriangle className="text-2xl" />
              <h1 className="text-2xl font-bold">Müşteri Şikayetleri Yönetimi</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">{user?.name}</Badge>
              <Badge variant="outline">{user?.role}</Badge>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="dashboard">
              <BarChart3 className="mr-2 h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="claims">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Şikayetler
            </TabsTrigger>
            <TabsTrigger value="reports">
              <TrendingUp className="mr-2 h-4 w-4" />
              Raporlar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <ClaimsDashboard stats={claimStats} />
          </TabsContent>

          <TabsContent value="claims">
            <div className="space-y-6">
              {/* Filters and Search */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Şikayet Listesi</CardTitle>
                    <Button onClick={handleNewClaim}>
                      <Plus className="mr-2 h-4 w-4" />
                      Yeni Şikayet
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 mb-6">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Müşteri adı, şikayet no veya parça adı ile ara..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Durum" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">Tüm Durumlar</SelectItem>
                        <SelectItem value="OPEN">Açık</SelectItem>
                        <SelectItem value="UNDER_REVIEW">İncelemede</SelectItem>
                        <SelectItem value="RESOLVED">Çözüldü</SelectItem>
                        <SelectItem value="CLOSED">Kapandı</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Departman" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">Tüm Departmanlar</SelectItem>
                        <SelectItem value="Quality">Kalite</SelectItem>
                        <SelectItem value="Production">Üretim</SelectItem>
                        <SelectItem value="Logistics">Lojistik</SelectItem>
                        <SelectItem value="Engineering">Mühendislik</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Claims Table */}
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Şikayet No</TableHead>
                          <TableHead>Müşteri</TableHead>
                          <TableHead>Hata Tipi</TableHead>
                          <TableHead>Parça Adı</TableHead>
                          <TableHead>Durum</TableHead>
                          <TableHead>Öncelik</TableHead>
                          <TableHead>Maliyet</TableHead>
                          <TableHead>Tarih</TableHead>
                          <TableHead>İşlemler</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredClaims.map((claim: any) => (
                          <TableRow key={claim.id}>
                            <TableCell className="font-medium">{claim.customerClaimNo}</TableCell>
                            <TableCell>{claim.customerName}</TableCell>
                            <TableCell>{claim.defectType}</TableCell>
                            <TableCell>{claim.gasPartName || '-'}</TableCell>
                            <TableCell>
                              <Badge variant={getStatusBadgeVariant(claim.status)}>
                                {claim.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={getPriorityBadgeVariant(claim.priority)}>
                                {claim.priority}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {claim.costAmount 
                                ? `${claim.costAmount} ${claim.currency}`
                                : '-'
                              }
                            </TableCell>
                            <TableCell>
                              {new Date(claim.claimDate).toLocaleDateString('tr-TR')}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewClaim(claim)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditClaim(claim)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Raporlar ve Analizler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-24 flex flex-col">
                    <Download className="h-6 w-6 mb-2" />
                    Excel Raporu
                  </Button>
                  <Button variant="outline" className="h-24 flex flex-col">
                    <BarChart3 className="h-6 w-6 mb-2" />
                    PPM Analizi
                  </Button>
                  <Button variant="outline" className="h-24 flex flex-col">
                    <DollarSign className="h-6 w-6 mb-2" />
                    Maliyet Raporu
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Modals */}
      <ClaimForm
        isOpen={isClaimFormOpen}
        onClose={() => setIsClaimFormOpen(false)}
        claim={selectedClaim}
      />

      <ClaimDetails
        isOpen={isClaimDetailsOpen}
        onClose={() => setIsClaimDetailsOpen(false)}
        claim={selectedClaim}
      />
    </div>
  );
}