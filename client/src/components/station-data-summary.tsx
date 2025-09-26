
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, Clock, Factory, TrendingDown, TrendingUp } from 'lucide-react';

interface StationEvent {
  id: string;
  day: number;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'resolved' | 'closed';
  createdAt: string;
}

interface StationSummary {
  stationName: string;
  stationCode: string;
  dataType: 'safety' | 'quality' | 'production' | 'logistics';
  events: StationEvent[];
}

const dataTypeLabels = {
  safety: 'İş Güvenliği',
  quality: 'Kalite',
  production: 'Üretim',
  logistics: 'Lojistik'
};

const dataTypeIcons = {
  safety: '🛡️',
  quality: '⚡',
  production: '⚙️',
  logistics: '🚚'
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical': return 'bg-red-600 text-white';
    case 'high': return 'bg-red-500 text-white';
    case 'medium': return 'bg-yellow-500 text-white';
    case 'low': return 'bg-green-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'resolved': return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'closed': return <CheckCircle className="h-4 w-4 text-gray-600" />;
    default: return <AlertTriangle className="h-4 w-4 text-red-600" />;
  }
};

export function StationDataSummary() {
  const [stationData, setStationData] = useState<StationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDataType, setSelectedDataType] = useState<string>('all');

  useEffect(() => {
    fetchStationData();
  }, []);

  const fetchStationData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/station-summary');
      if (response.ok) {
        const data = await response.json();
        setStationData(data);
      }
    } catch (error) {
      console.error('Station data fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = selectedDataType === 'all' 
    ? stationData 
    : stationData.filter(station => station.dataType === selectedDataType);

  const totalActiveEvents = stationData.reduce((total, station) => 
    total + station.events.filter(event => event.status === 'active').length, 0
  );

  const totalResolvedEvents = stationData.reduce((total, station) => 
    total + station.events.filter(event => event.status === 'resolved').length, 0
  );

  if (loading) {
    return (
      <Card className="w-full h-64">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Veriler yükleniyor...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium text-red-600">Aktif Olaylar</p>
                <p className="text-2xl font-bold text-red-700">{totalActiveEvents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-green-600">Çözülen Olaylar</p>
                <p className="text-2xl font-bold text-green-700">{totalResolvedEvents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Factory className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-blue-600">Aktif İstasyonlar</p>
                <p className="text-2xl font-bold text-blue-700">{stationData.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedDataType === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedDataType('all')}
        >
          Tümü ({stationData.length})
        </Button>
        {Object.entries(dataTypeLabels).map(([type, label]) => {
          const count = stationData.filter(s => s.dataType === type).length;
          return (
            <Button
              key={type}
              variant={selectedDataType === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedDataType(type)}
              disabled={count === 0}
            >
              {dataTypeIcons[type as keyof typeof dataTypeIcons]} {label} ({count})
            </Button>
          );
        })}
      </div>

      {/* Station Data */}
      <div className="grid gap-4">
        {filteredData.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Factory className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Henüz veri bulunmuyor</h3>
              <p className="text-muted-foreground">
                {selectedDataType === 'all' 
                  ? 'Üretim istasyonlarından henüz veri girişi yapılmamış.'
                  : `${dataTypeLabels[selectedDataType as keyof typeof dataTypeLabels]} kategorisinde veri bulunmuyor.`
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredData.map((station) => (
            <Card key={`${station.stationCode}-${station.dataType}`} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">
                      {dataTypeIcons[station.dataType]}
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {station.stationName} ({station.stationCode})
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {dataTypeLabels[station.dataType]} • {station.events.length} olay
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="bg-blue-50">
                      {station.events.filter(e => e.status === 'active').length} aktif
                    </Badge>
                    <Badge variant="outline" className="bg-green-50">
                      {station.events.filter(e => e.status === 'resolved').length} çözüldü
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {station.events.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start justify-between p-3 bg-muted/30 rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          {getStatusIcon(event.status)}
                          <Badge 
                            className={`text-xs ${getSeverityColor(event.severity)}`}
                          >
                            {event.severity === 'critical' ? 'Kritik' :
                             event.severity === 'high' ? 'Yüksek' :
                             event.severity === 'medium' ? 'Orta' : 'Düşük'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {event.day}. gün
                          </span>
                        </div>
                        <p className="text-sm font-medium line-clamp-2">
                          {event.description}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {station.events.length > 3 && (
                    <div className="text-center pt-2">
                      <Button variant="ghost" size="sm" className="text-xs">
                        {station.events.length - 3} olay daha göster
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}


