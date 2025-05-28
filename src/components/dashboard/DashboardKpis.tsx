
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
}

const DashboardKpis: React.FC<DashboardKpisProps> = ({ kpiData, showAllKpis = false }) => {
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

  // Filter KPIs based on data availability unless showAllKpis is true
  const visibleKpis = showAllKpis ? kpis : kpis.filter(kpi => kpi.hasData);

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
