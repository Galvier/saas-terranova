
import React from 'react';
import { BarChart3, FileText, ShoppingCart, Users } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import KpiCard from '@/components/KpiCard';
import PerformanceChart from '@/components/PerformanceChart';

const departmentPerformance = [
  { name: 'Vendas', value: 85 },
  { name: 'Marketing', value: 72 },
  { name: 'Financeiro', value: 90 },
  { name: 'Operações', value: 65 },
  { name: 'RH', value: 78 },
  { name: 'TI', value: 82 },
];

const monthlyRevenue = [
  { name: 'Jan', value: 120000 },
  { name: 'Fev', value: 140000 },
  { name: 'Mar', value: 160000 },
  { name: 'Abr', value: 180000 },
  { name: 'Mai', value: 190000 },
  { name: 'Jun', value: 170000 },
];

const Dashboard = () => {
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Dashboard"
        subtitle="Visão geral dos indicadores de desempenho da empresa"
      />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KpiCard
          title="Vendas totais"
          value="R$ 192.450"
          change={12.5}
          changeLabel="vs. mês anterior"
          status="success"
          icon={<ShoppingCart className="h-5 w-5 text-primary" />}
        />
        
        <KpiCard
          title="Novos clientes"
          value="124"
          change={-3.2}
          changeLabel="vs. mês anterior"
          status="warning"
          icon={<Users className="h-5 w-5 text-primary" />}
        />
        
        <KpiCard
          title="Taxa de conversão"
          value="8.3%"
          change={0.5}
          changeLabel="vs. mês anterior"
          status="success"
          icon={<BarChart3 className="h-5 w-5 text-primary" />}
        />
        
        <KpiCard
          title="Projetos abertos"
          value="7"
          change={-1}
          changeLabel="vs. mês anterior"
          status="danger"
          icon={<FileText className="h-5 w-5 text-primary" />}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceChart
          title="Desempenho por departamento (%)"
          data={departmentPerformance}
        />
        
        <PerformanceChart
          title="Receita mensal (R$)"
          data={monthlyRevenue}
          color="#10b981"
        />
      </div>
    </div>
  );
};

export default Dashboard;
