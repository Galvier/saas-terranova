
import { createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { Manager } from '@/integrations/supabase/types/manager';
import { useAuthSession } from './useAuthSession';
import { useManagerData } from './useManagerData';
import { useAuthMethods } from './useAuthMethods';
import { authRoles } from '@/services/auth/roles';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  manager: Manager | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isManager: boolean;
  isViewer: boolean;
  userRole: string | null;
  userDepartmentId: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// Create a default value for the context
const defaultAuthContext: AuthContextType = {
  user: null,
  session: null,
  manager: null,
  isLoading: true,
  isAuthenticated: false,
  isAdmin: false,
  isManager: false,
  isViewer: false,
  userRole: null,
  userDepartmentId: null,
  login: async () => false,
  logout: async () => {},
  refreshUser: async () => {}
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Use separate hooks to manage specific parts of authentication
  const { user, session, isLoading: isSessionLoading, error: sessionError, refreshUser } = useAuthSession();
  const { manager, userDepartmentId, isAdmin: managerIsAdmin, isLoading: isManagerLoading } = useManagerData(user);
  const { isAuthenticating, login, logout } = useAuthMethods();

  // Combine loadings
  const isLoading = isSessionLoading || isManagerLoading || isAuthenticating;

  // Consider user as authenticated if user object exists and not loading
  const isAuthenticated = !!user && !isLoading;
  
  // Check user roles using service functions
  const isAdmin = authRoles.isAdmin(user) || (managerIsAdmin && manager?.role === 'admin');
  const isManager = authRoles.isManager(user) || manager?.role === 'manager';
  const isViewer = authRoles.isViewer(user);
  const userRole = authRoles.getUserRole(user) || manager?.role || null;

  // Log for diagnostics
  if (user && !isLoading) {
    console.log('[AuthProvider] User status:', {
      id: user.id,
      email: user.email,
      authMetadataRole: user.user_metadata?.role,
      managerRole: manager?.role,
      isAdmin,
      isManager,
      isViewer,
      effectiveRole: userRole
    });
  }

  // Log debug info to facilitate problem identification
  if (sessionError) {
    console.error('[AuthProvider] Session error:', sessionError);
  }

  return (
    <AuthContext.Provider value={{
      user,
      session,
      manager,
      isLoading,
      isAuthenticated,
      isAdmin,
      isManager,
      isViewer,
      userRole,
      userDepartmentId,
      login,
      logout,
      refreshUser
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
