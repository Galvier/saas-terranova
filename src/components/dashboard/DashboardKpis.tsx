
import React from 'react';
import { ShoppingCart, Users, BarChart3, FileText } from 'lucide-react';
import KpiCard from '@/components/KpiCard';

export interface KpiData {
  salesTotal: number;
  newCustomers: number;
  conversionRate: number;
  openProjects: number;
  hasSalesData?: boolean;
  hasCustomerData?: boolean;
  hasConversionData?: boolean;
  hasProjectData?: boolean;
}

interface DashboardKpisProps {
  kpiData: KpiData;
  showAllKpis?: boolean; // When true, show all KPIs regardless of data availability
  selectedDepartment?: string; // To determine visibility logic
}

const DashboardKpis: React.FC<DashboardKpisProps> = ({ 
  kpiData, 
  showAllKpis = false,
  selectedDepartment = 'all'
}) => {
  const kpis = [
    {
      title: "Vendas totais",
      value: `R$ ${kpiData.salesTotal.toLocaleString('pt-BR')}`,
      change: 12.5,
      changeLabel: "vs. período anterior",
      status: "success" as const,
      icon: <ShoppingCart className="h-4 w-4 md:h-5 md:w-5 text-primary" />,
      hasData: kpiData.hasSalesData
    },
    {
      title: "Novos clientes",
      value: kpiData.newCustomers.toString(),
      change: -3.2,
      changeLabel: "vs. período anterior",
      status: "warning" as const,
      icon: <Users className="h-4 w-4 md:h-5 md:w-5 text-primary" />,
      hasData: kpiData.hasCustomerData
    },
    {
      title: "Taxa de conversão",
      value: `${kpiData.conversionRate}%`,
      change: 0.5,
      changeLabel: "vs. período anterior",
      status: "success" as const,
      icon: <BarChart3 className="h-4 w-4 md:h-5 md:w-5 text-primary" />,
      hasData: kpiData.hasConversionData
    },
    {
      title: "Projetos abertos",
      value: kpiData.openProjects.toString(),
      change: -1,
      changeLabel: "vs. período anterior",
      status: "danger" as const,
      icon: <FileText className="h-4 w-4 md:h-5 md:w-5 text-primary" />,
      hasData: kpiData.hasProjectData
    }
  ];

  // Determine which KPIs to show based on department and data availability
  const visibleKpis = useMemo(() => {
    // For "all departments" view, show KPIs that have data or if showAllKpis is true
    if (selectedDepartment === 'all') {
      return showAllKpis ? kpis : kpis.filter(kpi => kpi.hasData);
    }
    
    // For specific departments, only show KPIs that have actual data
    return kpis.filter(kpi => kpi.hasData);
  }, [kpis, selectedDepartment, showAllKpis]);

  // Don't render anything if no KPIs should be shown
  if (visibleKpis.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
      {visibleKpis.map((kpi, index) => (
        <KpiCard
          key={index}
          title={kpi.title}
          value={kpi.value}
          change={kpi.change}
          changeLabel={kpi.changeLabel}
          status={kpi.status}
          icon={kpi.icon}
        />
      ))}
    </div>
  );
};

export default DashboardKpis;
