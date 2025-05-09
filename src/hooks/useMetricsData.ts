import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { getAllDepartments, getMetricsByDepartment, deleteMetricDefinition, MetricDefinition } from '@/integrations/supabase';
import { useToast } from '@/hooks/use-toast';
import { DateRangeType } from '@/components/filters/DateFilter';
import { useAuth } from '@/hooks/useAuth';

export const useMetricsData = () => {
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

  // Fetch departments data
  const { data: departments = [], isLoading: isLoadingDepartments } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const result = await getAllDepartments();
      if (result.error) throw new Error(result.message || "Erro ao carregar departamentos");
      return result.data || [];
    }
  });

  // Set department name when department is selected
  useEffect(() => {
    if (selectedDepartment === 'all') {
      setDepartmentName("Todos os setores");
    } else {
      const dept = departments.find(d => d.id === selectedDepartment);
      setDepartmentName(dept?.name || "");
    }
  }, [selectedDepartment, departments]);

  // Fetch metrics data with proper error handling
  const { data: metrics = [], isLoading: isLoadingMetrics } = useQuery({
    queryKey: ['metrics', selectedDepartment, format(selectedDate, 'yyyy-MM-dd')],
    queryFn: async () => {
      console.log("Fetching metrics with params:", {
        department: selectedDepartment,
        date: format(selectedDate, 'yyyy-MM-dd')
      });
      
      const result = await getMetricsByDepartment(
        selectedDepartment === "all" ? undefined : selectedDepartment,
        format(selectedDate, 'yyyy-MM-dd')
      );
      
      console.log("Metrics API response:", result);
      
      if (result.error) {
        console.error("Error fetching metrics:", result.error);
        throw new Error(result.message || "Erro ao carregar métricas");
      }
      
      return result.data || [];
    },
    retry: 1,
    staleTime: 0, // Don't maintain in cache to always fetch updated data
  });

  // Dialog handlers
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

  // Metric action handlers
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

  // Set initial department based on user role
  useEffect(() => {
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
  useEffect(() => {
    try {
      if (selectedDepartment) {
        localStorage.setItem('metricsSelectedDepartment', selectedDepartment);
      }
    } catch (error) {
      console.error("Error saving department preference:", error);
    }
  }, [selectedDepartment]);

  // Load saved date filter preference
  useEffect(() => {
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
  useEffect(() => {
    try {
      localStorage.setItem('metricsDatePreferences', JSON.stringify({
        date: selectedDate.toISOString(),
        type: dateRangeType
      }));
    } catch (error) {
      console.error("Error saving date preferences", error);
    }
  }, [selectedDate, dateRangeType]);

  const isLoading = isLoadingDepartments || isLoadingMetrics;

  return {
    // State
    departments,
    metrics,
    isLoading,
    selectedDepartment,
    setSelectedDepartment,
    selectedDate,
    setSelectedDate,
    dateRangeType,
    setDateRangeType,
    departmentName,
    selectedMetric,
    
    // Dialog states
    dialogStates: {
      isCreateDialogOpen,
      isEditDialogOpen,
      isValueDialogOpen,
      isDeleteDialogOpen,
      setIsCreateDialogOpen,
      setIsEditDialogOpen,
      setIsValueDialogOpen,
      setIsDeleteDialogOpen,
    },
    
    // Dialog actions
    handleDialogActions: {
      handleMetricSuccess,
      handleValueSuccess,
      handleDeleteConfirm,
    },
    
    // Metric actions
    handleMetricActions: {
      handleAddValueClick,
      handleEditClick,
      handleDeleteClick,
    },
  };
};
