
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
    // Group metrics by department for easier processing
    const departmentMap = new Map<string, { metrics: MetricDefinition[], total: number, achieved: number }>();
    
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
      // Get department data
      const deptName = metric.department_name || 'Unknown';
      if (!departmentMap.has(deptName)) {
        departmentMap.set(deptName, { metrics: [], total: 0, achieved: 0 });
      }
      const deptData = departmentMap.get(deptName)!;
      deptData.metrics.push(metric);
      deptData.total++;
      
      // Count metrics without targets
      if (!metric.target) {
        withoutTarget++;
        return;
      }
      
      // Count metrics without current values
      if (!metric.current && metric.current !== 0) {
        withoutCurrentValue++;
        return;
      }
      
      // Count metrics with targets
      totalWithTargets++;
      
      // Calculate health percentage
      const healthPercentage = calculateHealthPercentage(metric);
      totalHealth += healthPercentage;
      
      // Determine if metric is achieving target
      if (isAchievingTarget(metric)) {
        achieving++;
        deptData.achieved++;
      }
      
      // Determine if metric is critical (status is 'danger' or health below 60%)
      // Corrected: Now also checking status === 'danger'
      if (healthPercentage < 60 || metric.status === 'danger') {
        criticalCount++;
        criticalMetricsArray.push({
          ...metric,
          health: healthPercentage
        });
      }
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
    
    // Calculate department performance
    const deptPerformance = Array.from(departmentMap.entries())
      .filter(([name, data]) => data.total > 0)
      .map(([name, data]) => ({
        name,
        value: Math.round((data.achieved / data.total) * 100)
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
