
import React, { useState } from 'react';
import { Download, ArrowDown, ArrowUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';

interface DataPoint {
  name: string;
  value: number;
}

interface PerformanceChartProps {
  title: string;
  data: DataPoint[];
  color?: string;
  type?: 'bar' | 'line' | 'pie';
  percentage?: boolean;
  status?: 'success' | 'warning' | 'danger';
  trend?: number;
}

const COLORS = ['#3b82f6', '#10b981', '#f97316', '#6366f1', '#ec4899', '#8b5cf6'];

const PerformanceChart: React.FC<PerformanceChartProps> = ({ 
  title, 
  data,
  color = "#3b82f6",
  type = 'bar',
  percentage = false,
  status,
  trend
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    try {
      setIsExporting(true);
      // Create CSV content
      const csvContent = [
        // Header row
        ['Nome', 'Valor'].join(','),
        // Data rows
        ...data.map(point => [point.name, point.value].join(','))
      ].join('\n');
      
      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.setAttribute('href', url);
      link.setAttribute('download', `${title.replace(/\s+/g, '-').toLowerCase()}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsExporting(false);
    } catch (error) {
      console.error('Error exporting data:', error);
      setIsExporting(false);
    }
  };

  const renderTrend = () => {
    if (trend === undefined) return null;
    
    const isPositive = trend > 0;
    const Icon = isPositive ? ArrowUp : ArrowDown;
    const trendColor = status === 'success' ? 'text-success' : 
                      status === 'warning' ? 'text-warning' : 'text-destructive';
    
    return (
      <div className={`flex items-center ${trendColor} ml-2`}>
        <Icon className="h-4 w-4" />
        <span className="text-xs">{Math.abs(trend)}%</span>
      </div>
    );
  };

  const getChartColor = () => {
    switch (status) {
      case 'success': return 'var(--success)';
      case 'warning': return 'var(--warning)';
      case 'danger': return 'var(--destructive)';
      default: return color;
    }
  };

  const renderChart = () => {
    if (!data || data.length === 0) {
      return (
        <div className="h-full flex items-center justify-center">
          <p className="text-muted-foreground">Sem dados disponíveis</p>
        </div>
      );
    }

    switch (type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                height={60}
                angle={-45}
                textAnchor="end"
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                tickFormatter={value => percentage ? `${value}%` : value}
              />
              <Tooltip 
                formatter={(value: number) => [percentage ? `${value}%` : value, '']}
                labelFormatter={(name) => `${name}`}
              />
              <Line 
                type="monotone"
                dataKey="value" 
                stroke={getChartColor()} 
                strokeWidth={2}
                dot={{ r: 3 }}
                animationDuration={1000}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
                animationDuration={1000}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [percentage ? `${value}%` : value, '']}
                labelFormatter={(name) => `${name}`}
              />
            </PieChart>
          </ResponsiveContainer>
        );
      
      default: // bar
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                height={60}
                angle={-45}
                textAnchor="end"
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                tickFormatter={value => percentage ? `${value}%` : value}
              />
              <Tooltip 
                formatter={(value: number) => [percentage ? `${value}%` : value, '']}
                labelFormatter={(name) => `${name}`}
              />
              <Bar 
                dataKey="value" 
                fill={getChartColor()} 
                radius={[4, 4, 0, 0]} 
                animationDuration={1000}
              />
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };
  
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center">
          <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
          {renderTrend()}
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleExport}
          title="Exportar dados"
          className="h-7 w-7 p-0"
          disabled={isExporting || !data || data.length === 0}
        >
          <Download className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="sr-only">Exportar dados</span>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] sm:h-[280px] lg:h-[300px]">
          {renderChart()}
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceChart;
