
import React from 'react';
import { MetricDefinition } from '@/integrations/supabase';
import KpiCard from '@/components/KpiCard';

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

  return (
    <div className="space-y-6">
      <div className="bg-primary/5 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Dashboard - {departmentName}</h2>
        <p className="text-muted-foreground">
          Métricas de desempenho do seu setor ({metrics.length} indicadores)
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sortedMetrics.map(metric => (
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
  );
};

export default ManagerDashboard;
