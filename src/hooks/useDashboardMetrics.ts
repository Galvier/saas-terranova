
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { DateRangeType } from '@/components/filters/DateFilter';
import { useMetricSelection } from './dashboard/useMetricSelection';
import { useMetricsFetching } from './dashboard/useMetricsFetching';
import { useMetricProcessing } from './dashboard/useMetricProcessing';
import { usePreferences } from './dashboard/usePreferences';

export const useDashboardMetrics = (
  selectedDepartment: string, 
  selectedDate: Date,
  dateRangeType: DateRangeType,
  viewMode: 'all' | 'favorites'
) => {
  const { isAdmin, userDepartmentId, isAuthenticated, user } = useAuth();
  
  console.log('[useDashboardMetrics] Inicializando hook:', {
    selectedDepartment,
    selectedDate: selectedDate.toISOString(),
    dateRangeType,
    viewMode,
    isAdmin,
    userDepartmentId,
    isAuthenticated,
    userId: user?.id
  });
  
  // Force department selection to user's department if not admin
  const effectiveDepartment = !isAdmin && userDepartmentId 
    ? userDepartmentId 
    : selectedDepartment;
    
  console.log('[useDashboardMetrics] Departamento efetivo:', {
    original: selectedDepartment,
    effective: effectiveDepartment,
    reason: !isAdmin && userDepartmentId ? 'override de gestor' : 'seleção original'
  });
  
  // Use the extracted hooks with the effective department
  const {
    selectedMetrics,
    isLoadingConfig,
    isConfigError,
    handleMetricSelectionChange,
    hasError: selectionHasError,
    errorMessage: selectionErrorMessage
  } = useMetricSelection();
  
  const {
    metrics,
    isLoading,
    isError: fetchingIsError,
    hasError: fetchingHasError,
    errorMessage: fetchingErrorMessage
  } = useMetricsFetching(effectiveDepartment, selectedDate, dateRangeType);
  
  const {
    filteredMetrics,
    departmentPerformance,
    kpiData,
    monthlyRevenue,
    shouldShowCharts
  } = useMetricProcessing(metrics, viewMode, selectedMetrics, isAdmin, effectiveDepartment);
  
  // Save preferences to localStorage
  usePreferences(dateRangeType, viewMode);
  
  // Aggregate error states - mas não considerar erro crítico se pelo menos temos dados básicos
  const hasError = selectionHasError || fetchingHasError;
  const errorMessage = selectionErrorMessage || fetchingErrorMessage;
  const isError = isConfigError || fetchingIsError;

  // Se não está autenticado, ainda está carregando autenticação
  if (!isAuthenticated) {
    console.log('[useDashboardMetrics] Usuário não autenticado, aguardando...');
    return {
      metrics: [],
      isLoading: true,
      isLoadingConfig: false,
      selectedMetrics: [],
      hasError: false,
      errorMessage: null,
      isError: false,
      kpiData: [],
      departmentPerformance: [],
      monthlyRevenue: [],
      shouldShowCharts: false,
      handleMetricSelectionChange,
      isFiltered: false,
      effectiveDepartment
    };
  }

  // Enhanced logging for debugging
  console.log('[useDashboardMetrics] Estado final:', {
    metricsCount: metrics?.length || 0,
    isLoading,
    hasError,
    errorMessage,
    isAuthenticated,
    isConfigError,
    fetchingIsError
  });

  return {
    metrics,
    isLoading,
    isLoadingConfig,
    selectedMetrics,
    hasError,
    errorMessage,
    isError,
    kpiData,
    departmentPerformance,
    monthlyRevenue,
    shouldShowCharts,
    handleMetricSelectionChange,
    isFiltered: !isAdmin && userDepartmentId !== null,
    effectiveDepartment
  };
};
