
import { callRPC, formatCrudResult, type CrudResult } from './core';
import { supabase } from './client';
import type { Manager } from './types/manager';
import { authCredentials } from '@/services/auth/credentials';

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
    console.log('[CreateManager] Iniciando criação do gestor:', manager.email);
    
    // Step 1: Create the manager record first
    console.log('[CreateManager] Criando registro do manager');
    const { data: managerData, error: managerError } = await callRPC<any>('create_manager', {
      manager_name: manager.name,
      manager_email: manager.email,
      manager_department_id: manager.department_id,
      manager_is_active: manager.is_active,
      manager_password: manager.password,
      manager_role: manager.role || 'manager'
    });
    
    if (managerError) {
      console.error('[CreateManager] Erro ao criar manager:', managerError);
      return formatCrudResult(null, managerError);
    }
    
    console.log('[CreateManager] Manager criado com sucesso:', managerData);
    
    // Step 2: Create auth user if needed
    if (managerData.auth_creation_needed && manager.password) {
      console.log('[CreateManager] Criando usuário auth com role:', manager.role);
      
      const authResult = await authCredentials.register({
        email: manager.email,
        password: manager.password,
        name: manager.name,
        role: manager.role || 'manager',
        department_id: manager.department_id
      });
      
      if (authResult.error) {
        console.error('[CreateManager] Erro ao criar usuário auth:', authResult.error);
        // Manager foi criado mas falhou a criação do usuário auth
        console.log('[CreateManager] Manager criado mas falhou a criação do usuário auth');
      } else {
        console.log('[CreateManager] Usuário auth criado com sucesso:', authResult.data?.user?.id);
      }
    }
    
    // Step 3: Run fix inconsistencies to ensure proper linking
    console.log('[CreateManager] Executando correção de inconsistências');
    await fixAuthManagerInconsistencies();
    
    // Step 4: Fetch the complete manager data
    const completeManagerResult = await getManagerById(managerData.id);
    
    console.log('[CreateManager] Processo concluído com sucesso');
    return formatCrudResult(completeManagerResult.data, null);
  } catch (error) {
    console.error('[CreateManager] Erro geral na criação:', error);
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

// Enhanced function to fix existing inconsistencies and sync metadata
export const fixAuthManagerInconsistencies = async (): Promise<CrudResult<any>> => {
  try {
    console.log("[FixInconsistencies] Iniciando correção abrangente de inconsistências");
    
    const { data, error } = await callRPC<any>('fix_user_manager_inconsistencies', {});
    
    if (error) {
      console.error('[FixInconsistencies] Erro na correção:', error);
      return formatCrudResult(null, error);
    }
    
    console.log('[FixInconsistencies] Correção concluída:', data);
    return formatCrudResult(data, null);
  } catch (error) {
    console.error('[FixInconsistencies] Erro geral:', error);
    return formatCrudResult(null, error);
  }
};
