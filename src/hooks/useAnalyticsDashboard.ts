
import { useState, useMemo } from 'react';
import { MetricDefinition } from '@/integrations/supabase';

interface AnalyticsDashboardData {
  percentAchievingTarget: number;
  metricsAchievingTarget: number;
  metricsWithTargets: number;
  averageHealth: number;
  criticalMetricsCount: number;
  criticalMetrics: Array<MetricDefinition & { health?: number }>;
  departmentPerformance: Array<{ name: string; value: number }>;
  statusDistribution: Array<{ name: string; value: number; color: string }>;
  metricsByDepartment: Array<{ name: string; value: number }>;
  metricsWithoutTarget: number;
  metricsWithoutCurrentValue: number;
}

const useAnalyticsDashboard = (metrics: MetricDefinition[]): AnalyticsDashboardData => {
  // Calculate all dashboard statistics based on metrics
  return useMemo(() => {
    console.log('[useAnalyticsDashboard] Processing metrics:', metrics.length);
    
    // Group metrics by department for easier processing
    const departmentMap = new Map<string, { metrics: MetricDefinition[], total: number, achieved: number, validMetrics: number }>();
    
    // Calculate metrics achieving target
    let achieving = 0;
    let totalWithTargets = 0;
    let totalHealth = 0;
    let criticalCount = 0;
    const criticalMetricsArray: Array<MetricDefinition & { health?: number }> = [];

    // Count metrics without target or current value
    let withoutTarget = 0;
    let withoutCurrentValue = 0;
    
    // Process metrics to calculate performance values
    metrics.forEach(metric => {
      console.log('[useAnalyticsDashboard] Processing metric:', {
        name: metric.name,
        target: metric.target,
        current: metric.current,
        lastValueDate: metric.last_value_date
      });
      
      // Get department data
      const deptName = metric.department_name || 'Desconhecido';
      if (!departmentMap.has(deptName)) {
        departmentMap.set(deptName, { metrics: [], total: 0, achieved: 0, validMetrics: 0 });
      }
      const deptData = departmentMap.get(deptName)!;
      deptData.metrics.push(metric);
      deptData.total++;
      
      // First, check for metrics without current values
      // A metric has no current value if: current === 0 AND last_value_date is null
      const hasNoCurrentValue = (metric.current === 0 && metric.last_value_date === null);
      
      if (hasNoCurrentValue) {
        withoutCurrentValue++;
        console.log('[useAnalyticsDashboard] Metric without current value:', {
          name: metric.name,
          current: metric.current,
          lastValueDate: metric.last_value_date
        });
        // Don't return here - continue to check for target
      }
      
      // Count metrics without targets
      if (!metric.target) {
        withoutTarget++;
        console.log('[useAnalyticsDashboard] Metric without target:', metric.name);
        return; // Skip further processing for metrics without targets
      }
      
      // Only process metrics that have both target and actual current value
      if (hasNoCurrentValue) {
        return; // Skip performance calculations for metrics without current values
      }
      
      // Count metrics with targets and valid current values
      totalWithTargets++;
      deptData.validMetrics++;
      
      // Calculate health percentage
      const healthPercentage = calculateHealthPercentage(metric);
      totalHealth += healthPercentage;
      
      // Determine if metric is achieving target
      if (isAchievingTarget(metric)) {
        achieving++;
        deptData.achieved++;
      }
      
      // Determine if metric is critical (status is 'danger' or health below 60%)
      if (healthPercentage < 60 || metric.status === 'danger') {
        criticalCount++;
        criticalMetricsArray.push({
          ...metric,
          health: healthPercentage
        });
      }
    });

    console.log('[useAnalyticsDashboard] Summary:', {
      totalMetrics: metrics.length,
      withoutTarget,
      withoutCurrentValue,
      totalWithTargets,
      achieving
    });

    // Calculate metrics achieving target percentage
    const percentAchieving = totalWithTargets > 0 
      ? Math.round((achieving / totalWithTargets) * 100) 
      : 0;
    
    // Calculate average health
    const avgHealth = totalWithTargets > 0 
      ? Math.round(totalHealth / totalWithTargets) 
      : 0;
    
    // Sort critical metrics by health (ascending)
    const sortedCriticalMetrics = criticalMetricsArray.sort((a, b) => 
      (a.health || 0) - (b.health || 0)
    );
    
    // Calculate department performance - only consider departments with valid metrics
    const deptPerformance = Array.from(departmentMap.entries())
      .filter(([name, data]) => data.validMetrics > 0) // Only departments with metrics that have both target and current value
      .map(([name, data]) => ({
        name,
        value: Math.round((data.achieved / data.validMetrics) * 100)
      }))
      .sort((a, b) => b.value - a.value);
    
    // Calculate status distribution
    const successCount = metrics.filter(m => m.status === 'success').length;
    const warningCount = metrics.filter(m => m.status === 'warning').length;
    const dangerCount = metrics.filter(m => m.status === 'danger').length;
    
    const statusDist = [
      { name: 'Success', value: successCount, color: '#10b981' },
      { name: 'Warning', value: warningCount, color: '#f59e0b' },
      { name: 'Critical', value: dangerCount, color: '#ef4444' }
    ];
    
    // Calculate metrics by department
    const metricsByDept = Array.from(departmentMap.entries())
      .map(([name, data]) => ({
        name,
        value: data.metrics.length
      }))
      .sort((a, b) => b.value - a.value);
    
    return {
      percentAchievingTarget: percentAchieving,
      metricsAchievingTarget: achieving,
      metricsWithTargets: totalWithTargets,
      averageHealth: avgHealth,
      criticalMetricsCount: criticalCount,
      criticalMetrics: sortedCriticalMetrics,
      departmentPerformance: deptPerformance,
      statusDistribution: statusDist,
      metricsByDepartment: metricsByDept,
      metricsWithoutTarget: withoutTarget,
      metricsWithoutCurrentValue: withoutCurrentValue
    };
  }, [metrics]);
};

// Helper function to calculate health percentage
const calculateHealthPercentage = (metric: MetricDefinition): number => {
  if (!metric.target || (metric.current === undefined || metric.current === null)) {
    return 0;
  }
  
  const ratio = metric.lower_is_better 
    ? metric.target / (metric.current || 1) // Lower values are better (e.g., error rates)
    : (metric.current || 0) / metric.target; // Higher values are better (e.g., revenue)
  
  return Math.min(Math.round(ratio * 100), 100);
};

// Helper function to determine if a metric is achieving its target
const isAchievingTarget = (metric: MetricDefinition): boolean => {
  if (!metric.target || (metric.current === undefined || metric.current === null)) {
    return false;
  }
  
  if (metric.lower_is_better) {
    // Lower is better: current should be <= target
    return metric.current <= metric.target;
  } else {
    // Higher is better: current should be >= target
    return metric.current >= metric.target;
  }
};

export default useAnalyticsDashboard;
