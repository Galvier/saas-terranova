
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
}

const FavoriteMetricsView: React.FC<FavoriteMetricsViewProps> = ({
  metrics,
  isLoading,
  dateFilter,
  departmentFilter
}) => {
  const { toast } = useToast();
  const [selectedMetrics, setSelectedMetrics] = useState<MetricDefinition[]>([]);

  // Group metrics by their status for easy access
  const groupMetricsByStatus = () => {
    const grouped: Record<string, MetricDefinition[]> = {
      success: [],
      warning: [],
      danger: []
    };

    metrics.forEach(metric => {
      if (metric.status) {
        const status = metric.status.toLowerCase();
        if (grouped[status]) {
          grouped[status].push(metric);
        }
      }
    });

    return grouped;
  };

  // Use effect to filter and set the selected metrics
  useEffect(() => {
    if (metrics.length > 0) {
      setSelectedMetrics(metrics);
    }
  }, [metrics]);

  // Handle empty state
  if (selectedMetrics.length === 0 && !isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            Nenhuma métrica foi selecionada para o dashboard personalizado.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Clique em "Editar dashboard" para selecionar as métricas que deseja visualizar.
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
    const count = selectedMetrics.length;
    if (count <= 2) return "grid-cols-1 sm:grid-cols-2";
    if (count <= 4) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
    return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
  };

  return (
    <div className={`grid ${getGridClass()} gap-4 mb-6`}>
      {isLoading ? (
        Array(4).fill(0).map((_, idx) => (
          <KpiCard
            key={idx}
            title="Carregando..."
            value="..."
            subtitle="Carregando dados"
            status="neutral"
            isLoading={true}
          />
        ))
      ) : (
        selectedMetrics.map((metric) => (
          <KpiCard
            key={metric.id}
            title={metric.name}
            value={formatNumber(metric.current, metric.unit)}
            subtitle={`Meta: ${formatNumber(metric.target, metric.unit)}`}
            status={metric.status || 'neutral'}
            trend={metric.trend || 'neutral'}
            icon={metric.icon_name}
          />
        ))
      )}
    </div>
  );
};

export default FavoriteMetricsView;
