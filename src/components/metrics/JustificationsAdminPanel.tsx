
import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CustomBadge } from '@/components/ui/custom-badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, MessageSquare, Calendar, User, Building, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  getPendingJustifications, 
  reviewMetricJustification, 
  PendingJustification 
} from '@/integrations/supabase/metrics/metricJustifications';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const JustificationsAdminPanel: React.FC = () => {
  const [justifications, setJustifications] = useState<PendingJustification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    loadPendingJustifications();
  }, []);

  const loadPendingJustifications = async () => {
    try {
      setIsLoading(true);
      const result = await getPendingJustifications();
      
      if (result.error) {
        toast({
          title: "Erro",
          description: `Erro ao carregar justificativas: ${result.message}`,
          variant: "destructive",
        });
        return;
      }
      
      setJustifications(result.data || []);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar justificativas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReview = async (justificationId: string, status: 'reviewed' | 'approved' | 'needs_revision') => {
    if ((status === 'needs_revision') && !feedback.trim()) {
      toast({
        title: "Erro",
        description: "Feedback é obrigatório ao solicitar revisão",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await reviewMetricJustification(
        justificationId, 
        status, 
        feedback.trim() || undefined
      );

      if (result.error) {
        toast({
          title: "Erro",
          description: `Erro ao revisar justificativa: ${result.message}`,
          variant: "destructive",
        });
        return;
      }

      let message = '';
      switch (status) {
        case 'approved':
          message = 'Justificativa aprovada com sucesso';
          break;
        case 'needs_revision':
          message = 'Justificativa devolvida para revisão. O usuário será notificado.';
          break;
        default:
          message = 'Justificativa revisada com sucesso';
      }

      toast({
        title: "Sucesso",
        description: message,
        variant: "default",
      });

      // Remover da lista e resetar formulário
      setJustifications(prev => prev.filter(j => j.id !== justificationId));
      setReviewingId(null);
      setFeedback('');
      
      // Invalidate pending justifications query to update the counter
      queryClient.invalidateQueries({ queryKey: ['pending-justifications'] });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro inesperado ao revisar justificativa",
        variant: "destructive",
      });
    }
  };

  const startReview = (justificationId: string) => {
    setReviewingId(justificationId);
    setFeedback('');
  };

  const cancelReview = () => {
    setReviewingId(null);
    setFeedback('');
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Justificativas Pendentes</CardTitle>
          <CardDescription>
            Carregando justificativas...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Justificativas Pendentes
          </CardTitle>
          <CardDescription>
            {justifications.length} justificativa(s) aguardando revisão
          </CardDescription>
        </CardHeader>
        <CardContent>
          {justifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma justificativa pendente</p>
            </div>
          ) : (
            <div className="space-y-6">
              {justifications.map((justification) => (
                <Card key={justification.id} className="border-l-4 border-l-amber-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{justification.metric_name}</CardTitle>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Building className="h-4 w-4" />
                            {justification.department_name}
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {justification.user_name}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(justification.period_date), "MMMM 'de' yyyy", { locale: ptBR })}
                          </div>
                        </div>
                      </div>
                      <CustomBadge variant="warning">Pendente</CustomBadge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Justificativa:</h4>
                      <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                        {justification.justification}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Plano de Ação:</h4>
                      <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                        {justification.action_plan}
                      </p>
                    </div>

                    {reviewingId === justification.id ? (
                      <div className="space-y-4 border-t pt-4">
                        <div>
                          <Label htmlFor={`feedback-${justification.id}`}>
                            Feedback para o usuário
                          </Label>
                          <Textarea
                            id={`feedback-${justification.id}`}
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Adicione comentários sobre a justificativa..."
                            rows={3}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            * Feedback é obrigatório ao solicitar revisão
                          </p>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleReview(justification.id, 'approved')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Aprovar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReview(justification.id, 'needs_revision')}
                            className="border-orange-500 text-orange-600 hover:bg-orange-50"
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Solicitar Revisão
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReview(justification.id, 'reviewed')}
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Marcar como Revisado
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={cancelReview}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="border-t pt-4">
                        <Button
                          size="sm"
                          onClick={() => startReview(justification.id)}
                        >
                          Revisar Justificativa
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default JustificationsAdminPanel;
