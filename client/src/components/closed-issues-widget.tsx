
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Eye, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface NCItem {
  id: string;
  description: string;
  source: string;
  status: 'open' | 'in_progress' | 'closed';
  severity: 'low' | 'medium' | 'high';
  assigneeName?: string;
  dueDate?: string;
  closedAt?: string;
  createdAt: string;
}

export function ClosedIssuesWidget() {
  const { data: ncItems = [] } = useQuery<NCItem[]>({
    queryKey: ['/api/non-conformities'],
    refetchInterval: 60000,
  });

  const closedIssues = ncItems.filter(nc => nc.status === 'closed');
  const recentlyClosed = closedIssues
    .sort((a, b) => new Date(b.closedAt || b.createdAt).getTime() - new Date(a.closedAt || a.createdAt).getTime())
    .slice(0, 5);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getSourceDisplayName = (source: string) => {
    const sourceMappings: { [key: string]: string } = {
      'internal_audit': 'İç Denetim',
      'customer_complaint': 'Müşteri Şikayeti',
      'supplier_issue': 'Tedarikçi Sorunu',
      'production_problem': 'Üretim Sorunu',
      'quality_control': 'Kalite Kontrol',
      'safety_incident': 'Güvenlik Olayı'
    };
    return sourceMappings[source] || source;
  };

  const getTimeSinceResolved = (date: string) => {
    const now = new Date();
    const resolvedDate = new Date(date);
    const diffTime = Math.abs(now.getTime() - resolvedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 gün önce';
    if (diffDays < 7) return `${diffDays} gün önce`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta önce`;
    return `${Math.floor(diffDays / 30)} ay önce`;
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            Kapalı Konular
          </CardTitle>
          <Badge variant="secondary" className="text-sm bg-green-100 text-green-800">
            {closedIssues.length} Tamamlandı
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {closedIssues.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Henüz kapalı konu bulunmuyor</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {recentlyClosed.map((issue) => (
              <div key={issue.id} className="p-3 bg-green-50 rounded-lg border border-green-200 hover:shadow-sm transition-all">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-2">
                      <Badge className={`${getSeverityColor(issue.severity)} text-xs px-2 py-1 flex-shrink-0`} variant="outline">
                        {issue.severity === 'high' ? 'Yüksek' : 
                         issue.severity === 'medium' ? 'Orta' : 'Düşük'}
                      </Badge>
                      <Badge variant="outline" className="text-xs px-2 py-1 flex-shrink-0">
                        {getSourceDisplayName(issue.source)}
                      </Badge>
                    </div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                      {issue.description}
                    </h4>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        {issue.assigneeName && (
                          <span>👤 {issue.assigneeName}</span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {getTimeSinceResolved(issue.closedAt || issue.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {closedIssues.length > 0 && (
          <div className="pt-2 border-t">
            <Button variant="outline" size="sm" className="w-full">
              <Eye className="h-4 w-4 mr-2" />
              Tümünü Görüntüle ({closedIssues.length})
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
