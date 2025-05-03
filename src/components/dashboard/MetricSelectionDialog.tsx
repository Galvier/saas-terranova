
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { MetricDefinition } from '@/integrations/supabase/types/metric';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, BarChart, LineChart } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

// Define default metric constants
export const DEPARTMENT_PERFORMANCE_CHART_ID = 'department_performance_chart';
export const MONTHLY_REVENUE_CHART_ID = 'monthly_revenue_chart';
export const DEFAULT_METRIC_ID = '7c77a8a1-5623-4964-9f79-c887af3ed934'; // Substitute with a real UUID from your database

interface MetricSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  metrics: MetricDefinition[];
  selectedMetrics: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  includeCharts?: boolean;
  chartIds?: {
    departmentPerformance: string;
    monthlyRevenue: string;
  };
}

const MetricSelectionDialog: React.FC<MetricSelectionDialogProps> = ({
  open,
  onOpenChange,
  metrics,
  selectedMetrics,
  onSelectionChange,
  includeCharts = false,
  chartIds = { departmentPerformance: DEPARTMENT_PERFORMANCE_CHART_ID, monthlyRevenue: MONTHLY_REVENUE_CHART_ID }
}) => {
  const [localSelection, setLocalSelection] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Initialize local selection when dialog opens
  useEffect(() => {
    if (open) {
      setLocalSelection([...selectedMetrics]);
    }
  }, [open, selectedMetrics]);

  const handleToggleMetric = (metricId: string) => {
    setLocalSelection(prev => {
      if (prev.includes(metricId)) {
        return prev.filter(id => id !== metricId);
      } else {
        return [...prev, metricId];
      }
    });
  };

  const handleSave = async () => {
    if (!user?.id) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para salvar configurações",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Call the parent's selection change handler
      onSelectionChange(localSelection);
      onOpenChange(false);
    } catch (error: any) {
      console.error("Erro ao salvar configuração:", error);
      toast({
        title: "Erro ao salvar configuração",
        description: error.message || "Ocorreu um erro ao salvar a configuração",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Selecionar métricas principais</DialogTitle>
          <DialogDescription>
            Escolha as métricas que deseja exibir no dashboard "Principais"
          </DialogDescription>
        </DialogHeader>
        
        <div className="max-h-[60vh] overflow-y-auto py-4">
          <div className="space-y-4">
            {metrics.map((metric) => (
              <div key={metric.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={`metric-${metric.id}`} 
                  checked={localSelection.includes(metric.id)}
                  onCheckedChange={() => handleToggleMetric(metric.id)}
                />
                <label 
                  htmlFor={`metric-${metric.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 cursor-pointer"
                >
                  <div className="font-medium">{metric.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {metric.department_name || 'Sem departamento'} • {metric.unit}
                  </div>
                </label>
              </div>
            ))}
            
            {includeCharts && (
              <>
                <Separator className="my-4" />
                <div className="text-sm font-medium mb-2">Gráficos de desempenho</div>
                
                {/* Department Performance Chart Option */}
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id={`chart-${chartIds.departmentPerformance}`} 
                    checked={localSelection.includes(chartIds.departmentPerformance)}
                    onCheckedChange={() => handleToggleMetric(chartIds.departmentPerformance)}
                  />
                  <label 
                    htmlFor={`chart-${chartIds.departmentPerformance}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 cursor-pointer"
                  >
                    <div className="font-medium flex items-center gap-2">
                      <BarChart className="h-4 w-4" />
                      Desempenho por departamento
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Gráfico de barras comparativo
                    </div>
                  </label>
                </div>
                
                {/* Monthly Revenue Chart Option */}
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id={`chart-${chartIds.monthlyRevenue}`} 
                    checked={localSelection.includes(chartIds.monthlyRevenue)}
                    onCheckedChange={() => handleToggleMetric(chartIds.monthlyRevenue)}
                  />
                  <label 
                    htmlFor={`chart-${chartIds.monthlyRevenue}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 cursor-pointer"
                  >
                    <div className="font-medium flex items-center gap-2">
                      <LineChart className="h-4 w-4" />
                      Receita mensal (R$)
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Gráfico de linha da tendência
                    </div>
                  </label>
                </div>
              </>
            )}
            
            {metrics.length === 0 && !includeCharts && (
              <p className="text-center text-muted-foreground">Nenhuma métrica encontrada</p>
            )}
          </div>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancelar
          </Button>
          <div className="flex gap-2">
            <Button onClick={() => setLocalSelection([])} disabled={isSaving || localSelection.length === 0}>
              Limpar seleção
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar configuração'
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MetricSelectionDialog;
