
import { supabase } from '@/integrations/supabase/client';
import { CrudResult, formatCrudResult } from '@/integrations/supabase';

export interface UserRecoveryOptions {
  email: string;
}

// Request a password reset email
export const requestPasswordReset = async (options: UserRecoveryOptions): Promise<CrudResult<null>> => {
  try {
    const { email } = options;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password',
    });
    
    if (error) {
      return formatCrudResult(null, error);
    }
    
    return formatCrudResult(null, null);
  } catch (error: any) {
    return formatCrudResult(null, error);
  }
};

// Update user's password after reset
export const updateUserPassword = async (newPassword: string): Promise<CrudResult<null>> => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) {
      return formatCrudResult(null, error);
    }
    
    return formatCrudResult(null, null);
  } catch (error: any) {
    return formatCrudResult(null, error);
  }
};

// Resend confirmation email
export const resendConfirmationEmail = async (email: string): Promise<CrudResult<null>> => {
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: window.location.origin
      }
    });
    
    if (error) {
      return formatCrudResult(null, error);
    }
    
    return formatCrudResult(null, null);
  } catch (error: any) {
    return formatCrudResult(null, error);
  }
};

export const authRecovery = {
  requestPasswordReset,
  updateUserPassword,
  resendConfirmationEmail
};
