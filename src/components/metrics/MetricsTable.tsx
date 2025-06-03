
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { CustomBadge } from '@/components/ui/custom-badge';
import { Plus, Edit, Trash2, FileText, AlertTriangle } from 'lucide-react';
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

  // Verificar se o usuário pode excluir uma métrica específica
  const canDeleteMetric = (metric: MetricDefinition): boolean => {
    return isAdmin || metric.department_id === userDepartmentId;
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
              <TableHead>Status</TableHead>
              <TableHead>Última Atualização</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {metrics.map((metric) => {
              const needsJustif = needsJustification(metric);
              const canDelete = canDeleteMetric(metric);
              
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
                    <CustomBadge 
                      variant={
                        metric.status === 'success' ? 'success' : 
                        metric.status === 'warning' ? 'warning' : 'destructive'
                      }
                    >
                      {metric.status === 'success' ? 'Sucesso' : 
                       metric.status === 'warning' ? 'Aviso' : 'Crítico'}
                    </CustomBadge>
                  </TableCell>
                  <TableCell>
                    {metric.last_value_date ? 
                      new Date(metric.last_value_date).toLocaleDateString('pt-BR') : 
                      'Nunca'
                    }
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onAddValue(metric)}
                        title="Adicionar valor"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      
                      {needsJustif && (
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
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(metric)}
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      {canDelete && (
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
