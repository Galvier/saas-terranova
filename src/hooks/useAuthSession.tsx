
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client'; 
import { useToast } from './use-toast';
import { createLog } from '@/services/logService';

interface UseAuthSessionReturn {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: Error | null;
  refreshUser: () => Promise<void>;
}

export const useAuthSession = (): UseAuthSessionReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  // Function to refresh user data
  const refreshUser = async (): Promise<void> => {
    try {
      console.log('[AuthSession] Atualização manual dos dados do usuário solicitada');
      setIsLoading(true);
      
      // Use getSession() instead of refreshSession() as it's more reliable
      const { data, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('[AuthSession] Erro ao obter sessão:', sessionError);
        throw sessionError;
      }
      
      if (!data.session) {
        console.log('[AuthSession] Nenhuma sessão encontrada');
        setSession(null);
        setUser(null);
        return;
      }
      
      console.log('[AuthSession] Sessão obtida com sucesso');
      setSession(data.session);
      setUser(data.session.user);
      
      // Now explicitly refresh the session to ensure tokens are up to date
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        console.warn('[AuthSession] Aviso ao atualizar sessão:', refreshError);
        // Continue with the current session
      } else if (refreshData.session) {
        console.log('[AuthSession] Sessão atualizada com sucesso');
        setSession(refreshData.session);
        setUser(refreshData.session.user);
        
        // Log successful refresh if we have a user
        try {
          if (refreshData.session.user) {
            await createLog('info', 'Sessão sincronizada', {
              user_id: refreshData.session.user.id,
              timestamp: new Date().toISOString()
            }, refreshData.session.user.id);
            
            toast({
              title: "Sincronização completa",
              description: "Seus dados e permissões foram atualizados"
            });
          }
        } catch (logError) {
          console.warn('[AuthSession] Erro ao criar log para atualização:', logError);
        }
      }
    } catch (err) {
      console.error('[AuthSession] Erro inesperado durante atualização:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao atualizar seus dados",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Track if component is mounted to prevent state updates after unmount
    let isMounted = true;
    
    // Function to set up authentication event subscription
    const setupAuthSubscription = () => {
      try {
        console.log('[AuthSession] Configurando listener de autenticação');
        
        // Set up subscription for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
          if (!isMounted) return;
          
          console.log('[AuthSession] Evento de autenticação:', event);
          
          // Update state without delay to ensure UI responds quickly
          setSession(newSession);
          setUser(newSession?.user || null);
          
          // Handle different auth events
          if (event === 'SIGNED_IN') {
            toast({
              title: "Login realizado com sucesso",
              description: "Bem-vindo ao Business Manager"
            });
            
            // Log sign in with slight delay to avoid blocking UI
            setTimeout(() => {
              if (newSession?.user) {
                createLog('info', 'Login bem-sucedido', {
                  user_id: newSession.user.id,
                  email: newSession.user.email,
                  timestamp: new Date().toISOString()
                }, newSession.user.id).catch(e => 
                  console.warn('[AuthSession] Error creating login log:', e)
                );
              }
            }, 0);
          }
          
          if (event === 'SIGNED_OUT') {
            toast({
              title: "Desconectado",
              description: "Sessão encerrada com sucesso"
            });
          }

          if (event === 'USER_UPDATED') {
            toast({
              title: "Dados atualizados",
              description: "Suas permissões foram atualizadas"
            });
            
            console.log('[AuthSession] Dados do usuário atualizados:', newSession?.user?.user_metadata);
            
            // Log user update with slight delay
            setTimeout(() => {
              if (newSession?.user) {
                createLog('info', 'Dados de usuário atualizados', {
                  user_id: newSession.user.id,
                  metadata: newSession.user.user_metadata,
                  timestamp: new Date().toISOString()
                }, newSession.user.id).catch(e => 
                  console.warn('[AuthSession] Error creating update log:', e)
                );
              }
            }, 0);
          }

          // Update loading state
          setIsLoading(false);
        });

        return subscription;
      } catch (err: any) {
        if (!isMounted) return null;
        
        console.error('[AuthSession] Erro ao configurar listener:', err);
        setError(err);
        setIsLoading(false);
        return null;
      }
    };

    // Check current session and set up listener
    const initializeAuth = async () => {
      try {
        console.log('[AuthSession] Verificando sessão existente');
        
        // Set up the subscription first to not miss any auth events
        const subscription = setupAuthSubscription();
        
        // Check current session
        const { data, error } = await supabase.auth.getSession();
        
        if (!isMounted) {
          if (subscription) subscription.unsubscribe();
          return;
        }
        
        if (error) {
          console.error('[AuthSession] Erro ao obter sessão:', error);
          setError(error);
        } else {
          console.log('[AuthSession] Sessão encontrada:', !!data.session);
          setSession(data.session);
          setUser(data.session?.user || null);
          
          // Log successful initialization if there's a session
          if (data.session?.user) {
            setTimeout(() => {
              if (!isMounted) return;
              createLog('info', 'Sessão inicializada', {
                user_id: data.session?.user.id,
                timestamp: new Date().toISOString()
              }, data.session?.user.id).catch(e => 
                console.warn('[AuthSession] Error creating initialization log:', e)
              );
            }, 0);
          }
        }
        
        setIsLoading(false);
        
        return () => {
          if (subscription) {
            console.log('[AuthSession] Cancelando inscrição de autenticação');
            subscription.unsubscribe();
          }
        };
      } catch (err: any) {
        if (!isMounted) return () => {};
        
        console.error('[AuthSession] Erro ao inicializar autenticação:', err);
        setError(err);
        setIsLoading(false);
        return () => {};
      }
    };

    const cleanup = initializeAuth();
    
    // Cleanup function
    return () => {
      isMounted = false;
      if (cleanup instanceof Promise) {
        cleanup.then(unsubscribe => {
          if (unsubscribe && typeof unsubscribe === 'function') {
            unsubscribe();
          }
        });
      } else if (cleanup && typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, [toast]);

  return { user, session, isLoading, error, refreshUser };
};
