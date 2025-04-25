import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { getAllDepartments, getMetricsByDepartment, deleteMetricDefinition, MetricDefinition } from '@/integrations/supabase';
import { useToast } from '@/hooks/use-toast';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
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
    queryKey: ['metrics', selectedDepartment, selectedDate],
    queryFn: async () => {
      const result = await getMetricsByDepartment(
        selectedDepartment,
        format(selectedDate, 'yyyy-MM-dd')
      );
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
      
      <div className="flex justify-end mb-6">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-[240px] justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(selectedDate, 'dd/MM/yyyy')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

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
