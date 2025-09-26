import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface KpiChartProps {
  title: string;
  data: any[];
  type: 'line' | 'bar' | 'pie';
  dataKey: string;
  xAxisKey?: string;
  color?: string;
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#06b6d4'];

export function KpiChart({ title, data, type, dataKey, xAxisKey, color = "#3b82f6" }: KpiChartProps) {
  const Chart = type === 'line' ? LineChart : type === 'bar' ? BarChart : PieChart;
  
  const renderChart = () => {
    if (type === 'pie') {
      return (
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey={dataKey}
            animationBegin={0}
            animationDuration={800}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              color: '#374151'
            }}
          />
        </PieChart>
      );
    }

    const DataComponent: any = type === 'line' ? Line : Bar;
    
    return (
      <Chart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <defs>
          <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
            <stop offset="95%" stopColor={color} stopOpacity={0.2}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" strokeWidth={1} />
        <XAxis 
          dataKey={xAxisKey} 
          stroke="#6b7280"
          fontSize={12}
          fontWeight={500}
          tickLine={false}
          axisLine={false}
        />
        <YAxis 
          stroke="#6b7280"
          fontSize={12}
          fontWeight={500}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            color: '#374151'
          }}
          cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
        />
        <DataComponent 
          dataKey={dataKey}
          stroke={color}
          fill={type === 'bar' ? "url(#colorGradient)" : color}
          strokeWidth={type === 'line' ? 3 : undefined}
          dot={type === 'line' ? { fill: color, strokeWidth: 2, r: 4 } : undefined}
          activeDot={type === 'line' ? { r: 6, stroke: color, strokeWidth: 2 } : undefined}
          radius={type === 'bar' ? [4, 4, 0, 0] : undefined}
          animationDuration={800}
          animationBegin={0}
        />
      </Chart>
    );
  };

  return (
    <Card className="chart-container bg-white shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300" data-testid={`chart-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
          <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded mr-3"></div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`${type === 'pie' ? 'h-[280px]' : 'h-[300px]'}`}>
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
