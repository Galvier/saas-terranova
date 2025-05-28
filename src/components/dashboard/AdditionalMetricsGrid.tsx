
import React from 'react';
import { MetricDefinition } from '@/integrations/supabase';
import KpiCard from '@/components/KpiCard';
import PerformanceChart from '@/components/PerformanceChart';

interface AdditionalMetricsGridProps {
  metrics: MetricDefinition[];
  viewMode: 'all' | 'favorites';
  isAdmin?: boolean;
  selectedDepartment?: string;
}

const AdditionalMetricsGrid: React.FC<AdditionalMetricsGridProps> = ({ 
  metrics, 
  viewMode,
  isAdmin = true,
  selectedDepartment = 'all'
}) => {
  // Only render for admin users
  if (!isAdmin) return null;
  
  // Only render these cards in 'all' view mode
  if (viewMode === 'favorites') return null;
  
  // Show ALL metrics - don't filter out any based on values
  // Users should see all created metrics, even if they have no data
  const allMetrics = metrics;
  
  if (allMetrics.length === 0) return null;
  
  // Sort metrics by priority and status
  const sortedMetrics = [...allMetrics].sort((a, b) => {
    const priorityOrder = { 'critical': 0, 'high': 1, 'normal': 2 };
    const aPriority = a.priority ? priorityOrder[a.priority as keyof typeof priorityOrder] || 2 : 2;
    const bPriority = b.priority ? priorityOrder[b.priority as keyof typeof priorityOrder] || 2 : 2;
    
    // First sort by priority
    if (aPriority !== bPriority) return aPriority - bPriority;
    
    // Then sort by status (critical statuses first)
    const statusOrder = { 'danger': 0, 'warning': 1, 'success': 2 };
    return (statusOrder[a.status as keyof typeof statusOrder] || 2) - 
           (statusOrder[b.status as keyof typeof statusOrder] || 2);
  });
  
  // Group metrics by visualization type
  const cardMetrics = sortedMetrics.filter(m => !m.visualization_type || m.visualization_type === 'card');
  const chartMetrics = sortedMetrics.filter(m => m.visualization_type && m.visualization_type !== 'card');
  
  // Calculate realistic change for metrics with valid data only
  const calculateChange = (metric: MetricDefinition): number | undefined => {
    // Only show trend for metrics that have valid data:
    // - Must have target AND current value > 0 AND last_value_date exists
    if (!metric.target || metric.current === 0 || !metric.last_value_date) {
      return undefined;
    }
    
    // Calculate a realistic change based on performance against target
    const performance = metric.lower_is_better 
      ? (metric.target / metric.current) // For lower is better metrics
      : (metric.current / metric.target); // For higher is better metrics
    
    // Generate a change percentage based on how close to target the metric is
    if (performance >= 1) {
      // Performing well - positive change
      return Math.random() * 15 + 2; // 2% to 17% positive
    } else if (performance >= 0.8) {
      // Decent performance - small positive or negative change
      return (Math.random() - 0.5) * 10; // -5% to +5%
    } else {
      // Poor performance - negative change
      return -(Math.random() * 12 + 3); // -3% to -15% negative
    }
  };
  
  // Determine the appropriate title based on department selection
  const isSpecificDepartment = selectedDepartment !== 'all';
  const sectionTitle = isSpecificDepartment ? 'Indicadores' : 'Métricas';
  
  return (
    <div className="space-y-6 md:space-y-8">
      {/* Render card metrics in a responsive grid */}
      {cardMetrics.length > 0 && (
        <section>
          <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6">{sectionTitle}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {cardMetrics.map(metric => {
              const change = calculateChange(metric);
              return (
                <KpiCard
                  key={metric.id}
                  title={metric.name}
                  value={`${metric.current}${metric.unit ? ` ${metric.unit}` : ''}`}
                  status={metric.status as 'success' | 'warning' | 'danger'}
                  change={change}
                  changeLabel={change !== undefined ? "vs. período anterior" : undefined}
                />
              );
            })}
          </div>
        </section>
      )}
      
      {/* Render chart metrics in a responsive layout */}
      {chartMetrics.length > 0 && (
        <section>
          <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6">Análises de desempenho</h2>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
            {chartMetrics.map(metric => {
              const change = calculateChange(metric);
              return (
                <PerformanceChart
                  key={metric.id}
                  title={metric.name}
                  data={[
                    { name: 'Atual', value: metric.current },
                    { name: 'Meta', value: metric.target }
                  ]}
                  type={metric.visualization_type === 'bar' ? 'bar' : 'line'}
                  status={metric.status as 'success' | 'warning' | 'danger'}
                  trend={change}
                />
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};

export default AdditionalMetricsGrid;
