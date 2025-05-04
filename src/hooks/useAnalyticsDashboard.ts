
import { useMemo } from 'react';
import { MetricDefinition } from '@/integrations/supabase';

export interface DashboardSummary {
  percentAchievingTarget: number;
  metricsAchievingTarget: number;
  metricsWithTargets: number;
  averageHealth: number;
  criticalMetricsCount: number;
  criticalMetrics: MetricDefinition[];
  departmentPerformance: { name: string; value: number }[];
  statusDistribution: { name: string; value: number; color: string }[];
  metricsByDepartment: { name: string; value: number }[];
  metricsWithoutTarget: number;
  metricsWithoutCurrentValue: number;
}

const useAnalyticsDashboard = (metrics: MetricDefinition[]): DashboardSummary => {
  return useMemo(() => {
    // Calculate targets achieved
    const totalMetrics = metrics.length;
    const metricsWithTargets = metrics.filter(m => m.target > 0).length;
    const metricsWithValues = metrics.filter(m => m.current !== undefined && m.current !== null).length;
    const metricsAchievingTarget = metrics.filter(m => {
      if (m.target <= 0 || m.current === undefined || m.current === null) return false;
      return m.lower_is_better 
        ? m.current <= m.target 
        : m.current >= m.target;
    }).length;
    
    const percentAchievingTarget = metricsWithTargets > 0 
      ? Math.round((metricsAchievingTarget / metricsWithTargets) * 100) 
      : 0;
    
    // Calculate overall health
    const overallHealth = metrics.reduce((acc, metric) => {
      if (metric.target <= 0 || metric.current === undefined || metric.current === null) return acc;
      
      let performanceRatio;
      if (metric.lower_is_better) {
        // Lower is better, 100% when current <= target
        performanceRatio = metric.current <= metric.target 
          ? 100 
          : Math.max(0, 100 - ((metric.current - metric.target) / metric.target * 100));
      } else {
        // Higher is better, 100% when current >= target
        performanceRatio = metric.target > 0 
          ? Math.min(100, (metric.current / metric.target * 100)) 
          : 0;
      }
      return acc + performanceRatio;
    }, 0);
    
    const averageHealth = metrics.filter(m => m.target > 0).length > 0 
      ? Math.round(overallHealth / metrics.filter(m => m.target > 0).length) 
      : 0;

    // Critical metrics (performing below 60%)
    const criticalMetrics = metrics.filter(m => {
      if (m.target <= 0 || m.current === undefined || m.current === null) return false;
      
      if (m.lower_is_better) {
        // Lower is better, critical if current > 160% of target
        return m.current > (m.target * 1.6);
      } else {
        // Higher is better, critical if current < 60% of target
        return m.current < (m.target * 0.6);
      }
    });

    // Department performance
    const deptMap = new Map<string, { total: number; count: number }>();
    
    metrics.forEach(metric => {
      if (!metric.department_name || metric.target <= 0 || metric.current === undefined) return;
      
      let performanceRatio;
      if (metric.lower_is_better) {
        performanceRatio = metric.current <= metric.target 
          ? 100 
          : Math.max(0, 100 - ((metric.current - metric.target) / metric.target * 100));
      } else {
        performanceRatio = Math.min(100, (metric.current / metric.target * 100));
      }
      
      const existing = deptMap.get(metric.department_name);
      if (existing) {
        existing.total += performanceRatio;
        existing.count += 1;
      } else {
        deptMap.set(metric.department_name, { total: performanceRatio, count: 1 });
      }
    });
    
    const departmentPerformance = Array.from(deptMap.entries())
      .map(([name, { total, count }]) => ({
        name,
        value: Math.round(total / count)
      }))
      .sort((a, b) => b.value - a.value);

    // Status distribution
    const counts = { success: 0, warning: 0, danger: 0 };
    
    metrics.forEach(metric => {
      if (metric.status === 'success') counts.success++;
      else if (metric.status === 'warning') counts.warning++;
      else if (metric.status === 'danger') counts.danger++;
    });
    
    const statusDistribution = [
      { name: 'Ótimo', value: counts.success, color: '#10b981' },
      { name: 'Atenção', value: counts.warning, color: '#f97316' },
      { name: 'Crítico', value: counts.danger, color: '#ef4444' }
    ];

    // Metrics by department
    const deptCounts = new Map<string, number>();
    
    metrics.forEach(metric => {
      if (!metric.department_name) return;
      
      const count = deptCounts.get(metric.department_name) || 0;
      deptCounts.set(metric.department_name, count + 1);
    });
    
    const metricsByDepartment = Array.from(deptCounts.entries())
      .map(([name, count]) => ({
        name,
        value: count
      }));

    // Metrics without targets and values
    const metricsWithoutTarget = metrics.filter(m => !m.target || m.target <= 0).length;
    const metricsWithoutCurrentValue = metrics.filter(m => m.current === undefined || m.current === null).length;

    return {
      percentAchievingTarget,
      metricsAchievingTarget,
      metricsWithTargets,
      averageHealth,
      criticalMetricsCount: criticalMetrics.length,
      criticalMetrics,
      departmentPerformance,
      statusDistribution,
      metricsByDepartment,
      metricsWithoutTarget,
      metricsWithoutCurrentValue
    };
  }, [metrics]);
};

export default useAnalyticsDashboard;
