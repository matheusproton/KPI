import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResizableWidgetWrapper } from './resizable-widget-wrapper';
import { KpiCard } from './kpi-card';
import { SafetyCalendar } from './safety-calendar';
import { QualityCalendar } from './quality-calendar';
import { ProductionCalendar } from './production-calendar';
import { PremiumFreightCalendar } from './premium-freight-calendar';
import { FireScrapTable } from './fire-scrap-table';
import { DeliveryPlanTableWeekly } from './delivery-plan-table-weekly';
import { ProductivityTable } from './productivity-table';
import { RotateCcw, Save, Plus, Eye, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ExcelImportChart } from './excel-import-chart';
import { MonthlyChart } from './monthly-chart';
import { OpenIssuesWidget } from './open-issues-widget';
import { ClosedIssuesWidget } from './closed-issues-widget';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

type WidgetType = 
  | 'kpi-overview' 
  | 'safety-checklist' 
  | 'quality-checklist'
  | 'productivity-table'
  | 'fire-scrap-table'
  | 'delivery-plan-table'
  | 'premium-freights-table'
  | 'safety-calendar'
  | 'quality-calendar'
  | 'production-calendar'
  | 'premium-freight-calendar'
  | 'delivery-plan-table-weekly'
  | 'excel-import-chart'
  | 'monthly-chart'
  | 'open-issues'
  | 'closed-issues';

interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  component: React.ReactNode;
  width: number;
  height: number;
  x: number;
  y: number;
  visible: boolean;
}

const availableWidgets: WidgetType[] = [
    'kpi-overview',
    'safety-checklist',
    'quality-checklist',
    'productivity-table',
    'fire-scrap-table',
    'delivery-plan-table',
    'premium-freights-table',
    'safety-calendar',
    'quality-calendar',
    'production-calendar',
    'premium-freight-calendar',
    'delivery-plan-table-weekly',
    'excel-import-chart',
    'monthly-chart',
    'open-issues',
    'closed-issues'
  ];

function getWidgetTitle(widgetType: WidgetType): string {
  switch (widgetType) {
    case 'kpi-overview':
      return 'Genel Bakış KPI';
    case 'safety-checklist':
      return 'Çalışan Kontrol Listesi';
    case 'quality-checklist':
      return 'Kalite Kontrol Listesi';
    case 'productivity-table':
      return 'Üretim Tablosu';
    case 'fire-scrap-table':
      return 'Fire & Hurda Tablosu';
    case 'delivery-plan-table':
      return 'Teslimat Planı';
    case 'premium-freights-table':
      return 'Ekstra Navlun Tablosu';
    case 'safety-calendar':
      return 'Çalışan Takvimi';
    case 'quality-calendar':
      return 'Kalite Takvimi';
    case 'production-calendar':
      return 'Üretim Takvimi';
    case 'premium-freight-calendar':
      return 'Ekstra Navlun Takvimi';
    case 'delivery-plan-table-weekly':
      return 'Haftalık Teslimat Planı';
    case 'excel-import-chart':
      return 'Excel Veri İçe Aktarma';
    case 'monthly-chart':
      return 'Aylık Trend Analizi';
    case 'open-issues':
      return 'Açık Konular';
    case 'closed-issues':
      return 'Kapalı Konular';
    default:
      return 'Bilinmeyen Widget';
  }
}

function renderWidgetContent(widgetType: WidgetType): React.ReactNode {
  switch (widgetType) {
    case 'kpi-overview':
      return <KpiCard department="Overview" percentage={90} subtitle="Genel Durum" status="success" />;
    case 'safety-checklist':
      return <div className="p-4 text-center">Çalışan Güvenlik Kontrol Listesi İçeriği</div>;
    case 'quality-checklist':
      return <div className="p-4 text-center">Kalite Kontrol Listesi İçeriği</div>;
    case 'productivity-table':
      return <ProductivityTable />;
    case 'fire-scrap-table':
      return <FireScrapTable />;
    case 'delivery-plan-table':
      return <div className="p-4 text-center">Teslimat Planı İçeriği</div>;
    case 'premium-freights-table':
      return <div className="p-4 text-center">Ekstra Navlun Tablosu İçeriği</div>;
    case 'safety-calendar':
      return <SafetyCalendar />;
    case 'quality-calendar':
      return <QualityCalendar />;
    case 'production-calendar':
      return <ProductionCalendar />;
    case 'premium-freight-calendar':
      return <PremiumFreightCalendar />;
    case 'delivery-plan-table-weekly':
      return <DeliveryPlanTableWeekly />;
    case 'excel-import-chart':
      return <ExcelImportChart />;
    case 'monthly-chart':
      return <MonthlyChart />;
    case 'open-issues':
      return <OpenIssuesWidget />;
    case 'closed-issues':
      return <ClosedIssuesWidget />;
    default:
      return <div>Desteklenmeyen widget tipi</div>;
  }
}

export function WidgetDashboardLayout() {
  // Default widget configuration
  const defaultWidgets: WidgetConfig[] = [
    {
      id: 'safety-kpi',
      type: 'kpi-overview',
      title: 'Çalışan KPI',
      component: <KpiCard department="Safety" percentage={95} subtitle="Çalışan KPI" status="success" />,
      width: 280,
      height: 180,
      x: 20,
      y: 20,
      visible: true
    },
    {
      id: 'quality-kpi',
      type: 'kpi-overview',
      title: 'Kalite KPI',
      component: <KpiCard department="Quality" percentage={92} subtitle="Kalite KPI" status="warning" />,
      width: 280,
      height: 180,
      x: 320,
      y: 20,
      visible: true
    },
    {
      id: 'production-kpi',
      type: 'kpi-overview',
      title: 'Maliyet KPI',
      component: <KpiCard department="Production" percentage={88} subtitle="Maliyet KPI" status="warning" />,
      width: 280,
      height: 180,
      x: 620,
      y: 20,
      visible: true
    },
    {
      id: 'logistics-kpi',
      type: 'kpi-overview',
      title: 'Teslimat KPI',
      component: <KpiCard department="Logistics" percentage={97} subtitle="Zamanında teslimat" status="success" />,
      width: 280,
      height: 180,
      x: 920,
      y: 20,
      visible: true
    },
    {
      id: 'safety-calendar',
      type: 'safety-calendar',
      title: 'Çalışan Takvimi',
      component: <SafetyCalendar />,
      width: 350,
      height: 300,
      x: 20,
      y: 220,
      visible: true
    },
    {
      id: 'quality-calendar',
      type: 'quality-calendar',
      title: 'Kalite Takvimi',
      component: <QualityCalendar />,
      width: 350,
      height: 300,
      x: 390,
      y: 220,
      visible: true
    },
    {
      id: 'production-calendar',
      type: 'production-calendar',
      title: 'Üretim Takvimi',
      component: <ProductionCalendar />,
      width: 350,
      height: 300,
      x: 760,
      y: 220,
      visible: true
    },
    {
      id: 'fire-scrap-table',
      type: 'fire-scrap-table',
      title: 'Fire & Scrap Tablosu',
      component: <FireScrapTable />,
      width: 400,
      height: 280,
      x: 20,
      y: 540,
      visible: true
    },
    {
      id: 'delivery-plan-weekly',
      type: 'delivery-plan-table-weekly',
      title: 'Haftalık Teslimat Planı',
      component: <DeliveryPlanTableWeekly />,
      width: 400,
      height: 280,
      x: 440,
      y: 540,
      visible: true
    },
    {
      id: 'premium-freight-calendar',
      type: 'premium-freight-calendar',
      title: 'Ekstra Navlun - Eylül 2025',
      component: <PremiumFreightCalendar />,
      width: 350,
      height: 400,
      x: 1130,
      y: 220,
      visible: true
    },
    {
      id: 'open-issues',
      type: 'open-issues',
      title: 'Açık Konular',
      component: <OpenIssuesWidget />,
      width: 400,
      height: 350,
      x: 860,
      y: 540,
      visible: true
    },
    {
      id: 'closed-issues',
      type: 'closed-issues',
      title: 'Kapalı Konular',
      component: <ClosedIssuesWidget />,
      width: 400,
      height: 350,
      x: 1280,
      y: 540,
      visible: true
    },
    {
      id: 'monthly-trend-analysis',
      type: 'monthly-chart',
      title: 'Aylık Trend Analizi',
      component: <MonthlyChart />,
      width: 450,
      height: 400,
      x: 1130,
      y: 640,
      visible: true
    }
  ];

  // Initialize widgets with saved layout or defaults
  const [widgets, setWidgets] = useState<WidgetConfig[]>(() => {
    const savedLayout = localStorage.getItem('dashboardLayout');
    if (savedLayout) {
      try {
        const layoutData = JSON.parse(savedLayout);
        // Merge saved layout data with default widget components
        return defaultWidgets.map(defaultWidget => {
          const savedWidget = layoutData.find((w: any) => w.id === defaultWidget.id);
          return savedWidget ? { ...defaultWidget, ...savedWidget } : defaultWidget;
        });
      } catch (error) {
        console.error('Error loading saved layout:', error);
        return defaultWidgets;
      }
    }
    return defaultWidgets;
  });

  const [layoutHistory, setLayoutHistory] = useState<WidgetConfig[][]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const updateWidget = useCallback((widgetId: string, updates: Partial<WidgetConfig>) => {
    setWidgets(prev => {
      const newWidgets = prev.map(widget => 
        widget.id === widgetId ? { ...widget, ...updates } : widget
      );
      return newWidgets;
    });
  }, []);

  const handleWidgetResize = useCallback((widgetId: string) => (width: number, height: number) => {
    updateWidget(widgetId, { width, height });
  }, [updateWidget]);

  const handleWidgetMove = useCallback((widgetId: string) => (x: number, y: number) => {
    updateWidget(widgetId, { x, y });
  }, [updateWidget]);

  const saveLayout = () => {
    setLayoutHistory(prev => [...prev, widgets]);

    // Only save layout data, exclude components to avoid circular reference
    const layoutData = widgets.map(widget => ({
      id: widget.id,
      type: widget.type,
      title: widget.title,
      width: widget.width,
      height: widget.height,
      x: widget.x,
      y: widget.y,
      visible: widget.visible
    }));

    localStorage.setItem('dashboardLayout', JSON.stringify(layoutData));
    setSuccessMessage('Kayıt işlemi başarılı!');
    setTimeout(() => setSuccessMessage(null), 3000); // 3 saniye sonra mesajı kaldır
  };

  const resetLayout = () => {
    if (layoutHistory.length > 0) {
      const previousLayout = layoutHistory[layoutHistory.length - 1];
      setWidgets(previousLayout);
      setLayoutHistory(prev => prev.slice(0, -1));
    }
  };

  const toggleWidgetVisibility = (widgetId: string) => {
    updateWidget(widgetId, { 
      visible: !widgets.find(w => w.id === widgetId)?.visible 
    });
  };

  const addWidget = (type: WidgetType) => {
    const newWidget: WidgetConfig = {
      id: `widget-${Date.now()}`,
      type: type,
      title: getWidgetTitle(type),
      component: renderWidgetContent(type),
      width: 300,
      height: 200,
      x: 50,
      y: 50,
      visible: true
    };
    setWidgets(prev => [...prev, newWidget]);
  };

  const resetToDefaultLayout = () => {
    setWidgets(defaultWidgets);
    localStorage.removeItem('dashboardLayout');
    console.log('Layout reset to default!');
  };

  return (
    <div className="relative">
      {/* Simplified Layout Controls */}
      <div className="mb-4 flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border">
        {successMessage && (
          <div className="text-green-600 text-sm font-medium ml-2">{successMessage}</div>
        )}
        <div className="flex items-center gap-2">
          <Button onClick={saveLayout} size="sm" variant="outline" className="flex items-center gap-1">
            <Save className="h-3 w-3" />
            Kaydet
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <RotateCcw className="h-3 w-3" />
                Ayarlar
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel>Dashboard Ayarları</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={resetLayout} className="cursor-pointer">
                <RotateCcw className="h-4 w-4 mr-2" />
                Geri Al
              </DropdownMenuItem>
              <DropdownMenuItem onClick={resetToDefaultLayout} className="cursor-pointer">
                <RotateCcw className="h-4 w-4 mr-2" />
                Varsayılana Sıfırla
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <DropdownMenuItem className="cursor-pointer">
                    <Plus className="h-4 w-4 mr-2" />
                    Widget Ekle
                  </DropdownMenuItem>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuLabel>Widget Seç</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Select onValueChange={(value) => addWidget(value as WidgetType)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Widget Türü Seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableWidgets.map(widgetType => (
                        <SelectItem key={widgetType} value={widgetType}>
                          {getWidgetTitle(widgetType)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </DropdownMenuContent>
              </DropdownMenu>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              Görünüm
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Widget Görünürlüğü</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {widgets.map(widget => (
              <DropdownMenuCheckboxItem
                key={widget.id}
                checked={widget.visible}
                onCheckedChange={() => toggleWidgetVisibility(widget.id)}
                className="cursor-pointer"
              >
                {widget.title}
              </DropdownMenuCheckboxItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => {
                widgets.forEach(widget => {
                  if (!widget.visible) toggleWidgetVisibility(widget.id);
                });
              }}
              className="cursor-pointer"
            >
              <Eye className="h-4 w-4 mr-2" />
              Tümünü Göster
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Widget Container */}
      <div className="relative min-h-[1200px] bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
        {widgets
          .filter(widget => widget.visible)
          .map(widget => (
            <ResizableWidgetWrapper
              key={widget.id}
              title={widget.title}
              initialWidth={widget.width}
              initialHeight={widget.height}
              initialX={widget.x}
              initialY={widget.y}
              onResize={handleWidgetResize(widget.id)}
              onMove={handleWidgetMove(widget.id)}
            >
              {widget.component}
            </ResizableWidgetWrapper>
          ))}
      </div>
    </div>
  );
}