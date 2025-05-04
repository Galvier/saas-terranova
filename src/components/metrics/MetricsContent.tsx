
import React from 'react';
import { useMetricsContext } from '@/contexts/MetricsContext';
import MetricsTable from '@/components/metrics/MetricsTable';
import { useMetricsDialogs } from '@/hooks/useMetricsDialogs';

const MetricsContent = () => {
  const { metrics, isLoading } = useMetricsContext();
  const { 
    handleAddValueClick,
    handleEditClick,
    handleDeleteClick
  } = useMetricsDialogs();

  if (isLoading) {
    return (
      <div className="text-center py-8">Carregando métricas...</div>
    );
  }

  if (metrics.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhuma métrica encontrada. Crie uma nova métrica para começar.
      </div>
    );
  }

  return (
    <MetricsTable 
      metrics={metrics}
      onAddValue={handleAddValueClick}
      onEdit={handleEditClick}
      onDelete={handleDeleteClick}
    />
  );
};

export default MetricsContent;
