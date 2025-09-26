
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Save, Factory } from 'lucide-react';

interface ProductionStation {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
}

interface StationDataEntryProps {
  defaultStationId?: string;
}

export function StationDataEntry({ defaultStationId }: StationDataEntryProps = {}) {
  const { toast } = useToast();
  const [stations, setStations] = useState<ProductionStation[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    stationId: defaultStationId || '',
    date: new Date().toISOString().split('T')[0],
    day: new Date().getDate().toString(),
    dataType: '',
    eventType: '',
    description: '',
    severity: 'medium',
    status: 'active'
  });

  useEffect(() => {
    fetchStations();
  }, []);

  useEffect(() => {
    if (defaultStationId) {
      setFormData(prev => ({
        ...prev,
        stationId: defaultStationId
      }));
    }
  }, [defaultStationId]);

  const fetchStations = async () => {
    try {
      const response = await fetch('/api/admin/production-stations');
      if (response.ok) {
        const data = await response.json();
        setStations(data.filter((station: ProductionStation) => station.isActive));
      }
    } catch (error) {
      console.error('Stations fetch error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.stationId || !formData.dataType || !formData.description) {
      toast({
        title: 'Hata',
        description: 'Lütfen tüm gerekli alanları doldurun.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/station-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast({
          title: 'Başarılı',
          description: 'Veri başarıyla kaydedildi.'
        });
        
        // Reset form
        setFormData({
          stationId: '',
          date: new Date().toISOString().split('T')[0],
          day: new Date().getDate().toString(),
          dataType: '',
          eventType: '',
          description: '',
          severity: 'medium',
          status: 'active'
        });
      } else {
        throw new Error('Kayıt işlemi başarısız');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: 'Hata',
        description: 'Veri kaydedilirken hata oluştu.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Factory className="h-5 w-5" />
          İstasyon Veri Girişi
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="station">İstasyon *</Label>
              <Select 
                value={formData.stationId}
                onValueChange={(value) => setFormData({ ...formData, stationId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="İstasyon seçin" />
                </SelectTrigger>
                <SelectContent>
                  {stations.map((station) => (
                    <SelectItem key={station.id} value={station.id}>
                      {station.name} ({station.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dataType">Kategori *</Label>
              <Select 
                value={formData.dataType}
                onValueChange={(value) => setFormData({ ...formData, dataType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kategori seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="safety">🛡️ İş Güvenliği</SelectItem>
                  <SelectItem value="quality">⚡ Kalite</SelectItem>
                  <SelectItem value="production">⚙️ Üretim</SelectItem>
                  <SelectItem value="logistics">🚚 Lojistik</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="date">Tarih</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="day">Gün</Label>
              <Input
                id="day"
                type="number"
                min="1"
                max="31"
                value={formData.day}
                onChange={(e) => setFormData({ ...formData, day: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="eventType">Olay Türü</Label>
              <Input
                id="eventType"
                value={formData.eventType}
                onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                placeholder="Örn: Kaza, Hata, Duruş, Gecikme"
              />
            </div>

            <div>
              <Label htmlFor="severity">Önem Derecesi</Label>
              <Select 
                value={formData.severity}
                onValueChange={(value) => setFormData({ ...formData, severity: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">🟢 Düşük</SelectItem>
                  <SelectItem value="medium">🟡 Orta</SelectItem>
                  <SelectItem value="high">🟠 Yüksek</SelectItem>
                  <SelectItem value="critical">🔴 Kritik</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Açıklama *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Olay detaylarını açıklayın..."
              rows={3}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Kaydet
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}


