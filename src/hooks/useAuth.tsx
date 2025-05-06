
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client'; 
import { useToast } from './use-toast';
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

  // Determine if the user is an admin based on the manager role
  const isAdmin = manager?.role === 'admin';

  // Get the manager record for the current user
  const fetchManagerData = async () => {
    if (!user) {
      setManager(null);
      setUserDepartmentId(null);
      return;
    }

    try {
      const { data: managerData, error } = await getCurrentUserManager();
      
      if (error) {
        console.error("Error fetching manager data:", error);
        return;
      }
      
      if (managerData) {
        setManager(managerData);
        
        // Set the department ID if the manager has one
        if (managerData.department_id) {
          setUserDepartmentId(managerData.department_id);
        }
      }
    } catch (error) {
      console.error("Error in fetchManagerData:", error);
    }
  };

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
        
        // Fetch manager data on sign in
        if (session?.user) {
          setTimeout(() => {
            fetchManagerData();
          }, 0);
        }
      }
      
      if (event === 'SIGNED_OUT') {
        setManager(null);
        setUserDepartmentId(null);
        
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
        
        // Fetch manager data if user is logged in
        if (data.session?.user) {
          await fetchManagerData();
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
  }, [toast]);

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
