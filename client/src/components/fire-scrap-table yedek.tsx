
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Input } from '@/components/ui/input';
import { Eye } from 'lucide-react';

interface FireScrapTableProps {
  className?: string;
  onIncidentClick?: (day: number, type: string) => void;
}

interface WeekData {
  weekNumber: number;
  startDay: number;
  endDay: number;
  days: number[];
  total: number;
  isCurrentWeek: boolean;
  isPastWeek: boolean;
}

export function FireScrapTable({ className, onIncidentClick }: FireScrapTableProps) {
  const [editingCell, setEditingCell] = useState<{ week: number } | null>(null);
  
  // Initialize fire/scrap data for calendar days
  const [fireScrapData, setFireScrapData] = useState<{ [day: number]: string }>(() => {
    const data: { [day: number]: string } = {};
    // Initialize with some sample data
    for (let i = 1; i <= 30; i++) {
      data[i] = Math.random() > 0.7 ? `${Math.floor(Math.random() * 5) + 1}` : '0';
    }
    return data;
  });

  // Store weekly totals
  const [weeklyTotals, setWeeklyTotals] = useState<{ [week: number]: string }>({});
  
  const currentMonth = new Date().toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
  const currentDay = new Date().getDate();
  
  // Generate weekly data based on calendar weeks from beginning of year
  const generateWeeklyData = (): WeekData[] => {
    const weeks: WeekData[] = [];
    
    // Current week is 38 (as mentioned by user)
    const currentCalendarWeek = 38; // Current week number in the year
    
    // Generate weeks from 36 to 50
    for (let weekNumber = 36; weekNumber <= 50; weekNumber++) {
      // Calculate some sample data for each week
      const dailyTotal = Math.floor(Math.random() * 8); // Random data for demonstration
      
      // Use weekly override if exists, otherwise use generated data
      const monthWeek = weekNumber - 35; // Convert to internal week number (36->1, 37->2, etc.)
      const total = weeklyTotals[monthWeek] ? parseInt(weeklyTotals[monthWeek]) : dailyTotal;
      
      // Calculate date ranges (approximate)
      const startDay = ((weekNumber - 36) * 7) + 1;
      const endDay = Math.min(startDay + 6, 30); // Limit to month boundaries
      const days = Array.from({ length: endDay - startDay + 1 }, (_, i) => startDay + i);
      
      weeks.push({
        weekNumber: weekNumber,
        startDay,
        endDay,
        days,
        total,
        isCurrentWeek: weekNumber === currentCalendarWeek,
        isPastWeek: weekNumber < currentCalendarWeek,
      });
    }
    
    return weeks;
  };

  const weeklyData = generateWeeklyData();

  const handleWeekClick = (weekNumber: number) => {
    const currentCalendarWeek = 38; // Current week in the year
    if (weekNumber <= currentCalendarWeek) {
      // Convert calendar week to internal month week number (36->1, 37->2, etc.)
      const monthWeek = weekNumber - 35;
      if (monthWeek >= 1) {
        setEditingCell({ week: monthWeek });
      }
    }
  };

  const handleWeekChange = (value: string, weekNumber: number) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    // Convert calendar week to internal month week number (36->1, 37->2, etc.)
    const monthWeek = weekNumber - 35;
    if (monthWeek >= 1) {
      setWeeklyTotals(prev => ({
        ...prev,
        [monthWeek]: numericValue || '0'
      }));
    }
  };

  const handleCellBlur = () => {
    setEditingCell(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setEditingCell(null);
    }
  };

  const handleViewAction = (weekNumber: number) => {
    if (onIncidentClick) {
      const week = weeklyData.find(w => w.weekNumber === weekNumber);
      if (week) {
        // Use the middle day of the week for the action
        const middleDay = Math.floor((week.startDay + week.endDay) / 2);
        onIncidentClick(middleDay, 'fire-scrap');
      }
    }
  };

  const getCellColor = (value: number) => {
    if (value === 0) return 'bg-success/10 border-success/30 text-success';
    if (value <= 5) return 'bg-warning/10 border-warning/30 text-warning';
    return 'bg-destructive/10 border-destructive/30 text-destructive';
  };

  const renderEditableWeekCell = (week: WeekData) => {
    // Convert calendar week to internal month week number (36->1, 37->2, etc.)
    const monthWeek = week.weekNumber - 35;
    const isEditing = editingCell?.week === monthWeek;
    const currentCalendarWeek = 38;
    const canEdit = week.weekNumber <= currentCalendarWeek;
    const isHighFireScrap = week.total >= 6;
    
    if (isEditing && monthWeek) {
      return (
        <Input
          value={weeklyTotals[monthWeek]?.toString() || week.total.toString()}
          onChange={(e) => handleWeekChange(e.target.value, week.weekNumber)}
          onBlur={handleCellBlur}
          onKeyPress={handleKeyPress}
          className="h-14 text-sm text-center border-primary bg-background"
          autoFocus
        />
      );
    }

    const weekCell = (
      <div
        className={`relative h-14 border border-border bg-background flex flex-col items-center justify-center text-sm font-medium transition-all duration-200 rounded ${
          canEdit 
            ? 'cursor-pointer hover:bg-muted/50 hover:border-primary/50' 
            : 'cursor-not-allowed opacity-50'
        } ${getCellColor(week.total)}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (canEdit) {
            handleWeekClick(week.weekNumber);
          }
        }}
        title={
          canEdit 
            ? `${week.weekNumber}. Hafta (${week.startDay}-${week.endDay} Eylül) - Tıklayarak düzenleyin`
            : `${week.weekNumber}. Hafta - Gelecek haftalar için değişiklik yapılamaz`
        }
      >
        <div className="text-xs text-muted-foreground">
          H{week.weekNumber}
        </div>
        <div className="text-lg font-bold">
          {week.total}
        </div>
        <div className="text-xs text-muted-foreground">
          {week.startDay}-{week.endDay}
        </div>
      </div>
    );

    // Only wrap with context menu if fire/scrap count is 6 or higher and editable
    if (isHighFireScrap && canEdit) {
      return (
        <ContextMenu key={week.weekNumber}>
          <ContextMenuTrigger asChild>
            {weekCell}
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem 
              onClick={() => handleViewAction(week.weekNumber)}
              className="cursor-pointer"
            >
              <Eye className="mr-2 h-4 w-4" />
              Aksiyonu Göster
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      );
    }

    return weekCell;
  };

  // Calculate total fire/scrap for completed weeks
  const currentCalendarWeek = 38;
  const completedWeeks = weeklyData.filter(week => week.weekNumber < currentCalendarWeek);
  const currentWeekData = weeklyData.find(week => week.weekNumber === currentCalendarWeek);
  
  const totalFireScrap = completedWeeks.reduce((sum, week) => sum + week.total, 0) + 
                        (currentWeekData ? currentWeekData.total : 0);

  // Calculate average weekly fire/scrap (for September weeks only)
  const septemberWeeksCompleted = weeklyData.filter(week => week.weekNumber <= currentCalendarWeek).length;
  const averageFireScrap = septemberWeeksCompleted > 0 ? (totalFireScrap / septemberWeeksCompleted).toFixed(1) : '0';

  return (
    <Card className={`bg-card shadow-sm border border-border ${className}`} data-testid="fire-scrap-table">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-card-foreground">
            Fire (Scrap) - {currentMonth} (Haftalık)
          </CardTitle>
          <div className="text-right">
            <div className="text-lg font-bold text-primary">0</div>
            <div className="text-xs text-muted-foreground">Hedef/Hafta</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Weekly Grid - Simplified layout */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 mb-4">
          {weeklyData.map((week) => 
            renderEditableWeekCell(week)
          )}
        </div>

        {/* Stats - Compact layout */}
        <div className="grid grid-cols-2 gap-3 py-3 border-t">
          <div className="text-center">
            <div className="text-xl font-bold text-destructive">
              {totalFireScrap}
            </div>
            <div className="text-xs text-muted-foreground">Toplam Fire</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-warning">
              {averageFireScrap}
            </div>
            <div className="text-xs text-muted-foreground">Haftalık Ortalama</div>
          </div>
        </div>

        {/* Legend - Simplified */}
        <div className="flex items-center justify-center gap-4 text-xs mt-3 pt-3 border-t">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-success rounded"></div>
            <span>Hedef (0)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-warning rounded"></div>
            <span>Orta (1-5)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-destructive rounded"></div>
            <span>Yüksek (6+)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
