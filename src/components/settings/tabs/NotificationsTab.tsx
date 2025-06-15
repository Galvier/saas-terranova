import React from 'react';
import { Bell, Send, Settings, Save, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
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
  hasChanges: boolean;
  onSave: () => void;
  onUpdateSettings: (newSettings: any) => void;
}

// Mobile Notification Toggle Component
const MobileNotificationToggle = ({ 
  id,
  title,
  description,
  checked, 
  onCheckedChange,
  disabled = false
}: { 
  id: string;
  title: string;
  description: string;
  checked: boolean; 
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}) => {
  return (
    <button
      onClick={() => !disabled && onCheckedChange(!checked)}
      disabled={disabled}
      className="w-full flex items-center justify-between p-4 rounded-lg border transition-all duration-200 min-h-[70px] touch-manipulation hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <div className="flex flex-col items-start gap-1 flex-1 min-w-0">
        <span className="text-sm font-medium text-left">{title}</span>
        <span className="text-xs text-muted-foreground text-left line-clamp-2">
          {description}
        </span>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className={cn(
          "text-xs font-medium transition-colors",
          checked ? "text-primary" : "text-muted-foreground"
        )}>
          {checked ? "ATIVO" : "INATIVO"}
        </span>
        <Checkbox 
          id={id}
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          className={cn(
            "h-5 w-5",
            checked && "bg-primary border-primary"
          )}
        />
      </div>
    </button>
  );
};

const NotificationsTab: React.FC<NotificationsTabProps> = ({ 
  settings, 
  isLoading, 
  hasChanges, 
  onSave, 
  onUpdateSettings 
}) => {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  // Verificar se o usuário é admin (simplificado)
  const isAdmin = user?.user_metadata?.role === 'admin';

  const handlePreferenceChange = (key: string, value: boolean) => {
    const newSettings = {
      notificationPreferences: {
        ...settings.notificationPreferences,
        [key]: value
      }
    };
    
    onUpdateSettings(newSettings);
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
              <CardTitle className="flex items-center gap-2">
                Preferências de Notificação
                {hasChanges && (
                  <div className="flex items-center gap-1">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    <span className="text-xs text-amber-600 font-normal">Alterações não salvas</span>
                  </div>
                )}
              </CardTitle>
              <CardDescription>
                Configure quais tipos de notificações você deseja receber
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isMobile ? (
                <div className="space-y-3">
                  <MobileNotificationToggle
                    id="system-notifications"
                    title="Notificações do Sistema"
                    description="Atualizações importantes do sistema e manutenções"
                    checked={preferences.system}
                    onCheckedChange={(checked) => handlePreferenceChange('system', checked)}
                    disabled={isLoading}
                  />
                  <MobileNotificationToggle
                    id="alerts-notifications"
                    title="Alertas de Métricas"
                    description="Avisos quando métricas estão fora do alvo ou em atraso"
                    checked={preferences.alerts}
                    onCheckedChange={(checked) => handlePreferenceChange('alerts', checked)}
                    disabled={isLoading}
                  />
                  <MobileNotificationToggle
                    id="email-notifications"
                    title="Notificações por Email"
                    description="Receber notificações importantes por email"
                    checked={preferences.email}
                    onCheckedChange={(checked) => handlePreferenceChange('email', checked)}
                    disabled={isLoading}
                  />
                </div>
              ) : (
                <>
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
                </>
              )}
            </CardContent>
            <CardFooter className="border-t bg-muted/50 px-4 md:px-6 py-4">
              <Button 
                onClick={onSave} 
                disabled={isLoading || !hasChanges}
                className={cn(
                  "w-full md:w-auto",
                  hasChanges && "bg-primary hover:bg-primary/90"
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {hasChanges ? "Salvar Alterações" : "Salvar"}
                  </>
                )}
              </Button>
            </CardFooter>
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
