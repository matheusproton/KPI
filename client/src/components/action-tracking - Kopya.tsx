import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Eye, Edit, Trash2, AlertTriangle, CheckCircle, Clock, LayoutGrid, List, Upload, FileSpreadsheet, Loader2, BarChart3, PieChart } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

// Edit Action Form Component
interface EditActionFormProps {
  selectedForEdit: NonConformity;
  onSave: (data: any) => void;
  onCancel: () => void;
  availableUsers: { id: string; name: string; }[];
}

function EditActionForm({ selectedForEdit, onSave, onCancel, availableUsers }: EditActionFormProps) {
  const [formData, setFormData] = useState({
    actionTitle: selectedForEdit.actionTitle || '',
    teamLeader: selectedForEdit.teamLeader ? 
      availableUsers.find(u => u.name === selectedForEdit.teamLeader)?.id || '' : '',
    team: selectedForEdit.team || '',
    category: selectedForEdit.category || '',
    targetDate: selectedForEdit.targetDate ? selectedForEdit.targetDate.split('T')[0] : '',
    status: selectedForEdit.status
  });

  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>(() => {
    if (selectedForEdit.team) {
      const teamNames = selectedForEdit.team.split(', ');
      return teamNames.map(name => 
        availableUsers.find(u => u.name === name)?.id || ''
      ).filter(id => id !== '');
    }
    return [];
  });

  const handleSave = () => {
    const teamLeaderName = formData.teamLeader ? 
      availableUsers.find(u => u.id === formData.teamLeader)?.name || formData.teamLeader : '';

    const teamNames = selectedTeamMembers.map(id => 
      availableUsers.find(u => u.id === id)?.name || id
    ).join(', ');

    onSave({
      ...formData,
      teamLeader: teamLeaderName,
      team: teamNames
    });
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-muted/30 rounded-lg">
        <h4 className="font-medium mb-2">Uygunsuzluk</h4>
        <p className="text-sm">{selectedForEdit.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">Aksiyon Başlığı</label>
            <Input 
              value={formData.actionTitle}
              onChange={(e) => setFormData(prev => ({ ...prev, actionTitle: e.target.value }))}
              placeholder="Aksiyon başlığını girin" 
              className="mt-1" 
            />
          </div>

          <div>
            <label className="text-sm font-medium">Ekip Lideri</label>
            <Select value={formData.teamLeader} onValueChange={(value) => setFormData(prev => ({ ...prev, teamLeader: value }))}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Ekip lideri seçin" />
              </SelectTrigger>
              <SelectContent>
                {availableUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id || 'unknown'}>{user.name || 'Bilinmeyen Kullanıcı'}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Ekip</label>
            <div className="mt-1">
              <TeamMemberSelector 
                selectedMembers={selectedTeamMembers}
                onMembersChange={setSelectedTeamMembers}
                availableUsers={availableUsers}
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">Kategori</label>
            <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Kategori seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kalite-iyilestirme">Kalite İyileştirme</SelectItem>
                <SelectItem value="maliyet-azaltma">Maliyet Azaltma</SelectItem>
                <SelectItem value="verimlilik-artirma">Verimlilik Artırma</SelectItem>
                <SelectItem value="is-guvenligi">İş Güvenliği</SelectItem>
                <SelectItem value="musteri-memnuniyeti">Müşteri Memnuniyeti</SelectItem>
                <SelectItem value="diger">Diğer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Hedef Tarih</label>
            <Input 
              type="date"
              value={formData.targetDate}
              onChange={(e) => setFormData(prev => ({ ...prev, targetDate: e.target.value }))}
              className="mt-1" 
            />
          </div>

          <div>
            <label className="text-sm font-medium">Durum</label>
            <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Durum seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Açık</SelectItem>
                <SelectItem value="in-progress">Devam Ediyor</SelectItem>
                <SelectItem value="closed">Kapalı</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          İptal
        </Button>
        <Button onClick={handleSave}>
          Kaydet
        </Button>
      </div>
    </div>
  );
}

// Create NC Form Component
interface CreateNCFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  selectedTeamMembers: string[];
  onTeamMembersChange: (members: string[]) => void;
  availableUsers: { id: string; name: string; }[];
}

function CreateNCForm({ onSubmit, onCancel, selectedTeamMembers, onTeamMembersChange, availableUsers }: CreateNCFormProps) {
  const [formData, setFormData] = useState({
    description: '',
    action: '',
    teamLeader: '',
    category: '',
    source: 'productivity',
    severity: 'medium',
    status: 'open',
    targetDate: '',
    day: '1',
    selectedClaimId: 'none', // Added for selected claim
  });
  const [claims, setClaims] = useState<any[]>([]); // State to hold claims data

  const { toast } = useToast();

  // Fetch claims data when component mounts
  useEffect(() => {
    const fetchClaims = async () => {
      try {
        // Replace with your actual API endpoint for fetching claims
        const response = await fetch('/api/claims'); 
        if (response.ok) {
          const data = await response.json();
          setClaims(data);
        }
      } catch (error) {
        console.error('Şikayetler yüklenirken hata:', error);
      }
    };

    fetchClaims();
  }, []);

  const handleClaimSelection = (claimId: string) => {
    setFormData(prev => ({ ...prev, selectedClaimId: claimId }));

    if (claimId && claimId !== 'none') {
      const selectedClaim = claims.find((claim: any) => claim.id === claimId);
      if (selectedClaim) {
        setFormData(prev => ({
          ...prev,
          description: `${selectedClaim.customerName} - ${selectedClaim.issueDescription}`,
          severity: selectedClaim.priority.toLowerCase(), // Map priority to severity
          // You might want to map other fields like status, defectType etc.
        }));
      }
    } else {
      // Clear description if no claim is selected
      setFormData(prev => ({ ...prev, description: '' }));
    }
  };

  const handleSubmit = () => {
    if (!formData.description) {
      toast({
        title: 'Hata',
        description: 'Lütfen konu açıklamasını girin',
        variant: 'destructive',
      });
      return;
    }

    const teamLeaderName = formData.teamLeader ? 
      availableUsers.find(u => u.id === formData.teamLeader)?.name || formData.teamLeader : '';

    const teamNames = selectedTeamMembers.map(id => 
      availableUsers.find(u => u.id === id)?.name || id
    ).join(', ');

    onSubmit({
      ...formData,
      teamLeader: teamLeaderName,
      team: teamNames,
      // If a claim is selected, use its ID or relevant info
      ...(formData.category === 'musteri-memnuniyeti' && formData.selectedClaimId && formData.selectedClaimId !== 'none' && {
        source: 'customer-satisfaction', // Set source to customer-satisfaction for complaints
        sourceLabel: 'Müşteri Memnuniyeti',
        description: formData.description, // Use the description from the selected claim
      })
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sol Kolon */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Konu / Açıklama *</label>
            <Textarea 
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Konunun detayını açıklayın" 
              className="mt-1 min-h-[100px]" 
            />
          </div>

          <div>
            <label className="text-sm font-medium">Aksiyon</label>
            <Input 
              value={formData.action}
              onChange={(e) => setFormData(prev => ({ ...prev, action: e.target.value }))}
              placeholder="Alınacak aksiyon" 
              className="mt-1" 
            />
          </div>

          <div>
            <label className="text-sm font-medium">Ekip Lideri</label>
            <Select value={formData.teamLeader} onValueChange={(value) => setFormData(prev => ({ ...prev, teamLeader: value }))}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Ekip lideri seçin" />
              </SelectTrigger>
              <SelectContent>
                {availableUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id || 'unknown'}>{user.name || 'Bilinmeyen Kullanıcı'}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Ekip</label>
            <div className="mt-1">
              <TeamMemberSelector 
                selectedMembers={selectedTeamMembers}
                onMembersChange={onTeamMembersChange}
                availableUsers={availableUsers}
              />
            </div>
          </div>
        </div>

        {/* Sağ Kolon */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Kategori</label>
            <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value, selectedClaimId: 'none', description: '' }))}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Kategori seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kalite-iyilestirme">Kalite İyileştirme</SelectItem>
                <SelectItem value="maliyet-azaltma">Maliyet Azaltma</SelectItem>
                <SelectItem value="verimlilik-artirma">Verimlilik Artırma</SelectItem>
                <SelectItem value="is-guvenligi">İş Güvenliği</SelectItem>
                <SelectItem value="musteri-memnuniyeti">Müşteri Memnuniyeti</SelectItem>
                <SelectItem value="diger">Diğer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.category === 'musteri-memnuniyeti' && (
            <div>
              <label className="text-sm font-medium">İlgili Şikayet</label>
              <Select value={formData.selectedClaimId} onValueChange={handleClaimSelection}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Şikayet seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Şikayet seçiniz</SelectItem>
                  {claims.map((claim: any) => (
                    <SelectItem key={claim.id} value={claim.id}>
                      {claim.customerClaimNo} - {claim.customerName} ({claim.defectType})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.selectedClaimId && formData.selectedClaimId !== 'none' && (
                <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-sm text-blue-800">
                    <strong>Seçilen Şikayet Bilgileri:</strong>
                    {(() => {
                      const selectedClaim = claims.find((claim: any) => claim.id === formData.selectedClaimId);
                      return selectedClaim ? (
                        <div className="mt-1 space-y-1">
                          <div><strong>Müşteri:</strong> {selectedClaim.customerName}</div>
                          <div><strong>Hata Tipi:</strong> {selectedClaim.defectType}</div>
                          <div><strong>Öncelik:</strong> {selectedClaim.priority}</div>
                          <div><strong>Durum:</strong> {selectedClaim.status}</div>
                          <div><strong>Açıklama:</strong> {selectedClaim.issueDescription}</div>
                        </div>
                      ) : null;
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}


          <div>
            <label className="text-sm font-medium">Kaynak</label>
            <Select value={formData.source} onValueChange={(value) => setFormData(prev => ({ ...prev, source: value }))}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Kaynak seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="safety">İş Güvenliği</SelectItem>
                <SelectItem value="customer-satisfaction">Müşteri Memnuniyeti</SelectItem>
                <SelectItem value="productivity">Verimlilik</SelectItem>
                <SelectItem value="fire-scrap">Fire (Scrap)</SelectItem>
                <SelectItem value="premium-freight">Ekstra Navlun</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Önem Derecesi</label>
            <Select value={formData.severity} onValueChange={(value) => setFormData(prev => ({ ...prev, severity: value }))}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Önem derecesi seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">Yüksek</SelectItem>
                <SelectItem value="medium">Orta</SelectItem>
                <SelectItem value="low">Düşük</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Durum</label>
            <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Durum seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Açık</SelectItem>
                <SelectItem value="in-progress">Devam Ediyor</SelectItem>
                <SelectItem value="closed">Kapalı</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Hedef Tarih</label>
            <Input 
              type="date"
              value={formData.targetDate}
              onChange={(e) => setFormData(prev => ({ ...prev, targetDate: e.target.value }))}
              className="mt-1" 
            />
          </div>

          <div>
            <label className="text-sm font-medium">Gün</label>
            <Input 
              type="number"
              value={formData.day}
              onChange={(e) => setFormData(prev => ({ ...prev, day: e.target.value }))}
              placeholder="Gün numarası" 
              className="mt-1" 
              min="1"
              max="31"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-6 border-t">
        <Button variant="outline" onClick={onCancel}>
          İptal
        </Button>
        <Button onClick={handleSubmit}>
          Konu Ekle
        </Button>
      </div>
    </div>
  );
}

// Team Member Selector Component
interface TeamMemberSelectorProps {
  selectedMembers: string[];
  onMembersChange: (members: string[]) => void;
  availableUsers: { id: string; name: string; }[];
}

function TeamMemberSelector({ selectedMembers, onMembersChange, availableUsers }: TeamMemberSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMember = (memberId: string) => {
    if (selectedMembers.includes(memberId)) {
      onMembersChange(selectedMembers.filter(id => id !== memberId));
    } else {
      onMembersChange([...selectedMembers, memberId]);
    }
  };

  const removeMember = (memberId: string) => {
    onMembersChange(selectedMembers.filter(id => id !== memberId));
  };

  const getSelectedNames = () => {
    return selectedMembers.map(id => 
      availableUsers.find(user => user.id === id)?.name || id
    );
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full justify-start text-left h-auto min-h-[40px] p-3"
        >
          {selectedMembers.length === 0 ? (
            <span className="text-muted-foreground">Ekip üyeleri seçin</span>
          ) : (
            <div className="flex flex-wrap gap-1">
              {getSelectedNames().map((name, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    const memberId = selectedMembers[index];
                    removeMember(memberId);
                  }}
                >
                  {name}
                  <span className="ml-1 cursor-pointer">×</span>
                </Badge>
              ))}
            </div>
          )}
        </Button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto">
            {availableUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                onClick={() => toggleMember(user.id)}
              >
                <input
                  type="checkbox"
                  checked={selectedMembers.includes(user.id)}
                  onChange={() => {}}
                  className="mr-2"
                />
                <span className="text-sm">{user.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface NonConformity {
  id: string;
  source: 'safety' | 'customer-satisfaction' | 'productivity' | 'fire-scrap' | 'premium-freight';
  sourceLabel: string;
  day: number;
  description: string;
  severity: 'high' | 'medium' | 'low';
  status: 'open' | 'in-progress' | 'closed';
  createdDate: string;
  createdAt: string; // Added for proper creation timestamp tracking
  closedDate?: string;
  actionId?: string;
  // Action details for list view
  actionTitle?: string;
  teamLeader?: string;
  team?: string;
  category?: string;
  targetDate?: string;
  pcda?: {
    plan: string;
    do: string;
    check: string;
    act: string;
  };
}

interface ActionTrackingProps {
  className?: string;
  onCreateAction?: (nonConformityId: string, actionData: any) => void;
}

export function ActionTracking({ className, onCreateAction }: ActionTrackingProps) {
  const { toast } = useToast();
  const [nonConformities, setNonConformities] = useState<NonConformity[]>([]);
  const [selectedNC, setSelectedNC] = useState<NonConformity | null>(null);
  const [isCreateActionOpen, setIsCreateActionOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');
  const [activeStatsTab, setActiveStatsTab] = useState('overview');
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [isEditActionOpen, setIsEditActionOpen] = useState(false);
  const [selectedForDetails, setSelectedForDetails] = useState<NonConformity | null>(null);
  const [selectedForEdit, setSelectedForEdit] = useState<NonConformity | null>(null);
  const [isCreateNCOpen, setIsCreateNCOpen] = useState(false);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]);
  const [availableUsers, setAvailableUsers] = useState<{ id: string; name: string; }[]>([]);

  // Excel Import States
  const [isExcelImportOpen, setIsExcelImportOpen] = useState(false);
  const [excelData, setExcelData] = useState<any[]>([]);
  const [excelColumns, setExcelColumns] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [fieldMappings, setFieldMappings] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        if (response.ok) {
          const users = await response.json();
          setAvailableUsers(users.map((user: any) => ({
            id: user.id.toString(),
            name: user.name || user.username
          })));
        }
      } catch (error) {
        console.error('Kullanıcılar yüklenirken hata:', error);
        // Fallback to default users if API fails
        setAvailableUsers([
          { id: 'default-1', name: 'Varsayılan Kullanıcı 1' },
          { id: 'default-2', name: 'Varsayılan Kullanıcı 2' }
        ]);
      }
    };

    fetchUsers();
  }, []);

  // Initialize with sample non-conformities
  useEffect(() => {
    const sampleNCs: NonConformity[] = [
      {
        id: 'nc-001',
        source: 'safety',
        sourceLabel: 'İş Güvenliği Kontrol Tablosu',
        day: 16,
        description: 'Güvenlik kazası - Makine koruma sisteminde arıza',
        severity: 'high',
        status: 'open',
        createdDate: new Date(2024, 8, 16).toISOString(),
        createdAt: new Date(2024, 8, 16).toISOString(),
      },
      {
        id: 'nc-002', 
        source: 'customer-satisfaction',
        sourceLabel: 'Müşteri Memnuniyeti',
        day: 15,
        description: 'Müşteri şikayeti - Ürün kalitesi ile ilgili',
        severity: 'medium',
        status: 'closed',
        createdDate: new Date(2024, 8, 15).toISOString(),
        createdAt: new Date(2024, 8, 15).toISOString(),
        closedDate: '2024-10-25', // Hedef tarihten önce kapandı
        actionId: 'action-001',
        actionTitle: 'Kalite Kontrol Süreci Revizyonu',
        teamLeader: 'Ahmet Yılmaz',
        team: 'Kalite Ekibi',
        category: 'Kalite İyileştirme',
        targetDate: '2024-10-30',
        pcda: {
          plan: 'Mevcut kalite kontrol süreçlerini gözden geçir',
          do: 'Yeni kontrol noktaları belirlendi',
          check: 'Test edilecek',
          act: 'Henüz başlanmadı'
        }
      },
      {
        id: 'nc-003',
        source: 'productivity',
        sourceLabel: 'Verimlilik',
        day: 12,
        description: 'M500/5.1 Montaj Hattı - Hedeflenen verimliliğin altında (%85)',
        severity: 'medium',
        status: 'open',
        createdDate: new Date(2024, 8, 12).toISOString(),
        createdAt: new Date(2024, 8, 12).toISOString(),
      },
      {
        id: 'nc-004',
        source: 'fire-scrap',
        sourceLabel: 'Fire (Scrap)',
        day: 10,
        description: 'Yüksek fire oranı - 5 adet fire kaydedildi',
        severity: 'high',
        status: 'open',
        createdDate: new Date(2024, 8, 10).toISOString(),
        createdAt: new Date(2024, 8, 10).toISOString(),
        actionId: 'action-003',
        actionTitle: 'Fire Azaltma Projesi',
        teamLeader: 'Mehmet Demir',
        team: 'Üretim Ekibi',
        category: 'Kalite İyileştirme',
        targetDate: '2024-09-20', // Geçmiş tarih - gecikmiş
        pcda: {
          plan: 'Fire nedenlerini analiz et',
          do: 'Süreç iyileştirmeleri yapılacak',
          check: 'Beklemede',
          act: 'Henüz başlanmadı'
        }
      },
      {
        id: 'nc-005',
        source: 'premium-freight',
        sourceLabel: 'Ekstra Navlun',
        day: 8,
        description: 'Ekstra navlun teslifi - Maliyet artışı',
        severity: 'low',
        status: 'closed',
        createdDate: new Date(2024, 8, 8).toISOString(),
        createdAt: new Date(2024, 8, 8).toISOString(),
        closedDate: '2024-09-30', // Hedef tarihten sonra kapandı
        actionId: 'action-002',
        actionTitle: 'Lojistik Optimizasyonu',
        teamLeader: 'Fatma Kaya',
        team: 'Lojistik Ekibi',
        category: 'Maliyet Azaltma',
        targetDate: '2024-09-25',
        pcda: {
          plan: 'Navlun maliyetlerini azaltma stratejisi',
          do: 'Alternatif taşıyıcılar değerlendirildi',
          check: 'Maliyet analizi tamamlandı',
          act: 'Yeni anlaşma imzalandı'
        }
      }
    ];
    setNonConformities(sampleNCs);
  }, []);

  const handleCreateAction = (ncId: string) => {
    setSelectedNC(nonConformities.find(nc => nc.id === ncId) || null);
    setIsCreateActionOpen(true);
  };

  const handleActionCreated = (actionData: any) => {
    if (selectedNC) {
      setNonConformities(prev => 
        prev.map(nc => 
          nc.id === selectedNC.id 
            ? { ...nc, status: 'closed', actionId: 'new-action-id' }
            : nc
        )
      );
      toast({
        title: 'Başarılı',
        description: 'Aksiyon başarıyla oluşturuldu ve uygunsuzlukla eşleştirildi',
      });
    }
    setIsCreateActionOpen(false);
    setSelectedNC(null);
  };

  const handleViewDetails = (ncId: string) => {
    const nc = nonConformities.find(nc => nc.id === ncId);
    if (nc) {
      setSelectedForDetails(nc);
      setIsViewDetailsOpen(true);
    }
  };

  const handleEditAction = (ncId: string) => {
    const nc = nonConformities.find(nc => nc.id === ncId);
    if (nc) {
      setSelectedForEdit(nc);
      setIsEditActionOpen(true);
    }
  };

  const handleSaveEdit = (editData: any) => {
    if (selectedForEdit) {
      setNonConformities(prev => 
        prev.map(nc => 
          nc.id === selectedForEdit.id 
            ? { ...nc, ...editData }
            : nc
        )
      );
      toast({
        title: 'Başarılı',
        description: 'Aksiyon başarıyla güncellendi',
      });
    }
    setIsEditActionOpen(false);
    setSelectedForEdit(null);
  };

  const handleCreateNC = (ncData: any) => {
    const now = new Date().toISOString();
    const newNC: NonConformity = {
      id: `nc-${Date.now()}`,
      source: ncData.source || 'productivity',
      sourceLabel: sourceMappings[ncData.source] || 'Verimlilik',
      day: parseInt(ncData.day) || 1,
      description: ncData.description,
      severity: ncData.severity || 'medium',
      status: ncData.status || 'open',
      createdDate: now,
      createdAt: now,
      actionId: ncData.action ? `action-${Date.now()}` : undefined,
      actionTitle: ncData.action || undefined,
      teamLeader: ncData.teamLeader || undefined,
      team: ncData.team || undefined,
      category: ncData.category || undefined,
      targetDate: ncData.targetDate || undefined,
    };

    setNonConformities(prev => [newNC, ...prev]);
    toast({
      title: 'Başarılı',
      description: 'Yeni konu başarıyla eklendi',
    });
    setIsCreateNCOpen(false);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-destructive text-destructive-foreground';
      case 'medium': return 'bg-warning text-white';
      case 'low': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-500 text-white';
      case 'in-progress':
        return 'bg-yellow-500 text-white';
      case 'closed':
        return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getTargetDateStatus = (targetDate: string, status: string, closedDate?: string) => {
    const today = new Date();
    const target = new Date(targetDate);

    // Set hours to 0 for date comparison only
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);

    if (status === 'closed') {
      const closed = closedDate ? new Date(closedDate) : new Date();
      closed.setHours(0, 0, 0, 0);

      if (closed <= target) {
        return 'Zamanında';
      } else {
        return 'Gecikmiş';
      }
    }

    // Açık durumlar için
    if (target < today) {
      return 'Gecikmiş';
    } else {
      return 'Devam Ediyor';
    }
  };

  const getTargetDateStatusColor = (targetDate: string, status: string, closedDate?: string) => {
    const today = new Date();
    const target = new Date(targetDate);

    // Set hours to 0 for date comparison only
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);

    if (status === 'closed') {
      const closed = closedDate ? new Date(closedDate) : new Date();
      closed.setHours(0, 0, 0, 0);

      if (closed <= target) {
        return 'bg-green-500 text-white'; // Zamanında
      } else {
        return 'bg-orange-500 text-white'; // Gecikmiş ama kapanmış
      }
    }

    // Açık durumlar için
    if (target < today) {
      return 'bg-red-500 text-white'; // Gecikmiş ve açık
    } else {
      return 'bg-blue-500 text-white'; // Devam ediyor
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertTriangle className="h-4 w-4" />;
      case 'closed': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const filteredNCs = nonConformities.filter(nc => {
    const statusMatch = filterStatus === 'all' || nc.status === filterStatus;
    const sourceMatch = filterSource === 'all' || nc.source === filterSource;
    return statusMatch && sourceMatch;
  });

  const sourceMappings = {
    safety: 'İş Güvenliği',
    'customer-satisfaction': 'Müşteri Memnuniyeti',
    productivity: 'Verimlilik',
    'fire-scrap': 'Fire (Scrap)',
    'premium-freight': 'Ekstra Navlun'
  };

  // Excel Import Functions
  const handleExcelUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (jsonData.length > 0) {
        const headers = jsonData[0] as string[];
        const dataRows = jsonData.slice(1);

        setExcelColumns(headers.filter(h => h && h.trim()));
        setExcelData(dataRows.map((row: any) => {
          const obj: any = {};
          headers.forEach((header, index) => {
            if (header && header.trim()) {
              obj[header] = row[index] || '';
            }
          });
          return obj;
        }));

        toast({
          title: 'Başarılı',
          description: `${dataRows.length} satır veri yüklendi. Şimdi alanları eşleştirin.`,
        });
      }
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Excel dosyası okunurken hata oluştu.',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleImportData = () => {
    if (excelData.length === 0) return;

    const mappedData = excelData.map((row, index) => {
      const createdDate = row[fieldMappings.createdDate] ? new Date(row[fieldMappings.createdDate]).toISOString() : new Date().toISOString();
      const newNc: NonConformity = {
        id: `imported-${Date.now()}-${index}`,
        source: mapSourceValue(row[fieldMappings.source] || ''),
        sourceLabel: row[fieldMappings.source] || 'İçe Aktarılan',
        day: parseInt(row[fieldMappings.day]) || 1,
        description: row[fieldMappings.description] || 'Açıklama yok',
        severity: mapSeverityValue(row[fieldMappings.severity] || 'orta'),
        status: mapStatusValue(row[fieldMappings.status] || 'açık'),
        createdDate: createdDate,
        createdAt: createdDate,
        closedDate: fieldMappings.closedDate !== 'none' ? row[fieldMappings.closedDate] : undefined,
        actionId: fieldMappings.actionTitle !== 'none' && row[fieldMappings.actionTitle] ? `action-${Date.now()}-${index}` : undefined,
        actionTitle: fieldMappings.actionTitle !== 'none' ? row[fieldMappings.actionTitle] || undefined : undefined,
        teamLeader: fieldMappings.teamLeader !== 'none' ? row[fieldMappings.teamLeader] || undefined : undefined,
        team: fieldMappings.team !== 'none' ? row[fieldMappings.team] || undefined : undefined,
        category: fieldMappings.category !== 'none' ? row[fieldMappings.category] || undefined : undefined,
        targetDate: fieldMappings.targetDate !== 'none' ? row[fieldMappings.targetDate] || undefined : undefined,
      };
      return newNc;
    }).filter(nc => nc.description && nc.description !== 'Açıklama yok');

    setNonConformities(prev => [...prev, ...mappedData]);

    toast({
      title: 'Başarılı',
      description: `${mappedData.length} kayıt içe aktarıldı.`,
    });

    // Reset import state
    setExcelData([]);
    setExcelColumns([]);
    setFieldMappings({});
    setIsExcelImportOpen(false);
  };

  const mapSourceValue = (value: string): NonConformity['source'] => {
    const lowerValue = value.toLowerCase();
    if (lowerValue.includes('güvenlik') || lowerValue.includes('safety')) return 'safety';
    if (lowerValue.includes('müşteri') || lowerValue.includes('customer')) return 'customer-satisfaction';
    if (lowerValue.includes('verim') || lowerValue.includes('productivity')) return 'productivity';
    if (lowerValue.includes('fire') || lowerValue.includes('scrap')) return 'fire-scrap';
    if (lowerValue.includes('navlun') || lowerValue.includes('freight')) return 'premium-freight';
    return 'productivity';
  };

  const mapSeverityValue = (value: string): NonConformity['severity'] => {
    const lowerValue = value.toLowerCase();
    if (lowerValue.includes('yüksek') || lowerValue.includes('high') || lowerValue.includes('kritik')) return 'high';
    if (lowerValue.includes('düşük') || lowerValue.includes('low') || lowerValue.includes('az')) return 'low';
    return 'medium';
  };

  const mapStatusValue = (value: string): NonConformity['status'] => {
    const lowerValue = value.toLowerCase();
    if (lowerValue.includes('kapalı') || lowerValue.includes('closed') || lowerValue.includes('tamamlan')) return 'closed';
    if (lowerValue.includes('devam') || lowerValue.includes('progress') || lowerValue.includes('süren')) return 'in-progress';
    return 'open';
  };

  // Statistics calculation functions
  const getStatusDistribution = () => {
    const openCount = nonConformities.filter(nc => nc.status === 'open').length;
    const closedCount = nonConformities.filter(nc => nc.status === 'closed').length;
    const totalCount = nonConformities.length;

    return [
      { name: 'Açık', value: openCount, color: '#ef4444' },
      { name: 'Kapalı', value: closedCount, color: '#22c55e' }
    ];
  };

  const getOpenTasksStatus = () => {
    const openTasks = nonConformities.filter(nc => nc.status === 'open');
    const today = new Date();

    let ongoingCount = 0;
    let overdueCount = 0;

    openTasks.forEach(task => {
      if (task.targetDate) {
        const targetDate = new Date(task.targetDate);
        if (targetDate < today) {
          overdueCount++;
        } else {
          ongoingCount++;
        }
      } else {
        ongoingCount++;
      }
    });

    return [
      { name: 'Devam Ediyor', value: ongoingCount, color: '#3b82f6' },
      { name: 'Gecikmiş', value: overdueCount, color: '#dc2626' }
    ];
  };

  const getCategoryDistribution = () => {
    const categoryMap: Record<string, number> = {};

    nonConformities.forEach(nc => {
      const category = nc.category || 'Belirtilmemiş';
      categoryMap[category] = (categoryMap[category] || 0) + 1;
    });

    const colors = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#06b6d4'];

    return Object.entries(categoryMap).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length]
    }));
  };

  const getWeeklyDistribution = () => {
    const weeklyMap: Record<string, number> = {};

    nonConformities.forEach(nc => {
      const date = new Date(nc.createdAt);
      const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
      const weekKey = `${weekStart.getDate()}/${weekStart.getMonth() + 1}`;
      weeklyMap[weekKey] = (weeklyMap[weekKey] || 0) + 1;
    });

    return Object.entries(weeklyMap).map(([week, count]) => ({
      week,
      count
    })).slice(-8); // Son 8 hafta
  };

  const getClosedTasksStatus = () => {
    const closedTasks = nonConformities.filter(nc => nc.status === 'closed' && nc.targetDate && nc.closedDate);

    let onTimeCount = 0;
    let lateCount = 0;

    closedTasks.forEach(task => {
      const targetDate = new Date(task.targetDate!);
      const closedDate = new Date(task.closedDate!);

      if (closedDate <= targetDate) {
        onTimeCount++;
      } else {
        lateCount++;
      }
    });

    return [
      { name: 'Zamanında', value: onTimeCount, color: '#22c55e' },
      { name: 'Geç', value: lateCount, color: '#ef4444' }
    ];
  };

  const getDepartmentSolutionTimes = () => {
    const departmentTimes: Record<string, number[]> = {};

    nonConformities.filter(nc => nc.status === 'closed' && nc.closedDate).forEach(nc => {
      const dept = sourceMappings[nc.source];
      const created = new Date(nc.createdAt);
      const closed = new Date(nc.closedDate!);
      const days = Math.ceil((closed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));

      if (!departmentTimes[dept]) {
        departmentTimes[dept] = [];
      }
      departmentTimes[dept].push(days);
    });

    return Object.entries(departmentTimes).map(([dept, times]) => ({
      department: dept,
      min: Math.min(...times),
      average: Math.round(times.reduce((a, b) => a + b, 0) / times.length),
      max: Math.max(...times)
    }));
  };

  const getTeamLeaderSolutionTimes = () => {
    const leaderTimes: Record<string, number[]> = {};

    nonConformities.filter(nc => nc.status === 'closed' && nc.closedDate && nc.teamLeader).forEach(nc => {
      const leader = nc.teamLeader!;
      const created = new Date(nc.createdAt);
      const closed = new Date(nc.closedDate!);
      const days = Math.ceil((closed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));

      if (!leaderTimes[leader]) {
        leaderTimes[leader] = [];
      }
      leaderTimes[leader].push(days);
    });

    return Object.entries(leaderTimes).map(([leader, times]) => ({
      teamLeader: leader,
      min: Math.min(...times),
      average: Math.round(times.reduce((a, b) => a + b, 0) / times.length),
      max: Math.max(...times)
    }));
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Tabs defaultValue="tracking" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tracking" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Aksiyon Takibi
          </TabsTrigger>
          <TabsTrigger value="statistics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            İstatistikler
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tracking" className="space-y-6">
      {/* Header with Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">Uygunsuzluk ve Aksiyon Takibi</CardTitle>
            <div className="flex gap-4">
              <Button
                onClick={() => setIsExcelImportOpen(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Excel'den İçe Aktar
              </Button>
              <Button
                onClick={() => setIsCreateNCOpen(true)}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" />
                Yeni Konu Ekle
              </Button>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'cards' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('cards')}
                >
                  <LayoutGrid className="h-4 w-4 mr-1" />
                  Kart Görünümü
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                >
                  <List className="h-4 w-4 mr-1" />
                  Liste Görünümü
                </Button>
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Durum Filtresi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Durumlar</SelectItem>
                  <SelectItem value="open">Açık</SelectItem>
                  <SelectItem value="closed">Kapalı</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterSource} onValueChange={setFilterSource}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Kaynak Filtresi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Kaynaklar</SelectItem>
                  <SelectItem value="safety">İş Güvenliği</SelectItem>
                  <SelectItem value="customer-satisfaction">Müşteri Memnuniyeti</SelectItem>
                  <SelectItem value="productivity">Verimlilik</SelectItem>
                  <SelectItem value="fire-scrap">Fire (Scrap)</SelectItem>
                  <SelectItem value="premium-freight">Ekstra Navlun</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-destructive/10 rounded-lg">
              <div className="text-2xl font-bold text-destructive">
                {nonConformities.filter(nc => nc.status === 'open').length}
              </div>
              <div className="text-sm text-muted-foreground">Açık Uygunsuzluk</div>
            </div>
            <div className="text-center p-4 bg-success/10 rounded-lg">
              <div className="text-2xl font-bold text-success">
                {nonConformities.filter(nc => nc.status === 'closed').length}
              </div>
              <div className="text-sm text-muted-foreground">Kapalı</div>
            </div>
            <div className="text-center p-4 bg-primary/10 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {nonConformities.length}
              </div>
              <div className="text-sm text-muted-foreground">Toplam</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content based on view mode */}
      {viewMode === 'cards' ? (
        <div className="space-y-6">
          {/* Mobile/Tablet: Stacked Cards */}
          <div className="block lg:hidden space-y-8">
            {/* Açık Konular Section */}
            <div>
              <div className="bg-white rounded-xl shadow-sm border">
                <div className="bg-destructive/10 rounded-t-xl p-5 border-b border-destructive/20">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-6 w-6 text-destructive" />
                    <h3 className="font-semibold text-xl text-destructive">Açık Konular</h3>
                    <Badge variant="outline" className="ml-auto bg-destructive/10 text-destructive border-destructive/20 px-3 py-1">
                      {filteredNCs.filter(nc => nc.status === 'open').length}
                    </Badge>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    {filteredNCs.filter(nc => nc.status === 'open').map((nc) => (
                      <Card key={nc.id} className="bg-white shadow-lg border-l-4 border-l-destructive hover:shadow-xl transition-all duration-300 cursor-pointer">
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="flex flex-wrap items-start gap-3">
                              <Badge className={`${getSeverityColor(nc.severity)} text-sm px-3 py-1`} variant="outline">
                                {nc.severity === 'high' ? 'Yüksek' : 
                                 nc.severity === 'medium' ? 'Orta' : 'Düşük'}
                              </Badge>
                              <Badge variant="outline" className="text-sm bg-gray-50 flex-shrink-0 px-3 py-1">
                                {sourceMappings[nc.source]}
                              </Badge>
                            </div>

                            <h4 className="font-medium text-base leading-relaxed text-gray-800 min-h-[3rem]">{nc.description}</h4>

                            <div className="text-sm text-gray-600 space-y-2 bg-gray-50 p-3 rounded-lg">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">📅</span>
                                <span>Gün: {nc.day}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-lg">🕐</span>
                                <span>{new Date(nc.createdDate).toLocaleDateString('tr-TR')}</span>
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 pt-3">
                              <Button
                                size="sm"
                                onClick={() => handleCreateAction(nc.id)}
                                className="bg-primary hover:bg-primary/90 text-sm h-10 flex-1 font-medium"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Aksiyon Oluştur
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-sm h-10 px-4"
                                onClick={() => handleViewDetails(nc.id)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Detay
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {filteredNCs.filter(nc => nc.status === 'open').length === 0 && (
                    <div className="text-center py-16 text-gray-400">
                      <CheckCircle className="h-16 w-16 mx-auto mb-4" />
                      <p className="text-base">Açık konu bulunmuyor</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Kapalı Konular Section */}
            <div>
              <div className="bg-white rounded-xl shadow-sm border">
                <div className="bg-success/10 rounded-t-xl p-5 border-b border-success/20">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-success" />
                    <h3 className="font-semibold text-xl text-success">Kapalı Konular</h3>
                    <Badge variant="outline" className="ml-auto bg-success/10 text-success border-success/20 px-3 py-1">
                      {filteredNCs.filter(nc => nc.status === 'closed').length}
                    </Badge>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    {filteredNCs.filter(nc => nc.status === 'closed').map((nc) => (
                      <Card key={nc.id} className="bg-white shadow-lg border-l-4 border-l-success hover:shadow-xl transition-all duration-300 cursor-pointer">
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="flex flex-wrap items-start gap-3">
                              <Badge className={`${getSeverityColor(nc.severity)} text-sm px-3 py-1`} variant="outline">
                                {nc.severity === 'high' ? 'Yüksek' : 
                                 nc.severity === 'medium' ? 'Orta' : 'Düşük'}
                              </Badge>
                              <Badge variant="outline" className="text-sm bg-gray-50 flex-shrink-0 px-3 py-1">
                                {sourceMappings[nc.source]}
                              </Badge>
                            </div>

                            <h4 className="font-medium text-base leading-relaxed text-gray-800 min-h-[3rem]">{nc.description}</h4>

                            {nc.actionTitle && (
                              <div className="text-sm bg-green-50 p-4 rounded-lg border border-green-100 space-y-2">
                                <div className="font-medium text-green-800">✅ {nc.actionTitle}</div>
                                {nc.teamLeader && (
                                  <div className="text-gray-700">
                                    👤 {nc.teamLeader}
                                  </div>
                                )}
                                <div className="text-green-600 font-medium">
                                  ✓ Başarıyla Tamamlandı
                                </div>
                              </div>
                            )}

                            <div className="text-sm text-gray-600 space-y-2 bg-gray-50 p-3 rounded-lg">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">📅</span>
                                <span>Gün: {nc.day}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-lg">🕐</span>
                                <span>{new Date(nc.createdDate).toLocaleDateString('tr-TR')}</span>
                              </div>
                            </div>

                            <div className="flex pt-3">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-sm h-10 flex-1 font-medium"
                                onClick={() => handleViewDetails(nc.id)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Detay Görüntüle
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {filteredNCs.filter(nc => nc.status === 'closed').length === 0 && (
                    <div className="text-center py-16 text-gray-400">
                      <CheckCircle className="h-16 w-16 mx-auto mb-4" />
                      <p className="text-base">Kapalı konu bulunmuyor</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Desktop: Modern Grid Layout */}
          <div className="hidden lg:block">
            <div className="grid grid-cols-2 gap-8">
              {/* Açık Konular */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-red-50 to-red-100 p-6 border-b border-red-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-red-800">Açık Konular</h3>
                      <p className="text-sm text-red-600">Aksiyon bekleyen uygunsuzluklar</p>
                    </div>
                    <div className="ml-auto">
                      <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {filteredNCs.filter(nc => nc.status === 'open').length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {filteredNCs.filter(nc => nc.status === 'open').length > 0 ? (
                    <div className="grid gap-4">
                      {filteredNCs.filter(nc => nc.status === 'open').slice(0, 4).map((nc) => (
                        <div key={nc.id} className="group p-5 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl hover:shadow-md transition-all duration-300 hover:border-red-300">
                          <div className="flex items-start gap-4">
                            <div className="w-3 h-3 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start gap-2 mb-3">
                                <Badge className={`${getSeverityColor(nc.severity)} text-xs px-2 py-1 flex-shrink-0`} variant="outline">
                                  {nc.severity === 'high' ? 'Yüksek' : nc.severity === 'medium' ? 'Orta' : 'Düşük'}
                                </Badge>
                                <Badge variant="outline" className="text-xs bg-gray-100 text-gray-700 px-2 py-1 flex-shrink-0">
                                  {sourceMappings[nc.source]}
                                </Badge>
                              </div>

                              <h4 className="font-semibold text-gray-800 text-sm leading-relaxed mb-3 line-clamp-2">
                                {nc.description}
                              </h4>

                              <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                                <div className="flex items-center gap-1">
                                  <span>📅</span>
                                  <span>Gün {nc.day}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span>🕐</span>
                                  <span>{new Date(nc.createdDate).toLocaleDateString('tr-TR')}</span>
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleCreateAction(nc.id)}
                                  className="bg-red-600 hover:bg-red-700 text-white text-xs h-8 px-3 flex-1 font-medium"
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Aksiyon Oluştur
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="text-xs h-8 px-3 border-gray-300 hover:bg-gray-50"
                                  onClick={() => handleViewDetails(nc.id)}
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {filteredNCs.filter(nc => nc.status === 'open').length > 4 && (
                        <div className="text-center pt-4 border-t border-gray-100">
                          <Button variant="outline" size="sm" className="text-xs">
                            {filteredNCs.filter(nc => nc.status === 'open').length - 4} tane daha göster
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                      <p className="text-gray-500 font-medium">Açık konu bulunmuyor</p>
                      <p className="text-sm text-gray-400 mt-1">Tüm konular başarıyla çözülmüş</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Kapalı Konular */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 border-b border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-green-800">Kapalı Konular</h3>
                      <p className="text-sm text-green-600">Başarıyla çözülmüş uygunsuzluklar</p>
                    </div>
                    <div className="ml-auto">
                      <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {filteredNCs.filter(nc => nc.status === 'closed').length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {filteredNCs.filter(nc => nc.status === 'closed').length > 0 ? (
                    <div className="grid gap-4">
                      {filteredNCs.filter(nc => nc.status === 'closed').slice(0, 4).map((nc) => (
                        <div key={nc.id} className="group p-5 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl hover:shadow-md transition-all duration-300 hover:border-green-300">
                          <div className="flex items-start gap-4">
                            <div className="w-3 h-3 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start gap-2 mb-3">
                                <Badge className={`${getSeverityColor(nc.severity)} text-xs px-2 py-1 flex-shrink-0`} variant="outline">
                                  {nc.severity === 'high' ? 'Yüksek' : nc.severity === 'medium' ? 'Orta' : 'Düşük'}
                                </Badge>
                                <Badge variant="outline" className="text-xs bg-gray-100 text-gray-700 px-2 py-1 flex-shrink-0">
                                  {sourceMappings[nc.source]}
                                </Badge>
                              </div>

                              <h4 className="font-semibold text-gray-800 text-sm leading-relaxed mb-3 line-clamp-2">
                                {nc.description}
                              </h4>

                              {nc.actionTitle && (
                                <div className="text-xs bg-green-50 p-3 rounded-lg border border-green-200 mb-3">
                                  <div className="font-semibold text-green-800 mb-1">✅ {nc.actionTitle}</div>
                                  {nc.teamLeader && (
                                    <div className="text-green-700">👤 {nc.teamLeader}</div>
                                  )}
                                </div>
                              )}

                              <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                                <div className="flex items-center gap-1">
                                  <span>📅</span>
                                  <span>Gün {nc.day}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span>🕐</span>
                                  <span>{new Date(nc.createdDate).toLocaleDateString('tr-TR')}</span>
                                </div>
                              </div>

                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-xs h-8 w-full border-gray-300 hover:bg-gray-50 font-medium"
                                onClick={() => handleViewDetails(nc.id)}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                Detay Görüntüle
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}

                      {filteredNCs.filter(nc => nc.status === 'closed').length > 4 && (
                        <div className="text-center pt-4 border-t border-gray-100">
                          <Button variant="outline" size="sm" className="text-xs">
                            {filteredNCs.filter(nc => nc.status === 'closed').length - 4} tane daha göster
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium">Kapalı konu bulunmuyor</p>
                      <p className="text-sm text-gray-400 mt-1">Henüz çözülmüş konu yok</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Konu</TableHead>
                  <TableHead>Aksiyon</TableHead>
                  <TableHead>Ekip Lideri</TableHead>
                  <TableHead>Ekip</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Hedef Tarih</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNCs.map((nc) => (
                  <TableRow key={nc.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{nc.description}</div>
                        <div className="text-sm text-muted-foreground">
                          {sourceMappings[nc.source]} - Gün {nc.day}
                        </div>
                        <Badge className={getSeverityColor(nc.severity)} variant="outline">
                          {nc.severity === 'high' ? 'Yüksek' : 
                           nc.severity === 'medium' ? 'Orta' : 'Düşük'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-48 text-sm">
                        {nc.actionTitle || '-'}
                      </div>
                    </TableCell>
                    <TableCell>{nc.teamLeader || '-'}</TableCell>
                    <TableCell>{nc.team || '-'}</TableCell>
                    <TableCell>{nc.category || '-'}</TableCell>
                    <TableCell>
                      {nc.targetDate ? (
                        <Badge className={getTargetDateStatusColor(nc.targetDate, nc.status, nc.closedDate)}>
                          {getTargetDateStatus(nc.targetDate, nc.status, nc.closedDate)}
                        </Badge>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(nc.status)}>
                        {getStatusIcon(nc.status)}
                        <span className="ml-1">
                          {nc.status === 'open' ? 'Açık' : nc.status === 'in-progress' ? 'Devam Ediyor' : 'Kapalı'}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {!nc.actionId && nc.status === 'open' && (
                          <Button
                            size="sm"
                            onClick={() => handleCreateAction(nc.id)}
                            className="bg-primary hover:bg-primary/90"
                            title="Aksiyon Oluştur"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewDetails(nc.id)}
                          title="Detayları Görüntüle"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditAction(nc.id)}
                          title="Düzenle"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredNCs.length === 0 && (
              <div className="text-center py-12">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Uygunsuzluk Bulunamadı</h3>
                <p className="text-muted-foreground">
                  Seçilen filtrelere uygun uygunsuzluk bulunmuyor.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Action Dialog */}
      <Dialog open={isCreateActionOpen} onOpenChange={setIsCreateActionOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Uygunsuzluk için Aksiyon Oluştur</DialogTitle>
          </DialogHeader>
          {selectedNC && (
            <div className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-medium mb-2">Uygunsuzluk Detayı</h4>
                <p className="text-sm text-muted-foreground mb-1">
                  <strong>Kaynak:</strong> {selectedNC.sourceLabel} - Gün {selectedNC.day}
                </p>
                <p className="text-sm">{selectedNC.description}</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Aksiyon Başlığı</label>
                  <Input placeholder="Aksiyon başlığını girin" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Açıklama</label>
                  <Textarea placeholder="Aksiyon detaylarını açıklayın" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Öncelik</label>
                  <Select>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Öncelik seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">Yüksek</SelectItem>
                      <SelectItem value="medium">Orta</SelectItem>
                      <SelectItem value="low">Düşük</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreateActionOpen(false)}>
                  İptal
                </Button>
                <Button onClick={() => handleActionCreated({})}>
                  Aksiyon Oluştur
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Uygunsuzluk ve Aksiyon Detayları</DialogTitle>
          </DialogHeader>
          {selectedForDetails && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-medium mb-3">Uygunsuzluk Bilgileri</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Kaynak:</strong> {selectedForDetails.sourceLabel}</div>
                      <div><strong>Gün:</strong> {selectedForDetails.day}</div>
                      <div><strong>Oluşturma Tarihi:</strong> {new Date(selectedForDetails.createdDate).toLocaleDateString('tr-TR')}</div>
                      <div className="flex items-center gap-2">
                        <strong>Önem Derecesi:</strong>
                        <Badge className={getSeverityColor(selectedForDetails.severity)}>
                          {selectedForDetails.severity === 'high' ? 'Yüksek' : 
                           selectedForDetails.severity === 'medium' ? 'Orta' : 'Düşük'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <strong>Durum:</strong>
                        <Badge className={getStatusColor(selectedForDetails.status)}>
                          {selectedForDetails.status === 'open' ? 'Açık' : 'Kapalı'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-medium mb-2">Açıklama</h4>
                    <p className="text-sm">{selectedForDetails.description}</p>
                  </div>
                </div>

                {selectedForDetails.actionId && (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-medium mb-3 text-blue-800">Aksiyon Bilgileri</h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>Aksiyon:</strong> {selectedForDetails.actionTitle}</div>
                        <div><strong>Ekip Lideri:</strong> {selectedForDetails.teamLeader}</div>
                        <div><strong>Ekip:</strong> {selectedForDetails.team}</div>
                        <div><strong>Kategori:</strong> {selectedForDetails.category}</div>
                        <div>
                          <strong>Hedef Tarih:</strong> {selectedForDetails.targetDate ? new Date(selectedForDetails.targetDate).toLocaleDateString('tr-TR') : '-'}
                        </div>
                        <div>
                          <strong>Durum:</strong> 
                          {selectedForDetails.targetDate ? (
                            <Badge className={getTargetDateStatusColor(selectedForDetails.targetDate, selectedForDetails.status, selectedForDetails.closedDate)}>
                              {getTargetDateStatus(selectedForDetails.targetDate, selectedForDetails.status, selectedForDetails.closedDate)}
                            </Badge>
                          ) : (
                            '-'
                          )}
                        </div>
                      </div>
                    </div>

                    {selectedForDetails.pcda && (
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <h4 className="font-medium mb-3 text-green-800">PCDA Durumu</h4>
                        <div className="space-y-2 text-sm">
                          <div><strong>Plan (P):</strong> {selectedForDetails.pcda.plan}</div>
                          <div><strong>Uygula (D):</strong> {selectedForDetails.pcda.do}</div>
                          <div><strong>Kontrol (C):</strong> {selectedForDetails.pcda.check}</div>
                          <div><strong>Aksiyon (A):</strong> {selectedForDetails.pcda.act}</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={() => setIsViewDetailsOpen(false)}>
                  Kapat
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Action Dialog */}
      <Dialog open={isEditActionOpen} onOpenChange={setIsEditActionOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Aksiyon Düzenle</DialogTitle>
          </DialogHeader>
          {selectedForEdit && (
            <EditActionForm 
              selectedForEdit={selectedForEdit}
              onSave={handleSaveEdit}
              onCancel={() => setIsEditActionOpen(false)}
              availableUsers={availableUsers}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Excel Import Dialog */}
      <Dialog open={isExcelImportOpen} onOpenChange={setIsExcelImportOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Excel Dosyasından İçe Aktar
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 overflow-y-auto max-h-[70vh] pr-2">
            {/* File Upload Section */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">1. Excel Dosyası Seç</h3>
                  {excelData.length > 0 && (
                    <span className="text-sm text-green-600 font-medium">
                      ✓ {excelData.length} satır yüklendi
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isImporting}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    {isImporting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    {isImporting ? 'Yükleniyor...' : 'Excel Dosyası Seç'}
                  </Button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.xlsm"
                  onChange={handleExcelUpload}
                  className="hidden"
                />

                <div className="text-xs text-gray-600">
                  <strong>Desteklenen formatlar:</strong> .xlsx, .xls, .xlsm<br />
                  <strong>Not:</strong> İlk satır başlık satırı olarak kabul edilecektir.
                </div>
              </div>
            </div>

            {/* Field Mapping Section */}
            {excelColumns.length > 0 && (
              <div className="border rounded-lg p-4">
                <div className="mb-4">
                  <h3 className="font-medium text-lg mb-2">2. Alan Eşleştirme</h3>
                  <p className="text-sm text-gray-600">Excel sütunlarını sistem alanları ile eşleştirin</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Açıklama (Zorunlu)
                      </label>
                      <Select 
                        value={fieldMappings.description || ''} 
                        onValueChange={(value) => setFieldMappings(prev => ({...prev, description: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Excel sütunu seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Sütun seçin</SelectItem>
                          {excelColumns.map(col => (
                            <SelectItem key={col} value={col}>{col}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Kaynak/Kategori
                      </label>
                      <Select 
                        value={fieldMappings.source || ''} 
                        onValueChange={(value) => setFieldMappings(prev => ({...prev, source: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Excel sütunu seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Sütun seçin</SelectItem>
                          {excelColumns.map(col => (
                            <SelectItem key={col} value={col}>{col}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Önem Derecesi
                      </label>
                      <Select 
                        value={fieldMappings.severity || ''} 
                        onValueChange={(value) => setFieldMappings(prev => ({...prev, severity: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Excel sütunu seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Sütun seçin</SelectItem>
                          {excelColumns.map(col => (
                            <SelectItem key={col} value={col}>{col}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Durum
                      </label>
                      <Select 
                        value={fieldMappings.status || ''} 
                        onValueChange={(value) => setFieldMappings(prev => ({...prev, status: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Excel sütunu seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Sütun seçin</SelectItem>
                          {excelColumns.map(col => (
                            <SelectItem key={col} value={col}>{col}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Gün
                      </label>
                      <Select 
                        value={fieldMappings.day || ''} 
                        onValueChange={(value) => setFieldMappings(prev => ({...prev, day: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Excel sütunu seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Sütun seçin</SelectItem>
                          {excelColumns.map(col => (
                            <SelectItem key={col} value={col}>{col}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Oluşturma Tarihi
                      </label>
                      <Select 
                        value={fieldMappings.createdDate || ''} 
                        onValueChange={(value) => setFieldMappings(prev => ({...prev, createdDate: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Excel sütunu seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Sütun seçin</SelectItem>
                          {excelColumns.map(col => (
                            <SelectItem key={col} value={col}>{col}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Aksiyon Başlığı
                      </label>
                      <Select 
                        value={fieldMappings.actionTitle || ''} 
                        onValueChange={(value) => setFieldMappings(prev => ({...prev, actionTitle: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Excel sütunu seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Sütun seçin</SelectItem>
                          {excelColumns.map(col => (
                            <SelectItem key={col} value={col}>{col}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Ekip Lideri
                      </label>
                      <Select 
                        value={fieldMappings.teamLeader || ''} 
                        onValueChange={(value) => setFieldMappings(prev => ({...prev, teamLeader: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Excel sütunu seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Sütun seçin</SelectItem>
                          {excelColumns.map(col => (
                            <SelectItem key={col} value={col}>{col}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Ekip
                      </label>
                      <Select 
                        value={fieldMappings.team || ''} 
                        onValueChange={(value) => setFieldMappings(prev => ({...prev, team: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Excel sütunu seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Sütun seçin</SelectItem>
                          {excelColumns.map(col => (
                            <SelectItem key={col} value={col}>{col}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Kategori
                      </label>
                      <Select 
                        value={fieldMappings.category || ''} 
                        onValueChange={(value) => setFieldMappings(prev => ({...prev, category: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Excel sütunu seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Sütun seçin</SelectItem>
                          {excelColumns.map(col => (
                            <SelectItem key={col} value={col}>{col}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Hedef Tarih
                      </label>
                      <Select 
                        value={fieldMappings.targetDate || ''} 
                        onValueChange={(value) => setFieldMappings(prev => ({...prev, targetDate: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Excel sütunu seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Sütun seçin</SelectItem>
                          {excelColumns.map(col => (
                            <SelectItem key={col} value={col}>{col}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Kapanış Tarihi
                      </label>
                      <Select 
                        value={fieldMappings.closedDate || ''} 
                        onValueChange={(value) => setFieldMappings(prev => ({...prev, closedDate: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Excel sütunu seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Sütun seçin</SelectItem>
                          {excelColumns.map(col => (
                            <SelectItem key={col} value={col}>{col}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-2 text-sm">💡 Otomatik Eşleştirme Kuralları:</h4>
                  <div className="text-xs text-blue-700 space-y-1">
                    <p><strong>Kaynak:</strong> "güvenlik", "müşteri", "verim", "fire", "navlun" gibi kelimeler otomatik eşleştirilir</p>
                    <p><strong>Önem:</strong> "yüksek/high", "düşük/low", "orta/medium" otomatik tanınır</p>
                    <p><strong>Durum:</strong> "açık/open", "kapalı/closed", "devam/progress" otomatik tanınır</p>
                  </div>
                </div>
              </div>
            )}

            {/* Preview Section */}
            {excelData.length > 0 && fieldMappings.description && (
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-lg mb-3">3. Veri Önizleme (İlk 5 Kayıt)</h3>
                <div className="overflow-x-auto bg-white rounded border">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-300 p-2 text-left">Açıklama</th>
                          <th className="border border-gray-300 p-2 text-left">Kaynak</th>
                          <th className="border border-gray-300 p-2 text-left">Durum</th>
                          <th className="border border-gray-300 p-2 text-left">Önem</th>
                          <th className="border border-gray-300 p-2 text-left">Aksiyon</th>
                        </tr>
                      </thead>
                      <tbody>
                        {excelData.slice(0, 5).map((row, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="border border-gray-300 p-2 text-sm">
                              {row[fieldMappings.description] || '-'}
                            </td>
                            <td className="border border-gray-300 p-2 text-sm">
                              {sourceMappings[mapSourceValue(row[fieldMappings.source] || '')] || '-'}
                            </td>
                            <td className="border border-gray-300 p-2 text-sm">
                              <Badge className={getStatusColor(mapStatusValue(row[fieldMappings.status] || ''))}>
                                {mapStatusValue(row[fieldMappings.status] || '') === 'open' ? 'Açık' : 
                                 mapStatusValue(row[fieldMappings.status] || '') === 'closed' ? 'Kapalı' : 'Devam Ediyor'}
                              </Badge>
                            </td>
                            <td className="border border-gray-300 p-2 text-sm">
                              <Badge className={getSeverityColor(mapSeverityValue(row[fieldMappings.severity] || ''))}>
                                {mapSeverityValue(row[fieldMappings.severity] || '') === 'high' ? 'Yüksek' : 
                                 mapSeverityValue(row[fieldMappings.severity] || '') === 'low' ? 'Düşük' : 'Orta'}
                              </Badge>
                            </td>
                            <td className="border border-gray-300 p-2 text-sm">
                              {row[fieldMappings.actionTitle] || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                </div>
              </div>
            )}

            </div>

          {/* Action Buttons - Fixed at bottom */}
          <div className="flex justify-between items-center pt-4 border-t bg-white">
            <div className="text-sm text-gray-500">
              {excelData.length > 0 && (
                <span>
                  {excelData.length} satır hazır
                  {fieldMappings.description && (
                    <span className="text-green-600 ml-2">• Eşleştirme tamamlandı</span>
                  )}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsExcelImportOpen(false)}>
                İptal
              </Button>
              <Button 
                onClick={handleImportData}
                disabled={!fieldMappings.description || excelData.length === 0}
                className="bg-primary hover:bg-primary/90"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                {excelData.length > 0 ? `${excelData.length} Kaydı` : ''} İçe Aktar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create New NC Dialog */}
      <Dialog open={isCreateNCOpen} onOpenChange={setIsCreateNCOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Yeni Konu Ekle</DialogTitle>
          </DialogHeader>
          <CreateNCForm 
            onSubmit={(data) => {
              handleCreateNC(data);
              setSelectedTeamMembers([]);
            }}
            onCancel={() => setIsCreateNCOpen(false)}
            selectedTeamMembers={selectedTeamMembers}
            onTeamMembersChange={setSelectedTeamMembers}
            availableUsers={availableUsers}
          />
        </DialogContent>
      </Dialog>
        </TabsContent>

        <TabsContent value="statistics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                İstatistikler
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeStatsTab} onValueChange={setActiveStatsTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
                  <TabsTrigger value="categories">Kategoriler</TabsTrigger>
                  <TabsTrigger value="timeline">Zaman Analizi</TabsTrigger>
                  <TabsTrigger value="performance">Performans</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Açık/Kapalı Konu Dağılımı */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Konu Durumu Dağılımı</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer config={{}} className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                              <ChartTooltip content={<ChartTooltipContent />} />
                              <Pie
                                data={getStatusDistribution()}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                dataKey="value"
                              >
                                {getStatusDistribution().map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                            </RechartsPieChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                        <div className="flex justify-center gap-4 mt-4">
                          {getStatusDistribution().map((entry) => (
                            <div key={entry.name} className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: entry.color }}
                              />
                              <span className="text-sm">{entry.name}: {entry.value}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Açık Konular Durumu */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Açık Konular Durumu</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer config={{}} className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                              <ChartTooltip content={<ChartTooltipContent />} />
                              <Pie
                                data={getOpenTasksStatus()}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                dataKey="value"
                              >
                                {getOpenTasksStatus().map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                            </RechartsPieChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                        <div className="flex justify-center gap-4 mt-4">
                          {getOpenTasksStatus().map((entry) => (
                            <div key={entry.name} className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: entry.color }}
                              />
                              <span className="text-sm">{entry.name}: {entry.value}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="categories" className="space-y-6 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Kategori Dağılımı */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Kategorilere Göre Konu Dağılımı</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer config={{}} className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                              <ChartTooltip content={<ChartTooltipContent />} />
                              <Pie
                                data={getCategoryDistribution()}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                dataKey="value"
                              >
                                {getCategoryDistribution().map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                            </RechartsPieChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                        <div className="grid grid-cols-2 gap-2 mt-4">
                          {getCategoryDistribution().map((entry) => (
                            <div key={entry.name} className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: entry.color }}
                              />
                              <span className="text-xs">{entry.name}: {entry.value}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Kapalı Konular Durumu */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Kapalı Konular - Zaman Durumu</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer config={{}} className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                              <ChartTooltip content={<ChartTooltipContent />} />
                              <Pie
                                data={getClosedTasksStatus()}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                dataKey="value"
                              >
                                {getClosedTasksStatus().map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                            </RechartsPieChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                        <div className="flex justify-center gap-4 mt-4">
                          {getClosedTasksStatus().map((entry) => (
                            <div key={entry.name} className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: entry.color }}
                              />
                              <span className="text-sm">{entry.name}: {entry.value}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="timeline" className="space-y-6 mt-6">
                  {/* Haftalık Konu Dağılımı */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Haftalık Konu Dağılımları</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={{}} className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={getWeeklyDistribution()}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="week" />
                            <YAxis />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="count" fill="#3b82f6" />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="performance" className="space-y-6 mt-6">
                  <div className="grid grid-cols-1 gap-6">
                    {/* Bölüm Bazlı Çözüm Süreleri */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Bölüm Bazlı Konu Kapatma Süreleri (Gün)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer config={{}} className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={getDepartmentSolutionTimes()}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="department" />
                              <YAxis />
                              <ChartTooltip content={<ChartTooltipContent />} />
                              <Bar dataKey="min" fill="#22c55e" name="Minimum" />
                              <Bar dataKey="average" fill="#3b82f6" name="Ortalama" />
                              <Bar dataKey="max" fill="#ef4444" name="Maksimum" />
                            </BarChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                      </CardContent>
                    </Card>

                    {/* Ekip Lideri Bazlı Çözüm Süreleri */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Ekip Lideri Bazlı Konu Kapatma Süreleri (Gün)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer config={{}} className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={getTeamLeaderSolutionTimes()}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="teamLeader" angle={-45} textAnchor="end" height={100} />
                              <YAxis />
                              <ChartTooltip content={<ChartTooltipContent />} />
                              <Bar dataKey="min" fill="#22c55e" name="Minimum" />
                              <Bar dataKey="average" fill="#3b82f6" name="Ortalama" />
                              <Bar dataKey="max" fill="#ef4444" name="Maksimum" />
                            </BarChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}