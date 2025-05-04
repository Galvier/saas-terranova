
import { getSupabase, formatCrudResult } from '@/integrations/supabase/core';

/**
 * Get current session
 */
export async function getCurrentSession() {
  try {
    const { data, error } = await getSupabase().auth.getSession();

    if (error) {
      console.error('Get session error:', error);
      return formatCrudResult(null, {
        message: error.message,
        details: '',
        hint: '',
        code: '',
        name: 'AuthError'  // Added name property
      });
    }

    return formatCrudResult(data);
  } catch (error: any) {
    console.error('Get session exception:', error);
    return formatCrudResult(null, {
      message: error.message || 'Failed to get session',
      details: '',
      hint: '',
      code: '',
      name: 'Error'  // Added name property
    });
  }
}

/**
 * Sign out user
 */
export async function signOut() {
  try {
    const { error } = await getSupabase().auth.signOut();

    if (error) {
      console.error('Sign out error:', error);
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
    console.error('Sign out exception:', error);
    return formatCrudResult(null, {
      message: error.message || 'Failed to sign out',
      details: '',
      hint: '',
      code: '',
      name: 'Error'  // Added name property
    });
  }
}
