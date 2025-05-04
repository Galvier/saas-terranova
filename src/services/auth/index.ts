
import { getCurrentSession, signOut } from './core';
import { loginWithCredentials, registerWithCredentials } from './credentials';
import { resetPassword, updatePasswordByToken } from './recovery';
import { checkUserRole, hasRole } from './roles';

export const authService = {
  // Core authentication
  getCurrentSession,
  signOut,
  
  // Credentials authentication
  loginWithCredentials,
  registerWithCredentials,
  
  // Password recovery
  resetPassword,
  updatePasswordByToken,
  
  // Role management
  checkUserRole,
  hasRole
};

// Re-export types from their respective files
export type { LoginCredentials, RegisterCredentials } from './credentials';

// Export individual auth modules for direct access
export { 
  getCurrentSession, 
  signOut,
  loginWithCredentials, 
  registerWithCredentials,
  resetPassword, 
  updatePasswordByToken,
  checkUserRole, 
  hasRole
};
