import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';

interface DeliveryPlanTableWeeklyProps {
  className?: string;
}

interface WeeklyDeliveryData {
  week: number;
  actual: number;
  target: number;
  percentage: number;
}

export function DeliveryPlanTableWeekly({ className }: DeliveryPlanTableWeeklyProps) {
  const [editingCell, setEditingCell] = useState<{ week: number; field: 'actual' | 'target' } | null>(null);

  // Initialize weekly delivery data (38th week is current week)
  const [weeklyData, setWeeklyData] = useState<{ [week: number]: WeeklyDeliveryData }>(() => {
    const data: { [week: number]: WeeklyDeliveryData } = {};
    // Weeks 36-51 for September-December period (16 weeks for 4x4 grid)
    for (let i = 36; i <= 51; i++) {
      data[i] = {
        week: i,
        actual: i === 38 ? 91 : (i < 38 ? [95, 100][i - 36] || 0 : 0), // Sample data, current week shows 91.44
        target: 100,
        percentage: 0
      };
      // Calculate percentage
      data[i].percentage = data[i].target > 0 ? Math.round((data[i].actual / data[i].target) * 100) : 0;
    }
    // Set current week data to match the image (91.44%)
    data[38].actual = 91;
    data[38].percentage = 91;
    return data;
  });

  const currentWeek = 38; // Current week number

  const handleCellClick = (week: number, field: 'actual' | 'target') => {
    if (week <= currentWeek) {
      setEditingCell({ week, field });
    }
  };

  const handleCellChange = (value: string, week: number, field: 'actual' | 'target') => {
    const numericValue = Math.max(0, parseInt(value) || 0);
    const newData = { ...weeklyData };
    newData[week] = { ...newData[week], [field]: numericValue };
    // Recalculate percentage
    newData[week].percentage = newData[week].target > 0 ? Math.round((newData[week].actual / newData[week].target) * 100) : 0;
    setWeeklyData(newData);
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
    if (percentage >= 85) return 'bg-warning/10 border-warning/30';
    if (percentage === 0) return 'bg-muted/50 border-muted';
    return 'bg-destructive/10 border-destructive/30';
  };

  const getTextColor = (percentage: number) => {
    if (percentage >= 100) return 'text-success';
    if (percentage >= 85) return 'text-warning';
    if (percentage === 0) return 'text-muted-foreground';
    return 'text-destructive';
  };

  const renderEditableWeekCell = (data: WeeklyDeliveryData, week: number) => {
    const canClick = week <= currentWeek;
    const isEditingActual = editingCell?.week === week && editingCell?.field === 'actual';
    const isCurrentWeek = week === currentWeek;

    return (
      <div
        key={week}
        className={`relative border border-border bg-background flex flex-col items-center justify-center text-xs font-medium transition-all duration-200 aspect-square min-h-[70px] ${
          canClick 
            ? 'hover:bg-muted/50 cursor-pointer' 
            : 'opacity-50'
        } ${getCellColor(data.percentage)} ${isCurrentWeek ? 'ring-2 ring-blue-500' : ''}`}
      >
        {/* Week number */}
        <div className="text-[9px] sm:text-[10px] text-muted-foreground font-bold mb-1">{week}</div>
        <div className="text-[8px] sm:text-[9px] text-muted-foreground mb-1">Hafta</div>

        {/* Actual value - editable */}
        <div className="w-full text-center mb-1">
          {isEditingActual && canClick ? (
            <input
              type="number"
              value={data.actual}
              onChange={(e) => handleCellChange(e.target.value, week, 'actual')}
              onBlur={handleCellBlur}
              onKeyPress={handleKeyPress}
              className="w-full text-xs text-center bg-transparent border-none outline-none"
              autoFocus
            />
          ) : (
            <div
              className={`text-xs sm:text-sm font-bold cursor-pointer ${canClick ? 'hover:bg-muted/30 rounded px-1' : ''}`}
              onClick={() => canClick && handleCellClick(week, 'actual')}
              title="Tıklayarak gerçekleşen değeri düzenleyin"
            >
              {data.actual}
            </div>
          )}
        </div>

        {/* Percentage */}
        <div className={`text-sm sm:text-base md:text-lg font-bold ${getTextColor(data.percentage)}`}>
          {data.percentage > 0 ? `${data.percentage}%` : '-'}
        </div>
      </div>
    );
  };

  // Calculate weekly totals for completed weeks
  const completedWeeks = Object.values(weeklyData).filter(week => week.week < currentWeek);
  const currentWeekData = weeklyData[currentWeek];

  const totalActual = completedWeeks.reduce((sum, week) => sum + week.actual, 0) + 
                    (currentWeekData ? currentWeekData.actual : 0);
  const totalTarget = completedWeeks.reduce((sum, week) => sum + week.target, 0) + 
                     (currentWeekData ? currentWeekData.target : 0);
  const overallPercentage = totalTarget > 0 ? ((totalActual / totalTarget) * 100).toFixed(1) : '0';

  // Show weeks 36-51 (16 weeks for 4x4 grid)
  const visibleWeeks = Array.from({ length: 16 }, (_, i) => 36 + i);

  return (
    <Card className={`bg-card shadow-sm border border-border h-full ${className}`} data-testid="delivery-plan-table-weekly">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-card-foreground">
            Teslimat Planı Gerçekleştirme - Haftalık
          </CardTitle>
          <div className="text-right">
            <div className={`text-xl font-bold ${getTextColor(parseFloat(overallPercentage))}`}>
              {overallPercentage}%
            </div>
            <div className="text-xs text-muted-foreground">Haftalık Hedef</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Current Week Summary */}
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">{currentWeek}. Hafta</div>
            <div className="text-2xl font-bold text-primary">{currentWeekData?.percentage || 0}%</div>
            <div className="text-xs text-muted-foreground">Mevcut Hafta</div>
          </div>

          {/* Weekly Grid - 4 weeks in a row */}
          <div className="grid grid-cols-4 gap-2 max-w-lg mx-auto">
            {visibleWeeks.slice(0, 4).map((week) => 
              weeklyData[week] ? renderEditableWeekCell(weeklyData[week], week) : null
            )}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 text-xs pt-4 border-t">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-success rounded"></div>
              <span>Hedefi Aştı (100%+)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-warning rounded"></div>
              <span>Hedefte (85%+)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-destructive rounded"></div>
              <span>Hedef Altı</span>
            </div>
          </div>

          {/* Instructions */}
          <div className="text-xs text-muted-foreground text-center p-2 bg-muted/20 rounded">
            G: Gerçekleşen - Değerleri düzenlemek için hafta kutularına tıklayın
          </div>
        </div>
      </CardContent>
    </Card>
  );
}