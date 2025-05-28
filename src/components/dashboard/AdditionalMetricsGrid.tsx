
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
  
  // All metrics are relevant - no need to filter out specific types
  // since we want to show all registered metrics for the department
  const relevantMetrics = metrics;
  
  if (relevantMetrics.length === 0) return null;
  
  // Sort metrics by priority
  const sortedMetrics = [...relevantMetrics].sort((a, b) => {
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
  
  // Determine the appropriate title based on department selection
  const isSpecificDepartment = selectedDepartment !== 'all';
  const sectionTitle = isSpecificDepartment ? 'Indicadores' : 'Métricas';
  
  return (
    <>
      {/* Render card metrics in a grid */}
      {cardMetrics.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mb-4 mt-8">{sectionTitle}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {cardMetrics.map(metric => (
              <KpiCard
                key={metric.id}
                title={metric.name}
                value={`${metric.current}${metric.unit ? ` ${metric.unit}` : ''}`}
                status={metric.status as 'success' | 'warning' | 'danger'}
                change={Math.random() * 10 * (Math.random() > 0.5 ? 1 : -1)} // Mock change data
                changeLabel="vs. período anterior"
              />
            ))}
          </div>
        </>
      )}
      
      {/* Render chart metrics in a different layout */}
      {chartMetrics.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mb-4 mt-8">Análises de desempenho</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {chartMetrics.map(metric => (
              <PerformanceChart
                key={metric.id}
                title={metric.name}
                data={[
                  { name: 'Atual', value: metric.current },
                  { name: 'Meta', value: metric.target }
                ]}
                type={metric.visualization_type === 'bar' ? 'bar' : 'line'}
                status={metric.status as 'success' | 'warning' | 'danger'}
                trend={Math.random() * 10 * (Math.random() > 0.5 ? 1 : -1)} // Mock trend data
              />
            ))}
          </div>
        </>
      )}
    </>
  );
};

export default AdditionalMetricsGrid;
