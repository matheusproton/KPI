
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Eye, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface NCItem {
  id: string;
  description: string;
  source: string;
  status: 'open' | 'in_progress' | 'closed';
  severity: 'low' | 'medium' | 'high';
  assigneeName?: string;
  dueDate?: string;
  createdAt: string;
}

export function OpenIssuesWidget() {
  const { data: ncItems = [] } = useQuery<NCItem[]>({
    queryKey: ['/api/non-conformities'],
    refetchInterval: 60000,
  });

  const openIssues = ncItems.filter(nc => nc.status === 'open');
  const inProgressIssues = ncItems.filter(nc => nc.status === 'in_progress');

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

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            Açık Konular
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="destructive" className="text-sm">
              {openIssues.length} Açık
            </Badge>
            <Badge variant="secondary" className="text-sm">
              {inProgressIssues.length} Devam Ediyor
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {openIssues.length === 0 && inProgressIssues.length === 0 ? (
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Açık konu bulunmuyor</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {[...openIssues, ...inProgressIssues].slice(0, 5).map((issue) => (
              <div key={issue.id} className="p-3 bg-gray-50 rounded-lg border hover:shadow-sm transition-all">
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    issue.status === 'open' ? 'bg-red-500' : 'bg-yellow-500'
                  }`} />
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
                        {issue.dueDate && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(issue.dueDate).toLocaleDateString('tr-TR')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {(openIssues.length > 0 || inProgressIssues.length > 0) && (
          <div className="pt-2 border-t">
            <Button variant="outline" size="sm" className="w-full">
              <Eye className="h-4 w-4 mr-2" />
              Tümünü Görüntüle ({openIssues.length + inProgressIssues.length})
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
