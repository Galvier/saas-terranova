
import { useState, useEffect } from 'react';
import { notificationService } from '@/services/notificationService';
import { useToast } from '@/hooks/use-toast';

export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    initializePushNotifications();
  }, []);

  const initializePushNotifications = async () => {
    console.log('[PushNotifications] Inicializando...');
    setIsLoading(true);
    
    try {
      const supported = checkSupport();
      console.log('[PushNotifications] Suporte:', supported);
      
      if (supported) {
        await waitForServiceWorker();
        await checkSubscriptionStatus();
      }
    } catch (error) {
      console.error('[PushNotifications] Erro na inicialização:', error);
      toast({
        title: 'Erro de inicialização',
        description: 'Falha ao inicializar notificações push',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkSupport = () => {
    const supported = 'Notification' in window && 
                     'serviceWorker' in navigator && 
                     'PushManager' in window;
    
    setIsSupported(supported);
    
    if (supported) {
      const currentPermission = Notification.permission;
      console.log('[PushNotifications] Permissão atual:', currentPermission);
      setPermission(currentPermission);
    }
    
    return supported;
  };

  const waitForServiceWorker = async () => {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Worker não suportado');
    }

    try {
      console.log('[PushNotifications] Aguardando Service Worker...');
      const registration = await navigator.serviceWorker.ready;
      console.log('[PushNotifications] Service Worker pronto:', registration.scope);
      return registration;
    } catch (error) {
      console.error('[PushNotifications] Erro no Service Worker:', error);
      throw error;
    }
  };

  const checkSubscriptionStatus = async () => {
    try {
      if (permission !== 'granted') {
        console.log('[PushNotifications] Permissão não concedida, subscription = false');
        setIsSubscribed(false);
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      const hasSubscription = !!subscription;
      console.log('[PushNotifications] Status da inscrição:', {
        hasSubscription,
        endpoint: subscription?.endpoint?.substring(0, 50) + '...',
        permission
      });
      
      setIsSubscribed(hasSubscription);
    } catch (error) {
      console.error('[PushNotifications] Erro ao verificar inscrição:', error);
      setIsSubscribed(false);
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) {
      toast({
        title: 'Não suportado',
        description: 'Seu navegador não suporta notificações push',
        variant: 'destructive'
      });
      return false;
    }

    console.log('[PushNotifications] Solicitando permissão...');
    setIsLoading(true);
    
    try {
      const result = await Notification.requestPermission();
      console.log('[PushNotifications] Resultado da permissão:', result);
      setPermission(result);
      
      if (result === 'granted') {
        toast({
          title: 'Permissão concedida! 🎉',
          description: 'Agora você pode ativar as notificações push',
        });
        
        setTimeout(() => {
          checkSubscriptionStatus();
        }, 500);
        
        return true;
      } else {
        toast({
          title: 'Permissão negada',
          description: 'Para ativar, clique no ícone na barra de endereço',
          variant: 'destructive'
        });
        return false;
      }
    } catch (error) {
      console.error('[PushNotifications] Erro ao solicitar permissão:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao solicitar permissão para notificações',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const subscribe = async (): Promise<boolean> => {
    console.log('[PushNotifications] Tentando se inscrever...', { permission, isLoading });
    
    if (permission !== 'granted') {
      console.log('[PushNotifications] Permissão necessária, solicitando...');
      const granted = await requestPermission();
      if (!granted) return false;
    }

    setIsLoading(true);
    
    try {
      const registration = await navigator.serviceWorker.ready;
      console.log('[PushNotifications] Service Worker pronto para inscrição');
      
      // Chave VAPID pública - temporária para testes
      const vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa40HI80NlMAPF6h5wFAAKgqR_GZV6XZJvDyoWksPa4UBlvKQRKzPRgQzFhiZI';
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlB64ToUint8Array(vapidPublicKey)
      });

      console.log('[PushNotifications] Inscrição criada:', {
        endpoint: subscription.endpoint.substring(0, 50) + '...',
        hasKeys: !!(subscription.getKey && subscription.getKey('p256dh') && subscription.getKey('auth'))
      });
      
      // Salvar no servidor
      try {
        const success = await notificationService.subscribeToPush(subscription);
        console.log('[PushNotifications] Salvo no servidor:', success);
        
        if (!success) {
          console.warn('[PushNotifications] Falha ao salvar no servidor, mas continuando...');
        }
      } catch (serverError) {
        console.warn('[PushNotifications] Erro ao salvar no servidor:', serverError);
        // Continuar mesmo se falhar no servidor para permitir testes locais
      }
      
      setIsSubscribed(true);
      toast({
        title: 'Notificações ativadas! 🔔',
        description: 'Você receberá notificações push do sistema',
      });
      
      return true;
    } catch (error) {
      console.error('[PushNotifications] Erro na inscrição:', error);
      
      let errorMessage = 'Falha ao se inscrever para notificações push';
      if (error instanceof Error) {
        if (error.message.includes('not_supported_error')) {
          errorMessage = 'Notificações push não são suportadas neste dispositivo';
        } else if (error.message.includes('permission_denied')) {
          errorMessage = 'Permissão negada pelo navegador';
        } else if (error.message.includes('AbortError')) {
          errorMessage = 'Operação cancelada. Tente novamente.';
        }
      }
      
      toast({
        title: 'Erro na inscrição',
        description: errorMessage,
        variant: 'destructive'
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribe = async (): Promise<boolean> => {
    console.log('[PushNotifications] Cancelando inscrição...');
    setIsLoading(true);
    
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        const unsubscribed = await subscription.unsubscribe();
        console.log('[PushNotifications] Inscrição cancelada:', unsubscribed);
        
        if (unsubscribed) {
          setIsSubscribed(false);
          toast({
            title: 'Notificações desativadas',
            description: 'Você não receberá mais notificações push',
          });
        }
        return unsubscribed;
      }
      
      setIsSubscribed(false);
      return true;
    } catch (error) {
      console.error('[PushNotifications] Erro ao cancelar inscrição:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao cancelar inscrição das notificações',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const sendTestNotification = async () => {
    if (permission !== 'granted') {
      toast({
        title: 'Permissão necessária',
        description: 'Você precisa permitir notificações primeiro',
        variant: 'destructive'
      });
      return;
    }

    try {
      console.log('[PushNotifications] Enviando notificação de teste...');
      
      const notification = new Notification('🎯 Teste de Notificação - Terranova', {
        body: 'Esta é uma notificação de teste do sistema. Se você está vendo isso, as notificações estão funcionando!',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'test-notification',
        requireInteraction: false
      });

      setTimeout(() => {
        notification.close();
      }, 5000);

      toast({
        title: 'Notificação de teste enviada! 📢',
        description: 'Verifique se a notificação apareceu no seu dispositivo',
      });

      console.log('[PushNotifications] Notificação de teste enviada com sucesso');
      
    } catch (error) {
      console.error('[PushNotifications] Erro ao enviar notificação de teste:', error);
      toast({
        title: 'Erro no teste',
        description: 'Não foi possível enviar a notificação de teste',
        variant: 'destructive'
      });
    }
  };

  // Função para converter chave VAPID
  const urlB64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification
  };
};
