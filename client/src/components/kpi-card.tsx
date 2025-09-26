
import { Card, CardContent } from '@/components/ui/card';
import { Users, Award, DollarSign, Truck } from 'lucide-react';

interface KpiCardProps {
  department: string;
  percentage: number;
  subtitle: string;
  status: 'success' | 'warning' | 'destructive';
}

const departmentIcons = {
  Safety: Users,
  Quality: Award,
  Production: DollarSign,
  Logistics: Truck,
};

const departmentNames = {
  Safety: 'Çalışan',
  Quality: 'Kalite',
  Production: 'Maliyet',
  Logistics: 'Teslimat',
};

const departmentLetters = {
  Safety: 'P',
  Quality: 'Q',
  Production: 'C',
  Logistics: 'D',
};

const departmentSubtitles = {
  Safety: 'Çalışan KPI',
  Quality: 'Kalite KPI',
  Production: 'Maliyet KPI',
  Logistics: 'Zamanında teslimat',
};

export function KpiCard({ department, percentage, subtitle, status }: KpiCardProps) {
  const Icon = departmentIcons[department as keyof typeof departmentIcons];
  const displayName = departmentNames[department as keyof typeof departmentNames];
  const letter = departmentLetters[department as keyof typeof departmentLetters];
  const defaultSubtitle = departmentSubtitles[department as keyof typeof departmentSubtitles];

  return (
    <div className="h-full w-full flex flex-col justify-between p-2 bg-gradient-to-br from-card/80 to-muted/20 rounded-xl border border-border/50 shadow-sm hover:shadow-lg transition-all duration-300 backdrop-blur-sm" data-testid={`card-kpi-${department.toLowerCase()}`}>
      {/* Header with title and red icon */}
      <div className="flex items-center justify-between mb-1 min-h-0">
        <h3 className="text-[0.65em] font-medium text-gray-700 leading-tight overflow-hidden text-ellipsis whitespace-nowrap flex-1 pr-1">{displayName}</h3>
        <div className="text-red-500 flex-shrink-0">
          <Icon className="h-[0.9em] w-[0.9em]" />
        </div>
      </div>

      {/* Center circle with letter */}
      <div className="flex justify-center items-center flex-1 min-h-0">
        <div className="aspect-square bg-gradient-to-br from-muted/50 to-muted/80 rounded-full flex items-center justify-center relative shadow-inner border border-border/30 hover:scale-105 transition-transform duration-200" style={{ width: 'min(55%, 70px)', maxWidth: '70px' }}>
          {/* Small dot at top */}
          <div className="absolute -top-[3%] w-[12%] h-[12%] bg-primary rounded-full shadow-sm"></div>
          
          {/* Large letter */}
          <div className="text-center">
            <div className="text-[1.3em] font-bold text-primary drop-shadow-sm leading-none" data-testid={`text-percentage-${department.toLowerCase()}`}>
              {letter}
            </div>
            <div className="text-[0.55em] text-muted-foreground font-semibold mt-1">KPI</div>
          </div>
        </div>
      </div>

      {/* Bottom subtitle */}
      <div className="text-center mt-1 min-h-0">
        <div className="text-[0.55em] text-gray-600 font-medium leading-tight overflow-hidden text-ellipsis whitespace-nowrap" data-testid={`text-subtitle-${department.toLowerCase()}`}>
          {defaultSubtitle}
        </div>
      </div>
    </div>
  )
}
