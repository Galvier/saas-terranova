
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
  userDepartmentId: string | null;
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
  userDepartmentId: null,
  login: async () => true, // Mock function
  logout: async () => {} // Mock function
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userDepartmentId, setUserDepartmentId] = useState<string | null>(null);
  const { toast } = useToast();

  // Determine if the user is an admin based on role
  // For demo purposes, we're using a fixed value, but in a real application
  // this would be determined from the user's metadata or profile
  const isAdmin = true; // In a real app, check user.role === 'admin'

  useEffect(() => {
    // Set up subscription for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user || null);
      
      // Fetch or determine user's department if they're logged in
      if (session?.user) {
        // In a real app, fetch the user's department from their profile
        // For demo purposes, we'll use a simulated value if not admin
        if (!isAdmin) {
          // Simulate fetching the manager's department
          // In a real app, make an API call to get this information
          setUserDepartmentId('department-123');
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
    });

    // Check current session
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        setUser(data.session?.user || null);
        
        // Fetch or determine user's department if they're logged in
        if (data.session?.user && !isAdmin) {
          // Simulate fetching the manager's department
          setUserDepartmentId('department-123');
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
