
import React, { useState } from 'react';
import { Settings, Save, Loader2, AlertCircle, Clock, Users, Database, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileSwitchControl from '@/components/settings/MobileSwitchControl';

const NotificationSettings: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    autoNotifications: true,
    systemAlerts: true,
    userActivity: false,
    dataBackup: true
  });

  const isAdmin = user?.user_metadata?.role === 'admin';

  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Acesso Restrito
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Apenas administradores podem acessar as configurações do sistema de notificações.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleSettingChange = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Configurações salvas",
        description: "As configurações do sistema foram atualizadas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configurações do Sistema
        </CardTitle>
        <CardDescription>
          Configure as notificações automáticas do sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isMobile ? (
          <div className="space-y-2">
            <MobileSwitchControl
              id="auto-notifications"
              title="Notificações Automáticas"
              description="Enviar notificações automáticas para métricas em atraso"
              checked={settings.autoNotifications}
              onCheckedChange={(checked) => handleSettingChange('autoNotifications', checked)}
              icon={Clock}
            />
            <MobileSwitchControl
              id="system-alerts"
              title="Alertas do Sistema"
              description="Notificar sobre problemas críticos do sistema"
              checked={settings.systemAlerts}
              onCheckedChange={(checked) => handleSettingChange('systemAlerts', checked)}
              icon={AlertCircle}
            />
            <MobileSwitchControl
              id="user-activity"
              title="Atividade de Usuários"
              description="Notificar sobre login e ações importantes dos usuários"
              checked={settings.userActivity}
              onCheckedChange={(checked) => handleSettingChange('userActivity', checked)}
              icon={Users}
            />
            <MobileSwitchControl
              id="data-backup"
              title="Backup de Dados"
              description="Notificar sobre status de backups automáticos"
              checked={settings.dataBackup}
              onCheckedChange={(checked) => handleSettingChange('dataBackup', checked)}
              icon={Database}
            />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-blue-500" />
                <div>
                  <h4 className="font-medium">Notificações Automáticas</h4>
                  <p className="text-sm text-gray-600">
                    Enviar notificações automáticas para métricas em atraso
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.autoNotifications}
                onCheckedChange={(checked) => handleSettingChange('autoNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <div>
                  <h4 className="font-medium">Alertas do Sistema</h4>
                  <p className="text-sm text-gray-600">
                    Notificar sobre problemas críticos do sistema
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.systemAlerts}
                onCheckedChange={(checked) => handleSettingChange('systemAlerts', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-green-500" />
                <div>
                  <h4 className="font-medium">Atividade de Usuários</h4>
                  <p className="text-sm text-gray-600">
                    Notificar sobre login e ações importantes dos usuários
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.userActivity}
                onCheckedChange={(checked) => handleSettingChange('userActivity', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5 text-purple-500" />
                <div>
                  <h4 className="font-medium">Backup de Dados</h4>
                  <p className="text-sm text-gray-600">
                    Notificar sobre status de backups automáticos
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.dataBackup}
                onCheckedChange={(checked) => handleSettingChange('dataBackup', checked)}
              />
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="border-t bg-muted/50">
        <Button 
          onClick={handleSave} 
          disabled={isLoading}
          className="w-full md:w-auto"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar Configurações
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NotificationSettings;
