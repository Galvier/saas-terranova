
import React from 'react';
import { MetricDefinition } from '@/integrations/supabase';
import KpiCard from '@/components/KpiCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface FavoriteMetricsGridProps {
  metrics: MetricDefinition[];
  selectedMetrics: string[];
  viewMode: 'all' | 'favorites';
  onConfigureClick: () => void;
}

const FavoriteMetricsGrid: React.FC<FavoriteMetricsGridProps> = ({
  metrics,
  selectedMetrics,
  viewMode,
  onConfigureClick
}) => {
  if (viewMode !== 'favorites' || !selectedMetrics.length) return null;
  
  // Get only metrics that are in the selected favorites list
  const favoriteMetrics = metrics.filter(metric => 
    selectedMetrics.includes(metric.id)
  );
  
  if (favoriteMetrics.length === 0) {
    return (
      <Card className="p-8 text-center">
        <h3 className="text-xl font-medium mb-2">Nenhuma métrica encontrada</h3>
        <p className="text-muted-foreground">
          As métricas selecionadas não estão disponíveis para o departamento e período selecionados.
          <Button 
            variant="link" 
            className="p-0 h-auto ml-1"
            onClick={onConfigureClick}
          >
            Configurar dashboard
          </Button>
        </p>
      </Card>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
      {favoriteMetrics.map(metric => (
        <KpiCard
          key={metric.id}
          title={metric.name}
          value={`${metric.current}${metric.unit ? ` ${metric.unit}` : ''}`}
          status={metric.status as 'success' | 'warning' | 'danger'}
          changeLabel={metric.department_name ? `${metric.department_name}` : ''}
          icon={null}
        />
      ))}
    </div>
  );
};

export default FavoriteMetricsGrid;
