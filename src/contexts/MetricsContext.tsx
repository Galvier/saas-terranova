
import React, { createContext, useContext, useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAllDepartments, getMetricsByDepartment, MetricDefinition } from '@/integrations/supabase';
import { DateRangeType } from '@/components/filters/DateFilter';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

// Define context type
interface MetricsContextType {
  metrics: MetricDefinition[];
  departments: any[];
  isLoading: boolean;
  selectedDepartment: string;
  selectedDate: Date;
  dateRangeType: DateRangeType;
  departmentName: string;
  setSelectedDepartment: (id: string) => void;
  setSelectedDate: (date: Date) => void;
  setDateRangeType: (type: DateRangeType) => void;
  refreshMetrics: () => void;
}

// Create context with default values
const MetricsContext = createContext<MetricsContextType>({
  metrics: [],
  departments: [],
  isLoading: false,
  selectedDepartment: 'all',
  selectedDate: new Date(),
  dateRangeType: 'month',
  departmentName: '',
  setSelectedDepartment: () => {},
  setSelectedDate: () => {},
  setDateRangeType: () => {},
  refreshMetrics: () => {},
});

export const useMetricsContext = () => useContext(MetricsContext);

export const MetricsProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dateRangeType, setDateRangeType] = useState<DateRangeType>('month');
  const [departmentName, setDepartmentName] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAdmin, userDepartmentId } = useAuth();
  
  // Load departments
  const { data: departments = [], isLoading: isLoadingDepartments } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const result = await getAllDepartments();
      if (result.error) throw new Error(result.message);
      return result.data || [];
    }
  });

  // Load metrics
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

  // Set department name when department is selected
  useEffect(() => {
    if (selectedDepartment === 'all') {
      setDepartmentName("Todos os departamentos");
    } else {
      const dept = departments.find(d => d.id === selectedDepartment);
      setDepartmentName(dept?.name || "");
    }
  }, [selectedDepartment, departments]);

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

  // Function to refresh metrics
  const refreshMetrics = () => {
    queryClient.invalidateQueries({ queryKey: ['metrics'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
  };

  const isLoading = isLoadingDepartments || isLoadingMetrics;
  
  const value = {
    metrics,
    departments,
    isLoading,
    selectedDepartment,
    selectedDate,
    dateRangeType,
    departmentName,
    setSelectedDepartment,
    setSelectedDate,
    setDateRangeType,
    refreshMetrics
  };

  return (
    <MetricsContext.Provider value={value}>
      {children}
    </MetricsContext.Provider>
  );
};
