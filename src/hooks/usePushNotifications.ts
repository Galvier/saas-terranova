
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
    // Verificar suporte do navegador
    const supported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);
    
    if (supported) {
      // Verificar permissão atual
      const currentPermission = Notification.permission;
      setPermission(currentPermission);
      console.log('Current notification permission:', currentPermission);
      
      // Verificar status da inscrição push
      checkSubscriptionStatus();
    }
  }, []);

  // Verificar mudanças na permissão periodicamente
  useEffect(() => {
    if (!isSupported) return;

    const checkPermissionChanges = () => {
      const currentPermission = Notification.permission;
      if (currentPermission !== permission) {
        console.log('Permission changed from', permission, 'to', currentPermission);
        setPermission(currentPermission);
        if (currentPermission === 'granted') {
          checkSubscriptionStatus();
        } else if (currentPermission === 'denied') {
          setIsSubscribed(false);
        }
      }
    };

    // Verificar mudanças a cada 2 segundos
    const interval = setInterval(checkPermissionChanges, 2000);
    
    // Verificar quando a janela ganha foco (usuário volta para a aba)
    const handleFocus = () => {
      checkPermissionChanges();
      checkSubscriptionStatus();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [permission, isSupported]);

  const checkSubscriptionStatus = async () => {
    try {
      if ('serviceWorker' in navigator && Notification.permission === 'granted') {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        const hasSubscription = !!subscription;
        
        console.log('Push subscription check:', {
          hasSubscription,
          endpoint: subscription?.endpoint,
          permission: Notification.permission
        });
        
        setIsSubscribed(hasSubscription);
      } else {
        console.log('Cannot check subscription - permission not granted or service worker not available');
        setIsSubscribed(false);
      }
    } catch (error) {
      console.error('Error checking subscription status:', error);
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
      const permission = await notificationService.requestPushPermission();
      const newPermission = Notification.permission;
      setPermission(newPermission);
      
      console.log('Permission request result:', { permission, newPermission });
      
      if (permission) {
        toast({
          title: 'Permissão concedida! 🎉',
          description: 'Agora você pode ativar as notificações push',
        });
        // Verificar automaticamente o status da inscrição após conceder permissão
        setTimeout(checkSubscriptionStatus, 1000);
      } else {
        toast({
          title: 'Permissão negada',
          description: 'Para ativar, clique no ícone de cadeado na barra de endereço',
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
      const registration = await navigator.serviceWorker.ready;
      
      // Chave pública VAPID - em produção, isso deve vir de variáveis de ambiente
      const vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa40HI80NlMAPF6h5wFAAKgqR_GZV6XZJvDyoWksPa4UBlvKQRKzPRgQzFhiZI';
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey
      });

      console.log('Push subscription created:', subscription);
      
      const success = await notificationService.subscribeToPush(subscription);
      
      if (success) {
        setIsSubscribed(true);
        toast({
          title: 'Notificações ativadas! 🔔',
          description: 'Você receberá notificações push do sistema',
        });
      } else {
        throw new Error('Failed to save subscription on server');
      }
      
      return success;
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

      // Log para debugging
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
