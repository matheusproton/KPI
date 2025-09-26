import React, { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { useAuth } from '../lib/auth';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import StationWidgetDashboard from "@/components/station-widget-dashboard";
import { ArrowLeft, Home, LogOut, Settings, User } from "lucide-react";
import { Badge } from '@/components/ui/badge';
import { WidgetDashboardLayout } from '@/components/widget-dashboard-layout';
import { StationDataEntry } from '@/components/station-data-entry';
import { Factory, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProductionStation {
  id: string;
  name: string;
  code: string;
  description?: string;
  location?: string;
  responsibleName?: string;
  isActive: boolean;
}

export default function StationDashboard() {
  const [match, params] = useRoute('/station/:stationId');
  const stationId = params?.stationId;
  const { user } = useAuth();
  const { toast } = useToast();
  const [station, setStation] = useState<ProductionStation | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (stationId) {
      fetchStationDetails();
    }
  }, [stationId]);

  const fetchStationDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/production-stations');
      if (response.ok) {
        const stations = await response.json();
        const foundStation = stations.find((s: ProductionStation) => s.id === stationId);
        if (foundStation) {
          setStation(foundStation);
        } else {
          toast({
            title: 'Hata',
            description: 'İstasyon bulunamadı.',
            variant: 'destructive'
          });
        }
      }
    } catch (error) {
      console.error('Station fetch error:', error);
      toast({
        title: 'Hata',
        description: 'İstasyon bilgileri yüklenirken hata oluştu.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">İstasyon bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!station) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Factory className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">İstasyon Bulunamadı</h3>
          <p className="text-muted-foreground mb-4">Belirtilen istasyon mevcut değil.</p>
          <Button onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri Dön
          </Button>
        </div>
      </div>
    );
  }

  const setLocation = (path: string) => {
    // This is a placeholder for actual routing logic if needed,
    // for now, we'll assume it's handled by the framework or context.
    // If you were using wouter's `useLocation` directly, you'd do:
    // const [, navigate] = useLocation();
    // navigate(path);
    console.log(`Navigating to ${path}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                className="flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Geri
              </Button>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-900">
                  <Factory className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">{station.name}</h1>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{station.code}</Badge>
                    {station.location && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">📍 {station.location}</span>
                    )}
                    {station.responsibleName && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">👤 {station.responsibleName}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Badge
                variant={station.isActive ? "default" : "secondary"}
                className={station.isActive ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"}
              >
                {station.isActive ? 'Aktif' : 'Pasif'}
              </Badge>

              {/* Theme Toggle */}
              <ThemeToggle />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-blue-500 text-white">
                        {user?.username?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuItem inset onClick={() => setLocation("/profile")}>
                    <User className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>Profil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem inset onClick={() => setLocation("/settings")}>
                    <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>Ayarlar</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem inset onClick={() => setLocation("/logout")}>
                    <LogOut className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>Çıkış Yap</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-300'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
              }`}
              onClick={() => setActiveTab('dashboard')}
            >
              📊 Genel Görünüm
            </button>
            <button
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'data-entry'
                  ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-300'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
              }`}
              onClick={() => setActiveTab('data-entry')}
            >
              ✏️ Veri Girişi
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <div>
            {/* Station Info Card */}
            {station.description && (
              <Card className="mb-6 dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="p-4 text-gray-700 dark:text-gray-300">
                  {station.description}
                </CardContent>
              </Card>
            )}

            {/* Widget Dashboard - Station specific data */}
            <StationSpecificWidgetLayout stationId={station.id} stationCode={station.code} />
          </div>
        )}

        {activeTab === 'data-entry' && (
          <div className="max-w-2xl mx-auto">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Plus className="h-5 w-5 dark:text-gray-300" />
                  {station.name} - Veri Girişi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StationDataEntry defaultStationId={station.id} />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

// Station-specific widget layout component
function StationSpecificWidgetLayout({ stationId, stationCode }: { stationId: string; stationCode: string }) {
  return (
    <div className="space-y-6">
      {/* Station-specific header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200 dark:from-blue-900 dark:to-indigo-900 dark:border-blue-800">
        <h2 className="text-lg font-semibold text-blue-900 mb-2 dark:text-blue-400">
          {stationCode} İstasyonu - Detaylı Görünüm
        </h2>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Bu dashboard sadece {stationCode} istasyonuna ait verileri göstermektedir.
          Genel konsolidasyon için ana dashboard'u kullanın.
        </p>
      </div>

      {/* Render the same widget layout but filtered for this station */}
      <WidgetDashboardLayout stationFilter={stationId} />
    </div>
  );
}