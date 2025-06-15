
import React, { useState } from 'react';
import { MoreHorizontal, Plus, Edit, Trash2, FileText, AlertTriangle, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CustomBadge } from '@/components/ui/custom-badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MetricDefinition } from '@/integrations/supabase';
import { useAuth } from '@/hooks/useAuth';

interface MobileMetricsCardProps {
  metric: MetricDefinition;
  onAddValue: (metric: MetricDefinition) => void;
  onEdit: (metric: MetricDefinition) => void;
  onDelete: (metric: MetricDefinition) => void;
  onJustify?: (metric: MetricDefinition) => void;
}

const MobileMetricsCard: React.FC<MobileMetricsCardProps> = ({
  metric,
  onAddValue,
  onEdit,
  onDelete,
  onJustify
}) => {
  const { isAdmin, userDepartmentId } = useAuth();

  // Verificar se uma métrica precisa de justificativa
  const needsJustification = (): boolean => {
    if (!metric.current || !metric.target) return false;
    
    if (metric.lower_is_better) {
      return metric.current > metric.target;
    } else {
      return metric.current < metric.target * 0.8; // Meta não atingida (menos de 80%)
    }
  };

  // Verificar se o usuário pode modificar uma métrica específica
  const canModifyMetric = (): boolean => {
    // Admins podem modificar qualquer métrica
    if (isAdmin) return true;
    // Gestores podem modificar apenas métricas do seu departamento
    return metric.department_id === userDepartmentId;
  };

  // Função para formatar valores com unidade na posição correta
  const formatValueWithUnit = (value: number | null, unit: string): string => {
    if (value === null || value === undefined) {
      // Para moedas, mostra a unidade na frente mesmo quando valor é 0
      if (unit === 'R$' || unit === 'USD') {
        return `${unit} 0`;
      }
      return `0 ${unit}`;
    }
    
    // Moedas ficam na frente
    if (unit === 'R$' || unit === 'USD') {
      return `${unit} ${value}`;
    }
    
    // Demais unidades ficam depois
    return `${value} ${unit}`;
  };

  // Function to render trend icon
  const renderTrendIcon = () => {
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

  const needsJustif = needsJustification();
  const canModify = canModifyMetric();

  return (
    <div className="mobile-card bg-card border rounded-lg p-4 space-y-3">
      {/* Header com nome e ícone de alerta */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 flex-1">
          <h3 className="font-medium text-base line-clamp-2">{metric.name}</h3>
          {needsJustif && (
            <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
          )}
        </div>
        
        {canModify && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {needsJustif && onJustify && (
                <DropdownMenuItem onClick={() => onJustify(metric)}>
                  <FileText className="mr-2 h-4 w-4 text-amber-600" />
                  Justificar
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onAddValue(metric)}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar valor
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(metric)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(metric)}>
                <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Setor */}
      <div className="text-sm text-muted-foreground">
        <span className="font-medium">Setor:</span> {metric.department_name}
      </div>

      {/* Valores e tendência */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-sm">
            <span className="font-medium">Meta:</span> {formatValueWithUnit(metric.target, metric.unit)}
          </div>
          <div className="text-sm">
            <span className="font-medium">Atual:</span> {formatValueWithUnit(metric.current, metric.unit)}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {renderTrendIcon()}
        </div>
      </div>

      {/* Status e última atualização */}
      <div className="flex items-center justify-between pt-2 border-t">
        <CustomBadge 
          variant={
            metric.status === 'success' ? 'success' : 
            metric.status === 'warning' ? 'warning' : 'destructive'
          }
        >
          {metric.status === 'success' ? 'Ótimo' : 
           metric.status === 'warning' ? 'Atenção' : 'Crítico'}
        </CustomBadge>
        
        <div className="text-xs text-muted-foreground">
          {metric.last_value_date ? 
            new Date(metric.last_value_date).toLocaleDateString('pt-BR') : 
            'Sem registro'
          }
        </div>
      </div>
    </div>
  );
};

export default MobileMetricsCard;
