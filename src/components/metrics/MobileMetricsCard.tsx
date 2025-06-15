
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CustomBadge } from '@/components/ui/custom-badge';
import { Plus, Edit, Trash2, FileText, AlertTriangle, ArrowUp, ArrowDown, Minus, Clock, Building2 } from 'lucide-react';
import { MetricDefinition } from '@/integrations/supabase';

interface MobileMetricsCardProps {
  metric: MetricDefinition;
  canModify: boolean;
  needsJustification: boolean;
  onAddValue: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onJustify: () => void;
}

const MobileMetricsCard: React.FC<MobileMetricsCardProps> = ({
  metric,
  canModify,
  needsJustification,
  onAddValue,
  onEdit,
  onDelete,
  onJustify,
}) => {
  // Função para formatar valores com unidade na posição correta
  const formatValueWithUnit = (value: number | null, unit: string): string => {
    if (value === null || value === undefined) {
      if (unit === 'R$' || unit === 'USD') {
        return `${unit} 0`;
      }
      return `0 ${unit}`;
    }
    
    if (unit === 'R$' || unit === 'USD') {
      return `${unit} ${value}`;
    }
    
    return `${value} ${unit}`;
  };

  // Function to render trend icon
  const renderTrendIcon = () => {
    if (!metric.current || !metric.target) return <Minus className="h-3 w-3 text-muted-foreground" />;
    
    if (metric.lower_is_better) {
      if (metric.current < metric.target) {
        return <ArrowUp className="h-3 w-3 text-green-500" />;
      } else if (metric.current > metric.target) {
        return <ArrowDown className="h-3 w-3 text-red-500" />;
      }
    } else {
      if (metric.current > metric.target) {
        return <ArrowUp className="h-3 w-3 text-green-500" />;
      } else if (metric.current < metric.target) {
        return <ArrowDown className="h-3 w-3 text-red-500" />;
      }
    }
    return <Minus className="h-3 w-3 text-muted-foreground" />;
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

  return (
    <Card className="mobile-card shadow-sm">
      <CardHeader className="pb-2 px-3 pt-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm font-medium line-clamp-2 flex items-center gap-1.5">
              {metric.name}
              {needsJustification && (
                <AlertTriangle className="h-3 w-3 text-amber-500 flex-shrink-0" />
              )}
            </CardTitle>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
              <Building2 className="h-2.5 w-2.5" />
              <span className="truncate">{metric.department_name}</span>
            </div>
          </div>
          
          <div className="flex items-center">
            {renderTrendIcon()}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 px-3 pb-3 space-y-2">
        {/* Valores principais em layout mais compacto */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Meta</p>
            <p className="font-medium text-sm">
              {formatValueWithUnit(metric.target, metric.unit)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Atual</p>
            <p className="font-medium text-sm">
              {formatValueWithUnit(metric.current, metric.unit)}
            </p>
          </div>
        </div>

        {/* Informações adicionais em uma linha */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
          <div className="flex items-center gap-1">
            <Clock className="h-2.5 w-2.5" />
            <span>{translateFrequency(metric.frequency || 'monthly')}</span>
          </div>
          <div>
            {metric.last_value_date ? 
              new Date(metric.last_value_date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : 
              'Sem dados'
            }
          </div>
        </div>

        {/* Status e ações em uma linha */}
        <div className="flex items-center justify-between pt-1">
          <CustomBadge 
            variant={
              metric.status === 'success' ? 'success' : 
              metric.status === 'warning' ? 'warning' : 'destructive'
            }
            className="text-xs px-2 py-0.5"
          >
            {metric.status === 'success' ? 'Ótimo' : 
             metric.status === 'warning' ? 'Atenção' : 'Crítico'}
          </CustomBadge>

          {/* Ações compactas */}
          {canModify && (
            <div className="flex gap-1">
              {needsJustification && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onJustify}
                  className="h-7 px-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                >
                  <FileText className="h-3 w-3" />
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onAddValue}
                className="h-7 px-2"
              >
                <Plus className="h-3 w-3" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onEdit}
                className="h-7 px-2"
              >
                <Edit className="h-3 w-3" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MobileMetricsCard;
