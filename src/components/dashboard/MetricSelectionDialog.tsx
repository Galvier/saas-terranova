
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { MetricDefinition } from '@/integrations/supabase/types/metric';
import { saveAdminDashboardConfig } from '@/integrations/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface MetricSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  metrics: MetricDefinition[];
  selectedMetrics: string[];
  onSelectionChange: (selectedIds: string[]) => void;
}

const MetricSelectionDialog: React.FC<MetricSelectionDialogProps> = ({
  open,
  onOpenChange,
  metrics,
  selectedMetrics,
  onSelectionChange,
}) => {
  const [localSelection, setLocalSelection] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Initialize local selection whenever the dialog opens or selectedMetrics changes
  useEffect(() => {
    if (open) {
      console.log("Dialog opened, setting localSelection to:", selectedMetrics);
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
      // Salva a configuração no banco de dados
      console.log("Salvando configuração para o usuário:", user.id, "com métricas:", localSelection);
      const result = await saveAdminDashboardConfig(
        localSelection,
        user.id
      );
      
      if (result.error) {
        throw new Error(result.message || "Erro ao salvar configuração");
      }
      
      // Atualiza o estado local do componente pai
      onSelectionChange(localSelection);
      
      toast({
        title: "Configuração salva",
        description: "Seu dashboard personalizado foi atualizado com sucesso",
      });
      
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
            
            {metrics.length === 0 && (
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
