
import React from 'react';
import { Bell, BellOff, Smartphone, TestTube, AlertTriangle, CheckCircle } from 'lucide-react';
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
  disabled
}: { 
  isSubscribed: boolean; 
  onToggle: (checked: boolean) => void;
  disabled: boolean;
}) => {
  return (
    <button
      onClick={() => !disabled && onToggle(!isSubscribed)}
      disabled={disabled}
      className="w-full flex items-center justify-between p-3 rounded-lg border transition-all duration-200 min-h-[48px] touch-manipulation hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <div className="flex items-center gap-3">
        {isSubscribed ? (
          <Bell className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
        ) : (
          <BellOff className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        )}
        <div className="flex flex-col items-start gap-0.5">
          <span className="text-sm font-medium">Notificações Push</span>
          <span className="text-xs text-muted-foreground text-left">
            {isSubscribed 
              ? 'Recebendo notificações push' 
              : 'Ative para receber notificações'
            }
          </span>
        </div>
      </div>
      <div className="flex items-center flex-shrink-0 ml-3">
        <Checkbox 
          checked={isSubscribed}
          onCheckedChange={onToggle}
          disabled={disabled}
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
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification
  } = usePushNotifications();
  
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

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
    console.log('Switch change:', { checked, permission, isSubscribed, isLoading });
    
    if (isLoading) {
      console.log('Already loading, ignoring switch change');
      return;
    }

    if (checked) {
      console.log('Attempting to subscribe...');
      const success = await subscribe();
      console.log('Subscribe result:', success);
    } else {
      console.log('Attempting to unsubscribe...');
      const success = await unsubscribe();
      console.log('Unsubscribe result:', success);
    }
  };

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
            disabled={isLoading}
          />
        ) : (
          <div className={`flex items-center justify-between rounded-lg border ${
            isTablet ? 'p-5 bg-muted/50' : 'p-4 bg-muted/50'
          }`}>
            <div className="flex items-center gap-3">
              {isSubscribed ? (
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
                  {isSubscribed 
                    ? 'Ativo - Você receberá notificações push' 
                    : 'Inativo - Ative para receber notificações push'
                  }
                </p>
              </div>
            </div>
            <Switch
              checked={isSubscribed}
              onCheckedChange={handleSwitchChange}
              disabled={isLoading}
              className={isTablet ? 'scale-110' : ''}
            />
          </div>
        )}

        {/* Alertas e ações baseados no status */}
        {permission === 'default' && (
          <Alert>
            <Bell className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span>Para receber notificações push, você precisa conceder permissão ao navegador.</span>
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
              <div className="space-y-2">
                <p><strong>Permissão negada:</strong> Para habilitar notificações push, você precisa:</p>
                <ol className={`list-decimal list-inside space-y-1 ml-4 ${
                  isTablet ? 'text-sm' : 'text-xs'
                }`}>
                  <li>Clicar no ícone de cadeado/informações na barra de endereço</li>
                  <li>Alterar a configuração de "Notificações" para "Permitir"</li>
                  <li>Recarregar a página</li>
                </ol>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {permission === 'granted' && !isSubscribed && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <span>Permissão concedida! Ative o switch acima para se inscrever nas notificações.</span>
            </AlertDescription>
          </Alert>
        )}

        {/* Botão de teste */}
        {permission === 'granted' && isSubscribed && (
          <div className="pt-2">
            <Button 
              onClick={sendTestNotification}
              variant="outline"
              className="w-full"
              size={isTablet ? 'default' : 'sm'}
              disabled={isLoading}
            >
              <TestTube className={`mr-2 ${isTablet ? 'h-5 w-5' : 'h-4 w-4'}`} />
              {isLoading ? 'Enviando...' : 'Enviar Notificação de Teste'}
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
