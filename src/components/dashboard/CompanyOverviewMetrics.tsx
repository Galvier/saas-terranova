
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import { AlertTriangle, TrendingUp, Award, Activity } from 'lucide-react';
import KpiCard from '@/components/KpiCard';
import { MetricDefinition } from '@/integrations/supabase';

interface CompanyOverviewMetricsProps {
  metrics: MetricDefinition[];
  isLoading: boolean;
}

const CompanyOverviewMetrics: React.FC<CompanyOverviewMetricsProps> = ({ 
  metrics,
  isLoading
}) => {
  // Calculate percentage of targets met
  const targetsMetData = React.useMemo(() => {
    if (!metrics.length) return { percentMet: 0, totalMetrics: 0, metCount: 0 };
    
    const metCount = metrics.filter(metric => {
      if (metric.lower_is_better) {
        // For lower_is_better metrics, current should be <= target
        return metric.current <= metric.target;
      } else {
        // For regular metrics, current should be >= target
        return metric.current >= metric.target;
      }
    }).length;
    
    const percentMet = Math.round((metCount / metrics.length) * 100);
    
    return {
      percentMet,
      totalMetrics: metrics.length,
      metCount
    };
  }, [metrics]);

  // Calculate company overall health
  const companyHealthData = React.useMemo(() => {
    if (!metrics.length) return { overallHealth: 0, statusCounts: [] };
    
    // Calculate overall performance as percentage of target for each metric
    const performances = metrics.map(metric => {
      if (metric.lower_is_better) {
        // For metrics where lower is better (target is maximum)
        return metric.target > 0 ? Math.min(100, (metric.target / Math.max(metric.current, 0.001)) * 100) : 0;
      } else {
        // For metrics where higher is better (target is goal)
        return metric.target > 0 ? Math.min(100, (metric.current / metric.target) * 100) : 0;
      }
    });
    
    // Calculate average performance
    const overallHealth = performances.length 
      ? Math.round(performances.reduce((sum, perf) => sum + perf, 0) / performances.length) 
      : 0;
    
    // Count metrics by status
    const statusCounts = [
      { name: 'Ótimo', value: metrics.filter(m => m.status === 'success').length },
      { name: 'Atenção', value: metrics.filter(m => m.status === 'warning').length },
      { name: 'Crítico', value: metrics.filter(m => m.status === 'danger').length }
    ];
    
    return { overallHealth, statusCounts };
  }, [metrics]);

  // Department performance ranking
  const departmentRankingData = React.useMemo(() => {
    if (!metrics.length) return [];
    
    const depPerformance = new Map<string, { total: number, count: number, met: number }>();
    
    metrics.forEach((metric) => {
      if (!metric.department_name) return;
      
      // Calculate performance percentage against target
      let perfValue;
      let targetMet = false;
      
      if (metric.lower_is_better) {
        // Lower values are better
        perfValue = metric.target > 0 ? Math.min(100, (metric.target / Math.max(metric.current, 0.001)) * 100) : 0;
        targetMet = metric.current <= metric.target;
      } else {
        // Higher values are better
        perfValue = metric.target > 0 ? Math.min(100, (metric.current / metric.target) * 100) : 0;
        targetMet = metric.current >= metric.target;
      }
      
      const existing = depPerformance.get(metric.department_name);
      if (existing) {
        existing.total += perfValue;
        existing.count += 1;
        if (targetMet) existing.met += 1;
      } else {
        depPerformance.set(metric.department_name, { 
          total: perfValue, 
          count: 1, 
          met: targetMet ? 1 : 0 
        });
      }
    });
    
    // Convert to array and calculate percentages
    return Array.from(depPerformance.entries())
      .map(([name, { total, count, met }]) => ({
        name,
        performance: Math.round(total / count),
        percentMet: count > 0 ? Math.round((met / count) * 100) : 0
      }))
      .sort((a, b) => b.performance - a.performance)
      .slice(0, 5);  // Top 5 departments
  }, [metrics]);

  // Calculate metrics distribution by department
  const metricsDistributionData = React.useMemo(() => {
    if (!metrics.length) return [];
    
    const departmentCounts = new Map<string, number>();
    
    metrics.forEach(metric => {
      if (!metric.department_name) return;
      
      const count = departmentCounts.get(metric.department_name) || 0;
      departmentCounts.set(metric.department_name, count + 1);
    });
    
    return Array.from(departmentCounts.entries())
      .map(([name, count]) => ({
        name,
        value: count
      }))
      .sort((a, b) => b.value - a.value);
  }, [metrics]);

  // Find critical metrics (below 60% of target)
  const criticalMetricsData = React.useMemo(() => {
    if (!metrics.length) return [];
    
    return metrics
      .map(metric => {
        let percentOfTarget;
        if (metric.lower_is_better) {
          // For lower is better, we invert the ratio since a lower value is good
          percentOfTarget = metric.target > 0 
            ? Math.round((metric.target / Math.max(metric.current, 0.001)) * 100) 
            : 0;
        } else {
          percentOfTarget = metric.target > 0 
            ? Math.round((metric.current / metric.target) * 100) 
            : 0;
        }
        
        return {
          ...metric,
          percentOfTarget
        };
      })
      .filter(m => m.percentOfTarget < 60)
      .sort((a, b) => a.percentOfTarget - b.percentOfTarget)
      .slice(0, 5); // Top 5 critical metrics
  }, [metrics]);

  // Count metrics without defined targets or current values
  const metricsMissingData = React.useMemo(() => {
    if (!metrics.length) return { withoutTarget: 0, withoutValue: 0 };
    
    const withoutTarget = metrics.filter(m => m.target === 0 || m.target === null).length;
    const withoutValue = metrics.filter(m => m.current === 0 || m.current === null).length;
    
    return { withoutTarget, withoutValue };
  }, [metrics]);

  // CHART COLORS
  const COLORS = ['#10b981', '#f97316', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'];
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-muted-foreground">Carregando métricas da empresa...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top KPIs Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard
          title="Percentual de Metas Atingidas"
          value={`${targetsMetData.percentMet}%`}
          subtitle={`${targetsMetData.metCount} de ${targetsMetData.totalMetrics} métricas`}
          status={targetsMetData.percentMet >= 80 ? 'success' : targetsMetData.percentMet >= 60 ? 'warning' : 'danger'}
          icon={<Award className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />}
        />
        
        <KpiCard
          title="Saúde Geral da Empresa"
          value={`${companyHealthData.overallHealth}%`}
          subtitle="Média de desempenho geral"
          status={companyHealthData.overallHealth >= 80 ? 'success' : companyHealthData.overallHealth >= 60 ? 'warning' : 'danger'}
          icon={<Activity className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />}
        />
        
        <KpiCard
          title="Indicadores Críticos"
          value={criticalMetricsData.length}
          subtitle="Métricas abaixo de 60% da meta"
          status={criticalMetricsData.length === 0 ? 'success' : criticalMetricsData.length <= 2 ? 'warning' : 'danger'}
          icon={<AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />}
        />
      </div>

      {/* Department Ranking and Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Performance Ranking */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Departamentos com Melhor Desempenho</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              {departmentRankingData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={departmentRankingData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                    <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                    <Bar dataKey="performance" name="Desempenho %" fill="#10b981" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Nenhum dado disponível</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Distribuição de Status dos Indicadores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              {companyHealthData.statusCounts.some(item => item.value > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={companyHealthData.statusCounts}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {companyHealthData.statusCounts.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : index === 1 ? '#f97316' : '#ef4444'} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} indicadores`, '']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Nenhum dado disponível</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Metrics Distribution and Critical Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Metrics Distribution by Department */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Distribuição de Indicadores por Departamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              {metricsDistributionData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={metricsDistributionData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12 }}
                      height={60}
                      angle={-45}
                      textAnchor="end"
                    />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" name="Número de indicadores" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Nenhum dado disponível</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Critical Metrics */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Indicadores Críticos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] overflow-auto">
              {criticalMetricsData.length > 0 ? (
                <div className="space-y-4">
                  {criticalMetricsData.map((metric) => (
                    <div key={metric.id} className="border-b pb-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{metric.name}</p>
                          <p className="text-xs text-muted-foreground">{metric.department_name || 'Sem departamento'}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-destructive font-semibold">{metric.percentOfTarget}%</div>
                          <div className="text-xs">
                            {metric.current} / {metric.target} {metric.unit}
                          </div>
                        </div>
                      </div>
                      <div className="mt-1 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className="bg-destructive h-full"
                          style={{ width: `${metric.percentOfTarget}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Nenhum indicador crítico</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Quality and Governance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <KpiCard
          title="Indicadores sem Meta Definida"
          value={metricsMissingData.withoutTarget}
          subtitle="Métricas cadastradas sem valor de referência"
          status={metricsMissingData.withoutTarget === 0 ? 'success' : 'warning'}
          icon={<TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />}
        />
        
        <KpiCard
          title="Indicadores sem Valor Atual"
          value={metricsMissingData.withoutValue}
          subtitle="Métricas sem leitura no período atual"
          status={metricsMissingData.withoutValue === 0 ? 'success' : 'warning'}
          icon={<TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />}
        />
      </div>
    </div>
  );
};

export default CompanyOverviewMetrics;
