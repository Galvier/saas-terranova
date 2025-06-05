
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CustomBadge } from '@/components/ui/custom-badge';
import { AlertTriangle, Clock, CheckCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  createOrUpdateMetricJustification, 
  getMetricJustification,
  MetricJustification
} from '@/integrations/supabase/metrics/metricJustifications';
import { MetricDefinition } from '@/integrations/supabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MetricJustificationDialogProps {
  metric: MetricDefinition | null;
  periodDate: Date;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const MetricJustificationDialog: React.FC<MetricJustificationDialogProps> = ({
  metric,
  periodDate,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [justification, setJustification] = useState('');
  const [actionPlan, setActionPlan] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [existingJustification, setExistingJustification] = useState<MetricJustification | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && metric) {
      loadExistingJustification();
    }
  }, [isOpen, metric, periodDate]);

  const loadExistingJustification = async () => {
    if (!metric) return;
    
    try {
      const result = await getMetricJustification(
        metric.id, 
        format(periodDate, 'yyyy-MM-dd')
      );
      
      if (result.data && result.data.length > 0) {
        const existing = result.data[0];
        setExistingJustification(existing);
        setJustification(existing.justification);
        setActionPlan(existing.action_plan);
      } else {
        setExistingJustification(null);
        setJustification('');
        setActionPlan('');
      }
    } catch (error) {
      console.error('Error loading existing justification:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!metric || !justification.trim() || !actionPlan.trim()) {
      toast({
        title: "Erro",
        description: "Justificativa e plano de ação são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await createOrUpdateMetricJustification(
        metric.id,
        format(periodDate, 'yyyy-MM-dd'),
        justification.trim(),
        actionPlan.trim()
      );

      if (result.error) {
        toast({
          title: "Erro",
          description: `Erro ao salvar justificativa: ${result.message}`,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: existingJustification ? 
          "Justificativa atualizada com sucesso" : 
          "Justificativa criada com sucesso",
      });

      onSuccess();
      onClose();
      
      // Reset form
      setJustification('');
      setActionPlan('');
      setExistingJustification(null);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro inesperado ao salvar justificativa",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setJustification('');
    setActionPlan('');
    setExistingJustification(null);
    onClose();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'needs_revision':
        return <RefreshCw className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'approved':
        return 'Aprovada';
      case 'needs_revision':
        return 'Requer Revisão';
      case 'reviewed':
        return 'Revisada';
      default:
        return 'Desconhecido';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'needs_revision':
        return 'warning';
      case 'pending':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  if (!metric) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Justificar Métrica</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div>
              <span className="font-medium">Métrica:</span> {metric.name}
            </div>
            <div>
              <span className="font-medium">Período:</span> {format(periodDate, "MMMM 'de' yyyy", { locale: ptBR })}
            </div>
            <div>
              <span className="font-medium">Valor Atual:</span> {metric.unit} {metric.current}
            </div>
            <div>
              <span className="font-medium">Meta:</span> {metric.unit} {metric.target}
            </div>
          </div>

          {existingJustification && (
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Status da Justificativa</h4>
                <CustomBadge 
                  variant={getStatusVariant(existingJustification.status)}
                  className="flex items-center gap-1"
                >
                  {getStatusIcon(existingJustification.status)}
                  {getStatusLabel(existingJustification.status)}
                </CustomBadge>
              </div>
              
              {existingJustification.status === 'needs_revision' && existingJustification.admin_feedback && (
                <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-medium text-amber-800 dark:text-amber-300 mb-1">
                        Feedback do Administrador:
                      </h5>
                      <p className="text-sm text-amber-700 dark:text-amber-200">
                        {existingJustification.admin_feedback}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {existingJustification.reviewed_at && (
                <div className="text-xs text-muted-foreground">
                  Revisada em: {format(new Date(existingJustification.reviewed_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="justification">
                Justificativa *
              </Label>
              <Textarea
                id="justification"
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="Explique os motivos pelos quais a meta não foi atingida..."
                rows={4}
                required
              />
            </div>

            <div>
              <Label htmlFor="actionPlan">
                Plano de Ação *
              </Label>
              <Textarea
                id="actionPlan"
                value={actionPlan}
                onChange={(e) => setActionPlan(e.target.value)}
                placeholder="Descreva as ações que serão tomadas para melhorar o resultado..."
                rows={4}
                required
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || !justification.trim() || !actionPlan.trim()}
              >
                {isLoading ? 'Salvando...' : 
                 existingJustification ? 'Atualizar Justificativa' : 'Salvar Justificativa'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MetricJustificationDialog;
