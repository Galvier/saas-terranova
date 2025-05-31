
import React from 'react';
import { Bell, BellOff, Smartphone, TestTube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
        return { text: 'Permitido', color: 'bg-green-100 text-green-800' };
      case 'denied':
        return { text: 'Negado', color: 'bg-red-100 text-red-800' };
      default:
        return { text: 'Pendente', color: 'bg-yellow-100 text-yellow-800' };
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
          <div className="text-center py-6">
            <BellOff className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">
              Seu navegador não suporta notificações push
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const permissionStatus = getPermissionStatus();

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
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium">Status da Permissão</h4>
            <p className="text-sm text-gray-600">
              Permissão para enviar notificações
            </p>
          </div>
          <Badge className={permissionStatus.color}>
            {permissionStatus.text}
          </Badge>
        </div>

        {/* Status da inscrição */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium">Notificações Push</h4>
            <p className="text-sm text-gray-600">
              {isSubscribed 
                ? 'Você receberá notificações push' 
                : 'Ative para receber notificações push'
              }
            </p>
          </div>
          <div className="flex items-center gap-2">
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
            {isSubscribed ? (
              <Bell className="h-4 w-4 text-green-600" />
            ) : (
              <BellOff className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </div>

        {/* Ações */}
        <div className="space-y-2">
          {permission === 'default' && (
            <Button 
              onClick={requestPermission}
              variant="outline"
              className="w-full"
            >
              <Bell className="h-4 w-4 mr-2" />
              Solicitar Permissão
            </Button>
          )}

          {permission === 'denied' && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                <strong>Permissão negada:</strong> Para habilitar notificações push, 
                você precisa alterar as configurações do seu navegador manualmente.
              </p>
            </div>
          )}

          {permission === 'granted' && isSubscribed && (
            <Button 
              onClick={sendTestNotification}
              variant="outline"
              className="w-full"
            >
              <TestTube className="h-4 w-4 mr-2" />
              Enviar Notificação de Teste
            </Button>
          )}
        </div>

        {/* Informações adicionais */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Como funcionam?</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Receba alertas de métricas importantes</li>
            <li>• Notificações de backup e sistema</li>
            <li>• Mensagens de administradores</li>
            <li>• Funcionam mesmo com o navegador fechado</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default PushNotificationSettings;
