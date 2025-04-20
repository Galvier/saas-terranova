
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client'; 
import { useToast } from './use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

// Create a default value for the context
const defaultAuthContext: AuthContextType = {
  user: null,
  session: null,
  isLoading: false,
  isAuthenticated: true, // Always authenticated for demo purposes
  isAdmin: true, // Always admin for demo purposes
  login: async () => true, // Mock function
  logout: async () => {} // Mock function
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Set up subscription for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user || null);
      
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
    });

    // Check current session
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        setUser(data.session?.user || null);
      } catch (error) {
        console.error('Erro ao verificar sessão:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.info('Supabase login failed, using mock login:', error);
        toast({
          title: "Login simulado",
          description: "Modo de demonstração ativado",
        });
        return true; // Always return true for demo purposes
      }
      
      return true;
    } catch (error: any) {
      console.error('Error during login:', error);
      toast({
        title: "Login simulado",
        description: "Modo de demonstração ativado",
      });
      return true; // Always return true for demo purposes
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

  // Always consider the user as authenticated for demo purposes
  const isAuthenticated = true;
  const isAdmin = true;

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isLoading,
      isAuthenticated,
      isAdmin,
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
