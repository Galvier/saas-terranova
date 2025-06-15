
import React from 'react';
import { Bell, BellOff, Smartphone, TestTube, AlertTriangle, CheckCircle, Loader2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useIsMobile } from '@/hooks/use-mobile';
import { useIsTablet } from '@/hooks/use-tablet';
import { cn } from '@/lib/utils';

// Mobile Push Toggle Component - Compact Design
const MobilePushToggle = ({ 
  isSubscribed, 
  onToggle,
  disabled,
  isLoading,
  localNotificationsEnabled
}: { 
  isSubscribed: boolean; 
  onToggle: (checked: boolean) => void;
  disabled: boolean;
  isLoading: boolean;
  localNotificationsEnabled?: boolean;
}) => {
  return (
    <button
      onClick={() => !disabled && !isLoading && onToggle(!isSubscribed)}
      disabled={disabled || isLoading}
      className="w-full flex items-center justify-between p-3 rounded-lg border transition-all duration-200 min-h-[48px] touch-manipulation hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <div className="flex items-center gap-3">
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground flex-shrink-0" />
        ) : isSubscribed ? (
          <Bell className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
        ) : (
          <BellOff className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        )}
        <div className="flex flex-col items-start gap-0.5">
          <span className="text-sm font-medium">Notificações Push</span>
          <span className="text-xs text-muted-foreground text-left">
            {isLoading 
              ? 'Carregando...'
              : isSubscribed 
                ? localNotificationsEnabled 
                  ? 'Modo local ativo' 
                  : 'Recebendo notificações push'
                : 'Ative para receber notificações'
            }
          </span>
        </div>
      </div>
      <div className="flex items-center flex-shrink-0 ml-3">
        <Checkbox 
          checked={isSubscribed}
          onCheckedChange={onToggle}
          disabled={disabled || isLoading}
          className={cn(
            "h-4 w-4",
            isSubscribed && "bg-primary border-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          )}
        />
      </div>
    </button>
  );
};

const PushNotificationSettings: React.FC = () => {
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    localNotificationsEnabled,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification,
    resetNotifications
  } = usePushNotifications();
  
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  console.log('[PushNotificationSettings] Estado atual:', {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    localNotificationsEnabled
  });

  const getPermissionStatus = () => {
    switch (permission) {
      case 'granted':
        return { 
          text: 'Permitido', 
          color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
          icon: CheckCircle,
          iconColor: 'text-green-600 dark:text-green-400'
        };
      case 'denied':
        return { 
          text: 'Negado', 
          color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
          icon: AlertTriangle,
          iconColor: 'text-red-600 dark:text-red-400'
        };
      default:
        return { 
          text: 'Pendente', 
          color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
          icon: AlertTriangle,
          iconColor: 'text-yellow-600 dark:text-yellow-400'
        };
    }
  };

  const handleSwitchChange = async (checked: boolean) => {
    console.log('[PushNotificationSettings] Switch alterado:', { 
      checked, 
      permission, 
      isSubscribed, 
      isLoading 
    });
    
    if (isLoading) {
      console.log('[PushNotificationSettings] Já está carregando, ignorando mudança');
      return;
    }

    if (checked) {
      console.log('[PushNotificationSettings] Tentando se inscrever...');
      const success = await subscribe();
      console.log('[PushNotificationSettings] Resultado da inscrição:', success);
    } else {
      console.log('[PushNotificationSettings] Tentando cancelar inscrição...');
      const success = await unsubscribe();
      console.log('[PushNotificationSettings] Resultado do cancelamento:', success);
    }
  };

  // Determinar se o switch deve estar desabilitado
  const isSwitchDisabled = isLoading;

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Notificações Push
          </CardTitle>
          <CardDescription>
            Receba notificações mesmo quando o navegador estiver fechado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Não suportado:</strong> Seu navegador não suporta notificações push. 
              Para usar esta funcionalidade, recomendamos usar Chrome, Firefox, Safari ou Edge em suas versões mais recentes.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const permissionStatus = getPermissionStatus();
  const StatusIcon = permissionStatus.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className={`h-5 w-5 ${isTablet ? 'h-6 w-6' : ''}`} />
          Notificações Push
          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </CardTitle>
        <CardDescription>
          Receba notificações mesmo quando o navegador estiver fechado
        </CardDescription>
      </CardHeader>
      <CardContent className={`space-y-4 ${isTablet ? 'space-y-6' : ''}`}>
        {/* Status da permissão */}
        <div className={`flex items-center justify-between rounded-lg border ${
          isTablet ? 'p-5 bg-muted/50' : 'p-4 bg-muted/50'
        }`}>
          <div className="flex items-center gap-3">
            <StatusIcon className={`h-5 w-5 ${permissionStatus.iconColor} ${
              isTablet ? 'h-6 w-6' : ''
            }`} />
            <div>
              <h4 className={`font-medium ${
                isTablet ? 'text-base' : 'text-sm'
              }`}>Status da Permissão</h4>
              <p className={`text-muted-foreground ${
                isTablet ? 'text-sm' : 'text-xs'
              }`}>
                Permissão para enviar notificações do navegador
              </p>
            </div>
          </div>
          <Badge className={`${permissionStatus.color} ${
            isTablet ? 'text-sm px-3 py-1' : ''
          }`}>
            {permissionStatus.text}
          </Badge>
        </div>

        {/* Status da inscrição - Mobile/Desktop/Tablet Layout */}
        {isMobile ? (
          <MobilePushToggle
            isSubscribed={isSubscribed}
            onToggle={handleSwitchChange}
            disabled={isSwitchDisabled}
            isLoading={isLoading}
            localNotificationsEnabled={localNotificationsEnabled}
          />
        ) : (
          <div className={`flex items-center justify-between rounded-lg border ${
            isTablet ? 'p-5 bg-muted/50' : 'p-4 bg-muted/50'
          }`}>
            <div className="flex items-center gap-3">
              {isLoading ? (
                <Loader2 className={`animate-spin text-muted-foreground ${
                  isTablet ? 'h-6 w-6' : 'h-5 w-5'
                }`} />
              ) : isSubscribed ? (
                <Bell className={`text-green-600 dark:text-green-400 ${
                  isTablet ? 'h-6 w-6' : 'h-5 w-5'
                }`} />
              ) : (
                <BellOff className={`text-muted-foreground ${
                  isTablet ? 'h-6 w-6' : 'h-5 w-5'
                }`} />
              )}
              <div>
                <h4 className={`font-medium ${
                  isTablet ? 'text-base' : 'text-sm'
                }`}>Notificações Push</h4>
                <p className={`text-muted-foreground ${
                  isTablet ? 'text-sm' : 'text-xs'
                }`}>
                  {isLoading 
                    ? 'Carregando...'
                    : isSubscribed 
                      ? localNotificationsEnabled
                        ? 'Ativo - Modo local (notificações do navegador)'
                        : 'Ativo - Você receberá notificações push'
                      : 'Inativo - Ative para receber notificações'
                  }
                </p>
              </div>
            </div>
            <Switch
              checked={isSubscribed}
              onCheckedChange={handleSwitchChange}
              disabled={isSwitchDisabled}
              className={isTablet ? 'scale-110' : ''}
            />
          </div>
        )}

        {/* Alertas e ações baseados no status */}
        {permission === 'default' && !isLoading && (
          <Alert>
            <Bell className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span>Para receber notificações, você precisa conceder permissão ao navegador.</span>
                <Button 
                  onClick={requestPermission}
                  size={isTablet ? 'default' : 'sm'}
                  className="ml-2"
                  disabled={isLoading}
                >
                  {isLoading ? 'Aguarde...' : 'Permitir'}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {permission === 'denied' && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-3">
                <p><strong>Permissão negada:</strong> Para habilitar notificações, você precisa:</p>
                <ol className={`list-decimal list-inside space-y-1 ml-4 ${
                  isTablet ? 'text-sm' : 'text-xs'
                }`}>
                  <li>Clicar no ícone de cadeado/informações na barra de endereço</li>
                  <li>Alterar a configuração de "Notificações" para "Permitir"</li>
                  <li>Recarregar a página</li>
                </ol>
                <Button 
                  onClick={resetNotifications}
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Tentar Novamente
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {permission === 'granted' && !isSubscribed && !isLoading && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <span>Permissão concedida! Use o switch acima para ativar as notificações.</span>
            </AlertDescription>
          </Alert>
        )}

        {/* Indicador de modo local */}
        {localNotificationsEnabled && (
          <Alert>
            <Bell className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p><strong>Modo Local Ativo:</strong> As notificações estão funcionando através do navegador.</p>
                <p className="text-sm text-muted-foreground">
                  Este modo garante que você receba notificações mesmo que o serviço de push esteja temporariamente indisponível.
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Botões de ação */}
        {permission === 'granted' && (
          <div className={`flex gap-2 ${isMobile ? 'flex-col' : 'flex-row'}`}>
            {isSubscribed && (
              <Button 
                onClick={sendTestNotification}
                variant="outline"
                className={isMobile ? 'w-full' : 'flex-1'}
                size={isTablet ? 'default' : 'sm'}
                disabled={isLoading}
              >
                <TestTube className={`mr-2 ${isTablet ? 'h-5 w-5' : 'h-4 w-4'}`} />
                Enviar Teste
              </Button>
            )}
            
            <Button 
              onClick={resetNotifications}
              variant="outline"
              className={isMobile ? 'w-full' : 'flex-1'}
              size={isTablet ? 'default' : 'sm'}
              disabled={isLoading}
            >
              <RotateCcw className={`mr-2 ${isTablet ? 'h-5 w-5' : 'h-4 w-4'}`} />
              Resetar
            </Button>
          </div>
        )}

        {/* Informações sobre funcionalidades */}
        <div className={`p-4 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-900/20 dark:border-blue-800 ${
          isTablet ? 'mt-8 p-5' : 'mt-6'
        }`}>
          <h4 className={`font-medium text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2 ${
            isTablet ? 'text-base' : 'text-sm'
          }`}>
            <Bell className={isTablet ? 'h-5 w-5' : 'h-4 w-4'} />
            O que você receberá:
          </h4>
          <ul className={`text-blue-800 dark:text-blue-300 space-y-2 ${
            isTablet ? 'text-sm' : 'text-xs'
          }`}>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400">•</span>
              <span><strong>Alertas de métricas:</strong> Quando valores estão fora do alvo ou em atraso</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400">•</span>
              <span><strong>Notificações do sistema:</strong> Backups, manutenções e atualizações</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400">•</span>
              <span><strong>Mensagens importantes:</strong> Comunicados de administradores</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400">•</span>
              <span><strong>Funcionam offline:</strong> Receba mesmo com o navegador fechado</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default PushNotificationSettings;
