
import { callRPC, formatCrudResult, type CrudResult } from './core';
import { insertRecord, KnownTable } from './core';

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  department_id: string | null;
  role: string;
  email: string;
  created_at?: string;
  updated_at?: string;
}

// Function to create a user profile
export const createUserProfile = async (profile: {
  user_id: string;
  full_name: string;
  department_id: string | null;
  role: string;
  email: string;
}): Promise<CrudResult<UserProfile>> => {
  try {
    console.log('Creating user profile:', profile);
    
    const result = await insertRecord<UserProfile>('profiles' as KnownTable, {
      user_id: profile.user_id,
      full_name: profile.full_name,
      department_id: profile.department_id,
      role: profile.role,
      email: profile.email
    });
    
    return result;
  } catch (error) {
    console.error('Error creating user profile:', error);
    return formatCrudResult(null, error);
  }
};

// Function to get a user profile by user ID
export const getUserProfileById = async (userId: string): Promise<CrudResult<UserProfile>> => {
  try {
    const { data, error } = await callRPC<UserProfile>('get_user_profile_by_id', {
      user_id_param: userId
    });
    
    return formatCrudResult(data, error);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return formatCrudResult(null, error);
  }
};
