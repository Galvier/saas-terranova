
import { getSupabase, formatCrudResult } from '@/integrations/supabase/core';
import { createUserProfile } from '@/integrations/supabase/profiles';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  fullName: string;
  department?: string;
  role?: string;
}

/**
 * Login with email and password
 */
export async function loginWithCredentials({ email, password }: LoginCredentials) {
  try {
    const { data, error } = await getSupabase().auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login error:', error);
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
    console.error('Login exception:', error);
    return formatCrudResult(null, {
      message: error.message || 'Failed to login',
      details: '',
      hint: '',
      code: '',
      name: 'Error'  // Added name property
    });
  }
}

/**
 * Register with email and password
 */
export async function registerWithCredentials({ email, password, fullName, department, role }: RegisterCredentials) {
  try {
    // Register the user
    const { data, error } = await getSupabase().auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error('Registration error:', error);
      return formatCrudResult(null, {
        message: error.message,
        details: '',
        hint: '',
        code: '',
        name: 'AuthError'  // Added name property
      });
    }

    // Create user profile if registration successful and user ID is available
    if (data?.user?.id) {
      await createUserProfile({
        id: data.user.id,
        email,
        full_name: fullName,
        department_id: department || null,
        role: role || 'user'
      });
    }

    return formatCrudResult(data);
  } catch (error: any) {
    console.error('Registration exception:', error);
    return formatCrudResult(null, {
      message: error.message || 'Failed to register',
      details: '',
      hint: '',
      code: '',
      name: 'Error'  // Added name property
    });
  }
}
