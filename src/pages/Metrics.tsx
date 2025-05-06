import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { getAllDepartments, getMetricsByDepartment, deleteMetricDefinition, MetricDefinition } from '@/integrations/supabase';
import { useToast } from '@/hooks/use-toast';
import MetricsHeader from '@/components/metrics/MetricsHeader';
import MetricsTable from '@/components/metrics/MetricsTable';
import MetricsDialogs from '@/components/metrics/MetricsDialogs';
import DateFilter, { DateRangeType } from '@/components/filters/DateFilter';
import { useAuth } from '@/hooks/useAuth';
import UserProfileIndicator from '@/components/UserProfileIndicator';

const Metrics = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isValueDialogOpen, setIsValueDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedMetric, setSelectedMetric] = useState<MetricDefinition | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dateRangeType, setDateRangeType] = useState<DateRangeType>('month');
  const [departmentName, setDepartmentName] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAdmin, userDepartmentId } = useAuth();

  const { data: departments = [], isLoading: isLoadingDepartments } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const result = await getAllDepartments();
      if (result.error) throw new Error(result.message);
      return result.data || [];
    }
  });

  // Set department name when department is selected
  React.useEffect(() => {
    if (selectedDepartment === 'all') {
      setDepartmentName("Todos os setores");
    } else {
      const dept = departments.find(d => d.id === selectedDepartment);
      setDepartmentName(dept?.name || "");
    }
  }, [selectedDepartment, departments]);

  const { data: metrics = [], isLoading: isLoadingMetrics } = useQuery({
    queryKey: ['metrics', selectedDepartment, format(selectedDate, 'yyyy-MM-dd')],
    queryFn: async () => {
      const result = await getMetricsByDepartment(
        selectedDepartment === "all" ? undefined : selectedDepartment,
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

  const isLoading = isLoadingDepartments || isLoadingMetrics;

  // Set initial department based on user role
  React.useEffect(() => {
    try {
      // Try to load from localStorage if user has a saved preference
      const savedDepartment = localStorage.getItem('metricsSelectedDepartment');
      
      if (savedDepartment) {
        // Only apply saved preference if user is admin or it's their department
        if (isAdmin || savedDepartment === userDepartmentId) {
          setSelectedDepartment(savedDepartment);
          return;
        }
      }
      
      // If no saved preference or not applicable, use defaults
      if (!isAdmin && userDepartmentId) {
        // Managers default to their department
        setSelectedDepartment(userDepartmentId);
      } else if (isAdmin) {
        // Admins default to "all departments"
        setSelectedDepartment('all');
      }
    } catch (error) {
      console.error("Error setting initial department:", error);
    }
  }, [isAdmin, userDepartmentId]);
  
  // Save department preference whenever it changes
  React.useEffect(() => {
    try {
      if (selectedDepartment) {
        localStorage.setItem('metricsSelectedDepartment', selectedDepartment);
      }
    } catch (error) {
      console.error("Error saving department preference:", error);
    }
  }, [selectedDepartment]);

  // Load saved date filter preference
  React.useEffect(() => {
    try {
      const savedPrefs = localStorage.getItem('metricsDatePreferences');
      if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs);
        if (prefs.date) setSelectedDate(new Date(prefs.date));
        if (prefs.type) setDateRangeType(prefs.type);
      }
    } catch (error) {
      console.error("Error loading date preferences", error);
    }
  }, []);
  
  // Save date filter preference
  React.useEffect(() => {
    try {
      localStorage.setItem('metricsDatePreferences', JSON.stringify({
        date: selectedDate.toISOString(),
        type: dateRangeType
      }));
    } catch (error) {
      console.error("Error saving date preferences", error);
    }
  }, [selectedDate, dateRangeType]);

  return (
    <div className="animate-fade-in">
      <MetricsHeader 
        departments={departments}
        selectedDepartment={selectedDepartment}
        setSelectedDepartment={setSelectedDepartment}
        setIsCreateDialogOpen={setIsCreateDialogOpen}
      />
      
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <UserProfileIndicator 
          selectedDepartment={selectedDepartment}
          departmentName={departmentName}
        />
        
        <DateFilter
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          dateRangeType={dateRangeType}
          onDateRangeTypeChange={setDateRangeType as (type: DateRangeType) => void}
          className="w-full sm:w-auto"
        />
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
