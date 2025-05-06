
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertTriangle, TrendingUp, Activity, AlertCircle, Calendar } from 'lucide-react';
import KpiCard from '@/components/KpiCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { MetricDefinition } from '@/integrations/supabase';
import useAnalyticsDashboard from '@/hooks/useAnalyticsDashboard';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AnalyticsDashboardProps {
  metrics: MetricDefinition[];
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ metrics }) => {
  const {
    percentAchievingTarget,
    metricsAchievingTarget,
    metricsWithTargets,
    averageHealth,
    criticalMetricsCount,
    criticalMetrics,
    departmentPerformance,
    statusDistribution,
    metricsByDepartment,
    metricsWithoutTarget,
    metricsWithoutCurrentValue
  } = useAnalyticsDashboard(metrics);

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "Nenhum registro";
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      return "Data inválida";
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <KpiCard 
          title="Percentual de Metas Atingidas"
          value={`${percentAchievingTarget}%`}
          changeLabel={`${metricsAchievingTarget} de ${metricsWithTargets} métricas`}
          status="success"
          icon={<CheckCircle className="h-5 w-5 text-primary" />}
        />
        <KpiCard 
          title="Saúde Geral da Empresa"
          value={`${averageHealth}%`}
          changeLabel="Média de desempenho geral"
          status={averageHealth >= 80 ? "success" : averageHealth >= 60 ? "warning" : "danger"}
          icon={<Activity className="h-5 w-5 text-primary" />}
        />
        <KpiCard 
          title="Indicadores Críticos"
          value={criticalMetricsCount.toString()}
          changeLabel="Métricas abaixo de 60% da meta"
          status={criticalMetricsCount === 0 ? "success" : "danger"}
          icon={<AlertTriangle className="h-5 w-5 text-primary" />}
        />
      </div>

      {/* Middle Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Departamentos com Melhor Desempenho */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Setores com Melhor Desempenho</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] sm:h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={departmentPerformance}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                  <YAxis type="category" dataKey="name" width={100} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Desempenho']} />
                  <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Distribuição de Status dos Indicadores */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Distribuição de Status dos Indicadores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] sm:h-[280px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    labelLine={false}
                    label={(entry) => entry.name}
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Indicadores']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              {statusDistribution.map((status, index) => (
                <div key={index} className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: status.color }} />
                  <span className="text-sm text-muted-foreground">{status.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Distribuição de Indicadores por Departamento */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Distribuição de Indicadores por Setor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] sm:h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={metricsByDepartment}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip formatter={(value) => [value, 'Indicadores']} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Indicadores Críticos */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle className="text-base sm:text-lg">Indicadores Críticos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] sm:h-[280px] overflow-auto">
              {criticalMetrics.length > 0 ? (
                <div className="space-y-4">
                  {criticalMetrics.map((metric) => (
                    <div 
                      key={metric.id} 
                      className="p-4 border border-destructive/20 bg-destructive/5 rounded-md"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{metric.name}</h4>
                          <p className="text-sm text-muted-foreground">{metric.department_name}</p>
                          <div className="text-xs text-muted-foreground flex items-center mt-1">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(metric.last_value_date)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">
                            {metric.current} {metric.unit}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Meta: {metric.target} {metric.unit}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Nenhum indicador crítico
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <KpiCard 
          title="Indicadores sem Meta Definida"
          value={metricsWithoutTarget.toString()}
          changeLabel="Métricas cadastradas sem valor de referência"
          status={metricsWithoutTarget === 0 ? "success" : "warning"}
          icon={<TrendingUp className="h-5 w-5 text-primary" />}
        />
        <KpiCard 
          title="Indicadores sem Valor Atual"
          value={metricsWithoutCurrentValue.toString()}
          changeLabel="Métricas sem leitura no período atual"
          status={metricsWithoutCurrentValue === 0 ? "success" : "warning"}
          icon={<TrendingUp className="h-5 w-5 text-primary" />}
        />
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
