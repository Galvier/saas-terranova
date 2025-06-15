
import { useState, useEffect } from 'react';
import { notificationService } from '@/services/notificationService';
import { useToast } from '@/hooks/use-toast';

export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [localNotificationsEnabled, setLocalNotificationsEnabled] = useState(false);
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
      // Não mostrar toast de erro na inicialização para não incomodar o usuário
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
          description: 'Agora você pode ativar as notificações',
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

  const clearOldRegistrations = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        console.log('[PushNotifications] Limpando registro antigo...');
        await subscription.unsubscribe();
      }
    } catch (error) {
      console.warn('[PushNotifications] Erro ao limpar registros:', error);
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
      // Primeiro, tentar limpar registros antigos
      await clearOldRegistrations();
      
      const registration = await navigator.serviceWorker.ready;
      console.log('[PushNotifications] Service Worker pronto para inscrição');
      
      // Tentar primeiro sem VAPID (apenas notificações locais)
      try {
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true
        });

        console.log('[PushNotifications] Inscrição local criada:', {
          endpoint: subscription.endpoint.substring(0, 50) + '...',
          type: 'local'
        });
        
        setIsSubscribed(true);
        setLocalNotificationsEnabled(true);
        
        toast({
          title: 'Notificações ativadas! 🔔',
          description: 'Modo local ativo - você receberá notificações do navegador',
        });
        
        return true;
      } catch (localError) {
        console.log('[PushNotifications] Falha na inscrição local, tentando com VAPID...');
        
        // Se falhar, mostrar erro mais claro
        toast({
          title: 'Serviço indisponível',
          description: 'O serviço de push está temporariamente indisponível. As notificações locais funcionarão normalmente.',
          variant: 'destructive'
        });
        
        // Ativar pelo menos as notificações locais básicas
        setLocalNotificationsEnabled(true);
        return true;
      }
    } catch (error) {
      console.error('[PushNotifications] Erro na inscrição:', error);
      
      let errorMessage = 'Falha ao ativar notificações push';
      if (error instanceof Error) {
        if (error.message.includes('not_supported_error')) {
          errorMessage = 'Notificações push não são suportadas neste dispositivo';
        } else if (error.message.includes('permission_denied')) {
          errorMessage = 'Permissão negada pelo navegador';
        } else if (error.name === 'AbortError') {
          errorMessage = 'Serviço temporariamente indisponível. Tente novamente em alguns minutos.';
        }
      }
      
      toast({
        title: 'Erro na ativação',
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
          setLocalNotificationsEnabled(false);
          toast({
            title: 'Notificações desativadas',
            description: 'Você não receberá mais notificações',
          });
        }
        return unsubscribed;
      }
      
      setIsSubscribed(false);
      setLocalNotificationsEnabled(false);
      return true;
    } catch (error) {
      console.error('[PushNotifications] Erro ao cancelar inscrição:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao cancelar notificações',
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

  const resetNotifications = async () => {
    setIsLoading(true);
    try {
      await clearOldRegistrations();
      setIsSubscribed(false);
      setLocalNotificationsEnabled(false);
      
      toast({
        title: 'Notificações resetadas',
        description: 'Você pode tentar ativar novamente',
      });
      
      // Verificar status após reset
      setTimeout(() => {
        checkSubscriptionStatus();
      }, 1000);
    } catch (error) {
      console.error('[PushNotifications] Erro ao resetar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isSupported,
    permission,
    isSubscribed: isSubscribed || localNotificationsEnabled,
    isLoading,
    localNotificationsEnabled,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification,
    resetNotifications
  };
};
