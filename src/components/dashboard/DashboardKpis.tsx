
import React from 'react';
import { ShoppingCart, Users, BarChart3, FileText } from 'lucide-react';
import KpiCard from '@/components/KpiCard';

export interface KpiData {
  salesTotal: number;
  newCustomers: number;
  conversionRate: number;
  openProjects: number;
}

interface DashboardKpisProps {
  kpiData: KpiData;
}

const DashboardKpis: React.FC<DashboardKpisProps> = ({ kpiData }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <KpiCard
        title="Vendas totais"
        value={`R$ ${kpiData.salesTotal.toLocaleString('pt-BR')}`}
        change={12.5}
        changeLabel="vs. período anterior"
        status="success"
        icon={<ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />}
      />
      
      <KpiCard
        title="Novos clientes"
        value={kpiData.newCustomers.toString()}
        change={-3.2}
        changeLabel="vs. período anterior"
        status="warning"
        icon={<Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />}
      />
      
      <KpiCard
        title="Taxa de conversão"
        value={`${kpiData.conversionRate}%`}
        change={0.5}
        changeLabel="vs. período anterior"
        status="success"
        icon={<BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />}
      />
      
      <KpiCard
        title="Projetos abertos"
        value={kpiData.openProjects.toString()}
        change={-1}
        changeLabel="vs. período anterior"
        status="danger"
        icon={<FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />}
      />
    </div>
  );
};

export default DashboardKpis;
