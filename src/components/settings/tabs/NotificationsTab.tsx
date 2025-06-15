
import React from 'react';
import { Send, Settings, Save, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { useIsTablet } from '@/hooks/use-tablet';
import { cn } from '@/lib/utils';
import BroadcastNotification from '@/components/notifications/BroadcastNotification';
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

// Mobile Notification Toggle Component - Redesigned for compactness
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
      className="w-full flex items-center justify-between p-3 rounded-lg border transition-all duration-200 min-h-[52px] touch-manipulation hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <div className="flex flex-col items-start gap-0.5 flex-1 min-w-0">
        <span className="text-sm font-medium text-left">{title}</span>
        <span className="text-xs text-muted-foreground text-left line-clamp-2">
          {description}
        </span>
      </div>
      <div className="flex items-center flex-shrink-0 ml-3">
        <Checkbox 
          id={id}
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          className={cn(
            "h-4 w-4",
            checked && "bg-primary border-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary"
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
  const isTablet = useIsTablet();

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
        <TabsList className={cn(
          "w-full grid h-12",
          isAdmin ? "grid-cols-3" : "grid-cols-1"
        )}>
          <TabsTrigger value="preferences" className="flex items-center gap-2 px-4">
            <Settings className="h-4 w-4" />
            <span className={isMobile ? "hidden sm:inline" : "inline"}>Preferências</span>
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="broadcast" className="flex items-center gap-2 px-4">
              <Send className="h-4 w-4" />
              <span className={isMobile ? "hidden sm:inline" : "inline"}>Broadcast</span>
            </TabsTrigger>
          )}
          {isAdmin && (
            <TabsTrigger value="system" className="flex items-center gap-2 px-4">
              <Settings className="h-4 w-4" />
              <span className={isMobile ? "hidden sm:inline" : "inline"}>Sistema</span>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="preferences" className={cn(
          "space-y-4",
          isTablet && "space-y-6"
        )}>
          <Card>
            <CardHeader className={isTablet ? "p-6" : ""}>
              <CardTitle className={cn(
                "flex items-center gap-2",
                isTablet && "text-lg"
              )}>
                Preferências de Notificação
                {hasChanges && (
                  <div className="flex items-center gap-1">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    <span className="text-xs text-amber-600 font-normal">Alterações não salvas</span>
                  </div>
                )}
              </CardTitle>
              <CardDescription className={isTablet ? "text-sm" : ""}>
                Configure quais tipos de notificações você deseja receber
              </CardDescription>
            </CardHeader>
            <CardContent className={cn(
              "space-y-3",
              isTablet && "p-6 space-y-4"
            )}>
              {isMobile ? (
                <div className="space-y-2">
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
                  <div className={cn(
                    "flex items-center justify-between border rounded-lg",
                    isTablet ? "p-4" : "p-3"
                  )}>
                    <div>
                      <h4 className={cn(
                        "font-medium",
                        isTablet ? "text-base" : "text-sm"
                      )}>Notificações do Sistema</h4>
                      <p className={cn(
                        "text-gray-600",
                        isTablet ? "text-sm" : "text-xs"
                      )}>
                        Atualizações importantes do sistema e manutenções
                      </p>
                    </div>
                    <Switch
                      checked={preferences.system}
                      onCheckedChange={(checked) => handlePreferenceChange('system', checked)}
                      disabled={isLoading}
                      className={isTablet ? "scale-110" : ""}
                    />
                  </div>

                  <div className={cn(
                    "flex items-center justify-between border rounded-lg",
                    isTablet ? "p-4" : "p-3"
                  )}>
                    <div>
                      <h4 className={cn(
                        "font-medium",
                        isTablet ? "text-base" : "text-sm"
                      )}>Alertas de Métricas</h4>
                      <p className={cn(
                        "text-gray-600",
                        isTablet ? "text-sm" : "text-xs"
                      )}>
                        Avisos quando métricas estão fora do alvo ou em atraso
                      </p>
                    </div>
                    <Switch
                      checked={preferences.alerts}
                      onCheckedChange={(checked) => handlePreferenceChange('alerts', checked)}
                      disabled={isLoading}
                      className={isTablet ? "scale-110" : ""}
                    />
                  </div>

                  <div className={cn(
                    "flex items-center justify-between border rounded-lg",
                    isTablet ? "p-4" : "p-3"
                  )}>
                    <div>
                      <h4 className={cn(
                        "font-medium",
                        isTablet ? "text-base" : "text-sm"
                      )}>Notificações por Email</h4>
                      <p className={cn(
                        "text-gray-600",
                        isTablet ? "text-sm" : "text-xs"
                      )}>
                        Receber notificações importantes por email
                      </p>
                    </div>
                    <Switch
                      checked={preferences.email}
                      onCheckedChange={(checked) => handlePreferenceChange('email', checked)}
                      disabled={isLoading}
                      className={isTablet ? "scale-110" : ""}
                    />
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter className={cn(
              "border-t bg-muted/50",
              isTablet ? "px-6 py-5" : "px-4 md:px-6 py-4"
            )}>
              <Button 
                onClick={onSave} 
                disabled={isLoading || !hasChanges}
                className={cn(
                  "w-full md:w-auto",
                  hasChanges && "bg-primary hover:bg-primary/90",
                  isTablet && "px-6 py-3 text-base"
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 className={cn(
                      "mr-2 animate-spin",
                      isTablet ? "h-5 w-5" : "h-4 w-4"
                    )} />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className={cn(
                      "mr-2",
                      isTablet ? "h-5 w-5" : "h-4 w-4"
                    )} />
                    {hasChanges ? "Salvar Alterações" : "Salvar"}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
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
