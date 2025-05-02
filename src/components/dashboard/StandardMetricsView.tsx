
import React from 'react';
import { ShoppingCart, Users, BarChart3, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import KpiCard from '@/components/KpiCard';
import { MetricDefinition } from '@/integrations/supabase/types/metric';
import AdditionalMetrics from './AdditionalMetrics';

interface StandardMetricsViewProps {
  filteredMetrics: MetricDefinition[];
}

const StandardMetricsView: React.FC<StandardMetricsViewProps> = ({
  filteredMetrics,
}) => {
  const hasMetricsData = filteredMetrics.length > 0;
  
  if (!hasMetricsData) {
    return (
      <Card className="p-8 text-center">
        <h3 className="text-xl font-medium mb-2">Nenhuma métrica encontrada</h3>
        <p className="text-muted-foreground">
          Não há métricas disponíveis para o departamento e período selecionados.
        </p>
      </Card>
    );
  }
  
  // Calculate KPI metrics for all view
  let salesTotal = 0;
  let newCustomers = 0;
  let conversionRate = 0;
  let openProjects = 0;
  
  // Find specific metrics by name or type
  filteredMetrics.forEach((metric) => {
    if (metric.name.toLowerCase().includes('venda') || metric.name.toLowerCase().includes('receita')) {
      salesTotal += metric.current;
    } else if (metric.name.toLowerCase().includes('cliente') || metric.name.toLowerCase().includes('usuário')) {
      newCustomers += Math.round(metric.current);
    } else if (metric.name.toLowerCase().includes('conversão') || metric.name.toLowerCase().includes('taxa')) {
      conversionRate = metric.current;
    } else if (metric.name.toLowerCase().includes('projeto') || metric.name.toLowerCase().includes('tarefa')) {
      openProjects += Math.round(metric.current);
    }
  });

  // Format sales total with locale
  const formattedSalesTotal = salesTotal.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          title="Vendas totais"
          value={`R$ ${formattedSalesTotal}`}
          change={12.5}
          changeLabel="vs. período anterior"
          status="success"
          icon={<ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />}
        />
        
        <KpiCard
          title="Novos clientes"
          value={newCustomers.toString()}
          change={-3.2}
          changeLabel="vs. período anterior"
          status="warning"
          icon={<Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />}
        />
        
        <KpiCard
          title="Taxa de conversão"
          value={`${conversionRate}%`}
          change={0.5}
          changeLabel="vs. período anterior"
          status="success"
          icon={<BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />}
        />
        
        <KpiCard
          title="Projetos abertos"
          value={openProjects.toString()}
          change={-1}
          changeLabel="vs. período anterior"
          status="danger"
          icon={<FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />}
        />
      </div>
      
      <AdditionalMetrics filteredMetrics={filteredMetrics} />
    </>
  );
};

export default StandardMetricsView;
