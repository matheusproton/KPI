import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';

interface PremiumFreightCalendarProps {
  className?: string;
}

export function PremiumFreightCalendar({ className = '' }: PremiumFreightCalendarProps) {
  const [currentDate] = useState(new Date());
  
  // Premium freight data - günlere göre ekstra navlun durumu
  const [premiumFreightData, setPremiumFreightData] = useState({
    1: false, 2: true, 4: true, 5: true, 6: true,
    8: true, 9: true, 
    // Diğer günler için false (normal navlun)
  });

  // Gün tıklama fonksiyonu
  const handleDayClick = (day: number) => {
    setPremiumFreightData(prev => ({
      ...prev,
      [day]: !prev[day as keyof typeof prev]
    }));
  };

  const currentMonth = currentDate.toLocaleDateString('tr-TR', { 
    month: 'long', 
    year: 'numeric' 
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = (new Date(year, month, 1).getDay() + 6) % 7; // Pazartesi = 0

  const renderCalendarDays = () => {
    const days = [];
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
        <div key={`empty-${i}`} className="aspect-square p-1">
          <div className="w-full h-full"></div>
        </div>
      );
    }
    
    // Ayın günleri
    for (let day = 1; day <= daysInMonth; day++) {
      const hasPremiumFreight = premiumFreightData[day] || false;
      const isToday = day === currentDate.getDate() && 
                     month === new Date().getMonth() && 
                     year === new Date().getFullYear();
      
      days.push(
        <div key={day} className="aspect-square p-1 cursor-pointer">
          <div 
            className={`
              w-full h-full rounded-sm flex items-center justify-center text-xs font-medium cursor-pointer select-none
              ${isToday ? 'ring-2 ring-blue-500' : ''}
              ${hasPremiumFreight ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
              transition-all duration-200 hover:scale-105 active:scale-95
            `}
            onClick={() => handleDayClick(day)}
          >
            {day}
          </div>
        </div>
      );
    }
    
    return days;
  };

  return (
    <Card className={`bg-white shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 h-full flex flex-col ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-gray-800">
          Ekstra Navlun - {currentMonth}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 flex flex-col min-h-[400px]">
        {/* Takvim Grid */}
        <div className="grid grid-cols-7 gap-1 bg-gray-50 rounded-lg p-2">
          {renderCalendarDays()}
        </div>
        
        {/* Açıklamalar */}
        <div className="flex justify-center space-x-6 pt-4 border-t border-gray-100 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-400 rounded"></div>
            <span className="text-gray-600">Normal Navlun</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-gray-600">Ekstra Navlun</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}