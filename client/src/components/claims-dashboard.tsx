
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Users, 
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface ClaimsDashboardProps {
  stats: any;
}

export function ClaimsDashboard({ stats }: ClaimsDashboardProps) {
  // Mock data for demonstration
  const mockStats = {
    totalClaims: 156,
    openClaims: 23,
    resolvedClaims: 89,
    closedClaims: 44,
    totalCost: 89750,
    avgResolutionTime: 8.5,
    monthlyTrend: [
      { month: 'Oca', claims: 12, cost: 15000 },
      { month: 'Şub', claims: 18, cost: 22000 },
      { month: 'Mar', claims: 15, cost: 18500 },
      { month: 'Nis', claims: 22, cost: 28000 },
      { month: 'May', claims: 19, cost: 24500 },
      { month: 'Haz', claims: 16, cost: 21000 },
    ],
    departmentDistribution: [
      { name: 'Kalite', value: 45, color: '#ef4444' },
      { name: 'Üretim', value: 32, color: '#f97316' },
      { name: 'Lojistik', value: 18, color: '#eab308' },
      { name: 'Mühendislik', value: 12, color: '#22c55e' },
    ],
    priorityDistribution: [
      { name: 'Kritik', value: 8, color: '#dc2626' },
      { name: 'Yüksek', value: 23, color: '#ea580c' },
      { name: 'Orta', value: 67, color: '#ca8a04' },
      { name: 'Düşük', value: 58, color: '#16a34a' },
    ]
  };

  // Ensure data has required properties with fallbacks
  const safeData = {
    totalClaims: stats?.totalClaims || mockStats.totalClaims,
    openClaims: stats?.openClaims || mockStats.openClaims,
    resolvedClaims: stats?.resolvedClaims || mockStats.resolvedClaims,
    closedClaims: stats?.closedClaims || mockStats.closedClaims,
    totalCost: stats?.totalCost || mockStats.totalCost,
    avgResolutionTime: stats?.avgResolutionTime || mockStats.avgResolutionTime,
    departmentDistribution: stats?.departmentDistribution || mockStats.departmentDistribution,
    priorityDistribution: stats?.priorityDistribution || mockStats.priorityDistribution,
    monthlyTrend: stats?.monthlyTrend || mockStats.monthlyTrend,
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700 font-medium">Toplam Şikayet</p>
                <p className="text-3xl font-bold text-red-900">{safeData.totalClaims || 0}</p>
              </div>
              <AlertTriangle className="h-12 w-12 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700 font-medium">Açık Şikayetler</p>
                <p className="text-3xl font-bold text-orange-900">{safeData.openClaims || 0}</p>
              </div>
              <Clock className="h-12 w-12 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium">Toplam Maliyet</p>
                <p className="text-3xl font-bold text-blue-900">€{(safeData.totalCost || 0).toLocaleString()}</p>
              </div>
              <DollarSign className="h-12 w-12 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium">Ort. Çözüm Süresi</p>
                <p className="text-3xl font-bold text-green-900">{safeData.avgResolutionTime || 0} gün</p>
              </div>
              <TrendingUp className="h-12 w-12 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Aylık Şikayet Trendi</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={safeData.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="claims" stroke="#ef4444" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Department Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Departman Dağılımı</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={safeData.departmentDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {safeData.departmentDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Priority Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Öncelik Dağılımı</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={safeData.priorityDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Durum Özeti</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <XCircle className="h-8 w-8 text-red-600" />
                  <span className="font-medium text-red-900">Açık</span>
                </div>
                <Badge variant="destructive">{safeData.openClaims || 0}</Badge>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Eye className="h-8 w-8 text-yellow-600" />
                  <span className="font-medium text-yellow-900">İncelemede</span>
                </div>
                <Badge variant="default">
                  {(safeData.totalClaims || 0) - (safeData.openClaims || 0) - (safeData.resolvedClaims || 0) - (safeData.closedClaims || 0)}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-8 w-8 text-blue-600" />
                  <span className="font-medium text-blue-900">Çözüldü</span>
                </div>
                <Badge variant="secondary">{safeData.resolvedClaims || 0}</Badge>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <span className="font-medium text-green-900">Kapandı</span>
                </div>
                <Badge variant="outline">{safeData.closedClaims || 0}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
