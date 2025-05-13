
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Save, Loader2 } from 'lucide-react';
import { UserSettings } from '@/hooks/useUserSettings';

interface NotificationsTabProps {
  settings: UserSettings;
  isLoading: boolean;
  onSave: () => void;
  onUpdateSettings: (settings: Partial<UserSettings>) => void;
}

const NotificationsTab = ({ settings, isLoading, onSave, onUpdateSettings }: NotificationsTabProps) => {
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
              <Label htmlFor="email-notifications">Notificações por E-mail</Label>
              <p className="text-sm text-muted-foreground">
                Receba atualizações importantes por e-mail
              </p>
            </div>
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
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="system-notifications">Notificações do Sistema</Label>
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
              <Label htmlFor="alert-notifications">Alertas de Métricas</Label>
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
      </CardContent>
      <CardFooter className="border-t bg-muted/50 px-6 py-4">
        <Button onClick={onSave} disabled={isLoading}>
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
