
import React from 'react';
import { Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import KpiCard from '@/components/KpiCard';
import { MetricDefinition } from '@/integrations/supabase/types/metric';

interface FavoriteMetricsViewProps {
  selectedMetrics: string[];
  filteredMetrics: MetricDefinition[];
  onConfigClick: () => void;
}

const FavoriteMetricsView: React.FC<FavoriteMetricsViewProps> = ({
  selectedMetrics,
  filteredMetrics,
  onConfigClick,
}) => {
  if (!selectedMetrics.length || !filteredMetrics.length) {
    return (
      <Card className="p-8 text-center">
        <h3 className="text-xl font-medium mb-2">Nenhuma métrica selecionada</h3>
        <p className="text-muted-foreground">
          Selecione suas métricas principais usando o botão de configuração.
          <Button 
            variant="link" 
            className="p-0 h-auto ml-1"
            onClick={onConfigClick}
          >
            Configurar dashboard
          </Button>
        </p>
      </Card>
    );
  }
  
  // Find the metrics that are selected for favorites
  const favoriteMetrics = filteredMetrics.filter(metric => 
    selectedMetrics.includes(metric.id)
  );
  
  if (!favoriteMetrics.length) {
    return (
      <Card className="p-8 text-center">
        <h3 className="text-xl font-medium mb-2">Métricas não encontradas</h3>
        <p className="text-muted-foreground">
          As métricas selecionadas não estão disponíveis para o departamento ou período atual.
        </p>
      </Card>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
      {favoriteMetrics.map(metric => {
        const formattedValue = metric.unit === 'R$' 
          ? `R$ ${metric.current.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
          : `${metric.current}${metric.unit ? ` ${metric.unit}` : ''}`;
          
        return (
          <KpiCard
            key={metric.id}
            title={metric.name}
            value={formattedValue}
            change={(Math.random() * 10 * (Math.random() > 0.5 ? 1 : -1)).toFixed(1)} // Mock change data
            changeLabel="vs. período anterior"
            status={metric.status as 'success' | 'warning' | 'danger'}
            icon={<Star className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />}
          />
        );
      })}
    </div>
  );
};

export default FavoriteMetricsView;
