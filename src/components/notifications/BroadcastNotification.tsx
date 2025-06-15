
import React, { useState } from 'react';
import { Send, Users, UserCheck, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { directBroadcastService } from '@/services/directBroadcastService';
import { useDepartmentsData } from '@/hooks/useDepartmentsData';

interface BroadcastNotificationProps {
  onSent?: () => void;
}

const BroadcastNotification: React.FC<BroadcastNotificationProps> = ({ onSent }) => {
  const [customTitle, setCustomTitle] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [targetType, setTargetType] = useState<'all' | 'admins' | 'department'>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [notificationType, setNotificationType] = useState<'info' | 'warning' | 'success' | 'error'>('info');
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();
  const { departments } = useDepartmentsData();

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

      const notificationCount = await directBroadcastService.sendDirectBroadcast({
        title: customTitle,
        message: customMessage,
        type: notificationType,
        targetType,
        departmentId: targetType === 'department' ? selectedDepartment : undefined
      });

      console.log('Broadcast completed. Notification count:', notificationCount);

      if (notificationCount > 0) {
        toast({
          title: 'Sucesso',
          description: `Notificação enviada para ${notificationCount} usuário(s)`,
        });
        
        // Reset form
        setCustomTitle('');
        setCustomMessage('');
        setTargetType('all');
        setSelectedDepartment('');
        setNotificationType('info');
        
        onSent?.();
      } else {
        toast({
          title: 'Aviso',
          description: 'Nenhum usuário encontrado para os critérios selecionados',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error sending broadcast:', error);
      let errorMessage = 'Erro desconhecido ao enviar notificação';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
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
            <label className="text-sm font-medium">Mensagem</label>
            <Textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Digite a mensagem da notificação. Use {{user_name}} para incluir o nome do destinatário."
              rows={3}
            />
            <p className="text-xs text-gray-500">
              💡 Dica: Use <code>{{"{{"}}user_name{{"}}"}}</code> na mensagem para personalizar com o nome do destinatário
            </p>
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
                {targetType === 'all' && <Users className="h-4 w-4" />}
                {targetType === 'admins' && <UserCheck className="h-4 w-4" />}
                {targetType === 'department' && <Building2 className="h-4 w-4" />}
                <span className="ml-2">Enviar Notificação</span>
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default BroadcastNotification;
