
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, TrendingUp } from 'lucide-react';

interface MonthlyChartProps {
  className?: string;
}

export function MonthlyChart({ className }: MonthlyChartProps) {
  // Persist selected options in localStorage to maintain state across renders
  const [selectedMetric, setSelectedMetric] = useState(() => {
    return localStorage.getItem('monthlyChart_selectedMetric') || 'quality';
  });
  const [chartType, setChartType] = useState<'line' | 'bar'>(() => {
    return (localStorage.getItem('monthlyChart_chartType') as 'line' | 'bar') || 'line';
  });

  // Save preferences when they change
  const handleMetricChange = (value: string) => {
    setSelectedMetric(value);
    localStorage.setItem('monthlyChart_selectedMetric', value);
  };

  const handleChartTypeChange = (value: 'line' | 'bar') => {
    setChartType(value);
    localStorage.setItem('monthlyChart_chartType', value);
  };

  // Geçmişte kaydedilen aylık verileri yükle
  const getMonthlyData = () => {
    const currentDate = new Date();
    const months = [];
    
    // Son 12 ayı al
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth();
      const monthName = date.toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' });
      
      months.push({
        name: monthName,
        year,
        month,
        ...getMetricData(year, month)
      });
    }
    
    return months;
  };

  const getMetricData = (year: number, month: number) => {
    switch (selectedMetric) {
      case 'quality':
        // Önce mevcut aylık veriyi kontrol et
        let qualityData = localStorage.getItem(`quality_monthly_${year}_${month}`);
        if (qualityData) {
          const parsed = JSON.parse(qualityData);
          return {
            satisfied: parsed.satisfied || 0,
            dissatisfied: parsed.dissatisfied || 0,
            satisfactionRate: parsed.satisfied ? (parsed.satisfied / (parsed.satisfied + parsed.dissatisfied) * 100).toFixed(1) : 0
          };
        }
        
        // Günlük verilerden aylık hesapla
        const qualityDailyData = localStorage.getItem(`quality_data_${year}_${month}`);
        if (qualityDailyData) {
          const dailyStatuses = JSON.parse(qualityDailyData);
          const satisfied = Object.values(dailyStatuses).filter(status => status === 'satisfied').length;
          const dissatisfied = Object.values(dailyStatuses).filter(status => status === 'dissatisfied').length;
          const satisfactionRate = satisfied + dissatisfied > 0 ? (satisfied / (satisfied + dissatisfied) * 100).toFixed(1) : 0;
          
          // Aylık veriyi kaydet
          localStorage.setItem(`quality_monthly_${year}_${month}`, JSON.stringify({ satisfied, dissatisfied }));
          
          return { satisfied, dissatisfied, satisfactionRate };
        }
        
        // Varsayılan veriler (mevcut ay için)
        if (year === new Date().getFullYear() && month === new Date().getMonth()) {
          return { satisfied: 22, dissatisfied: 9, satisfactionRate: (22 / 31 * 100).toFixed(1) };
        }
        
        return { satisfied: 0, dissatisfied: 0, satisfactionRate: 0 };
        
      case 'safety':
        // Önce mevcut aylık veriyi kontrol et
        let safetyData = localStorage.getItem(`safety_monthly_${year}_${month}`);
        if (safetyData) {
          const parsed = JSON.parse(safetyData);
          return {
            safeDays: parsed.safeDays || 0,
            incidents: parsed.incidents || 0,
            safetyRate: parsed.safeDays ? (parsed.safeDays / (parsed.safeDays + parsed.incidents) * 100).toFixed(1) : 0
          };
        }
        
        // Günlük verilerden aylık hesapla
        const safetyDailyData = localStorage.getItem(`safety_data_${year}_${month}`);
        if (safetyDailyData) {
          const dailyStatuses = JSON.parse(safetyDailyData);
          const safeDays = Object.values(dailyStatuses).filter(status => status === 'safe').length;
          const incidents = Object.values(dailyStatuses).filter(status => status === 'incident').length;
          const safetyRate = safeDays + incidents > 0 ? (safeDays / (safeDays + incidents) * 100).toFixed(1) : 0;
          
          // Aylık veriyi kaydet
          localStorage.setItem(`safety_monthly_${year}_${month}`, JSON.stringify({ safeDays, incidents }));
          
          return { safeDays, incidents, safetyRate };
        }
        
        // Varsayılan veriler (mevcut ay için)
        if (year === new Date().getFullYear() && month === new Date().getMonth()) {
          return { safeDays: 30, incidents: 1, safetyRate: (30 / 31 * 100).toFixed(1) };
        }
        
        return { safeDays: 0, incidents: 0, safetyRate: 0 };
        
      case 'production':
        const productionLines = [
          'M500/5.1 Montaj Hattı',
          'M600/3.2 Paketleme Hattı',
          'M700/4.1 Kalite Kontrol',
        ];
        
        let totalEfficiency = 0;
        let lineCount = 0;
        
        productionLines.forEach(line => {
          const efficiency = localStorage.getItem(`production_monthly_${line}_${year}_${month}`);
          if (efficiency) {
            totalEfficiency += parseFloat(efficiency);
            lineCount++;
          } else {
            // Günlük verilerden hesapla
            const dailyData = localStorage.getItem(`production_efficiency_${line}_${year}_${month}`);
            if (dailyData) {
              const dailyEfficiencies = JSON.parse(dailyData);
              const values = Object.values(dailyEfficiencies) as number[];
              if (values.length > 0) {
                const avgEfficiency = values.reduce((sum, val) => sum + val, 0) / values.length;
                totalEfficiency += avgEfficiency;
                lineCount++;
                // Aylık veriyi kaydet
                localStorage.setItem(`production_monthly_${line}_${year}_${month}`, avgEfficiency.toString());
              }
            }
          }
        });
        
        // Varsayılan veriler (mevcut ay için)
        if (lineCount === 0 && year === new Date().getFullYear() && month === new Date().getMonth()) {
          return { efficiency: '92' };
        }
        
        return {
          efficiency: lineCount > 0 ? (totalEfficiency / lineCount).toFixed(1) : 0
        };
        
      default:
        return {};
    }
  };

  const chartData = useMemo(() => getMonthlyData(), [selectedMetric]);

  const getChartConfig = () => {
    switch (selectedMetric) {
      case 'quality':
        return {
          dataKey: 'satisfactionRate',
          color: '#10b981',
          label: 'Müşteri Memnuniyet Oranı (%)'
        };
      case 'safety':
        return {
          dataKey: 'safetyRate',
          color: '#3b82f6',
          label: 'Güvenlik Oranı (%)'
        };
      case 'production':
        return {
          dataKey: 'efficiency',
          color: '#f59e0b',
          label: 'Verimlilik (%)'
        };
      default:
        return {
          dataKey: 'value',
          color: '#6b7280',
          label: 'Değer'
        };
    }
  };

  const config = getChartConfig();

  return (
    <div className={`w-full max-w-full ${className}`}>
      <Card className="bg-white shadow-lg border border-gray-100 w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold text-gray-800 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Aylık Trend Analizi
          </CardTitle>
          <div className="flex flex-wrap gap-2 mt-2">
            <Select value={selectedMetric} onValueChange={handleMetricChange}>
              <SelectTrigger className="w-[180px] min-w-[140px] h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quality">Müşteri Memnuniyeti</SelectItem>
                <SelectItem value="safety">İş Güvenliği</SelectItem>
                <SelectItem value="production">Verimlilik</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={chartType} onValueChange={handleChartTypeChange}>
              <SelectTrigger className="w-[120px] min-w-[100px] h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="line">Çizgi</SelectItem>
                <SelectItem value="bar">Bar</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="w-full overflow-hidden p-4 pt-2">
          <div className="w-full h-[280px] min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 15, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  stroke="#6b7280"
                  fontSize={10}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  interval={0}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={10}
                  width={40}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    fontSize: '12px'
                  }}
                  formatter={(value) => [`${value}%`, config.label]}
                />
                <Line 
                  type="monotone"
                  dataKey={config.dataKey}
                  stroke={config.color}
                  strokeWidth={2}
                  dot={{ fill: config.color, strokeWidth: 1, r: 3 }}
                  activeDot={{ r: 4, stroke: config.color, strokeWidth: 1 }}
                />
              </LineChart>
            ) : (
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 15, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  stroke="#6b7280"
                  fontSize={10}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  interval={0}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={10}
                  width={40}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    fontSize: '12px'
                  }}
                  formatter={(value) => [`${value}%`, config.label]}
                />
                <Bar 
                  dataKey={config.dataKey}
                  fill={config.color}
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
          </div>
          
          {/* İstatistikler */}
          <div className="mt-4 grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
            <div className="text-center p-2 bg-blue-50 rounded-md">
              <div className="text-lg font-bold text-blue-600">
                {chartData.length > 0 ? chartData[chartData.length - 1]?.[config.dataKey] || 0 : 0}%
              </div>
              <div className="text-xs text-gray-500">Bu Ay</div>
            </div>
            <div className="text-center p-2 bg-green-50 rounded-md">
              <div className="text-lg font-bold text-green-600">
                {chartData.length > 0 ? 
                  (chartData.reduce((sum, item) => sum + (parseFloat(item[config.dataKey]) || 0), 0) / chartData.length).toFixed(1) 
                  : 0}%
              </div>
              <div className="text-xs text-gray-500">Ortalama</div>
            </div>
            <div className="text-center p-2 bg-purple-50 rounded-md">
              <div className="text-lg font-bold text-purple-600">
                {chartData.length > 0 ? Math.max(...chartData.map(item => parseFloat(item[config.dataKey]) || 0)).toFixed(1) : 0}%
              </div>
              <div className="text-xs text-gray-500">En Yüksek</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
