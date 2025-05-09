
import { supabase } from './client';
import { formatCrudResult } from './core';
import type { Department } from './types/department';

export type GetDepartmentsResult = {
  data: Department[] | null;
  error: Error | null;
  message?: string;
};

export const getAllDepartments = async (): Promise<GetDepartmentsResult> => {
  try {
    const { data, error } = await supabase.rpc('get_all_departments');
    
    return {
      data: data as Department[],
      error: error,
      message: error ? error.message : undefined
    };
  } catch (error: any) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
      message: error instanceof Error ? error.message : String(error)
    };
  }
};

export const createDepartment = async (
  name: string,
  description: string,
  is_active: boolean = true,
  manager_id: string | null = null
) => {
  try {
    const { data, error } = await supabase.rpc('create_department', {
      department_name: name,
      department_description: description,
      department_is_active: is_active,
      department_manager_id: manager_id
    });
    
    return formatCrudResult(data, error);
  } catch (error: any) {
    return formatCrudResult(null, error);
  }
};

export const updateDepartment = async (
  id: string,
  name: string,
  description: string,
  is_active: boolean = true,
  manager_id: string | null = null
) => {
  try {
    const { data, error } = await supabase
      .from('departments')
      .update({
        name,
        description,
        is_active,
        manager_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
    
    return formatCrudResult(data, error);
  } catch (error: any) {
    return formatCrudResult(null, error);
  }
};

export const deleteDepartment = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('departments')
      .delete()
      .eq('id', id);
    
    return formatCrudResult(data, error);
  } catch (error: any) {
    return formatCrudResult(null, error);
  }
};
