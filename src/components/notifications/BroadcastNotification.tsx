
import React, { useState, useEffect } from 'react';
import { Send, Users, UserCheck, Building2, Info, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { notificationService, NotificationTemplate } from '@/services/notificationService';
import { useDepartmentsData } from '@/hooks/useDepartmentsData';
import { translateTemplateName } from '@/utils/roleTranslations';
import VariablesHelper from './VariablesHelper';

interface BroadcastNotificationProps {
  onSent?: () => void;
}

const BroadcastNotification: React.FC<BroadcastNotificationProps> = ({ onSent }) => {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customTitle, setCustomTitle] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [targetType, setTargetType] = useState<'all' | 'admins' | 'department'>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [notificationType, setNotificationType] = useState<'info' | 'warning' | 'success' | 'error'>('info');
  const [isLoading, setIsLoading] = useState(false);
  const [showVariablesHelp, setShowVariablesHelp] = useState(false);
  
  const { toast } = useToast();
  const { departments } = useDepartmentsData();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      console.log('Loading templates...');
      const templateList = await notificationService.getTemplates();
      console.log('Templates loaded:', templateList);
      setTemplates(templateList);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao carregar templates',
        variant: 'destructive'
      });
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setCustomTitle(template.title);
      setCustomMessage(template.message);
      setNotificationType(template.type);
    }
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('message-textarea') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const before = text.substring(0, start);
      const after = text.substring(end, text.length);
      const newText = before + `{{${variable}}}` + after;
      setCustomMessage(newText);
      
      // Manter o foco e posição do cursor
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length + 4, start + variable.length + 4);
      }, 0);
    }
  };

  const handleSendBroadcast = async () => {
    if (!customTitle.trim() || !customMessage.trim()) {
      toast({
        title: 'Erro',
        description: 'Título e mensagem são obrigatórios',
        variant: 'destructive'
      });
      return;
    }

    if (targetType === 'department' && !selectedDepartment) {
      toast({
        title: 'Erro',
        description: 'Selecione um departamento',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('Starting broadcast notification...');
      console.log('Target type:', targetType);
      console.log('Selected department:', selectedDepartment);
      console.log('Title:', customTitle);
      console.log('Message:', customMessage);

      let notificationCount = 0;

      // Preparar variáveis para substituição
      const variables: Record<string, any> = {};
      
      // Adicionar informações do departamento se selecionado
      if (targetType === 'department' && selectedDepartment) {
        const dept = departments.find(d => d.id === selectedDepartment);
        if (dept) {
          variables.department_name = dept.name;
          console.log('Department name added to variables:', dept.name);
        }
      }

      // Adicionar variáveis de exemplo para demonstração
      variables.current_date = new Date().toLocaleDateString('pt-BR');
      variables.current_period = new Date().toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' });
      
      console.log('Variables prepared:', variables);

      if (selectedTemplate) {
        console.log('Using existing template:', selectedTemplate);
        // Usar template existente
        notificationCount = await notificationService.broadcastFromTemplate({
          templateId: selectedTemplate,
          targetType,
          departmentId: targetType === 'department' ? selectedDepartment : undefined,
          variables
        });
      } else {
        console.log('Creating temporary template...');
        // Criar template temporário e enviar
        const tempTemplateName = `temp_broadcast_${Date.now()}`;
        const tempTemplateId = await notificationService.createTemplate({
          name: tempTemplateName,
          title: customTitle,
          message: customMessage,
          type: notificationType,
          category: 'broadcast',
          is_active: false // Template temporário
        });

        console.log('Temporary template created:', tempTemplateId);

        if (tempTemplateId) {
          notificationCount = await notificationService.broadcastFromTemplate({
            templateId: tempTemplateId,
            targetType,
            departmentId: targetType === 'department' ? selectedDepartment : undefined,
            variables
          });
        } else {
          throw new Error('Falha ao criar template temporário');
        }
      }

      console.log('Notification count:', notificationCount);

      if (notificationCount !== null && notificationCount > 0) {
        toast({
          title: 'Sucesso',
          description: `Notificação enviada para ${notificationCount} usuário(s)`,
        });
        
        // Reset form
        setSelectedTemplate('');
        setCustomTitle('');
        setCustomMessage('');
        setTargetType('all');
        setSelectedDepartment('');
        setNotificationType('info');
        
        onSent?.();
      } else if (notificationCount === 0) {
        toast({
          title: 'Aviso',
          description: 'Nenhum usuário encontrado para os critérios selecionados',
          variant: 'destructive'
        });
      } else {
        throw new Error('Falha ao enviar notificações - retorno nulo');
      }
    } catch (error) {
      console.error('Error sending broadcast:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: 'Erro',
        description: `Falha ao enviar notificação: ${errorMessage}`,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTargetIcon = () => {
    switch (targetType) {
      case 'all': return <Users className="h-4 w-4" />;
      case 'admins': return <UserCheck className="h-4 w-4" />;
      case 'department': return <Building2 className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const translateNotificationType = (type: string) => {
    const typeTranslations: Record<string, string> = {
      'info': 'Informação',
      'success': 'Sucesso',
      'warning': 'Aviso',
      'error': 'Erro'
    };
    return typeTranslations[type] || type;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Enviar Notificação em Massa
          </CardTitle>
          <CardDescription>
            Envie notificações para todos os usuários, apenas admins ou um departamento específico
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Seleção de Template */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Template (opcional)</label>
            <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um template ou crie uma mensagem personalizada" />
              </SelectTrigger>
              <SelectContent>
                {templates.filter(t => t.is_active).map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    <div className="flex items-center gap-2">
                      <Badge className={getTypeColor(template.type)}>
                        {translateNotificationType(template.type)}
                      </Badge>
                      {translateTemplateName(template.name)}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Título personalizado */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Título</label>
            <Input
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="Digite o título da notificação"
            />
          </div>

          {/* Mensagem personalizada */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Mensagem</label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowVariablesHelp(!showVariablesHelp)}
                className="flex items-center gap-1 text-xs"
              >
                <HelpCircle className="h-3 w-3" />
                Variáveis disponíveis
              </Button>
            </div>
            <Textarea
              id="message-textarea"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Digite a mensagem da notificação"
              rows={3}
            />
            
            {/* Ajuda com variáveis */}
            <Collapsible open={showVariablesHelp} onOpenChange={setShowVariablesHelp}>
              <CollapsibleContent className="space-y-3">
                <VariablesHelper onVariableClick={insertVariable} />
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Tipo de notificação */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo</label>
            <Select value={notificationType} onValueChange={(value: any) => setNotificationType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="info">
                  <Badge className="bg-blue-100 text-blue-800">Informação</Badge>
                </SelectItem>
                <SelectItem value="success">
                  <Badge className="bg-green-100 text-green-800">Sucesso</Badge>
                </SelectItem>
                <SelectItem value="warning">
                  <Badge className="bg-yellow-100 text-yellow-800">Aviso</Badge>
                </SelectItem>
                <SelectItem value="error">
                  <Badge className="bg-red-100 text-red-800">Erro</Badge>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Destinatários */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Destinatários</label>
            <Select value={targetType} onValueChange={(value: any) => setTargetType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Todos os usuários
                  </div>
                </SelectItem>
                <SelectItem value="admins">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    Apenas administradores
                  </div>
                </SelectItem>
                <SelectItem value="department">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Departamento específico
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Seleção de departamento */}
          {targetType === 'department' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Departamento</label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um departamento" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Botão de envio */}
          <Button 
            onClick={handleSendBroadcast}
            disabled={isLoading || !customTitle.trim() || !customMessage.trim()}
            className="w-full"
          >
            {isLoading ? (
              'Enviando...'
            ) : (
              <>
                {getTargetIcon()}
                <span className="ml-2">Enviar Notificação</span>
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper functions
const getTargetIcon = (targetType: string) => {
  switch (targetType) {
    case 'all': return <Users className="h-4 w-4" />;
    case 'admins': return <UserCheck className="h-4 w-4" />;
    case 'department': return <Building2 className="h-4 w-4" />;
    default: return <Users className="h-4 w-4" />;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'success': return 'bg-green-100 text-green-800';
    case 'warning': return 'bg-yellow-100 text-yellow-800';
    case 'error': return 'bg-red-100 text-red-800';
    default: return 'bg-blue-100 text-blue-800';
  }
};

const translateNotificationType = (type: string) => {
  const typeTranslations: Record<string, string> = {
    'info': 'Informação',
    'success': 'Sucesso',
    'warning': 'Aviso',
    'error': 'Erro'
  };
  return typeTranslations[type] || type;
};

export default BroadcastNotification;
