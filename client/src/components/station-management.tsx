
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLocation } from 'wouter';
import { Factory, Eye, BarChart3, Users, MapPin } from 'lucide-react';

interface ProductionStation {
  id: string;
  name: string;
  code: string;
  description?: string;
  location?: string;
  responsibleName?: string;
  isActive: boolean;
  createdAt?: string;
}

export function StationManagement() {
  const [location, setLocation] = useLocation();
  const [stations, setStations] = useState<ProductionStation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/production-stations');
      if (response.ok) {
        const data = await response.json();
        setStations(data.filter((station: ProductionStation) => station.isActive));
      }
    } catch (error) {
      console.error('Stations fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateToStation = (stationId: string) => {
    setLocation(`/station/${stationId}`);
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">İstasyonlar yükleniyor...</p>
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
          <h2 className="text-2xl font-bold text-gray-900">Üretim İstasyonları</h2>
          <p className="text-gray-600">Her istasyonun kendi dashboard'unu görüntüleyebilirsiniz</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-blue-50">
            {stations.length} Aktif İstasyon
          </Badge>
        </div>
      </div>

      {/* Stations Grid */}
      {stations.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Factory className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Henüz istasyon bulunmuyor</h3>
            <p className="text-muted-foreground">
              Admin panelinden üretim istasyonları tanımlayabilirsiniz.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stations.map((station) => (
            <Card key={station.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Factory className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{station.name}</CardTitle>
                      <Badge variant="outline" className="mt-1">
                        {station.code}
                      </Badge>
                    </div>
                  </div>
                  <Badge 
                    variant="default"
                    className="bg-green-100 text-green-800"
                  >
                    Aktif
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {station.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {station.description}
                    </p>
                  )}
                  
                  <div className="space-y-2">
                    {station.location && (
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-2" />
                        {station.location}
                      </div>
                    )}
                    {station.responsibleName && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="h-4 w-4 mr-2" />
                        {station.responsibleName}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t">
                    <Button 
                      onClick={() => navigateToStation(station.id)}
                      className="w-full"
                      size="sm"
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Dashboard'ı Görüntüle
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
