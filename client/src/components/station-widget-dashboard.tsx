
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Factory, Users, Award, DollarSign, Package, Edit, Settings, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { SafetyCalendar } from './safety-calendar';
import { QualityCalendar } from './quality-calendar';
import { ProductionCalendar } from './production-calendar';
import { PremiumFreightCalendar } from './premium-freight-calendar';
import { FireScrapTable } from './fire-scrap-table';
import { DeliveryPlanTableWeekly } from './delivery-plan-table-weekly';

interface ProductionStation {
  id: string;
  name: string;
  code: string;
  description?: string;
  location?: string;
  responsibleId?: number;
  responsibleName?: string;
  isActive: boolean;
  createdAt?: string;
}

interface StationKPI {
  id: string;
  stationId: string;
  category: 'safety' | 'quality' | 'production' | 'logistics';
  title: string;
  value: number;
  target: number;
  unit: string;
  updatedAt: string;
  updatedBy: string;
}

const categoryConfig = {
  safety: {
    title: 'Çalışan KPI',
    icon: Users,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    letter: 'P'
  },
  quality: {
    title: 'Kalite KPI',
    icon: Award,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    letter: 'Q'
  },
  production: {
    title: 'Maliyet KPI',
    icon: DollarSign,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    letter: 'C'
  },
  logistics: {
    title: 'Teslimat KPI',
    icon: Package,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    letter: 'D'
  }
};

export function StationWidgetDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stations, setStations] = useState<ProductionStation[]>([]);
  const [stationKPIs, setStationKPIs] = useState<StationKPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingKPI, setEditingKPI] = useState<StationKPI | null>(null);
  const [editFormData, setEditFormData] = useState({
    value: '',
    target: '',
    title: ''
  });

  useEffect(() => {
    fetchStations();
    fetchStationKPIs();
  }, []);

  const fetchStations = async () => {
    try {
      const response = await fetch('/api/admin/production-stations');
      if (response.ok) {
        const data = await response.json();
        // Filter stations based on user role and responsibility
        let filteredStations = data.filter((station: ProductionStation) => station.isActive);
        
        if (user?.role !== 'admin') {
          filteredStations = filteredStations.filter((station: ProductionStation) => 
            station.responsibleId === user?.id
          );
        }
        
        setStations(filteredStations);
      }
    } catch (error) {
      console.error('Stations fetch error:', error);
    }
  };

  const fetchStationKPIs = async () => {
    try {
      const response = await fetch('/api/station-kpis');
      if (response.ok) {
        const data = await response.json();
        // Filter out KPIs for non-existent stations
        const validKPIs = data.filter((kpi: any) => 
          stations.some(station => station.id === kpi.station_id)
        );
        setStationKPIs(validKPIs);
      }
    } catch (error) {
      console.error('Station KPIs fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStationKPIs = (stationId: string) => {
    return stationKPIs.filter(kpi => kpi.stationId === stationId);
  };

  const getKPIsByCategory = (stationId: string, category: string) => {
    return stationKPIs.find(kpi => kpi.stationId === stationId && kpi.category === category);
  };

  const calculatePerformance = (value: number, target: number) => {
    if (target === 0) return 0;
    return Math.round((value / target) * 100);
  };

  const getPerformanceColor = (performance: number) => {
    if (performance >= 95) return 'text-green-600';
    if (performance >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  const canEditStation = (station: ProductionStation) => {
    return user?.role === 'admin' || station.responsibleId === user?.id;
  };

  const handleEditKPI = (kpi: StationKPI) => {
    setEditingKPI(kpi);
    setEditFormData({
      value: kpi.value.toString(),
      target: kpi.target.toString(),
      title: kpi.title
    });
    setEditModalOpen(true);
  };

  const handleSaveKPI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKPI) return;

    try {
      const response = await fetch(`/api/station-kpis/${editingKPI.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          value: parseFloat(editFormData.value),
          target: parseFloat(editFormData.target),
          title: editFormData.title
        })
      });

      if (response.ok) {
        toast({
          title: 'Başarılı',
          description: 'KPI başarıyla güncellendi'
        });
        fetchStationKPIs();
        setEditModalOpen(false);
      }
    } catch (error) {
      console.error('Update KPI error:', error);
      toast({
        title: 'Hata',
        description: 'KPI güncellenirken hata oluştu',
        variant: 'destructive'
      });
    }
  };

  const initializeStationKPIs = async (stationId: string) => {
    const categories = ['safety', 'quality', 'production', 'logistics'];
    
    for (const category of categories) {
      const existingKPI = getKPIsByCategory(stationId, category);
      if (!existingKPI) {
        try {
          const response = await fetch('/api/station-kpis', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              stationId: parseInt(stationId),
              category,
              title: categoryConfig[category as keyof typeof categoryConfig].title,
              value: 85, // Fixed initial value instead of random
              target: 100,
              unit: category === 'production' ? 'TL' : '%'
            })
          });
          
          // If response is not ok, log but don't break the flow
          if (!response.ok) {
            const errorData = await response.json();
            console.warn(`KPI already exists for station ${stationId}, category ${category}:`, errorData.message);
          }
        } catch (error) {
          console.warn('Initialize KPI error (likely duplicate):', error);
        }
      }
    }
  };

  const [initializedStations, setInitializedStations] = useState<Set<string>>(new Set());
  const [initializationInProgress, setInitializationInProgress] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Initialize KPIs for all stations only if we have both stations and KPIs data
    if (stations.length > 0 && stationKPIs.length >= 0) {
      stations.forEach(station => {
        // Check if station is already initialized, being initialized, or has all KPIs
        const stationKPICount = stationKPIs.filter(kpi => kpi.stationId === station.id).length;
        const isInitialized = initializedStations.has(station.id);
        const isInProgress = initializationInProgress.has(station.id);
        
        if (!isInitialized && !isInProgress && stationKPICount < 4) {
          setInitializedStations(prev => new Set(prev).add(station.id));
          setInitializationInProgress(prev => new Set(prev).add(station.id));
          
          initializeStationKPIs(station.id).finally(() => {
            setInitializationInProgress(prev => {
              const newSet = new Set(prev);
              newSet.delete(station.id);
              return newSet;
            });
            // Refresh KPIs after initialization
            fetchStationKPIs();
          });
        }
      });
    }
  }, [stations, stationKPIs]);

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">İstasyon widget'ları yükleniyor...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">İstasyon Widget Dashboard</h2>
          <p className="text-gray-600">
            {user?.role === 'admin' 
              ? 'Tüm istasyonların KPI widget\'larını görüntüleyebilir ve düzenleyebilirsiniz'
              : 'Sorumlu olduğunuz istasyonların KPI widget\'larını görüntüleyebilir ve düzenleyebilirsiniz'
            }
          </p>
        </div>
        <Badge variant="outline" className="bg-blue-50">
          {stations.length} İstasyon
        </Badge>
      </div>

      {/* Station Widgets Grid */}
      {stations.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Factory className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">İstasyon bulunamadı</h3>
            <p className="text-muted-foreground">
              {user?.role === 'admin' 
                ? 'Henüz aktif istasyon bulunmuyor. Admin panelinden yeni istasyon ekleyebilirsiniz.'
                : 'Size atanmış aktif istasyon bulunmuyor.'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {stations.map((station) => (
            <div key={station.id} className="space-y-4">
              {/* Station Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Factory className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{station.name}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span>{station.code}</span>
                      {station.location && <span>• {station.location}</span>}
                      {station.responsibleName && <span>• Sorumlu: {station.responsibleName}</span>}
                    </div>
                  </div>
                </div>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Aktif
                </Badge>
              </div>

              {/* KPI Widgets Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {Object.entries(categoryConfig).map(([category, config]) => {
                  const kpi = getKPIsByCategory(station.id, category);
                  const performance = kpi ? calculatePerformance(kpi.value, kpi.target) : 0;
                  const Icon = config.icon;
                  
                  return (
                    <Card key={`${station.id}-${category}`} className="relative group hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className={`p-1.5 rounded ${config.bgColor}`}>
                              <span className={`text-lg font-bold ${config.color}`}>
                                {config.letter}
                              </span>
                            </div>
                            <CardTitle className="text-sm font-medium">{config.title}</CardTitle>
                          </div>
                          {canEditStation(station) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => kpi && handleEditKPI(kpi)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          <div className="text-center">
                            <div className={`text-2xl font-bold ${getPerformanceColor(performance)}`}>
                              {performance}%
                            </div>
                            <div className="text-xs text-gray-500">
                              {kpi ? `${kpi.value} / ${kpi.target}` : '0 / 100'}
                            </div>
                          </div>
                          
                          {kpi && (
                            <div className="text-xs text-gray-400 text-center">
                              Son güncelleme: {new Date(kpi.updatedAt).toLocaleDateString('tr-TR')}
                            </div>
                          )}
                          
                          <div className={`h-1 bg-gray-200 rounded-full overflow-hidden`}>
                            <div 
                              className={`h-full transition-all duration-300 ${
                                performance >= 95 ? 'bg-green-500' :
                                performance >= 85 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(performance, 100)}%` }}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Calendar Widgets Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card className="h-96">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center space-x-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span>Çalışan Takvimi</span>
                      <span className="text-xs text-gray-500">İş Güvenliği - Eylül 2025</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 h-full">
                    <SafetyCalendar className="h-full" />
                  </CardContent>
                </Card>

                <Card className="h-96">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center space-x-2">
                      <Award className="h-4 w-4 text-green-600" />
                      <span>Kalite Takvimi</span>
                      <span className="text-xs text-gray-500">Müşteri Memnuniyeti - Eylül 2025</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 h-full">
                    <QualityCalendar className="h-full" />
                  </CardContent>
                </Card>

                <Card className="h-96">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-orange-600" />
                      <span>Üretim Takvimi</span>
                      <span className="text-xs text-gray-500">Verimlilik - Eylül 2025</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 h-full">
                    <ProductionCalendar className="h-full" />
                  </CardContent>
                </Card>

                <Card className="h-96">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center space-x-2">
                      <Package className="h-4 w-4 text-purple-600" />
                      <span>Ekstra Navlun</span>
                      <span className="text-xs text-gray-500">Eylül 2025</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 h-full">
                    <PremiumFreightCalendar className="h-full" />
                  </CardContent>
                </Card>
              </div>

              {/* Table Widgets Grid - Positioned below specific calendar widgets */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Empty space for Çalışan and Kalite columns */}
                <div></div>
                <div></div>
                
                {/* Fire & Scrap Table - Below Maliyet KPI (Production Calendar) */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center space-x-2">
                      <TrendingDown className="h-4 w-4 text-red-600" />
                      <span>Fire & Scrap Tablosu</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <FireScrapTable />
                  </CardContent>
                </Card>

                {/* Haftalık Teslimat Planı - Below Ekstra Navlun */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span>Haftalık Teslimat Planı</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <DeliveryPlanTableWeekly />
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit KPI Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>KPI Güncelle</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveKPI} className="space-y-4">
            <div>
              <Label htmlFor="title">Başlık</Label>
              <Input
                id="title"
                value={editFormData.title}
                onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="value">Değer</Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                value={editFormData.value}
                onChange={(e) => setEditFormData({ ...editFormData, value: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="target">Hedef</Label>
              <Input
                id="target"
                type="number"
                step="0.01"
                value={editFormData.target}
                onChange={(e) => setEditFormData({ ...editFormData, target: e.target.value })}
                required
              />
            </div>
            <Button type="submit" className="w-full">Güncelle</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
