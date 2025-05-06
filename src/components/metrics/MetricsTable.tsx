
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, BarChart3, LineChart, PieChart, LayoutGrid, Calendar } from 'lucide-react';
import { CustomBadge } from '@/components/ui/custom-badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MetricDefinition } from '@/integrations/supabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'success': return 'success';
      case 'warning': return 'secondary';
      case 'danger': return 'destructive';
      default: return 'default';
    }
  };

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'Diária';
      case 'weekly': return 'Semanal';
      case 'monthly': return 'Mensal';
      case 'quarterly': return 'Trimestral';
      case 'yearly': return 'Anual';
      default: return frequency;
    }
  };
  
  const getVisualizationIcon = (type?: string) => {
    switch (type) {
      case 'bar':
        return <BarChart3 className="h-4 w-4" />;
      case 'line':
        return <LineChart className="h-4 w-4" />;
      case 'pie':
        return <PieChart className="h-4 w-4" />;
      case 'card':
      default:
        return <LayoutGrid className="h-4 w-4" />;
    }
  };
  
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "Nenhum registro";
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      return "Data inválida";
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Métrica</TableHead>
            <TableHead>Setor</TableHead>
            <TableHead>Meta</TableHead>
            <TableHead>Atual</TableHead>
            <TableHead className="text-center">Tendência</TableHead>
            <TableHead>Frequência</TableHead>
            <TableHead className="text-center">Visualização</TableHead>
            <TableHead className="text-center">Último Registro</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-center">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {metrics.map((metric) => {
            const isCurrencyUnit = metric.unit === 'R$';
            return (
              <TableRow key={metric.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {metric.name}
                  </div>
                </TableCell>
                <TableCell>{metric.department_name || 'Sem setor'}</TableCell>
                <TableCell>
                  {isCurrencyUnit ? `R$ ${metric.target}` : `${metric.target} ${metric.unit}`}
                </TableCell>
                <TableCell>
                  {isCurrencyUnit ? `R$ ${metric.current}` : `${metric.current} ${metric.unit}`}
                </TableCell>
                <TableCell className="text-center">
                  {metric.trend !== 'neutral' ? (
                    <div className={`inline-flex ${
                      metric.trend === 'up' ? 'text-success' : 'text-destructive'
                    }`}>
                      {metric.trend === 'up' ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ArrowDown className="h-4 w-4" />
                      )}
                    </div>
                  ) : (
                    <span>—</span>
                  )}
                </TableCell>
                <TableCell>{getFrequencyLabel(metric.frequency)}</TableCell>
                <TableCell className="text-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="flex justify-center">
                          {getVisualizationIcon(metric.visualization_type)}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{metric.visualization_type === 'card' ? 'Cartão KPI' : 
                           metric.visualization_type === 'bar' ? 'Gráfico de barras' :
                           metric.visualization_type === 'line' ? 'Gráfico de linha' :
                           metric.visualization_type === 'pie' ? 'Gráfico de pizza' :
                           'Cartão KPI'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell className="text-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="flex items-center justify-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm">{formatDate(metric.last_value_date)}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Data do último valor registrado</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell className="text-center">
                  <CustomBadge variant={getStatusVariant(metric.status)}>
                    {metric.status === 'success' ? 'Ótimo' : 
                     metric.status === 'warning' ? 'Atenção' : 'Crítico'}
                  </CustomBadge>
                </TableCell>
                <TableCell>
                  <div className="flex justify-center gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7"
                            onClick={() => onAddValue(metric)}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Registrar valor</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7"
                            onClick={() => onEdit(metric)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Editar métrica</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => onDelete(metric)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Excluir métrica</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default MetricsTable;
