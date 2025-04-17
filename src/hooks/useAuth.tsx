
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { authService } from '@/services/authService';
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Configura o listener de mudanças de estado de autenticação
    const { data: { subscription } } = authService.onAuthStateChange((event, session) => {
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

    // Verifica se já existe uma sessão
    const checkSession = async () => {
      try {
        const { session, user } = await authService.getSession();
        setSession(session);
        setUser(user);
      } catch (error) {
        console.error('Erro ao verificar sessão:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Limpa a subscrição quando o componente for desmontado
    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const result = await authService.loginUser({ email, password });
      
      if (result.status === 'error') {
        toast({
          title: "Erro no login",
          description: result.message,
          variant: "destructive"
        });
        return false;
      }
      
      return true;
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error.message || "Falha ao fazer login",
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
      await authService.logout();
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

  const isAdmin = user ? authService.isAdmin(user) : false;

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isLoading,
      isAuthenticated: !!user,
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
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
