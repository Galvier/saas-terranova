
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
  const { isAdmin, userDepartmentId } = useAuth();
  
  // Force department selection to user's department if not admin
  const effectiveDepartment = !isAdmin && userDepartmentId 
    ? userDepartmentId 
    : selectedDepartment;
  
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
  
  // Aggregate error states
  const hasError = selectionHasError || fetchingHasError;
  const errorMessage = selectionErrorMessage || fetchingErrorMessage;
  const isError = isConfigError || fetchingIsError;

  return {
    metrics, // This now contains all unfiltered metrics for the selection dialog
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
    // Add effective department to check if filtering was enforced
    isFiltered: !isAdmin && userDepartmentId !== null,
    effectiveDepartment
  };
};
