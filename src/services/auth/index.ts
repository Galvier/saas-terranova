
import { authCore } from './core';
import { authCredentials } from './credentials';
import { authRecovery } from './recovery';
import { authRoles } from './roles';

export const authService = {
  ...authCore,
  ...authCredentials,
  ...authRecovery,
  ...authRoles
};

// Re-export types from their respective files
export type { AuthSession } from './core';
export type { 
  UserRegistrationData,
  LoginCredentials,
  AuthResult
} from './credentials';

// Export individual auth modules for direct access
export { authCore, authCredentials, authRecovery, authRoles };
