
import React from 'react';
import { MetricsProvider } from '@/contexts/MetricsContext';
import MetricsHeader from '@/components/metrics/MetricsHeader';
import MetricsFilters from '@/components/metrics/MetricsFilters';
import MetricsContent from '@/components/metrics/MetricsContent';
import MetricsDialogs from '@/components/metrics/MetricsDialogs';
import { useMetricsContext } from '@/contexts/MetricsContext';
import { useMetricsDialogs } from '@/hooks/useMetricsDialogs';

// Create a component for the metrics page content
const MetricsPageContent = () => {
  const { departments } = useMetricsContext();
  const { 
    selectedMetric,
    isCreateDialogOpen,
    isEditDialogOpen,
    isValueDialogOpen,
    isDeleteDialogOpen,
    setIsCreateDialogOpen,
    handleMetricSuccess,
    handleValueSuccess,
    handleDeleteConfirm,
    setIsEditDialogOpen,
    setIsValueDialogOpen,
    setIsDeleteDialogOpen
  } = useMetricsDialogs();

  return (
    <div className="animate-fade-in">
      <MetricsHeader 
        setIsCreateDialogOpen={setIsCreateDialogOpen}
      />
      
      <MetricsFilters />
      
      <MetricsContent />

      <MetricsDialogs 
        departments={departments}
        selectedMetric={selectedMetric}
        isCreateDialogOpen={isCreateDialogOpen}
        isEditDialogOpen={isEditDialogOpen}
        isValueDialogOpen={isValueDialogOpen}
        isDeleteDialogOpen={isDeleteDialogOpen}
        onCreateSuccess={handleMetricSuccess}
        onEditSuccess={handleMetricSuccess}
        onValueSuccess={handleValueSuccess}
        onDeleteConfirm={handleDeleteConfirm}
        setIsCreateDialogOpen={setIsCreateDialogOpen}
        setIsEditDialogOpen={setIsEditDialogOpen}
        setIsValueDialogOpen={setIsValueDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
      />
    </div>
  );
};

// Main component that wraps everything with the provider
const Metrics = () => {
  return (
    <MetricsProvider>
      <MetricsPageContent />
    </MetricsProvider>
  );
};

export default Metrics;
