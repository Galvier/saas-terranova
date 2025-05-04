
import { getSupabase, formatCrudResult } from '@/integrations/supabase/core';

/**
 * Send password reset link to email
 */
export async function resetPassword(email: string) {
  try {
    const { error } = await getSupabase().auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      console.error('Password reset error:', error);
      return formatCrudResult(null, {
        message: error.message,
        details: '',
        hint: '',
        code: '',
        name: 'AuthError'  // Added name property
      });
    }

    return formatCrudResult(true);
  } catch (error: any) {
    console.error('Password reset exception:', error);
    return formatCrudResult(null, {
      message: error.message,
      details: '',
      hint: '',
      code: '',
      name: 'Error'  // Added name property
    });
  }
}

/**
 * Complete password reset with new password
 */
export async function updatePasswordByToken(password: string) {
  try {
    const { error } = await getSupabase().auth.updateUser({
      password,
    });

    if (error) {
      console.error('Password update error:', error);
      return formatCrudResult(null, {
        message: error.message,
        details: '',
        hint: '',
        code: '',
        name: 'AuthError'  // Added name property
      });
    }

    return formatCrudResult(true);
  } catch (error: any) {
    console.error('Password update exception:', error);
    return formatCrudResult(null, {
      message: error.message,
      details: '',
      hint: '',
      code: '',
      name: 'Error'  // Added name property
    });
  }
}
