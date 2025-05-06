
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client'; 
import { useToast } from './use-toast';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  session: Session | null;
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
  const [isLoading, setIsLoading] = useState(true);
  const [userDepartmentId, setUserDepartmentId] = useState<string | null>(null);
  const { toast } = useToast();

  // Determine if the user is an admin based on metadata
  const isAdmin = user?.user_metadata?.user_type === 'admin';

  useEffect(() => {
    // Set up subscription for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user || null);
      
      // Fetch or determine user's department if they're logged in
      if (session?.user) {
        // In a real app, fetch the user's department from their profile
        if (!isAdmin && session.user.user_metadata?.department_id) {
          setUserDepartmentId(session.user.user_metadata.department_id);
        }
      } else {
        setUserDepartmentId(null);
      }
      
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

      // Update loading state
      setIsLoading(false);
    });

    // Check current session
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        setUser(data.session?.user || null);
        
        // Fetch or determine user's department if they're logged in
        if (data.session?.user) {
          if (!isAdmin && data.session.user.user_metadata?.department_id) {
            setUserDepartmentId(data.session.user.user_metadata.department_id);
          }
        }
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
  }, [toast, isAdmin]);

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
