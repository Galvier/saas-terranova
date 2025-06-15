
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
    <Card className="mobile-card">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-medium line-clamp-2 flex items-center gap-2">
              {metric.name}
              {needsJustification && (
                <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
              )}
            </CardTitle>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <Building2 className="h-3 w-3" />
              <span className="truncate">{metric.department_name}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {renderTrendIcon()}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-4">
        {/* Valores principais */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Meta</p>
            <p className="font-semibold text-sm">
              {formatValueWithUnit(metric.target, metric.unit)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Atual</p>
            <p className="font-semibold text-sm">
              {formatValueWithUnit(metric.current, metric.unit)}
            </p>
          </div>
        </div>

        {/* Informações adicionais */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{translateFrequency(metric.frequency || 'monthly')}</span>
          </div>
          <div>
            {metric.last_value_date ? 
              new Date(metric.last_value_date).toLocaleDateString('pt-BR') : 
              'Sem dados'
            }
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between">
          <CustomBadge 
            variant={
              metric.status === 'success' ? 'success' : 
              metric.status === 'warning' ? 'warning' : 'destructive'
            }
          >
            {metric.status === 'success' ? 'Ótimo' : 
             metric.status === 'warning' ? 'Atenção' : 'Crítico'}
          </CustomBadge>
        </div>

        {/* Ações */}
        {canModify && (
          <div className="flex gap-2 pt-2 border-t">
            {needsJustification && (
              <Button
                variant="outline"
                size="sm"
                onClick={onJustify}
                className="flex-1 text-amber-600 border-amber-200 hover:bg-amber-50"
              >
                <FileText className="h-4 w-4 mr-1" />
                Justificar
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={onAddValue}
              className="flex-1"
            >
              <Plus className="h-4 w-4 mr-1" />
              Valor
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
            >
              <Edit className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MobileMetricsCard;
