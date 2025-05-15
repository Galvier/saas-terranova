
import { useState, useEffect, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client'; 
import { useToast } from './use-toast';

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
      console.log('[AuthSession] Manual refresh of user data requested');
      setIsLoading(true);
      
      const { data, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        console.error('[AuthSession] Error refreshing session:', refreshError);
        toast({
          title: "Erro na sincronização",
          description: "Não foi possível atualizar seus dados: " + refreshError.message,
          variant: "destructive"
        });
        return;
      }
      
      if (data.session) {
        console.log('[AuthSession] Session refreshed successfully');
        setSession(data.session);
        setUser(data.session.user);
        
        toast({
          title: "Sincronização completa",
          description: "Seus dados e permissões foram atualizados"
        });
      } else {
        console.log('[AuthSession] No session found after refresh');
        toast({
          title: "Sessão não encontrada",
          description: "Por favor, faça login novamente"
        });
      }
    } catch (err) {
      console.error('[AuthSession] Unexpected error during refresh:', err);
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
    const isMounted = { current: true };
    
    // Function to set up authentication event subscription
    const setupAuthSubscription = () => {
      try {
        console.log('[AuthSession] Configurando listener de autenticação');
        
        // Set up subscription for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
          if (!isMounted.current) return;
          
          console.log('[AuthSession] Evento de autenticação:', event);
          
          // Don't update state if the event is a token refresh
          if (event === 'TOKEN_REFRESHED') {
            return;
          }
          
          setSession(newSession);
          setUser(newSession?.user || null);
          
          if (event === 'SIGNED_IN') {
            toast({
              title: "Login realizado com sucesso",
              description: "Bem-vindo ao Business Manager"
            });
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
            
            console.log('[AuthSession] User data updated:', newSession?.user?.user_metadata);
          }

          // Update loading state
          setIsLoading(false);
        });

        return subscription;
      } catch (err: any) {
        if (!isMounted.current) return null;
        
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
        
        // Set up the subscription first
        const subscription = setupAuthSubscription();
        
        // Check current session
        const { data, error } = await supabase.auth.getSession();
        
        if (!isMounted.current) return () => {
          if (subscription) subscription.unsubscribe();
        };
        
        if (error) throw error;
        
        console.log('[AuthSession] Sessão encontrada:', !!data.session);
        setSession(data.session);
        setUser(data.session?.user || null);
        
        setIsLoading(false);
        
        return () => {
          if (subscription) {
            console.log('[AuthSession] Cancelando inscrição de autenticação');
            subscription.unsubscribe();
          }
        };
      } catch (err: any) {
        if (!isMounted.current) return () => {};
        
        console.error('[AuthSession] Erro ao inicializar autenticação:', err);
        setError(err);
        setIsLoading(false);
        return () => {};
      }
    };

    const cleanup = initializeAuth();
    
    // Cleanup function
    return () => {
      isMounted.current = false;
      cleanup.then(unsubscribe => unsubscribe());
    };
  }, [toast]);

  return { user, session, isLoading, error, refreshUser };
};
