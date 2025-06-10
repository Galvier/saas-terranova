
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
  
  // Determine the effective role - prioritize auth metadata over manager role
  // This ensures that the latest changes from the database are reflected
  const userMetadataRole = user?.user_metadata?.role;
  const managerRole = manager?.role;
  
  // Log the role sources for debugging
  if (user && !isLoading) {
    console.log('[AuthProvider] Role sources:', {
      userEmail: user.email,
      userMetadataRole,
      managerRole,
      finalRole: userMetadataRole || managerRole,
      userDepartmentId,
      manager: manager ? { id: manager.id, name: manager.name, role: manager.role } : null
    });
  }

  // Enhanced logging for dashboard metrics issues
  if (sessionError) {
    console.error('[AuthProvider] Session error:', sessionError);
  }

  if (!user && !isLoading) {
    console.warn('[AuthProvider] No user found after loading completed');
  }

  if (user && !manager && !isManagerLoading) {
    console.warn('[AuthProvider] User found but no manager data:', {
      userId: user.id,
      userEmail: user.email,
      userMetadata: user.user_metadata
    });
  }
  
  // Check user roles - give priority to user_metadata from auth.users
  const isAdmin = userMetadataRole === 'admin' || (!userMetadataRole && managerRole === 'admin');
  const isManager = userMetadataRole === 'manager' || (!userMetadataRole && managerRole === 'manager');
  const isViewer = userMetadataRole === 'viewer' || (!userMetadataRole && managerRole === 'viewer');
  
  // Get the effective role, prioritizing auth metadata
  const userRole = userMetadataRole || managerRole || null;

  // Enhanced logging for diagnostics
  if (user && !isLoading) {
    console.log('[AuthProvider] Final user status:', {
      id: user.id,
      email: user.email,
      authMetadataRole: userMetadataRole,
      managerRole: managerRole,
      isAdmin,
      isManager,
      isViewer,
      effectiveRole: userRole,
      isAuthenticated,
      userDepartmentId
    });
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
