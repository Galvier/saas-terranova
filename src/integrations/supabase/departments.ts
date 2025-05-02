
import { callRPC, formatCrudResult, type CrudResult } from './core';
import type { Department } from './types/department';

export const getAllDepartments = async (): Promise<CrudResult<Department[]>> => {
  try {
    const { data, error } = await callRPC<Department[]>('get_all_departments', {});
    return formatCrudResult(data, error);
  } catch (error) {
    console.error('Error fetching departments:', error);
    return formatCrudResult(null, error);
  }
};

export const createDepartment = async (
  department: { 
    name: string; 
    description: string; 
    is_active: boolean;
    manager_id?: string;
  }
): Promise<CrudResult<Department>> => {
  try {
    const { data, error } = await callRPC<{id: string}>('create_department', {
      department_name: department.name,
      department_description: department.description,
      department_is_active: department.is_active,
      department_manager_id: department.manager_id ?? null
    });

    if (error) throw error;

    // Return the newly created department with basic info
    const newDepartment: Department = {
      id: data?.id || '',
      name: department.name,
      description: department.description,
      is_active: department.is_active,
      manager_id: department.manager_id
    };

    return formatCrudResult(newDepartment, null);
  } catch (error) {
    console.error('Error creating department:', error);
    return formatCrudResult(null, error);
  }
};
