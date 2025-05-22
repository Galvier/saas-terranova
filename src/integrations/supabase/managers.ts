
import { callRPC, formatCrudResult, type CrudResult } from './core';
import { supabase } from './client';
import type { Manager } from './types/manager';

export const getAllManagers = async (): Promise<CrudResult<Manager[]>> => {
  try {
    const { data, error } = await callRPC<Manager[]>('get_all_managers', {});
    return formatCrudResult(data, error);
  } catch (error) {
    console.error('Error fetching managers:', error);
    return formatCrudResult(null, error);
  }
};

export const createManager = async (
  manager: { 
    name: string; 
    email: string; 
    department_id: string;
    is_active: boolean;
    password?: string;
    role?: string;
  }
): Promise<CrudResult<Manager>> => {
  try {
    // First create the manager in the database
    const { data: managerData, error: managerError } = await callRPC<Manager>('create_manager', {
      manager_name: manager.name,
      manager_email: manager.email,
      manager_department_id: manager.department_id,
      manager_is_active: manager.is_active,
      manager_password: manager.password,
      manager_role: manager.role || 'manager'
    });
    
    if (managerError) {
      console.error('Error creating manager:', managerError);
      return formatCrudResult(null, managerError);
    }
    
    // If a password was provided, create/update auth user through Edge Function
    if (manager.password) {
      try {
        console.log('Creating auth user via Edge Function:', manager.email);
        
        // Call our Edge Function to create the auth user with admin privileges
        const { data: authData, error: authFnError } = await supabase.functions.invoke('create-auth-user', {
          body: {
            email: manager.email,
            password: manager.password,
            metadata: {
              role: manager.role || 'manager',
              department_id: manager.department_id,
              display_name: manager.name
            }
          }
        });
        
        if (authFnError) {
          console.error('Edge function error creating auth user:', authFnError);
          // Still return success for manager creation, but log the auth error
          return formatCrudResult(managerData, null);
        }
        
        console.log('Auth user creation response:', authData);
        
        // Run fix inconsistencies to ensure user_id is properly set in managers table
        if (authData?.user) {
          await fixAuthManagerInconsistencies();
        }
      } catch (authErr) {
        console.error('Exception in auth user creation:', authErr);
        // Still return success for manager creation
      }
    }

    return formatCrudResult(managerData, null);
  } catch (error) {
    console.error('Error in createManager:', error);
    return formatCrudResult(null, error);
  }
};

export const updateManager = async (
  id: string,
  manager: { 
    name: string; 
    email: string; 
    department_id: string;
    is_active: boolean;
    role?: string;
  }
): Promise<CrudResult<Manager>> => {
  try {
    console.log("Calling update_manager with params:", {
      manager_id: id,
      manager_name: manager.name,
      manager_email: manager.email,
      manager_department_id: manager.department_id,
      manager_is_active: manager.is_active,
      manager_role: manager.role
    });

    const { data, error } = await callRPC<Manager>('update_manager', {
      manager_id: id,
      manager_name: manager.name,
      manager_email: manager.email,
      manager_department_id: manager.department_id,
      manager_is_active: manager.is_active,
      manager_role: manager.role
    });

    if (error) {
      console.error('Error from update_manager RPC:', error);
    } else {
      console.log('Update manager success:', data);
    }

    return formatCrudResult(data, error);
  } catch (error) {
    console.error('Exception in updateManager:', error);
    return formatCrudResult(null, error);
  }
};

export const deleteManager = async (id: string): Promise<CrudResult<Manager>> => {
  try {
    const { data, error } = await callRPC<Manager>('delete_manager', {
      manager_id: id
    });
    return formatCrudResult(data, error);
  } catch (error) {
    console.error('Error deleting manager:', error);
    return formatCrudResult(null, error);
  }
};

export const getManagerById = async (id: string): Promise<CrudResult<Manager>> => {
  try {
    console.log("Fetching manager with ID:", id);
    const { data, error } = await callRPC<Manager[]>('get_manager_by_id', {
      manager_id: id
    });
    
    // Since the function returns a table (array) but we only need one manager
    const manager = Array.isArray(data) && data.length > 0 ? data[0] : null;
    console.log("Manager data received:", manager);
    
    return formatCrudResult(manager, error);
  } catch (error) {
    console.error('Error fetching manager:', error);
    return formatCrudResult(null, error);
  }
};

export const getCurrentUserManager = async (): Promise<CrudResult<Manager>> => {
  try {
    const { data, error } = await callRPC<Manager[]>('get_current_user_manager', {});
    
    // The function should return either one manager or none if the user is not a manager
    const manager = Array.isArray(data) && data.length > 0 ? data[0] : null;
    console.log("Current user manager data:", manager);
    
    return formatCrudResult(manager, error);
  } catch (error) {
    console.error('Error fetching current user manager:', error);
    return formatCrudResult(null, error);
  }
};

// Function to manually fix any sync issues
export const fixAuthManagerInconsistencies = async (): Promise<CrudResult<any>> => {
  try {
    console.log("Starting fix_user_manager_inconsistencies process");
    
    const { data, error } = await callRPC<any>('fix_user_manager_inconsistencies', {});
    
    if (error) {
      console.error('Error fixing inconsistencies:', error);
      return formatCrudResult(null, error);
    }
    
    // If manager records were updated but some still need auth user creation,
    // process each one with the edge function
    const managersWithoutAuthUsers = await getManagersWithoutAuthUsers();
    
    if (managersWithoutAuthUsers.data && managersWithoutAuthUsers.data.length > 0) {
      console.log(`Found ${managersWithoutAuthUsers.data.length} managers without auth users, attempting to create auth users`);
      
      // Create a temporary password for these users
      // In a production system, you'd want to generate random secure passwords and notify users
      const tempPassword = "ChangeMe123!";
      
      for (const manager of managersWithoutAuthUsers.data) {
        try {
          console.log(`Creating auth user for ${manager.email}`);
          
          // Call our Edge Function to create the auth user
          const { data: authData, error: authFnError } = await supabase.functions.invoke('create-auth-user', {
            body: {
              email: manager.email,
              password: tempPassword,
              metadata: {
                role: manager.role || 'manager',
                department_id: manager.department_id,
                display_name: manager.name
              }
            }
          });
          
          if (authFnError) {
            console.error(`Failed to create auth user for ${manager.email}:`, authFnError);
          } else {
            console.log(`Successfully created auth user for ${manager.email}`);
          }
        } catch (err) {
          console.error(`Error creating auth user for ${manager.email}:`, err);
        }
      }
      
      // Run fix inconsistencies again to link newly created users
      const { data: secondFixData } = await callRPC<any>('fix_user_manager_inconsistencies', {});
      
      // Combine the results
      const combinedData = {
        ...data,
        additional_users_processed: managersWithoutAuthUsers.data.length,
        total_fixed: (data?.managers_updated || 0) + (secondFixData?.managers_updated || 0)
      };
      
      console.log('Combined fix results:', combinedData);
      return formatCrudResult(combinedData, null);
    }
    
    console.log('Fixed inconsistencies result:', data);
    return formatCrudResult(data, null);
  } catch (error) {
    console.error('Exception in fixAuthManagerInconsistencies:', error);
    return formatCrudResult(null, error);
  }
};

// Helper function to get managers without associated auth users
const getManagersWithoutAuthUsers = async (): Promise<CrudResult<Manager[]>> => {
  try {
    const { data: allManagers, error } = await supabase
      .from('managers')
      .select('*')
      .is('user_id', null);
      
    if (error) {
      throw error;
    }
    
    return formatCrudResult(allManagers, null);
  } catch (error) {
    console.error('Error fetching managers without auth users:', error);
    return formatCrudResult(null, error);
  }
};
