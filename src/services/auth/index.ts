
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

export type { 
  AuthSession,
  UserRegistrationData,
  LoginCredentials,
  AuthResult
} from './credentials';

