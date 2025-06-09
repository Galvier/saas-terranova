
import React from 'react';
import { Bell, Send, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import BroadcastNotification from '@/components/notifications/BroadcastNotification';
import PushNotificationSettings from '@/components/notifications/PushNotificationSettings';
import NotificationSettings from '@/components/notifications/NotificationSettings';

interface NotificationsTabProps {
  settings: {
    notificationPreferences: {
      email: boolean;
      alerts: boolean;
      system: boolean;
    };
  };
  isLoading: boolean;
  onUpdateSettings: (newSettings: any) => Promise<void>;
}

const NotificationsTab: React.FC<NotificationsTabProps> = ({ settings, isLoading, onUpdateSettings }) => {
  const { user } = useAuth();

  // Verificar se o usuário é admin (simplificado)
  const isAdmin = user?.user_metadata?.role === 'admin';

  const handlePreferenceChange = async (key: string, value: boolean) => {
    const newSettings = {
      notificationPreferences: {
        ...settings.notificationPreferences,
        [key]: value
      }
    };
    
    await onUpdateSettings(newSettings);
  };

  const preferences = settings?.notificationPreferences || {
    email: true,
    alerts: true,
    system: true
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="preferences" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Preferências
          </TabsTrigger>
          <TabsTrigger value="push" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Push
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="broadcast" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Broadcast
            </TabsTrigger>
          )}
          {isAdmin && (
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Sistema
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Preferências de Notificação</CardTitle>
              <CardDescription>
                Configure quais tipos de notificações você deseja receber
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">Notificações do Sistema</h4>
                  <p className="text-sm text-gray-600">
                    Atualizações importantes do sistema e manutenções
                  </p>
                </div>
                <Switch
                  checked={preferences.system}
                  onCheckedChange={(checked) => handlePreferenceChange('system', checked)}
                  disabled={isLoading}
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">Alertas de Métricas</h4>
                  <p className="text-sm text-gray-600">
                    Avisos quando métricas estão fora do alvo ou em atraso
                  </p>
                </div>
                <Switch
                  checked={preferences.alerts}
                  onCheckedChange={(checked) => handlePreferenceChange('alerts', checked)}
                  disabled={isLoading}
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">Notificações por Email</h4>
                  <p className="text-sm text-gray-600">
                    Receber notificações importantes por email
                  </p>
                </div>
                <Switch
                  checked={preferences.email}
                  onCheckedChange={(checked) => handlePreferenceChange('email', checked)}
                  disabled={isLoading}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="push">
          <PushNotificationSettings />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="broadcast">
            <BroadcastNotification />
          </TabsContent>
        )}

        {isAdmin && (
          <TabsContent value="system">
            <NotificationSettings />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default NotificationsTab;
