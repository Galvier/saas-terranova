
import { useState, useEffect } from 'react';
import { notificationService } from '@/services/notificationService';
import { useToast } from '@/hooks/use-toast';

export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkSupport();
  }, []);

  // Verificar suporte periodicamente
  useEffect(() => {
    if (!isSupported) return;

    const checkChanges = () => {
      const currentPermission = Notification.permission;
      if (currentPermission !== permission) {
        console.log('Permission changed:', permission, '->', currentPermission);
        setPermission(currentPermission);
        
        if (currentPermission === 'granted') {
          checkSubscriptionStatus();
        } else if (currentPermission === 'denied') {
          setIsSubscribed(false);
        }
      }
    };

    const interval = setInterval(checkChanges, 2000);
    window.addEventListener('focus', checkChanges);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', checkChanges);
    };
  }, [permission, isSupported]);

  const checkSupport = async () => {
    const supported = 'Notification' in window && 
                     'serviceWorker' in navigator && 
                     'PushManager' in window;
    
    setIsSupported(supported);
    
    if (supported) {
      setPermission(Notification.permission);
      await waitForServiceWorker();
      await checkSubscriptionStatus();
    }
  };

  const waitForServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        console.log('Service Worker ready:', registration);
        return registration;
      } catch (error) {
        console.error('Service Worker not ready:', error);
        throw error;
      }
    }
  };

  const checkSubscriptionStatus = async () => {
    try {
      if (Notification.permission !== 'granted') {
        setIsSubscribed(false);
        return;
      }

      await waitForServiceWorker();
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      console.log('Subscription check:', {
        hasSubscription: !!subscription,
        endpoint: subscription?.endpoint,
        permission: Notification.permission
      });
      
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Error checking subscription:', error);
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

    setIsLoading(true);
    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      
      console.log('Permission result:', permission);
      
      if (permission === 'granted') {
        toast({
          title: 'Permissão concedida! 🎉',
          description: 'Agora você pode ativar as notificações push',
        });
        setTimeout(checkSubscriptionStatus, 1000);
        return true;
      } else {
        toast({
          title: 'Permissão negada',
          description: 'Para ativar, clique no ícone de cadeado na barra de endereço',
          variant: 'destructive'
        });
        return false;
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
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
    if (permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return false;
    }

    setIsLoading(true);
    try {
      await waitForServiceWorker();
      const registration = await navigator.serviceWorker.ready;
      
      // Chave VAPID pública - deve ser configurada no Supabase
      const vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa40HI80NlMAPF6h5wFAAKgqR_GZV6XZJvDyoWksPa4UBlvKQRKzPRgQzFhiZI';
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlB64ToUint8Array(vapidPublicKey)
      });

      console.log('Push subscription created:', subscription);
      
      const success = await notificationService.subscribeToPush(subscription);
      
      if (success) {
        setIsSubscribed(true);
        toast({
          title: 'Notificações ativadas! 🔔',
          description: 'Você receberá notificações push do sistema',
        });
        return true;
      } else {
        throw new Error('Failed to save subscription on server');
      }
    } catch (error) {
      console.error('Error subscribing to push:', error);
      
      let errorMessage = 'Falha ao se inscrever para notificações push';
      if (error instanceof Error) {
        if (error.message.includes('not_supported_error')) {
          errorMessage = 'Notificações push não são suportadas neste dispositivo';
        } else if (error.message.includes('permission_denied')) {
          errorMessage = 'Permissão negada pelo navegador';
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
    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        const unsubscribed = await subscription.unsubscribe();
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
      console.error('Error unsubscribing from push:', error);
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
      // Primeira tentativa: notificação local
      const notification = new Notification('🎯 Teste de Notificação - Terranova', {
        body: 'Esta é uma notificação de teste do sistema. Se você está vendo isso, as notificações estão funcionando!',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'test-notification',
        requireInteraction: false
      });

      // Auto-fechar após 5 segundos
      setTimeout(() => {
        notification.close();
      }, 5000);

      toast({
        title: 'Notificação de teste enviada! 📢',
        description: 'Verifique se a notificação apareceu no seu dispositivo',
      });

      console.log('Test notification sent successfully');
      
    } catch (error) {
      console.error('Error sending test notification:', error);
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
