
import React, { useState, useEffect } from 'react';
import { format, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, subMonths, subWeeks, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BarChart3, FileText, ShoppingCart, Users, Calendar as CalendarIcon, Filter, ChevronDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getAllDepartments, getMetricsByDepartment } from '@/integrations/supabase';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

import PageHeader from '@/components/PageHeader';
import KpiCard from '@/components/KpiCard';
import PerformanceChart from '@/components/PerformanceChart';
import { useToast } from '@/hooks/use-toast';

// Type for date filter presets
type DatePreset = {
  label: string;
  startDate: Date;
  endDate: Date;
};

const Dashboard = () => {
  const { toast } = useToast();
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dateRangeType, setDateRangeType] = useState<'day' | 'week' | 'month'>('month');
  
  // Load departments
  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const result = await getAllDepartments();
      if (result.error) throw new Error(result.message);
      return result.data || [];
    }
  });

  // Custom date presets
  const datePresets: DatePreset[] = [
    {
      label: "Hoje",
      startDate: new Date(),
      endDate: new Date(),
    },
    {
      label: "Ontem",
      startDate: subDays(new Date(), 1),
      endDate: subDays(new Date(), 1),
    },
    {
      label: "Últimos 7 dias",
      startDate: subDays(new Date(), 6),
      endDate: new Date(),
    },
    {
      label: "Último mês",
      startDate: startOfMonth(subMonths(new Date(), 1)),
      endDate: endOfMonth(subMonths(new Date(), 1)),
    },
    {
      label: "Este mês",
      startDate: startOfMonth(new Date()),
      endDate: new Date(),
    },
  ];
  
  // Load metrics data with filters
  const { data: metrics = [], isLoading } = useQuery({
    queryKey: ['dashboard-metrics', selectedDepartment, format(selectedDate, 'yyyy-MM-dd')],
    queryFn: async () => {
      try {
        const result = await getMetricsByDepartment(
          selectedDepartment === "all" ? undefined : selectedDepartment,
          format(selectedDate, 'yyyy-MM-dd')
        );
        if (result.error) throw new Error(result.message);
        return result.data || [];
      } catch (error) {
        console.error("Error fetching metrics:", error);
        toast({
          title: "Erro ao carregar métricas",
          description: "Não foi possível carregar os dados de desempenho",
          variant: "destructive",
        });
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache to prevent excessive calls
  });
  
  // Process department performance data
  const departmentPerformance = React.useMemo(() => {
    if (!metrics.length) return [];
    
    // Group metrics by department and calculate average performance
    const depPerformance = new Map<string, { total: number, count: number }>();
    
    metrics.forEach((metric) => {
      if (!metric.department_name) return;
      
      // Calculate performance percentage against target
      let perfValue;
      if (metric.lower_is_better) {
        // Lower values are better (target is maximum)
        perfValue = metric.target > 0 ? (1 - Math.min(metric.current / metric.target, 1)) * 100 : 0;
      } else {
        // Higher values are better (target is goal)
        perfValue = metric.target > 0 ? Math.min(metric.current / metric.target, 1) * 100 : 0;
      }
      
      const existing = depPerformance.get(metric.department_name);
      if (existing) {
        existing.total += perfValue;
        existing.count += 1;
      } else {
        depPerformance.set(metric.department_name, { total: perfValue, count: 1 });
      }
    });
    
    // Convert to array format for the chart
    return Array.from(depPerformance.entries()).map(([name, { total, count }]) => ({
      name,
      value: Math.round(total / count),
    }));
  }, [metrics]);
  
  // Calculate KPI metrics
  const kpiData = React.useMemo(() => {
    // Default values
    let salesTotal = 0;
    let newCustomers = 0;
    let conversionRate = 0;
    let openProjects = 0;
    
    // Find specific metrics by name or type
    metrics.forEach((metric) => {
      if (metric.name.toLowerCase().includes('venda') || metric.name.toLowerCase().includes('receita')) {
        salesTotal += metric.current;
      } else if (metric.name.toLowerCase().includes('cliente') || metric.name.toLowerCase().includes('usuário')) {
        newCustomers += Math.round(metric.current);
      } else if (metric.name.toLowerCase().includes('conversão') || metric.name.toLowerCase().includes('taxa')) {
        conversionRate = metric.current;
      } else if (metric.name.toLowerCase().includes('projeto') || metric.name.toLowerCase().includes('tarefa')) {
        openProjects += Math.round(metric.current);
      }
    });
    
    return {
      salesTotal,
      newCustomers,
      conversionRate,
      openProjects
    };
  }, [metrics]);
  
  // Create monthly revenue data
  const monthlyRevenue = React.useMemo(() => {
    // Use sample data if no metrics are available
    if (!metrics.length) {
      return [
        { name: 'Jan', value: 120000 },
        { name: 'Fev', value: 140000 },
        { name: 'Mar', value: 160000 },
        { name: 'Abr', value: 180000 },
        { name: 'Mai', value: 190000 },
        { name: 'Jun', value: 170000 },
      ];
    }
    
    // Find revenue metrics
    const revenueMetrics = metrics.filter((metric) => 
      metric.name.toLowerCase().includes('receita') && 
      metric.unit === 'R$'
    );
    
    if (revenueMetrics.length === 0) {
      // Use sample data if no revenue metrics available
      return [
        { name: 'Jan', value: 120000 },
        { name: 'Fev', value: 140000 },
        { name: 'Mar', value: 160000 },
        { name: 'Abr', value: 180000 },
        { name: 'Mai', value: 190000 },
        { name: 'Jun', value: 170000 },
      ];
    }
    
    // Process actual revenue data if available
    // This would need to be expanded with real historical data
    return revenueMetrics.slice(0, 6).map((metric, index) => {
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
      return {
        name: months[index % months.length],
        value: Math.round(metric.current),
      };
    });
    
  }, [metrics]);
  
  // Apply date preset
  const handleDatePreset = (preset: DatePreset) => {
    setSelectedDate(preset.endDate);
  };
  
  // Save user preferences
  useEffect(() => {
    try {
      localStorage.setItem('dashboardPreferences', JSON.stringify({
        department: selectedDepartment,
        dateType: dateRangeType,
      }));
    } catch (error) {
      console.error("Error saving preferences", error);
    }
  }, [selectedDepartment, dateRangeType]);
  
  // Load user preferences
  useEffect(() => {
    try {
      const savedPrefs = localStorage.getItem('dashboardPreferences');
      if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs);
        setSelectedDepartment(prefs.department || "all");
        setDateRangeType(prefs.dateType || "month");
      }
    } catch (error) {
      console.error("Error loading preferences", error);
    }
  }, []);
  
  // Format the date display based on range type
  const getFormattedDateDisplay = () => {
    switch (dateRangeType) {
      case 'day':
        return format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
      case 'week':
        const weekStart = startOfWeek(selectedDate);
        const weekEnd = endOfWeek(selectedDate);
        return `${format(weekStart, "dd/MM", { locale: ptBR })} - ${format(weekEnd, "dd/MM/yyyy", { locale: ptBR })}`;
      case 'month':
        return format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR });
      default:
        return format(selectedDate, "dd/MM/yyyy", { locale: ptBR });
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Dashboard"
        subtitle="Visão geral dos indicadores de desempenho da empresa"
      />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        {/* Department filter */}
        <div className="w-full sm:w-auto">
          <Select
            value={selectedDepartment}
            onValueChange={setSelectedDepartment}
          >
            <SelectTrigger className="w-full sm:w-[240px]">
              <SelectValue placeholder="Todos os departamentos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os departamentos</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Date range controls */}
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 w-full sm:w-auto">
          <Select
            value={dateRangeType}
            onValueChange={(value) => setDateRangeType(value as 'day' | 'week' | 'month')}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Diário</SelectItem>
              <SelectItem value="week">Semanal</SelectItem>
              <SelectItem value="month">Mensal</SelectItem>
            </SelectContent>
          </Select>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Filter className="mr-2 h-4 w-4" />
                <span>Períodos</span>
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[200px]">
              {datePresets.map((preset) => (
                <DropdownMenuItem 
                  key={preset.label}
                  onClick={() => handleDatePreset(preset)}
                >
                  {preset.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full sm:w-auto justify-start text-left sm:ml-auto"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {getFormattedDateDisplay()}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">Carregando indicadores...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <KpiCard
              title="Vendas totais"
              value={`R$ ${kpiData.salesTotal.toLocaleString('pt-BR')}`}
              change={12.5}
              changeLabel="vs. período anterior"
              status="success"
              icon={<ShoppingCart className="h-5 w-5 text-primary" />}
            />
            
            <KpiCard
              title="Novos clientes"
              value={kpiData.newCustomers.toString()}
              change={-3.2}
              changeLabel="vs. período anterior"
              status="warning"
              icon={<Users className="h-5 w-5 text-primary" />}
            />
            
            <KpiCard
              title="Taxa de conversão"
              value={`${kpiData.conversionRate}%`}
              change={0.5}
              changeLabel="vs. período anterior"
              status="success"
              icon={<BarChart3 className="h-5 w-5 text-primary" />}
            />
            
            <KpiCard
              title="Projetos abertos"
              value={kpiData.openProjects.toString()}
              change={-1}
              changeLabel="vs. período anterior"
              status="danger"
              icon={<FileText className="h-5 w-5 text-primary" />}
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PerformanceChart
              title={`Desempenho por departamento (%)`}
              data={departmentPerformance.length > 0 ? departmentPerformance : [
                { name: 'Carregando...', value: 0 }
              ]}
            />
            
            <PerformanceChart
              title="Receita mensal (R$)"
              data={monthlyRevenue}
              color="#10b981"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
