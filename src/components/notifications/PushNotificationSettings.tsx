
import React from 'react';
import { Bell, BellOff, Smartphone, TestTube, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePushNotifications } from '@/hooks/usePushNotifications';

const PushNotificationSettings: React.FC = () => {
  const {
    isSupported,
    permission,
    isSubscribed,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification
  } = usePushNotifications();

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
          <Smartphone className="h-5 w-5" />
          Notificações Push
        </CardTitle>
        <CardDescription>
          Receba notificações mesmo quando o navegador estiver fechado
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status da permissão */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
          <div className="flex items-center gap-3">
            <StatusIcon className={`h-5 w-5 ${permissionStatus.iconColor}`} />
            <div>
              <h4 className="font-medium">Status da Permissão</h4>
              <p className="text-sm text-muted-foreground">
                Permissão para enviar notificações do navegador
              </p>
            </div>
          </div>
          <Badge className={permissionStatus.color}>
            {permissionStatus.text}
          </Badge>
        </div>

        {/* Status da inscrição */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
          <div className="flex items-center gap-3">
            {isSubscribed ? (
              <Bell className="h-5 w-5 text-green-600 dark:text-green-400" />
            ) : (
              <BellOff className="h-5 w-5 text-muted-foreground" />
            )}
            <div>
              <h4 className="font-medium">Notificações Push</h4>
              <p className="text-sm text-muted-foreground">
                {isSubscribed 
                  ? 'Ativo - Você receberá notificações push' 
                  : 'Inativo - Ative para receber notificações push'
                }
              </p>
            </div>
          </div>
          <Switch
            checked={isSubscribed}
            onCheckedChange={async (checked) => {
              if (checked) {
                await subscribe();
              } else {
                await unsubscribe();
              }
            }}
            disabled={permission === 'denied'}
          />
        </div>

        {/* Alertas e ações baseados no status */}
        {permission === 'default' && (
          <Alert>
            <Bell className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span>Para receber notificações push, você precisa conceder permissão ao navegador.</span>
                <Button 
                  onClick={requestPermission}
                  size="sm"
                  className="ml-2"
                >
                  Permitir
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
                <ol className="list-decimal list-inside space-y-1 text-sm ml-4">
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
              <div className="flex items-center justify-between">
                <span>Permissão concedida! Ative o switch acima para se inscrever nas notificações.</span>
              </div>
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
            >
              <TestTube className="h-4 w-4 mr-2" />
              Enviar Notificação de Teste
            </Button>
          </div>
        )}

        {/* Informações sobre funcionalidades */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-900/20 dark:border-blue-800">
          <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2">
            <Bell className="h-4 w-4" />
            O que você receberá:
          </h4>
          <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-2">
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
