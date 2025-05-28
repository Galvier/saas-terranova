
import React from 'react';
import PerformanceChart from '@/components/PerformanceChart';

interface DepartmentPerformanceData {
  name: string;
  value: number;
}

interface DashboardChartsProps {
  departmentPerformance: DepartmentPerformanceData[];
  monthlyRevenue: { name: string; value: number }[];
  shouldShowCharts: {
    departmentPerformance: boolean;
    monthlyRevenue: boolean;
  };
  selectedDepartment?: string; // Add this to help with conditional rendering
}

const DashboardCharts: React.FC<DashboardChartsProps> = ({ 
  departmentPerformance,
  monthlyRevenue,
  shouldShowCharts,
  selectedDepartment = 'all'
}) => {
  // Don't render anything if no charts should be shown
  if (!shouldShowCharts.departmentPerformance && !shouldShowCharts.monthlyRevenue) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
      {/* Department Performance Chart - only in "all departments" view */}
      {shouldShowCharts.departmentPerformance && selectedDepartment === 'all' && (
        <PerformanceChart
          title="Desempenho por departamento"
          data={departmentPerformance.length > 0 ? departmentPerformance : [{ name: 'Carregando...', value: 0 }]}
          type="bar"
          percentage={true}
          status="success"
          trend={5.2}
        />
      )}
      
      {/* Monthly Revenue Chart - only if there are actual revenue metrics */}
      {shouldShowCharts.monthlyRevenue && monthlyRevenue.length > 0 && (
        <PerformanceChart
          title="Receita mensal (R$)"
          data={monthlyRevenue}
          color="#10b981"
          type="line"
          status="success"
          trend={3.8}
        />
      )}
    </div>
  );
};

export default DashboardCharts;
