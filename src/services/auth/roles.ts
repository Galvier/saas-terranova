
import { User } from '@supabase/supabase-js';

export const authRoles = {
  isAdmin: (user: User | null): boolean => {
    if (!user) return false;
    
    // Explicit verification that the role is 'admin'
    const isAdmin = user.user_metadata?.role === 'admin';
    console.log('[AuthRoles] Admin check for user:', user.id, 'Role:', user.user_metadata?.role, 'Result:', isAdmin);
    
    // Ensure we return false for any role that isn't explicitly 'admin'
    return isAdmin === true;
  },
  
  // Function to check if user has manager role
  isManager: (user: User | null): boolean => {
    if (!user) return false;
    
    // Check if role is 'manager' or 'gestor'
    const isManager = user.user_metadata?.role === 'manager' || user.user_metadata?.role === 'gestor';
    console.log('[AuthRoles] Manager check for user:', user.id, 'Role:', user.user_metadata?.role, 'Result:', isManager);
    
    return isManager === true;
  },
  
  // Function to check if user has viewer role
  isViewer: (user: User | null): boolean => {
    if (!user) return false;
    
    // Check if role is 'viewer' or 'visualizador'
    const isViewer = user.user_metadata?.role === 'viewer' || user.user_metadata?.role === 'visualizador';
    console.log('[AuthRoles] Viewer check for user:', user.id, 'Role:', user.user_metadata?.role, 'Result:', isViewer);
    
    return isViewer === true;
  },
  
  // Get user role as a string
  getUserRole: (user: User | null): string | null => {
    if (!user) return null;
    return user.user_metadata?.role || null;
  },
  
  // Check if a user has a specific role
  hasRole: (user: User | null, role: string): boolean => {
    if (!user) return false;
    
    const userRole = user.user_metadata?.role;
    const hasRole = userRole === role;
    
    console.log('[AuthRoles] Role check:', {
      userId: user.id,
      requestedRole: role,
      userRole: userRole,
      result: hasRole
    });
    
    return hasRole;
  }
};
