import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';

interface ActionItemCardProps {
  id: string;
  title: string;
  description: string;
  department: string;
  priority: 'high' | 'medium' | 'low';
  status: string;
  assigneeName: string;
  dueDate?: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  canEdit: boolean;
}

const priorityColors = {
  high: 'bg-destructive text-destructive-foreground',
  medium: 'bg-warning text-white',
  low: 'bg-muted text-muted-foreground',
};

const priorityLabels = {
  high: 'YÜKSEK',
  medium: 'ORTA',
  low: 'DÜŞÜK',
};

const departmentLabels = {
  Safety: 'Güvenlik',
  Quality: 'Kalite',
  Production: 'Üretim',
  Logistics: 'Lojistik',
};

export function ActionItemCard({
  id,
  title,
  description,
  department,
  priority,
  status,
  assigneeName,
  dueDate,
  onEdit,
  onDelete,
  canEdit
}: ActionItemCardProps) {
  const priorityColor = priorityColors[priority];
  const priorityLabel = priorityLabels[priority];
  const departmentLabel = departmentLabels[department as keyof typeof departmentLabels];

  return (
    <Card className={`action-item shadow-sm border transition-all duration-200 hover:shadow-md ${priority === 'high' ? 'border-destructive bg-destructive/5' : priority === 'medium' ? 'border-warning bg-warning/5' : 'border-border'}`} data-testid={`card-action-${id}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Badge className={`text-xs ${priorityColor}`}>
                {priorityLabel}
              </Badge>
              <span className="text-sm text-muted-foreground">{departmentLabel}</span>
            </div>
            <h4 className="font-medium text-sm mb-1" data-testid={`text-title-${id}`}>{title}</h4>
            <p className="text-sm text-muted-foreground mb-2" data-testid={`text-description-${id}`}>{description}</p>
            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
              <span data-testid={`text-assignee-${id}`}>{assigneeName}</span>
              {dueDate && (
                <span data-testid={`text-due-date-${id}`}>
                  Bitiş: {new Date(dueDate).toLocaleDateString('tr-TR')}
                </span>
              )}
            </div>
          </div>
          {canEdit && (
            <div className="flex space-x-1 ml-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(id)}
                data-testid={`button-edit-${id}`}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(id)}
                data-testid={`button-delete-${id}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
