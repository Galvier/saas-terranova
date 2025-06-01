
import { useState, useEffect } from 'react';
import { notificationService } from '@/services/notificationService';
import { useToast } from '@/hooks/use-toast';

export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Verificar suporte do navegador
    const supported = 'Notification' in window && 'serviceWorker' in navigator;
    setIsSupported(supported);
    
    if (supported) {
      setPermission(Notification.permission);
      checkSubscriptionStatus();
    }
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Error checking subscription status:', error);
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

    try {
      const permission = await notificationService.requestPushPermission();
      setPermission(Notification.permission);
      
      if (permission) {
        toast({
          title: 'Permissão concedida',
          description: 'Você receberá notificações push do sistema',
        });
      } else {
        toast({
          title: 'Permissão negada',
          description: 'Não será possível enviar notificações push',
          variant: 'destructive'
        });
      }
      
      return permission;
    } catch (error) {
      console.error('Error requesting permission:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao solicitar permissão para notificações',
        variant: 'destructive'
      });
      return false;
    }
  };

  const subscribe = async (): Promise<boolean> => {
    if (permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Chave pública VAPID (você precisará configurar isso no Supabase)
      const vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa40HI80NlMAPF6h5wFAAKgqR_GZV6XZJvDyoWksPa4UBlvKQRKzPRgQzFhiZI';
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey
      });

      const success = await notificationService.subscribeToPush(subscription);
      
      if (success) {
        setIsSubscribed(true);
        toast({
          title: 'Inscrito com sucesso',
          description: 'Você receberá notificações push do sistema',
        });
      } else {
        throw new Error('Failed to save subscription');
      }
      
      return success;
    } catch (error) {
      console.error('Error subscribing to push:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao se inscrever para notificações push',
        variant: 'destructive'
      });
      return false;
    }
  };

  const unsubscribe = async (): Promise<boolean> => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        setIsSubscribed(false);
        toast({
          title: 'Desinscrito',
          description: 'Você não receberá mais notificações push',
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error unsubscribing from push:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao cancelar inscrição',
        variant: 'destructive'
      });
      return false;
    }
  };

  const sendTestNotification = () => {
    if (permission === 'granted') {
      new Notification('Teste de Notificação', {
        body: 'Esta é uma notificação de teste do sistema.',
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      });
    }
  };

  return {
    isSupported,
    permission,
    isSubscribed,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification
  };
};
