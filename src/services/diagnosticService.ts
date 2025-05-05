import { supabase } from '@/integrations/supabase/client';

// Function to check if a table exists
export const checkTableExists = async (tableName: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('check_table_exists', {
      table_name: tableName,
    });

    if (error) {
      console.error('Error checking table existence:', error);
      return false;
    }

    return data || false;
  } catch (error) {
    console.error('Unexpected error checking table existence:', error);
    return false;
  }
};

// Function to check if a user profile exists
export const checkUserProfileExists = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('check_user_profile', {
      user_id: userId
    });

    if (error) {
      console.error('Error checking user profile:', error);
      return false;
    }

    return data?.exists || false;
  } catch (error) {
    console.error('Unexpected error checking user profile:', error);
    return false;
  }
};
