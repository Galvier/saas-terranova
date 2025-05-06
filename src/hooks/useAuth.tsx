
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client'; 
import { useToast } from './use-toast';
import { useNavigate } from 'react-router-dom';
import { Manager } from '@/integrations/supabase/types/manager';
import { getCurrentUserManager } from '@/integrations/supabase/managers';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  manager: Manager | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  userDepartmentId: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

// Create a default value for the context
const defaultAuthContext: AuthContextType = {
  user: null,
  session: null,
  manager: null,
  isLoading: true,
  isAuthenticated: false,
  isAdmin: false,
  userDepartmentId: null,
  login: async () => false,
  logout: async () => {}
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [manager, setManager] = useState<Manager | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userDepartmentId, setUserDepartmentId] = useState<string | null>(null);
  const { toast } = useToast();

  // Determine if the user is an admin based on metadata or manager role
  const isAdmin = user?.user_metadata?.role === 'admin' || manager?.role === 'admin';

  // Fetch manager data for the current user
  const fetchManagerData = async () => {
    if (!user) {
      setManager(null);
      return;
    }
    
    try {
      console.log('Buscando dados do manager para o usuário:', user.id);
      const result = await getCurrentUserManager();
      
      if (result.error) {
        console.error('Erro ao buscar dados do manager:', result.error);
        // Não definimos o manager como null aqui para evitar loops infinitos de autenticação
        return;
      }
      
      if (result.data) {
        console.log('Dados do manager encontrados:', result.data);
        setManager(result.data);
        if (result.data.department_id) {
          setUserDepartmentId(result.data.department_id);
        }
      } else {
        console.log('Nenhum registro de manager encontrado para este usuário');
        setManager(null);
      }
    } catch (error) {
      console.error('Erro ao buscar dados do manager:', error);
      // Não definimos o manager como null aqui para evitar loops infinitos de autenticação
    }
  };

  useEffect(() => {
    let authSubscription: {
      subscription: { unsubscribe: () => void };
      data: { subscription: { unsubscribe: () => void } };
    };
    
    // Função para configurar a inscrição de eventos de autenticação
    const setupAuthSubscription = () => {
      // Set up subscription for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
        console.log('[AuthProvider] Evento de autenticação:', event);
        
        // Não atualize o estado se o evento for um refresh de token
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
          setManager(null);
          setUserDepartmentId(null);
        }

        // Update loading state
        setIsLoading(false);
      });

      return { subscription, data: { subscription } };
    };

    // Configurar a inscrição e armazenar a referência para limpeza
    authSubscription = setupAuthSubscription();

    // Check current session
    const checkSession = async () => {
      try {
        console.log('[AuthProvider] Verificando sessão existente');
        const { data } = await supabase.auth.getSession();
        console.log('[AuthProvider] Sessão encontrada:', !!data.session);
        setSession(data.session);
        setUser(data.session?.user || null);
      } catch (error) {
        console.error('Erro ao verificar sessão:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Cleanup function to unsubscribe
    return () => {
      if (authSubscription?.data?.subscription) {
        console.log('[AuthProvider] Cancelando inscrição de autenticação');
        authSubscription.data.subscription.unsubscribe();
      } else if (authSubscription?.subscription) {
        console.log('[AuthProvider] Cancelando inscrição alternativa de autenticação');
        authSubscription.subscription.unsubscribe();
      }
    };
  }, [toast]);

  // Fetch manager data whenever the user changes
  useEffect(() => {
    if (user) {
      // Use setTimeout para evitar deadlock com auth state change
      setTimeout(() => {
        fetchManagerData();
      }, 0);
    } else {
      setManager(null);
      setUserDepartmentId(null);
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Erro durante login:', error);
        toast({
          title: "Erro no login",
          description: error.message || "Credenciais inválidas. Por favor, verifique seu email e senha.",
          variant: "destructive"
        });
        return false;
      }
      
      return true;
    } catch (error: any) {
      console.error('Erro durante login:', error);
      toast({
        title: "Erro no login",
        description: error.message || "Ocorreu um erro ao fazer login. Por favor, tente novamente.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
    } catch (error: any) {
      toast({
        title: "Erro ao desconectar",
        description: error.message || "Falha ao fazer logout",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Consider user as authenticated if user object exists and not loading
  const isAuthenticated = !!user && !isLoading;

  return (
    <AuthContext.Provider value={{
      user,
      session,
      manager,
      isLoading,
      isAuthenticated,
      isAdmin,
      userDepartmentId,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    console.warn('useAuth was called outside of AuthProvider. Using default auth context.');
    return defaultAuthContext;
  }
  return context;
};
