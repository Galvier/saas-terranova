
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

  // Force department selection to user's department if not admin
  const effectiveDepartment = !isAdmin && userDepartmentId 
    ? userDepartmentId 
    : selectedDepartment;

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
    if (effectiveDepartment === 'all') {
      setDepartmentName("Todos os setores");
    } else {
      const dept = departments.find(d => d.id === effectiveDepartment);
      setDepartmentName(dept?.name || "");
    }
  }, [effectiveDepartment, departments]);

  // Fetch metrics data with proper error handling
  const { data: metrics = [], isLoading: isLoadingMetrics } = useQuery({
    queryKey: ['metrics', effectiveDepartment, format(selectedDate, 'yyyy-MM-dd')],
    queryFn: async () => {
      console.log("Fetching metrics with params:", {
        department: effectiveDepartment,
        date: format(selectedDate, 'yyyy-MM-dd')
      });
      
      const result = await getMetricsByDepartment(
        effectiveDepartment === "all" ? undefined : effectiveDepartment,
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

  // Set initial department based on user role
  useEffect(() => {
    try {
      // For non-admin users, force their department
      if (!isAdmin && userDepartmentId) {
        setSelectedDepartment(userDepartmentId);
        return;
      }
      
      // For admins, try to load from localStorage
      const savedDepartment = localStorage.getItem('metricsSelectedDepartment');
      if (savedDepartment && isAdmin) {
        setSelectedDepartment(savedDepartment);
      } else if (isAdmin) {
        setSelectedDepartment('all');
      }
    } catch (error) {
      console.error("Error setting initial department:", error);
    }
  }, [isAdmin, userDepartmentId]);
  
  // Save department preference for admins only
  useEffect(() => {
    try {
      if (isAdmin && selectedDepartment) {
        localStorage.setItem('metricsSelectedDepartment', selectedDepartment);
      }
    } catch (error) {
      console.error("Error saving department preference:", error);
    }
  }, [selectedDepartment, isAdmin]);

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

  return {
    // State
    departments,
    metrics,
    isLoading,
    selectedDepartment: effectiveDepartment,
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
