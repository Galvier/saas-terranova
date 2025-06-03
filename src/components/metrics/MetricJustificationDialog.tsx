
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CustomBadge } from '@/components/ui/custom-badge';
import { useToast } from '@/hooks/use-toast';
import { MetricDefinition } from '@/integrations/supabase';
import { 
  createOrUpdateMetricJustification, 
  getMetricJustification, 
  MetricJustification 
} from '@/integrations/supabase/metrics/metricJustifications';
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

  // Carregar justificativa existente quando o modal abrir
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
      console.error('Erro ao carregar justificativa:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!metric) return;
    
    if (!justification.trim() || !actionPlan.trim()) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
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
        description: existingJustification 
          ? "Justificativa atualizada com sucesso" 
          : "Justificativa criada com sucesso",
        variant: "default",
      });

      onSuccess();
      onClose();
    } catch (error) {
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

  if (!metric) return null;

  const canEdit = !existingJustification || 
    existingJustification.status === 'pending' || 
    existingJustification.status === 'needs_revision';
  const formattedDate = format(periodDate, "MMMM 'de' yyyy", { locale: ptBR });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <CustomBadge variant="success">Aprovado</CustomBadge>;
      case 'reviewed':
        return <CustomBadge variant="secondary">Revisado</CustomBadge>;
      case 'needs_revision':
        return <CustomBadge variant="warning">Precisa Revisão</CustomBadge>;
      default:
        return <CustomBadge variant="warning">Pendente</CustomBadge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {existingJustification ? 'Atualizar Justificativa' : 'Justificar Métrica'}
          </DialogTitle>
          <DialogDescription>
            Justifique o não batimento de meta da métrica "{metric.name}" para {formattedDate}
          </DialogDescription>
        </DialogHeader>

        {existingJustification && (
          <div className="mb-4 p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Status:</span>
              {getStatusBadge(existingJustification.status)}
            </div>
            {existingJustification.admin_feedback && (
              <div className="mt-2">
                <span className="text-sm font-medium">Feedback do Administrador:</span>
                <p className="text-sm text-muted-foreground mt-1 p-2 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                  {existingJustification.admin_feedback}
                </p>
              </div>
            )}
            {existingJustification.status === 'needs_revision' && (
              <p className="text-sm text-orange-600 mt-2 font-medium">
                Esta justificativa precisa ser revisada conforme o feedback acima.
              </p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="justification">
              Justificativa do não batimento de meta *
            </Label>
            <Textarea
              id="justification"
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Explique os motivos pelos quais a meta não foi atingida..."
              rows={4}
              disabled={!canEdit}
              required
            />
          </div>

          <div>
            <Label htmlFor="actionPlan">
              Plano de ação para o próximo período *
            </Label>
            <Textarea
              id="actionPlan"
              value={actionPlan}
              onChange={(e) => setActionPlan(e.target.value)}
              placeholder="Descreva as ações que serão tomadas para melhorar o desempenho..."
              rows={4}
              disabled={!canEdit}
              required
            />
          </div>

          {canEdit && (
            <div className="flex justify-end space-x-2">
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
                disabled={isLoading}
              >
                {isLoading ? 'Salvando...' : 
                 existingJustification?.status === 'needs_revision' ? 'Reenviar Justificativa' : 'Salvar Justificativa'}
              </Button>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MetricJustificationDialog;
