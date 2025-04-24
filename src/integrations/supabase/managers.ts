
import { callRPC, formatCrudResult, type CrudResult } from './core';
import type { Manager } from './types/manager';

// Function to get all active managers
export const getAllManagers = async (): Promise<CrudResult<Manager[]>> => {
  try {
    const { data, error } = await callRPC<Manager[]>('get_all_managers');
    return formatCrudResult(data, error);
  } catch (error) {
    console.error('Error fetching managers:', error);
    return formatCrudResult(null, error);
  }
};

// Function to create a new manager
export const createManager = async (
  manager: { 
    name: string; 
    email: string; 
    department_id: string;
    is_active: boolean;
  }
): Promise<CrudResult<Manager>> => {
  try {
    // For now, we'll use a dummy implementation as the RPC function is not implemented yet
    // This will be replaced with an actual RPC call once the backend is ready
    console.log("Creating manager:", manager);
    
    // Create a dummy success response
    const newManager: Manager = {
      id: crypto.randomUUID(),
      name: manager.name,
      email: manager.email,
      department_id: manager.department_id,
      is_active: manager.is_active,
      created_at: new Date().toISOString()
    };

    return formatCrudResult(newManager, null);
  } catch (error) {
    console.error('Error creating manager:', error);
    return formatCrudResult(null, error);
  }
};
