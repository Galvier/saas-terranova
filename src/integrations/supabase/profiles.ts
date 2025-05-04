
import { getSupabase, formatCrudResult } from './core';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  first_name?: string;
  last_name?: string; 
  avatar_url?: string;
  department_id?: string | null;
  role?: string;
}

/**
 * Get user profile by ID
 */
export async function getUserProfileById(userId: string) {
  try {
    const { data, error } = await getSupabase().rpc('get_user_profile_by_id', {
      user_id_param: userId
    });

    if (error) {
      console.error('Error getting user profile:', error);
      return formatCrudResult(null, error);
    }

    return formatCrudResult(data);
  } catch (error: any) {
    console.error('Exception getting user profile:', error);
    return formatCrudResult(null, {
      message: error.message || 'Failed to get user profile',
      details: '',
      hint: '',
      code: '',
      name: 'Error'
    });
  }
}

/**
 * Create user profile 
 */
export async function createUserProfile(profile: UserProfile) {
  try {
    // Insert into profiles table
    const { data, error } = await getSupabase()
      .from('profiles')
      .insert([
        {
          id: profile.id, 
          first_name: profile.first_name || profile.full_name,
          last_name: profile.last_name,
          avatar_url: profile.avatar_url
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating user profile:', error);
      return formatCrudResult(null, error);
    }

    return formatCrudResult(data);
  } catch (error: any) {
    console.error('Exception creating user profile:', error);
    return formatCrudResult(null, {
      message: error.message || 'Failed to create user profile',
      details: '',
      hint: '',
      code: '',
      name: 'Error'
    });
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(userId: string, profile: Partial<UserProfile>) {
  try {
    const { data, error } = await getSupabase()
      .from('profiles')
      .update({
        first_name: profile.first_name,
        last_name: profile.last_name,
        avatar_url: profile.avatar_url
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      return formatCrudResult(null, error);
    }

    return formatCrudResult(data);
  } catch (error: any) {
    console.error('Exception updating user profile:', error);
    return formatCrudResult(null, {
      message: error.message || 'Failed to update user profile',
      details: '',
      hint: '',
      code: '',
      name: 'Error'
    });
  }
}
