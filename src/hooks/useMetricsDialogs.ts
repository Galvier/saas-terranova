
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { MetricDefinition, deleteMetricDefinition } from '@/integrations/supabase';
import { useToast } from '@/hooks/use-toast';

export const useMetricsDialogs = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isValueDialogOpen, setIsValueDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<MetricDefinition | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleMetricSuccess = () => {
    setIsCreateDialogOpen(false);
    setIsEditDialogOpen(false);
    queryClient.invalidateQueries({ queryKey: ['metrics'] });
    // Also invalidate dashboard metrics to show changes in real-time
    queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
  };

  const handleValueSuccess = () => {
    setIsValueDialogOpen(false);
    queryClient.invalidateQueries({ queryKey: ['metrics'] });
    // Also invalidate dashboard metrics to show changes in real-time
    queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
  };

  const handleAddValueClick = (metric: MetricDefinition) => {
    console.log('Registering value for metric:', metric);
    setSelectedMetric(metric);
    setIsValueDialogOpen(true);
  };

  const handleEditClick = (metric: MetricDefinition) => {
    console.log('Editing metric:', metric);
    setSelectedMetric(metric);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (metric: MetricDefinition) => {
    console.log('Deleting metric:', metric);
    setSelectedMetric(metric);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedMetric) return;

    try {
      console.log('Confirming deletion of metric:', selectedMetric.id);
      const result = await deleteMetricDefinition(selectedMetric.id);
      if (result.error) {
        toast({
          title: "Erro",
          description: `Não foi possível excluir a métrica: ${result.message}`,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Métrica excluída",
        description: "Métrica excluída com sucesso",
        variant: "default",
      });

      queryClient.invalidateQueries({ queryKey: ['metrics'] });
      // Also invalidate dashboard metrics
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      // Also invalidate admin dashboard config
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-config'] });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao excluir a métrica",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedMetric(null);
    }
  };

  return {
    isCreateDialogOpen,
    isEditDialogOpen, 
    isValueDialogOpen,
    isDeleteDialogOpen,
    selectedMetric,
    setIsCreateDialogOpen,
    setIsEditDialogOpen,
    setIsValueDialogOpen,
    setIsDeleteDialogOpen,
    handleMetricSuccess,
    handleValueSuccess,
    handleAddValueClick,
    handleEditClick,
    handleDeleteClick,
    handleDeleteConfirm
  };
};
