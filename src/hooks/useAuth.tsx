
import { createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { Manager } from '@/integrations/supabase/types/manager';
import { useAuthSession } from './useAuthSession';
import { useManagerData } from './useManagerData';
import { useAuthMethods } from './useAuthMethods';

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
  // Usar hooks separados para gerenciar partes específicas da autenticação
  const { user, session, isLoading: isSessionLoading, error: sessionError } = useAuthSession();
  const { manager, userDepartmentId, isAdmin, isLoading: isManagerLoading } = useManagerData(user);
  const { isAuthenticating, login, logout } = useAuthMethods();

  // Combinar carregamentos
  const isLoading = isSessionLoading || isManagerLoading || isAuthenticating;

  // Considerar usuário como autenticado se o objeto de usuário existir e não estiver carregando
  const isAuthenticated = !!user && !isLoading;

  // Log de debug para facilitar identificação de problemas
  if (sessionError) {
    console.error('[AuthProvider] Erro na sessão:', sessionError);
  }

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
    console.warn('useAuth foi chamado fora do AuthProvider. Usando contexto de autenticação padrão.');
    return defaultAuthContext;
  }
  return context;
};
