
import React from 'react';
import { MetricDefinition } from '@/integrations/supabase';
import KpiCard from '@/components/KpiCard';
import PerformanceChart from '@/components/PerformanceChart';

interface ManagerDashboardProps {
  metrics: MetricDefinition[];
  departmentName: string;
}

const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ metrics, departmentName }) => {
  if (metrics.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">Nenhuma métrica encontrada</h3>
        <p className="text-muted-foreground">
          Não há métricas disponíveis para {departmentName} no período selecionado.
        </p>
      </div>
    );
  }

  // Sort metrics by priority and status for better organization
  const sortedMetrics = [...metrics].sort((a, b) => {
    const priorityOrder = { 'critical': 0, 'high': 1, 'normal': 2 };
    const aPriority = a.priority ? priorityOrder[a.priority as keyof typeof priorityOrder] || 2 : 2;
    const bPriority = b.priority ? priorityOrder[b.priority as keyof typeof priorityOrder] || 2 : 2;
    
    if (aPriority !== bPriority) return aPriority - bPriority;
    
    const statusOrder = { 'danger': 0, 'warning': 1, 'success': 2 };
    return (statusOrder[a.status as keyof typeof statusOrder] || 2) - 
           (statusOrder[b.status as keyof typeof statusOrder] || 2);
  });

  // Separate metrics by visualization type
  const cardMetrics = sortedMetrics.filter(metric => 
    !metric.visualization_type || metric.visualization_type === 'card'
  );
  
  const chartMetrics = sortedMetrics.filter(metric => 
    metric.visualization_type && metric.visualization_type !== 'card'
  );

  // Generate mock historical data for charts
  const generateChartData = (metric: MetricDefinition) => {
    const baseValue = metric.current;
    const target = metric.target;
    
    // Generate 6 data points including current and target
    return [
      { name: 'Jan', value: Math.max(0, baseValue * 0.8 + (Math.random() - 0.5) * baseValue * 0.2) },
      { name: 'Fev', value: Math.max(0, baseValue * 0.85 + (Math.random() - 0.5) * baseValue * 0.2) },
      { name: 'Mar', value: Math.max(0, baseValue * 0.9 + (Math.random() - 0.5) * baseValue * 0.2) },
      { name: 'Abr', value: Math.max(0, baseValue * 0.95 + (Math.random() - 0.5) * baseValue * 0.2) },
      { name: 'Atual', value: baseValue },
      { name: 'Meta', value: target }
    ];
  };

  return (
    <div className="space-y-6">
      <div className="bg-primary/5 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Dashboard - {departmentName}</h2>
        <p className="text-muted-foreground">
          Métricas de desempenho do seu setor ({metrics.length} indicadores)
        </p>
      </div>
      
      {/* KPI Cards Section */}
      {cardMetrics.length > 0 && (
        <div className="space-y-4">
          {cardMetrics.length > 0 && chartMetrics.length > 0 && (
            <h3 className="text-lg font-semibold">Indicadores principais</h3>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {cardMetrics.map(metric => (
              <KpiCard
                key={metric.id}
                title={metric.name}
                value={`${metric.current}${metric.unit ? ` ${metric.unit}` : ''}`}
                status={metric.status as 'success' | 'warning' | 'danger'}
                change={Math.random() * 10 * (Math.random() > 0.5 ? 1 : -1)} // Mock change data
                changeLabel="vs. período anterior"
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Charts Section */}
      {chartMetrics.length > 0 && (
        <div className="space-y-4">
          {cardMetrics.length > 0 && chartMetrics.length > 0 && (
            <h3 className="text-lg font-semibold">Análises de desempenho</h3>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {chartMetrics.map(metric => (
              <PerformanceChart
                key={metric.id}
                title={metric.name}
                data={generateChartData(metric)}
                type={metric.visualization_type as 'bar' | 'line' | 'pie'}
                status={metric.status as 'success' | 'warning' | 'danger'}
                trend={Math.random() * 10 * (Math.random() > 0.5 ? 1 : -1)} // Mock trend data
                percentage={metric.unit === '%'}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;
