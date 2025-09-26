
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
  
  // Initialize fire/scrap data for calendar days with stable values
  const [fireScrapData] = useState<{ [day: number]: string }>(() => {
    const data: { [day: number]: string } = {};
    // Fixed sample data - no more regeneration
    const sampleValues = ['0', '0', '0', '1', '0', '0', '2', '0', '0', '0', '0', '3', '0', '0', '0', '0', '1', '0', '0', '0', '0', '0', '4', '0', '0', '0', '1', '0', '0', '0'];
    for (let i = 1; i <= 30; i++) {
      data[i] = sampleValues[i - 1] || '0';
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
    
    // Fixed sample data for weeks - no more random generation
    const weeklyDataSample = [2, 0, 1, 3, 0, 1, 4, 0, 2, 1, 0, 3, 1, 0, 2];
    
    // Generate weeks from 36 to 50
    for (let weekNumber = 36; weekNumber <= 50; weekNumber++) {
      // Use fixed sample data for each week
      const weekIndex = weekNumber - 36;
      const dailyTotal = weeklyDataSample[weekIndex] || 0;
      
      // Use weekly override if exists, otherwise use fixed data
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
          className="h-32 text-sm text-center border-primary bg-background"
          autoFocus
        />
      );
    }

    const weekCell = (
      <div
        className={`relative aspect-[3/4] border border-border bg-background flex flex-col items-center justify-center text-[0.7em] font-medium transition-all duration-200 rounded ${
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
        <div className="text-[0.6em] text-muted-foreground">
          H{week.weekNumber}
        </div>
        <div className="text-[1.4em] font-bold">
          {week.total}
        </div>
        <div className="text-[0.6em] text-muted-foreground">
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
    <div className={`h-full w-full bg-card border border-border rounded-xl shadow-lg flex flex-col overflow-hidden ${className}`} data-testid="fire-scrap-table">
      <div className="p-2 pb-1 border-b border-border bg-gradient-to-r from-card to-muted/20 rounded-t-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-[0.7em] font-semibold text-card-foreground leading-tight overflow-hidden text-ellipsis whitespace-nowrap flex items-center gap-1 flex-1 pr-2">
            <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></div>
            Fire (Scrap) - {currentMonth}
          </h3>
          <div className="text-right bg-primary/5 rounded-lg p-1.5 border border-primary/20 flex-shrink-0">
            <div className="text-[0.8em] font-bold text-primary leading-tight">0</div>
            <div className="text-[0.5em] text-muted-foreground leading-tight">Hedef</div>
          </div>
        </div>
      </div>
      <div className="flex-1 p-2 flex flex-col min-h-0">
        {/* Weekly Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 flex-1 min-h-0 bg-muted/10 rounded-lg p-2">
          {weeklyData.map((week) => 
            renderEditableWeekCell(week)
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-border">
          <div className="text-center bg-destructive/5 rounded-lg p-1.5 border border-destructive/20">
            <div className="text-[1.1em] font-bold text-destructive leading-tight">
              {totalFireScrap}
            </div>
            <div className="text-[0.55em] text-muted-foreground font-medium leading-tight">Toplam Fire</div>
          </div>
          <div className="text-center bg-warning/5 rounded-lg p-1.5 border border-warning/20">
            <div className="text-[1.1em] font-bold text-warning leading-tight">
              {averageFireScrap}
            </div>
            <div className="text-[0.55em] text-muted-foreground font-medium leading-tight">Ortalama</div>
          </div>
        </div>
      </div>
    </div>
  );
}
