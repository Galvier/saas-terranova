
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
    // Use the SQL function get_all_departments
    const { data, error } = await supabase.rpc('get_all_departments');
    
    if (error) {
      console.error("Error fetching departments:", error);
      return {
        data: null,
        error: error,
        message: error.message
      };
    }
    
    // Transform the results to ensure all fields are present
    const transformedData = data?.map(dept => ({
      id: dept.id,
      name: dept.name,
      description: dept.description || null,
      is_active: dept.is_active || true,
      manager_id: dept.manager_id || null,
      created_at: dept.created_at,
      updated_at: dept.updated_at,
      manager_name: dept.manager_name || null
    }));
    
    console.log("Fetched departments:", transformedData);
    
    return {
      data: transformedData as Department[],
      error: null,
      message: undefined
    };
  } catch (error: any) {
    console.error("Exception in getAllDepartments:", error);
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
    // Usar a função SQL create_department com SECURITY DEFINER
    const { data, error } = await supabase.rpc('create_department', {
      department_name: name,
      department_description: description,
      department_is_active: is_active,
      department_manager_id: manager_id
    });
    
    if (error) {
      console.error("Error creating department:", error);
    } else {
      console.log("Department created successfully:", data);
    }
    
    return formatCrudResult(data, error);
  } catch (error: any) {
    console.error("Exception in createDepartment:", error);
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
