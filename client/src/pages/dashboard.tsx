import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { KpiCard } from '@/components/kpi-card';
import { SafetyChecklist } from '@/components/safety-checklist';
import { CustomerSatisfactionChecklist } from '@/components/customer-satisfaction-checklist';
import { ProductivityTable } from '@/components/productivity-table';
import { FireScrapTable } from '@/components/fire-scrap-table';
import { DeliveryPlanTable } from '@/components/delivery-plan-table';
import { PremiumFreightsTable } from '@/components/premium-freights-table';
import { ActionModal } from '@/components/action-modal';
import { ActionTracking } from '@/components/action-tracking';
import { WidgetDashboardLayout } from '@/components/widget-dashboard-layout';
import AdminPanel from './admin';
import ProfilePage from './profile';
import ClaimsPage from './claims';
import { SafetyCalendar } from '@/components/safety-calendar';
import { QualityCalendar } from '@/components/quality-calendar';
import { ProductionCalendar } from '@/components/production-calendar';
import { PremiumFreightCalendar } from '@/components/premium-freight-calendar'; // Assuming this import exists
import { DeliveryPlanTableWeekly } from '@/components/delivery-plan-table-weekly';
import { MonthlyChart } from '@/components/monthly-chart';
import { apiRequest } from '@/lib/queryClient';
import { Factory, Users, Award, DollarSign, Package, Plus, LogOut, Home, Shield, UserCog, User, AlertTriangle, TrendingUp } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Settings, Eye } from 'lucide-react';
import { StationManagement } from '@/components/station-management';
import { StationWidgetDashboard } from '@/components/station-widget-dashboard';
import { ThemeToggle } from "@/components/theme-toggle";


export default function Dashboard() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [editingActionId, setEditingActionId] = useState<string | undefined>();

  // Dummy addWidget function, replace with actual implementation if needed
  const addWidget = (widgetType: string) => {
    console.log(`Adding widget: ${widgetType}`);
    // In a real application, this would update the state to add a new widget
    // to the WidgetDashboardLayout.
  };

  const { data: latestKpiData = [] } = useQuery({
    queryKey: ['/api/kpi/latest'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: actionItems = [] } = useQuery({
    queryKey: ['/api/actions'],
    refetchInterval: 60000, // Refresh every minute
  });

  const { data: activityLogs = [] } = useQuery({
    queryKey: ['/api/activity'],
    staleTime: 30000,
  });

  const deleteActionMutation = useMutation({
    mutationFn: async (actionId: string) => {
      const response = await apiRequest('DELETE', `/api/actions/${actionId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/actions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/activity'] });
      toast({
        title: 'Başarılı',
        description: 'Aksiyon başarıyla silindi',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message || 'Aksiyon silinirken hata oluştu',
        variant: 'destructive',
      });
    },
  });

  const getKpiStatus = (percentage: number) => {
    if (percentage >= 95) return 'success';
    if (percentage >= 85) return 'warning';
    return 'destructive';
  };

  const getKpiSubtitle = (dept: any) => {
    switch (dept.department) {
      case 'Safety':
        return dept.metadata?.daysSinceIncident ? `${dept.metadata.daysSinceIncident} gün kaza yok` : 'Çalışan KPI';
      case 'Quality':
        return dept.metadata?.defectRate ? `${dept.metadata.defectRate}% hata oranı` : 'Kalite KPI';
      case 'Production':
        return dept.metadata?.actualProduction ? `${dept.value} / ${dept.target} maliyet` : 'Maliyet KPI';
      case 'Logistics':
        return 'Zamanında teslimat';
      default:
        return 'KPI';
    }
  };

  const handleEditAction = (action: any) => {
    setEditingActionId(action.id);
    setActionModalOpen(true);
  };

  const handleDeleteAction = async (actionId: string) => {
    if (window.confirm('Bu aksiyonu silmek istediğinizden emin misiniz?')) {
      await deleteActionMutation.mutateAsync(actionId);
    }
  };

  const handleAddAction = () => {
    setEditingActionId(undefined);
    setActionModalOpen(true);
  };

  const canEditAction = (action: any) => {
    return user?.role === 'Admin' ||
           user?.id === action.createdBy ||
           user?.id === action.assigneeId ||
           user?.permissions?.includes(action.department);
  };

  const criticalActions = actionItems
    .filter((action: any) => action.priority === 'high' || action.status === 'open')
    .slice(0, 5);

  const recentUpdates = activityLogs.slice(0, 6);

  return (
    <div className="min-h-screen bg-background w-full overflow-x-hidden">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg" data-testid="header-dashboard">
        <div className="w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Factory className="text-2xl" />
              <h1 className="text-2xl font-bold">Fabrika KPI Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm" data-testid="text-current-time">
                {new Date().toLocaleString('tr-TR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-medium" data-testid="text-user-name">{user?.name}</span>
                <Badge variant="secondary" data-testid="text-user-role">{user?.role}</Badge>
              </div>
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab('profile')}
                data-testid="button-profile"
              >
                <UserCog className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                data-testid="button-logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-0 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} data-testid="tabs-main">
          <TabsList className={`grid w-full ${user?.role === 'admin' ? 'grid-cols-7' : 'grid-cols-6'} mb-6`} data-testid="tabs-list">
            <TabsTrigger value="overview" data-testid="tab-overview">
              <Home className="mr-2 h-4 w-4" />
              Genel Görünüm
            </TabsTrigger>
            <TabsTrigger value="action-tracking" data-testid="tab-action-tracking">
              <Plus className="mr-2 h-4 w-4" />
              Aksiyon Takibi
            </TabsTrigger>
            <TabsTrigger value="claims" data-testid="tab-claims">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Şikayetler</TabsTrigger>
            <TabsTrigger value="trends" data-testid="tab-trends">
              <TrendingUp className="mr-2 h-4 w-4" />
              Aylık Trendler
            </TabsTrigger>
            <TabsTrigger value="station-widgets" data-testid="tab-station-widgets">
              <Factory className="mr-2 h-4 w-4" />
              İstasyonlar
            </TabsTrigger>
            <TabsTrigger value="profile" data-testid="tab-profile">
              <User className="mr-2 h-4 w-4" />
              Profil
            </TabsTrigger>
            {user?.role === 'admin' && (
              <TabsTrigger value="admin" data-testid="tab-admin">
                <UserCog className="mr-2 h-4 w-4" />
                Admin
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview" data-testid="content-overview">
            {/* Flexible Widget Dashboard Layout */}
            <WidgetDashboardLayout />
          </TabsContent>

          <TabsContent value="action-tracking" data-testid="content-action-tracking">
            <ActionTracking />
          </TabsContent>

          <TabsContent value="claims" data-testid="content-claims">
            <ClaimsPage />
          </TabsContent>

          <TabsContent value="trends" data-testid="content-trends">
            <MonthlyChart />
          </TabsContent>

          <TabsContent value="station-widgets" data-testid="content-station-widgets">
            <StationWidgetDashboard />
          </TabsContent>

          <TabsContent value="profile" data-testid="content-profile">
            <ProfilePage />
          </TabsContent>

          {user?.role === 'admin' && (
            <TabsContent value="admin" data-testid="content-admin">
              <AdminPanel />
            </TabsContent>
          )}

          {['safety', 'quality', 'production', 'logistics'].map((dept) => {
            const deptName = dept.charAt(0).toUpperCase() + dept.slice(1);

            return (
              <TabsContent key={dept} value={dept} data-testid={`content-${dept}`}>
                <div className="space-y-6">
                  {/* Department specific tables */}
                  {dept === 'production' && (
                    <Card className="bg-card shadow-sm border border-border">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold text-card-foreground">Üretim Widgetları</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Carousel className="w-full max-w-full">
                          <CarouselContent>
                            <CarouselItem>
                              <ProductivityTable />
                            </CarouselItem>
                            <CarouselItem>
                              <FireScrapTable />
                            </CarouselItem>
                            {/* Add more CarouselItems for other widgets as needed */}
                          </CarouselContent>
                          <CarouselPrevious />
                          <CarouselNext />
                        </Carousel>
                      </CardContent>
                    </Card>
                  )}

                  <Card className="bg-card shadow-sm border border-border">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-card-foreground">
                        {deptName} Aksiyonları
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {actionItems
                          .filter((action: any) => action.department === deptName)
                          .map((action: any) => (
                            <ActionItemCard
                              key={action.id}
                              id={action.id}
                              title={action.title}
                              description={action.description}
                              department={action.department}
                              priority={action.priority}
                              status={action.status}
                              assigneeName={action.assigneeName}
                              dueDate={action.dueDate}
                              onEdit={handleEditAction}
                              onDelete={handleDeleteAction}
                              canEdit={canEditAction(action)}
                            />
                          ))}
                        {actionItems.filter((action: any) => action.department === deptName).length === 0 && (
                          <p className="text-center text-muted-foreground py-4" data-testid={`text-no-${dept}-actions`}>
                            Bu departman için henüz aksiyon bulunmuyor
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            );
          })}

        </Tabs>
      </main>

      {/* Action Modal */}
      <ActionModal
        isOpen={actionModalOpen}
        onClose={() => setActionModalOpen(false)}
        actionId={editingActionId}
        defaultDepartment={user?.role !== 'Admin' ? user?.role : undefined}
      />
    </div>
  );
}

// Placeholder for ActionItemCard, assuming it exists and is used elsewhere.
// If ActionItemCard is not defined, this will cause a runtime error.
// For the purpose of this example, we'll assume it's a pre-existing component.
function ActionItemCard(props: any) {
  return (
    <Card className="bg-card shadow-sm border border-border p-4">
      <CardHeader className="p-0 mb-2">
        <CardTitle className="text-base font-semibold text-card-foreground">{props.title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <p className="text-sm text-muted-foreground mb-2">{props.description}</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Departman: {props.department}</span>
          <span>Atanan: {props.assigneeName}</span>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
          <span>Öncelik: {props.priority}</span>
          <span>Durum: {props.status}</span>
        </div>
        {props.dueDate && (
          <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
            <span>Son Teslim Tarihi: {props.dueDate}</span>
            {props.canEdit && (
              <div className="flex space-x-2">
                <Button variant="link" size="sm" onClick={() => props.onEdit(props.id)}>Düzenle</Button>
                <Button variant="link" size="sm" className="text-destructive" onClick={() => props.onDelete(props.id)}>Sil</Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}