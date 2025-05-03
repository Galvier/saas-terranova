
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MetricDefinition } from '@/integrations/supabase/types/metric';
import KpiCard from '@/components/KpiCard';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface FavoriteMetricsViewProps {
  metrics: MetricDefinition[];
  isLoading: boolean;
  dateFilter: string;
  departmentFilter: string;
  selectedMetrics: string[];
}

const FavoriteMetricsView: React.FC<FavoriteMetricsViewProps> = ({
  metrics,
  isLoading,
  dateFilter,
  departmentFilter,
  selectedMetrics
}) => {
  const { toast } = useToast();
  const [displayedMetrics, setDisplayedMetrics] = useState<MetricDefinition[]>([]);

  // Filter metrics based on the selectedMetrics array
  useEffect(() => {
    if (!metrics || !selectedMetrics) {
      setDisplayedMetrics([]);
      return;
    }
    
    // Only show metrics that are in the selectedMetrics list
    const filtered = metrics.filter(metric => 
      selectedMetrics.includes(metric.id)
    );
    
    setDisplayedMetrics(filtered);
  }, [metrics, selectedMetrics]);

  // Handle empty state
  if (!isLoading && (!displayedMetrics || displayedMetrics.length === 0)) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            Nenhuma métrica foi selecionada para o dashboard personalizado.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Clique em "Configurar dashboard" para selecionar as métricas que deseja visualizar.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Format the number based on metric unit
  const formatNumber = (value: number, unit: string) => {
    if (unit === 'R$') {
      return formatCurrency(value);
    } else if (unit === '%') {
      return `${value.toFixed(1)}%`;
    } else {
      return value.toFixed(1);
    }
  };

  // Define how many metrics to show per row based on count
  const getGridClass = () => {
    const count = displayedMetrics ? displayedMetrics.length : 0;
    if (count <= 2) return "grid-cols-1 sm:grid-cols-2";
    if (count <= 4) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
    return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
  };

  return (
    <div className={`grid ${getGridClass()} gap-4 mb-6 overflow-x-auto md:overflow-visible`}>
      {isLoading ? (
        Array(4).fill(0).map((_, idx) => (
          <KpiCard
            key={idx}
            title="Carregando..."
            value="..."
            subtitle="Carregando dados"
            status="success"
            isLoading={true}
          />
        ))
      ) : (
        displayedMetrics && displayedMetrics.map((metric) => (
          <KpiCard
            key={metric.id}
            title={metric.name}
            value={formatNumber(metric.current, metric.unit)}
            subtitle={`Meta: ${formatNumber(metric.target, metric.unit)}`}
            status={metric.status as "success" | "warning" | "danger"}
            trend={metric.trend || 'neutral'}
            icon={metric.icon_name}
            departmentName={metric.department_name || 'Sem departamento'}
          />
        ))
      )}
    </div>
  );
};

export default FavoriteMetricsView;
