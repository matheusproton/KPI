
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface SafetyCalendarProps {
  className?: string;
}

type DayStatus = 'safe' | 'incident' | 'none';

export function SafetyCalendar({ className }: SafetyCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const today = new Date().getDate();
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
  
  // Initialize state with current month data from localStorage
  const getStorageKey = () => `safety_data_${year}_${month}`;
  
  const initializeDayStatuses = (): Record<number, DayStatus> => {
    const storageKey = getStorageKey();
    const saved = localStorage.getItem(storageKey);
    
    if (saved) {
      return JSON.parse(saved);
    }
    
    // Default data for new months
    const statuses: Record<number, DayStatus> = {};
    for (let day = 1; day <= daysInMonth; day++) {
      if (day <= today && year === new Date().getFullYear() && month === new Date().getMonth()) {
        statuses[day] = day === 16 ? 'incident' : 'safe';
      } else {
        statuses[day] = 'none';
      }
    }
    return statuses;
  };

  const [dayStatuses, setDayStatuses] = useState<Record<number, DayStatus>>(initializeDayStatuses);

  const handleDayClick = (day: number) => {
    if (day > today && (year === new Date().getFullYear() && month === new Date().getMonth())) return;
    
    setDayStatuses(prev => {
      const currentStatus = prev[day];
      let newStatus: DayStatus;
      
      if (currentStatus === 'safe') {
        newStatus = 'incident';
      } else {
        newStatus = 'safe';
      }
      
      const newStatuses = { ...prev, [day]: newStatus };
      
      // Save to localStorage
      localStorage.setItem(getStorageKey(), JSON.stringify(newStatuses));
      
      // Save monthly summary
      const safeDays = Object.values(newStatuses).filter(status => status === 'safe').length;
      const incidents = Object.values(newStatuses).filter(status => status === 'incident').length;
      const monthlyKey = `safety_monthly_${year}_${month}`;
      localStorage.setItem(monthlyKey, JSON.stringify({ safeDays, incidents }));
      
      return newStatuses;
    });
  };

  // Calculate totals based on current state
  const totalSafeDays = Object.values(dayStatuses).filter(status => status === 'safe').length;
  const totalIncidents = Object.values(dayStatuses).filter(status => status === 'incident').length;
  
  const renderCalendarDays = () => {
    const days = [];
    const dayNames = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
    
    // Gün başlıkları
    dayNames.forEach((day, index) => (
      days.push(
        <div key={`header-${index}`} className="text-center text-xs font-medium text-gray-500 p-2">
          {day}
        </div>
      )
    ));
    
    // Boş hücreler (ayın başlangıcından önceki günler)
    for (let i = 0; i < startDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="p-2"></div>
      );
    }
    
    // Ayın günleri
    for (let day = 1; day <= daysInMonth; day++) {
      const status = dayStatuses[day];
      const canClick = day <= today;
      
      days.push(
        <div 
          key={day} 
          className={`relative aspect-square border border-border/50 text-center flex items-center justify-center transition-all duration-200 rounded-lg backdrop-blur-sm ${
            canClick 
              ? 'cursor-pointer hover:scale-105 hover:shadow-md hover:border-primary/50' 
              : 'cursor-not-allowed opacity-50'
          } ${
            status === 'safe' ? 'bg-success/10 border-success/20 hover:bg-success/20' :
            status === 'incident' ? 'bg-destructive/10 border-destructive/20 hover:bg-destructive/20' :
            'bg-muted/20 hover:bg-muted/30'
          }`}
          onClick={() => handleDayClick(day)}
          title={
            canClick 
              ? 'Tıklayarak güvenlik durumunu değiştirin' 
              : 'Gelecek günler için değişiklik yapılamaz'
          }
        >
          <span className="text-[0.6em] text-gray-600 absolute top-[2px] left-[2px]">{day}</span>
          {status === 'incident' && (
            <X className="h-[0.8em] w-[0.8em] text-red-500" />
          )}
          {status === 'safe' && (
            <Check className="h-[0.8em] w-[0.8em] text-green-500" />
          )}
        </div>
      );
    }
    
    return days;
  };

  return (
    <div className={`h-full w-full bg-card border border-border rounded-xl shadow-lg flex flex-col overflow-hidden ${className}`}>
      <div className="p-2 pb-1 border-b border-border bg-gradient-to-r from-card to-muted/20 rounded-t-xl">
        <h3 className="text-[0.75em] font-bold text-card-foreground leading-tight overflow-hidden text-ellipsis whitespace-nowrap flex items-center gap-1">
          <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></div>
          İş Güvenliği - {currentMonth}
        </h3>
      </div>
      <div className="flex-1 p-2 flex flex-col min-h-0">
        {/* Takvim Grid */}
        <div className="grid grid-cols-7 gap-1 bg-muted/30 rounded-lg flex-1 p-2 min-h-0">
          {renderCalendarDays()}
        </div>
        
        {/* İstatistikler */}
        <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-border">
          <div className="text-center bg-success/5 rounded-lg p-1.5 border border-success/20">
            <div className="text-[1.1em] font-bold text-success leading-tight">{totalSafeDays}</div>
            <div className="text-[0.55em] text-muted-foreground font-medium leading-tight">Güvenli Gün</div>
          </div>
          <div className="text-center bg-destructive/5 rounded-lg p-1.5 border border-destructive/20">
            <div className="text-[1.1em] font-bold text-destructive leading-tight">{totalIncidents}</div>
            <div className="text-[0.55em] text-muted-foreground font-medium leading-tight">Kaza Sayısı</div>
          </div>
        </div>
      </div>
    </div>
  );
}
