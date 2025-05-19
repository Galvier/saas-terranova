
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Save, Loader2, Mail, Bell, AlertTriangle } from 'lucide-react';
import { UserSettings } from '@/hooks/useUserSettings';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface NotificationsTabProps {
  settings: UserSettings;
  isLoading: boolean;
  onSave: () => void;
  onUpdateSettings: (settings: Partial<UserSettings>) => void;
}

const NotificationsTab = ({ settings, isLoading, onSave, onUpdateSettings }: NotificationsTabProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Função para simular o envio de um email de teste
  const handleSendTestEmail = () => {
    if (!user || !user.email) {
      toast({
        title: "Erro",
        description: "Não foi possível identificar seu email para enviar o teste.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Email de teste enviado",
      description: `Um email de teste foi enviado para ${user.email}`,
    });
    
    // Note: Esta é uma simulação. Em um ambiente real, você chamaria
    // uma função edge do Supabase para enviar o email real.
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações de Notificações</CardTitle>
        <CardDescription>
          Gerencie como e quando você recebe notificações
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>Notificações por E-mail</span>
              </Label>
              <p className="text-sm text-muted-foreground">
                Receba atualizações importantes por e-mail em {user?.email}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch 
                id="email-notifications" 
                checked={settings.notificationPreferences.email}
                onCheckedChange={(value) => onUpdateSettings({
                  notificationPreferences: {
                    ...settings.notificationPreferences,
                    email: value
                  }
                })}
              />
              {settings.notificationPreferences.email && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSendTestEmail}
                  disabled={isLoading}
                >
                  Testar
                </Button>
              )}
            </div>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="system-notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span>Notificações do Sistema</span>
              </Label>
              <p className="text-sm text-muted-foreground">
                Notificações no navegador sobre atualizações do sistema
              </p>
            </div>
            <Switch 
              id="system-notifications" 
              checked={settings.notificationPreferences.system}
              onCheckedChange={(value) => onUpdateSettings({
                notificationPreferences: {
                  ...settings.notificationPreferences,
                  system: value
                }
              })}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="alert-notifications" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <span>Alertas de Métricas</span>
              </Label>
              <p className="text-sm text-muted-foreground">
                Receba alertas quando métricas atingirem limites críticos
              </p>
            </div>
            <Switch 
              id="alert-notifications" 
              checked={settings.notificationPreferences.alerts}
              onCheckedChange={(value) => onUpdateSettings({
                notificationPreferences: {
                  ...settings.notificationPreferences,
                  alerts: value
                }
              })}
            />
          </div>
        </div>
        
        <div className="rounded-md border p-4 bg-muted/50">
          <h4 className="text-sm font-medium mb-2">Informações sobre notificações</h4>
          <p className="text-sm text-muted-foreground">
            As notificações por e-mail são enviadas através do Supabase usando uma função edge.
            As notificações do sistema são exibidas diretamente no navegador.
            Os alertas de métricas são gerados quando métricas monitoradas atingem valores críticos.
          </p>
        </div>
      </CardContent>
      <CardFooter className="border-t bg-muted/50 px-6 py-4">
        <Button onClick={onSave} disabled={isLoading} className="card-content">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar Preferências
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NotificationsTab;
