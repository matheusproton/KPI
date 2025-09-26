
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

interface ProductivityTableProps {
  className?: string;
  onIncidentClick?: (day: number, type: string) => void;
}

export function ProductivityTable({ className, onIncidentClick }: ProductivityTableProps) {
  const [editingCell, setEditingCell] = useState<{ day: number; dept: string } | null>(null);
  
  // Initialize productivity data for calendar days
  const [productivityData, setProductivityData] = useState<{ [key: string]: { [day: number]: string } }>({
    'M500/5.1 Montaj Hattı': Object.fromEntries(Array.from({ length: 30 }, (_, i) => [i + 1, '%95'])),
    'M500/5 Kaynak Line': Object.fromEntries(Array.from({ length: 30 }, (_, i) => [i + 1, '%95'])),
    'Daily Mold Injection': Object.fromEntries(Array.from({ length: 30 }, (_, i) => [i + 1, '%95'])),
    'Hafta Sıkışması Mevsimli Hattı': Object.fromEntries(Array.from({ length: 30 }, (_, i) => [i + 1, '%95'])),
    'TIG Offloading Automated Hattı': Object.fromEntries(Array.from({ length: 30 }, (_, i) => [i + 1, '%95'])),
    'Cast Grinding Hattı': Object.fromEntries(Array.from({ length: 30 }, (_, i) => [i + 1, '%95'])),
    'Motor Analysis': Object.fromEntries(Array.from({ length: 30 }, (_, i) => [i + 1, '%95'])),
    'Manual Kaynak': Object.fromEntries(Array.from({ length: 30 }, (_, i) => [i + 1, '%95']))
  });

  const [selectedDepartment, setSelectedDepartment] = useState<string>('M500/5.1 Montaj Hattı');
  
  const currentMonth = new Date().toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
  const currentDay = new Date().getDate();
  
  // Generate calendar days (1-30 for September)
  const calendarDays = Array.from({ length: 30 }, (_, i) => i + 1);
  
  const departments = Object.keys(productivityData);

  const handleCellClick = (day: number, department: string) => {
    if (day <= currentDay) {
      setEditingCell({ day, dept: department });
    }
  };

  const handleCellChange = (value: string, day: number, department: string) => {
    const newData = { ...productivityData };
    // Ensure the value includes % if it's a number
    const formattedValue = value.includes('%') ? value : `%${value.replace('%', '')}`;
    newData[department][day] = formattedValue;
    setProductivityData(newData);
  };

  const handleCellBlur = () => {
    setEditingCell(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setEditingCell(null);
    }
  };

  const handleViewAction = (day: number) => {
    if (onIncidentClick) {
      onIncidentClick(day, 'productivity');
    }
  };

  const getCellColor = (value: string) => {
    const numericValue = parseFloat(value.replace('%', ''));
    if (numericValue >= 95) return 'bg-success/10 border-success/30 text-success';
    if (numericValue >= 85) return 'bg-warning/10 border-warning/30 text-warning';
    return 'bg-destructive/10 border-destructive/30 text-destructive';
  };

  const renderEditableCell = (value: string, day: number, department: string) => {
    const isEditing = editingCell?.day === day && editingCell?.dept === department;
    const canEdit = day <= currentDay;
    const numericValue = parseFloat(value.replace('%', ''));
    const isLowProductivity = numericValue < 85;
    
    if (isEditing) {
      return (
        <Input
          value={value}
          onChange={(e) => handleCellChange(e.target.value, day, department)}
          onBlur={handleCellBlur}
          onKeyPress={handleKeyPress}
          className="h-8 text-xs text-center border-primary bg-background"
          autoFocus
        />
      );
    }

    const dayCell = (
      <div
        className={`relative aspect-square border border-border bg-background flex flex-col items-center justify-center text-xs font-medium transition-all duration-200 ${
          canEdit 
            ? 'cursor-pointer hover:bg-muted/70 hover:border-primary/50 hover:scale-105' 
            : 'cursor-not-allowed opacity-50'
        } ${getCellColor(value)}`}
        style={{ cursor: canEdit ? 'pointer' : 'not-allowed' }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (canEdit) {
            handleCellClick(day, department);
          }
        }}
        title={
          canEdit 
            ? `Gün ${day} - Tıklayarak düzenleyin`
            : `Gün ${day} - Gelecek günler için değişiklik yapılamaz`
        }
      >
        <span className="absolute top-0.5 left-0.5 text-xs text-muted-foreground">
          {day}
        </span>
        <div className="text-center mt-1">
          {value}
        </div>
      </div>
    );

    // Only wrap with context menu if productivity is below 85% and editable
    if (isLowProductivity && canEdit) {
      return (
        <ContextMenu key={`${day}-${department}`}>
          <ContextMenuTrigger asChild>
            {dayCell}
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem 
              onClick={() => handleViewAction(day)}
              className="cursor-pointer"
            >
              <Eye className="mr-2 h-4 w-4" />
              Aksiyonu Göster
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      );
    }

    return dayCell;
  };

  // Calculate daily average across all departments
  const calculateDailyAverage = (day: number) => {
    const values = departments.map(dept => parseFloat(productivityData[dept][day].replace('%', '')));
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    return `%${Math.round(average)}`;
  };

  // Calculate department average for the month
  const calculateDepartmentAverage = (department: string) => {
    const values = calendarDays.slice(0, currentDay).map(day => 
      parseFloat(productivityData[department][day].replace('%', ''))
    );
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    return `%${Math.round(average)}`;
  };

  return (
    <Card className={`bg-card shadow-sm border border-border min-h-[700px] h-full flex flex-col ${className}`} data-testid="productivity-table">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-card-foreground">
          Verimlilik - {currentMonth}
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-6 flex-1 flex flex-col">
        <div className="space-y-4">
          {/* Department Selector */}
          <div>
            <select 
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full p-2 border border-border rounded-md bg-background text-xs"
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>
                  {dept.length > 25 ? `${dept.substring(0, 25)}...` : dept}
                </option>
              ))}
            </select>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-0.5 mb-8 flex-1 min-h-[400px]">
            {calendarDays.map((day) => 
              renderEditableCell(productivityData[selectedDepartment][day], day, selectedDepartment)
            )}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-8 text-sm mt-8 pt-8 border-t">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-success rounded"></div>
              <span>Hedefi İçinde (&gt;=95%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-warning rounded"></div>
              <span>Uyarı (85-94%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-destructive rounded"></div>
              <span>Hedef altı (&lt;85%)</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-6 py-8 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                %95
              </div>
              <div className="text-sm text-muted-foreground">Hedef</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">
                {calculateDepartmentAverage(selectedDepartment)}
              </div>
              <div className="text-sm text-muted-foreground">Aylık Ortalama</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
