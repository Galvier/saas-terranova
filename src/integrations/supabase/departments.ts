
import { supabase } from './client';
import { formatCrudResult } from './core';
import type { Department, DepartmentManager } from './types/department';

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
    
    // Transform the results to ensure all fields are present and properly typed
    const transformedData = data?.map(dept => ({
      id: dept.id,
      name: dept.name,
      description: dept.description || null,
      is_active: dept.is_active || true,
      manager_id: dept.manager_id || null,
      created_at: dept.created_at,
      updated_at: dept.updated_at,
      manager_name: dept.manager_name || null,
      managers: Array.isArray(dept.managers) ? dept.managers.map((manager: any) => ({
        id: manager.id,
        name: manager.name,
        email: manager.email,
        is_primary: manager.is_primary
      } as DepartmentManager)) : []
    }));
    
    console.log("Fetched departments with multiple managers data:", transformedData);
    
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
  manager_ids: string[] = [],
  primary_manager_id: string | null = null
) => {
  try {
    console.log(`Creating department with managers:`, manager_ids);
    
    // Use the SQL function create_department with multiple managers support
    const { data, error } = await supabase.rpc('create_department', {
      department_name: name,
      department_description: description,
      department_is_active: is_active,
      department_manager_id: primary_manager_id,
      manager_ids: manager_ids.length > 0 ? manager_ids : null
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
  manager_ids: string[] = [],
  primary_manager_id: string | null = null
) => {
  try {
    console.log(`Updating department ${id} with managers:`, manager_ids);
    
    // First update basic department info
    const { error: updateError } = await supabase
      .from('departments')
      .update({
        name,
        description,
        is_active,
        manager_id: primary_manager_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
    
    if (updateError) {
      console.error("Error updating department basic info:", updateError);
      return formatCrudResult(null, updateError);
    }
    
    // Remove all existing managers
    const { error: deleteError } = await supabase
      .from('department_managers')
      .delete()
      .eq('department_id', id);
    
    if (deleteError) {
      console.error("Error removing existing managers:", deleteError);
      return formatCrudResult(null, deleteError);
    }
    
    // Add new managers if any
    if (manager_ids.length > 0) {
      const managersToInsert = manager_ids.map(managerId => ({
        department_id: id,
        manager_id: managerId,
        is_primary: managerId === primary_manager_id
      }));
      
      const { error: insertError } = await supabase
        .from('department_managers')
        .insert(managersToInsert);
      
      if (insertError) {
        console.error("Error adding new managers:", insertError);
        return formatCrudResult(null, insertError);
      }
    }
    
    console.log("Department updated successfully");
    return formatCrudResult({ id }, null);
  } catch (error: any) {
    console.error("Exception in updateDepartment:", error);
    return formatCrudResult(null, error);
  }
};

export const addManagerToDepartment = async (
  departmentId: string,
  managerId: string,
  isPrimary: boolean = false
) => {
  try {
    const { data, error } = await supabase.rpc('add_manager_to_department', {
      department_id_param: departmentId,
      manager_id_param: managerId,
      is_primary_param: isPrimary
    });
    
    return formatCrudResult(data, error);
  } catch (error: any) {
    return formatCrudResult(null, error);
  }
};

export const removeManagerFromDepartment = async (
  departmentId: string,
  managerId: string
) => {
  try {
    const { data, error } = await supabase.rpc('remove_manager_from_department', {
      department_id_param: departmentId,
      manager_id_param: managerId
    });
    
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
