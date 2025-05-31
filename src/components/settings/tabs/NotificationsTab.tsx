
import React from 'react';
import { Bell, Send, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useAuth } from '@/hooks/useAuth';
import BroadcastNotification from '@/components/notifications/BroadcastNotification';
import PushNotificationSettings from '@/components/notifications/PushNotificationSettings';

const NotificationsTab = () => {
  const { userSettings, updatePreferences } = useUserSettings();
  const { user } = useAuth();

  // Verificar se o usuário é admin (simplificado)
  const isAdmin = user?.user_metadata?.role === 'admin';

  const handlePreferenceChange = async (key: string, value: boolean) => {
    if (!userSettings) return;
    
    const newPreferences = {
      ...userSettings.notification_preferences,
      [key]: value
    };
    
    await updatePreferences(newPreferences);
  };

  const preferences = userSettings?.notification_preferences || {
    email: true,
    alerts: true,
    system: true,
    push: true
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="preferences" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
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
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">Notificações Push</h4>
                  <p className="text-sm text-gray-600">
                    Receber notificações no navegador e dispositivo
                  </p>
                </div>
                <Switch
                  checked={preferences.push}
                  onCheckedChange={(checked) => handlePreferenceChange('push', checked)}
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
      </Tabs>
    </div>
  );
};

export default NotificationsTab;
