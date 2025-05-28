
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
}

const DashboardCharts: React.FC<DashboardChartsProps> = ({ 
  departmentPerformance,
  monthlyRevenue,
  shouldShowCharts
}) => {
  // Don't render anything if no charts should be shown
  if (!shouldShowCharts.departmentPerformance && !shouldShowCharts.monthlyRevenue) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
      {shouldShowCharts.departmentPerformance && (
        <PerformanceChart
          title="Desempenho por departamento"
          data={departmentPerformance.length > 0 ? departmentPerformance : [{ name: 'Carregando...', value: 0 }]}
          type="bar"
          percentage={true}
          status="success"
          trend={5.2}
        />
      )}
      
      {shouldShowCharts.monthlyRevenue && (
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
