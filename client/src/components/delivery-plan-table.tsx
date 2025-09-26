
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';

interface DeliveryPlanTableProps {
  className?: string;
}

interface DeliveryData {
  day: number;
  actual: number;
  target: number;
  percentage: number;
}

export function DeliveryPlanTable({ className }: DeliveryPlanTableProps) {
  const [editingCell, setEditingCell] = useState<{ day: number; field: 'actual' | 'target' } | null>(null);
  
  // Initialize delivery data for calendar days (30 days)
  const [deliveryData, setDeliveryData] = useState<{ [day: number]: DeliveryData }>(() => {
    const data: { [day: number]: DeliveryData } = {};
    for (let i = 1; i <= 30; i++) {
      data[i] = {
        day: i,
        actual: i <= 5 ? [38, 100, 100, 105, 100][i - 1] : 0, // Sample data for first 5 days
        target: 100,
        percentage: 0
      };
      // Calculate percentage
      data[i].percentage = data[i].target > 0 ? Math.round((data[i].actual / data[i].target) * 100) : 0;
    }
    return data;
  });

  const currentMonth = new Date().toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
  const currentDay = new Date().getDate();
  
  // Generate calendar days (1-30 for September)
  const calendarDays = Array.from({ length: 30 }, (_, i) => i + 1);

  const handleCellClick = (day: number, field: 'actual' | 'target') => {
    if (day <= currentDay) {
      setEditingCell({ day, field });
    }
  };

  const handleCellChange = (value: string, day: number, field: 'actual' | 'target') => {
    const numericValue = Math.max(0, parseInt(value) || 0);
    const newData = { ...deliveryData };
    newData[day] = { ...newData[day], [field]: numericValue };
    // Recalculate percentage
    newData[day].percentage = newData[day].target > 0 ? Math.round((newData[day].actual / newData[day].target) * 100) : 0;
    setDeliveryData(newData);
  };

  const handleCellBlur = () => {
    setEditingCell(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setEditingCell(null);
    }
  };

  const getCellColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-success/10 border-success/30';
    if (percentage >= 80) return 'bg-warning/10 border-warning/30';
    if (percentage === 0) return 'bg-muted/50 border-muted';
    return 'bg-destructive/10 border-destructive/30';
  };

  const getTextColor = (percentage: number) => {
    if (percentage >= 100) return 'text-success';
    if (percentage >= 80) return 'text-warning';
    if (percentage === 0) return 'text-muted-foreground';
    return 'text-destructive';
  };

  const renderEditableCell = (data: DeliveryData, day: number) => {
    const canClick = day <= currentDay;
    const isEditingActual = editingCell?.day === day && editingCell?.field === 'actual';
    const isEditingTarget = editingCell?.day === day && editingCell?.field === 'target';

    return (
      <div
        key={day}
        className={`relative border border-border bg-background flex flex-col items-center justify-center text-xs font-medium transition-all duration-200 aspect-square ${
          canClick 
            ? 'hover:bg-muted/50' 
            : 'opacity-50'
        } ${getCellColor(data.percentage)}`}
      >
        {/* Day number */}
        <div className="text-xs text-muted-foreground font-bold">{day}</div>
        
        {/* Actual value - editable */}
        <div className="w-full text-center">
          {isEditingActual && canClick ? (
            <input
              type="number"
              value={data.actual}
              onChange={(e) => handleCellChange(e.target.value, day, 'actual')}
              onBlur={handleCellBlur}
              onKeyPress={handleKeyPress}
              className="w-full text-xs text-center bg-transparent border-none outline-none"
              autoFocus
            />
          ) : (
            <div
              className={`text-xs cursor-pointer ${canClick ? 'hover:bg-muted/30' : ''}`}
              onClick={() => canClick && handleCellClick(day, 'actual')}
              title="Tıklayarak gerçekleşen değeri düzenleyin"
            >
              G: {data.actual}
            </div>
          )}
        </div>

        {/* Target value - editable */}
        <div className="w-full text-center">
          {isEditingTarget && canClick ? (
            <input
              type="number"
              value={data.target}
              onChange={(e) => handleCellChange(e.target.value, day, 'target')}
              onBlur={handleCellBlur}
              onKeyPress={handleKeyPress}
              className="w-full text-xs text-center bg-transparent border-none outline-none"
              autoFocus
            />
          ) : (
            <div
              className={`text-xs cursor-pointer ${canClick ? 'hover:bg-muted/30' : ''}`}
              onClick={() => canClick && handleCellClick(day, 'target')}
              title="Tıklayarak hedef değeri düzenleyin"
            >
              H: {data.target}
            </div>
          )}
        </div>

        {/* Percentage */}
        <div className={`text-xs font-bold ${getTextColor(data.percentage)}`}>
          {data.percentage > 0 ? `%${data.percentage}` : '-'}
        </div>
      </div>
    );
  };

  // Calculate totals
  const monthlyActual = calendarDays.slice(0, currentDay).reduce((sum, day) => sum + deliveryData[day].actual, 0);
  const monthlyTarget = calendarDays.slice(0, currentDay).reduce((sum, day) => sum + deliveryData[day].target, 0);
  const monthlyPercentage = monthlyTarget > 0 ? ((monthlyActual / monthlyTarget) * 100).toFixed(1) : '0';

  return (
    <Card className={`bg-card shadow-sm border border-border ${className}`} data-testid="delivery-plan-table">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-card-foreground">
            Teslimat Planı Gerçekleştirme - {currentMonth}
          </CardTitle>
          <div className="text-right">
            <div className={`text-xl font-bold ${getTextColor(parseFloat(monthlyPercentage))}`}>
              {monthlyPercentage}%
            </div>
            <div className="text-xs text-muted-foreground">Aylık Hedef</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Monthly Summary */}
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-primary">{monthlyActual}</div>
            <div className="text-xs text-muted-foreground">Aylık Gerçekleşen</div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {calendarDays.map((day) => renderEditableCell(deliveryData[day], day))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 text-xs pt-4 border-t">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-success rounded"></div>
              <span>Hedefi Aştı (%100+)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-warning rounded"></div>
              <span>Hedefte (%80+)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-destructive rounded"></div>
              <span>Hedef Altı</span>
            </div>
          </div>

          {/* Instructions */}
          <div className="text-xs text-muted-foreground text-center p-2 bg-muted/20 rounded">
            G: Gerçekleşen, H: Hedef - Değerleri düzenlemek için tıklayın
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
