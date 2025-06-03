
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { CustomBadge } from '@/components/ui/custom-badge';
import { Plus, Edit, Trash2, FileText, AlertTriangle, ArrowUp, ArrowDown, Minus, BarChart3, CreditCard, Table as TableIcon, Gauge, LineChart, PieChart, Activity } from 'lucide-react';
import { MetricDefinition } from '@/integrations/supabase';
import { useAuth } from '@/hooks/useAuth';
import MetricJustificationDialog from './MetricJustificationDialog';

interface MetricsTableProps {
  metrics: MetricDefinition[];
  onAddValue: (metric: MetricDefinition) => void;
  onEdit: (metric: MetricDefinition) => void;
  onDelete: (metric: MetricDefinition) => void;
}

const MetricsTable: React.FC<MetricsTableProps> = ({
  metrics,
  onAddValue,
  onEdit,
  onDelete,
}) => {
  const { isAdmin, userDepartmentId } = useAuth();
  const [selectedMetricForJustification, setSelectedMetricForJustification] = useState<MetricDefinition | null>(null);
  const [justificationDate, setJustificationDate] = useState<Date>(new Date());

  // Verificar se uma métrica precisa de justificativa
  const needsJustification = (metric: MetricDefinition): boolean => {
    if (!metric.current || !metric.target) return false;
    
    if (metric.lower_is_better) {
      return metric.current > metric.target;
    } else {
      return metric.current < metric.target * 0.8; // Meta não atingida (menos de 80%)
    }
  };

  // Verificar se o usuário pode modificar uma métrica específica
  const canModifyMetric = (metric: MetricDefinition): boolean => {
    // Admins podem modificar qualquer métrica
    if (isAdmin) return true;
    // Gestores podem modificar apenas métricas do seu departamento
    return metric.department_id === userDepartmentId;
  };

  const handleJustifyClick = (metric: MetricDefinition) => {
    setSelectedMetricForJustification(metric);
    setJustificationDate(new Date());
  };

  const handleJustificationSuccess = () => {
    // Aqui você pode adicionar lógica para atualizar a lista de métricas
    // ou mostrar algum indicador de que a justificativa foi criada
  };

  // Função para formatar valores com unidade na frente
  const formatValueWithUnit = (value: number | null, unit: string): string => {
    if (value === null || value === undefined) return `${unit} 0`;
    return `${unit} ${value}`;
  };

  // Function to render trend icon
  const renderTrendIcon = (metric: MetricDefinition) => {
    if (!metric.current || !metric.target) return <Minus className="h-4 w-4 text-muted-foreground" />;
    
    if (metric.lower_is_better) {
      if (metric.current < metric.target) {
        return <ArrowUp className="h-4 w-4 text-green-500" />;
      } else if (metric.current > metric.target) {
        return <ArrowDown className="h-4 w-4 text-red-500" />;
      }
    } else {
      if (metric.current > metric.target) {
        return <ArrowUp className="h-4 w-4 text-green-500" />;
      } else if (metric.current < metric.target) {
        return <ArrowDown className="h-4 w-4 text-red-500" />;
      }
    }
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  // Function to render visualization icon with more specific chart types
  const renderVisualizationIcon = (type: string) => {
    const iconClass = "h-5 w-5 text-muted-foreground";
    
    switch (type) {
      case 'chart':
      case 'bar_chart':
        return <div title="Gráfico de Barras"><BarChart3 className={iconClass} /></div>;
      case 'line_chart':
        return <div title="Gráfico de Linha"><LineChart className={iconClass} /></div>;
      case 'pie_chart':
        return <div title="Gráfico de Pizza"><PieChart className={iconClass} /></div>;
      case 'area_chart':
        return <div title="Gráfico de Área"><Activity className={iconClass} /></div>;
      case 'card':
        return <div title="Cartão"><CreditCard className={iconClass} /></div>;
      case 'table':
        return <div title="Tabela"><TableIcon className={iconClass} /></div>;
      case 'gauge':
        return <div title="Medidor"><Gauge className={iconClass} /></div>;
      default:
        return <div title="Cartão"><CreditCard className={iconClass} /></div>;
    }
  };

  // Function to translate frequency
  const translateFrequency = (frequency: string): string => {
    const translations: Record<string, string> = {
      'daily': 'Diário',
      'weekly': 'Semanal',
      'monthly': 'Mensal',
      'quarterly': 'Trimestral',
      'yearly': 'Anual'
    };
    return translations[frequency] || frequency;
  };

  // Function to translate visualization type
  const translateVisualization = (type: string): string => {
    const translations: Record<string, string> = {
      'card': 'Cartão',
      'chart': 'Gráfico de Barras',
      'bar_chart': 'Gráfico de Barras',
      'line_chart': 'Gráfico de Linha',
      'pie_chart': 'Gráfico de Pizza',
      'area_chart': 'Gráfico de Área',
      'table': 'Tabela',
      'gauge': 'Medidor'
    };
    return translations[type] || type;
  };

  return (
    <>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Métrica</TableHead>
              <TableHead>Setor</TableHead>
              <TableHead>Meta</TableHead>
              <TableHead>Atual</TableHead>
              <TableHead>Tendência</TableHead>
              <TableHead>Frequência</TableHead>
              <TableHead>Visualização</TableHead>
              <TableHead>Última Atualização</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {metrics.map((metric) => {
              const needsJustif = needsJustification(metric);
              const canModify = canModifyMetric(metric);
              
              return (
                <TableRow key={metric.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {metric.name}
                      {needsJustif && (
                        <div title="Precisa de justificativa">
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{metric.department_name}</TableCell>
                  <TableCell>
                    {formatValueWithUnit(metric.target, metric.unit)}
                  </TableCell>
                  <TableCell>
                    {formatValueWithUnit(metric.current, metric.unit)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center">
                      {renderTrendIcon(metric)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {translateFrequency(metric.frequency || 'monthly')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center">
                      {renderVisualizationIcon(metric.visualization_type || 'card')}
                    </div>
                  </TableCell>
                  <TableCell>
                    {metric.last_value_date ? 
                      new Date(metric.last_value_date).toLocaleDateString('pt-BR') : 
                      'Nenhum registro'
                    }
                  </TableCell>
                  <TableCell>
                    <CustomBadge 
                      variant={
                        metric.status === 'success' ? 'success' : 
                        metric.status === 'warning' ? 'warning' : 'destructive'
                      }
                    >
                      {metric.status === 'success' ? 'Ótimo' : 
                       metric.status === 'warning' ? 'Atenção' : 'Crítico'}
                    </CustomBadge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      {canModify && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onAddValue(metric)}
                          title="Adicionar valor"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {needsJustif && canModify && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleJustifyClick(metric)}
                          title="Justificar métrica"
                          className="text-amber-600 hover:text-amber-700"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {canModify && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(metric)}
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {canModify && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(metric)}
                          title="Excluir"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <MetricJustificationDialog
        metric={selectedMetricForJustification}
        periodDate={justificationDate}
        isOpen={!!selectedMetricForJustification}
        onClose={() => setSelectedMetricForJustification(null)}
        onSuccess={handleJustificationSuccess}
      />
    </>
  );
};

export default MetricsTable;
