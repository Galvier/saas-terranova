
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
    const { data, error } = await callRPC<Manager>('create_manager', manager);
    return formatCrudResult(data, error);
  } catch (error) {
    console.error('Error creating manager:', error);
    return formatCrudResult(null, error);
  }
};

// Function to update a manager
export const updateManager = async (
  id: string,
  manager: { 
    name: string; 
    email: string; 
    department_id: string;
    is_active: boolean;
  }
): Promise<CrudResult<Manager>> => {
  try {
    const { data, error } = await callRPC<Manager>('update_manager', {
      manager_id: id,
      ...manager
    });
    return formatCrudResult(data, error);
  } catch (error) {
    console.error('Error updating manager:', error);
    return formatCrudResult(null, error);
  }
};

// Function to delete a manager
export const deleteManager = async (id: string): Promise<CrudResult<Manager>> => {
  try {
    const { data, error } = await callRPC<Manager>('delete_manager', { manager_id: id });
    return formatCrudResult(data, error);
  } catch (error) {
    console.error('Error deleting manager:', error);
    return formatCrudResult(null, error);
  }
};
