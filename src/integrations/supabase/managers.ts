
import { callRPC, formatCrudResult, type CrudResult } from './core';
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
    const { data, error } = await callRPC<Manager>('create_manager', {
      manager_name: manager.name,
      manager_email: manager.email,
      manager_department_id: manager.department_id,
      manager_is_active: manager.is_active,
      manager_password: manager.password,
      manager_role: manager.role
    });
    return formatCrudResult(data, error);
  } catch (error) {
    console.error('Error creating manager:', error);
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
    const { data, error } = await callRPC<Manager>('update_manager', {
      manager_id: id,
      manager_name: manager.name,
      manager_email: manager.email,
      manager_department_id: manager.department_id,
      manager_is_active: manager.is_active,
      manager_role: manager.role
    });
    return formatCrudResult(data, error);
  } catch (error) {
    console.error('Error updating manager:', error);
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
    const { data, error } = await callRPC<Manager>('get_manager_by_id', {
      manager_id: id
    });
    console.log("Manager data received:", data);
    return formatCrudResult(data, error);
  } catch (error) {
    console.error('Error fetching manager:', error);
    return formatCrudResult(null, error);
  }
};
