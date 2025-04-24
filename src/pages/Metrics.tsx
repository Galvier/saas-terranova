
import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAllDepartments, getMetricsByDepartment, deleteMetricDefinition, MetricDefinition } from '@/integrations/supabase';
import { useToast } from '@/hooks/use-toast';
import MetricsHeader from '@/components/metrics/MetricsHeader';
import MetricsTable from '@/components/metrics/MetricsTable';
import MetricsDialogs from '@/components/metrics/MetricsDialogs';

const Metrics = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isValueDialogOpen, setIsValueDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedMetric, setSelectedMetric] = useState<MetricDefinition | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: departments = [], isLoading: isLoadingDepartments } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const result = await getAllDepartments();
      if (result.error) throw new Error(result.message);
      return result.data || [];
    }
  });

  const { data: metrics = [], isLoading: isLoadingMetrics } = useQuery({
    queryKey: ['metrics', selectedDepartment],
    queryFn: async () => {
      const result = await getMetricsByDepartment(selectedDepartment);
      if (result.error) throw new Error(result.message);
      return result.data || [];
    }
  });

  const handleMetricSuccess = () => {
    setIsCreateDialogOpen(false);
    setIsEditDialogOpen(false);
    queryClient.invalidateQueries({ queryKey: ['metrics'] });
  };

  const handleValueSuccess = () => {
    setIsValueDialogOpen(false);
    queryClient.invalidateQueries({ queryKey: ['metrics'] });
  };

  const handleAddValueClick = (metric: MetricDefinition) => {
    setSelectedMetric(metric);
    setIsValueDialogOpen(true);
  };

  const handleEditClick = (metric: MetricDefinition) => {
    setSelectedMetric(metric);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (metric: MetricDefinition) => {
    setSelectedMetric(metric);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedMetric) return;

    try {
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

  const isLoading = isLoadingDepartments || isLoadingMetrics;

  return (
    <div className="animate-fade-in">
      <MetricsHeader 
        departments={departments}
        selectedDepartment={selectedDepartment}
        setSelectedDepartment={setSelectedDepartment}
        setIsCreateDialogOpen={setIsCreateDialogOpen}
      />
      
      {isLoading ? (
        <div className="text-center py-8">Carregando métricas...</div>
      ) : metrics.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Nenhuma métrica encontrada. Crie uma nova métrica para começar.
        </div>
      ) : (
        <MetricsTable 
          metrics={metrics}
          onAddValue={handleAddValueClick}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />
      )}

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

export default Metrics;
