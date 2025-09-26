import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProductionCalendarProps {
  className?: string;
}

export function ProductionCalendar({ className }: ProductionCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const currentMonth = currentDate.toLocaleDateString('tr-TR', { 
    month: 'long', 
    year: 'numeric' 
  });
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  // Her gece 00:00'da tarihi güncelle
  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      const currentStateDate = new Date(currentDate);
      
      // Eğer ay değiştiyse state'i güncelle
      if (now.getMonth() !== currentStateDate.getMonth() || 
          now.getFullYear() !== currentStateDate.getFullYear()) {
        setCurrentDate(new Date());
      }
    };
    
    // Her 1 saatte bir kontrol et
    const interval = setInterval(updateDate, 1000 * 60 * 60);
    
    return () => clearInterval(interval);
  }, [currentDate]);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = (new Date(year, month, 1).getDay() + 6) % 7; // Pazartesi = 0
  
  // Üretim hatları
  const productionLines = [
    'M500/5.1 Montaj Hattı',
    'M600/3.2 Paketleme Hattı',
    'M700/4.1 Kalite Kontrol',
  ];
  
  const [selectedLine, setSelectedLine] = useState(productionLines[0]);
  
  // Verimlilik verilerini localStorage'dan yükle
  const getStorageKey = (line: string, year: number, month: number) => {
    return `production_efficiency_${line}_${year}_${month}`;
  };
  
  const loadEfficiencyData = (line: string) => {
    const storageKey = getStorageKey(line, year, month);
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      return JSON.parse(saved);
    }
    
    // Varsayılan veriler (sadece ilk yüklemede)
    const defaultData: { [day: number]: number } = {};
    for (let day = 1; day <= daysInMonth; day++) {
      if (line === productionLines[0]) {
        defaultData[day] = 95;
      } else if (line === productionLines[1]) {
        defaultData[day] = 85 + Math.floor(Math.random() * 15);
      } else {
        defaultData[day] = 80 + Math.floor(Math.random() * 20);
      }
    }
    return defaultData;
  };
  
  const [efficiencyData, setEfficiencyData] = useState<{ [day: number]: number }>(() => 
    loadEfficiencyData(selectedLine)
  );
  
  // Veri güncellemesi
  const updateEfficiency = (day: number, value: number) => {
    const newData = { ...efficiencyData, [day]: value };
    setEfficiencyData(newData);
    
    // localStorage'a kaydet
    const storageKey = getStorageKey(selectedLine, year, month);
    localStorage.setItem(storageKey, JSON.stringify(newData));
    
    // Aylık ortalamayı kaydet
    const monthlyAvg = Object.values(newData).reduce((sum, val) => sum + val, 0) / Object.values(newData).length;
    const monthlyKey = `production_monthly_${selectedLine}_${year}_${month}`;
    localStorage.setItem(monthlyKey, monthlyAvg.toString());
  };
  
  // Hat değiştiğinde verileri yükle
  useEffect(() => {
    setEfficiencyData(loadEfficiencyData(selectedLine));
  }, [selectedLine, year, month]);
  
  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 95) return 'text-green-600';
    if (efficiency >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  const getEfficiencyBg = (efficiency: number) => {
    if (efficiency >= 95) return 'bg-green-50';
    if (efficiency >= 85) return 'bg-yellow-50';
    return 'bg-red-50';
  };
  
  const currentData = efficiencyData;
  
  const renderCalendarDays = () => {
    const days: JSX.Element[] = [];
    const dayNames = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
    
    // Gün başlıkları
    dayNames.forEach((day, index) => {
      days.push(
        <div key={`header-${index}`} className="text-center text-xs font-medium text-gray-500 p-2">
          {day}
        </div>
      );
    });
    
    // Boş hücreler (ayın başlangıcından önceki günler)
    for (let i = 0; i < startDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="p-2"></div>
      );
    }
    
    // Ayın günleri
    for (let day = 1; day <= daysInMonth; day++) {
      const efficiency = currentData[day] || 0;
      
      days.push(
        <div key={day} className={`relative p-2 h-12 border border-border/50 text-center flex flex-col items-center justify-center rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-sm ${getEfficiencyBg(efficiency)} backdrop-blur-sm`}>
          <span className="text-xs text-gray-600 absolute top-1 left-1">{day}</span>
          <span className={`text-xs font-semibold ${getEfficiencyColor(efficiency)}`}>
            %{efficiency}
          </span>
        </div>
      );
    }
    
    return days;
  };

  return (
    <Card className={`bg-card shadow-xl border border-border hover:shadow-2xl transition-all duration-300 rounded-xl ${className}`}>
      <CardHeader className="pb-2 p-2 bg-gradient-to-r from-card to-muted/20 rounded-t-xl">
        <CardTitle className="text-[0.75em] font-bold text-card-foreground leading-tight overflow-hidden text-ellipsis whitespace-nowrap flex items-center gap-1">
          <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></div>
          Verimlilik - {currentMonth}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 p-2">
        {/* Üretim Hattı Seçici */}
        <div>
          <select 
            value={selectedLine}
            onChange={(e) => setSelectedLine(e.target.value)}
            className="w-full p-1.5 border border-gray-200 rounded-md bg-gray-50 text-[0.65em] font-medium text-gray-700"
          >
            {productionLines.map(line => (
              <option key={line} value={line}>
                {line}
              </option>
            ))}
          </select>
        </div>
        
        {/* Takvim Grid */}
        <div className="grid grid-cols-7 gap-1 bg-muted/30 rounded-lg p-1.5 shadow-inner">
          {renderCalendarDays()}
        </div>
      </CardContent>
    </Card>
  );
}