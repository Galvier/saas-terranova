import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { Manager } from '@/integrations/supabase/types/manager';
import { Department } from '@/integrations/supabase/types/department';
import { getCurrentUserManager, getManagerById, getAllManagers } from '@/integrations/supabase/managers';
import { getAllDepartments } from '@/integrations/supabase/departments';
import { useToast } from './use-toast';

export interface UseManagerDataReturn {
  manager: Manager | null;
  userDepartmentId: string | null;
  isAdmin: boolean;
  isLoading: boolean;
  // Adicionando os campos que faltavam para ManagersUpdate.tsx
  departments: Department[];
  isSaving: boolean;
  fetchManager: (id: string) => Promise<void>;
  fetchDepartments: () => Promise<void>;
  handleUpdateManager: (manager: Partial<Manager>) => Promise<boolean>;
}

export const useManagerData = (
  userIdentifier: User | string | null,
  dependencies: any[] = []
): UseManagerDataReturn => {
  const [manager, setManager] = useState<Manager | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [userDepartmentId, setUserDepartmentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const { toast } = useToast();

  // Determinar se o usuário é um administrador com base nos metadados ou na função de gerente
  const isAdmin = userIdentifier && 
    (typeof userIdentifier === 'object' && 
    userIdentifier?.user_metadata?.role === 'admin') || 
    manager?.role === 'admin';

  // Function to fetch a manager specific by ID
  const fetchManager = async (id: string): Promise<void> => {
    setIsLoading(true);
    try {
      const { data, error } = await getManagerById(id);
      if (error) {
        console.error('[ManagerData] Erro ao buscar gerente:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do gerente",
          variant: "destructive"
        });
        return;
      }
      
      if (data) {
        console.log('[ManagerData] Dados do gerente encontrados:', data);
        setManager(data);
        if (data.department_id) {
          setUserDepartmentId(data.department_id);
        }
      } else {
        console.error('[ManagerData] Gerente não encontrado');
        setManager(null);
      }
    } catch (error) {
      console.error('[ManagerData] Erro inesperado:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch all departments
  const fetchDepartments = async (): Promise<void> => {
    try {
      const { data, error } = await getAllDepartments();
      if (error) {
        console.error('[ManagerData] Erro ao buscar departamentos:', error);
        return;
      }
      
      setDepartments(data || []);
    } catch (error) {
      console.error('[ManagerData] Erro ao buscar departamentos:', error);
    }
  };

  // Function to update a manager
  const handleUpdateManager = async (managerData: Partial<Manager>): Promise<boolean> => {
    if (!manager?.id) return false;
    
    setIsSaving(true);
    try {
      const { error } = await updateManager(manager.id, {
        name: managerData.name || manager.name,
        email: managerData.email || manager.email,
        department_id: managerData.department_id || manager.department_id || '',
        is_active: typeof managerData.is_active !== 'undefined' ? managerData.is_active : manager.is_active,
        role: managerData.role
      });

      if (error) {
        console.error('[ManagerData] Erro ao atualizar gerente:', error);
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o gerente",
          variant: "destructive"
        });
        return false;
      }
      
      toast({
        title: "Sucesso",
        description: "Gerente atualizado com sucesso"
      });
      return true;
    } catch (error) {
      console.error('[ManagerData] Erro inesperado ao atualizar gerente:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar o gerente"
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Effect to load manager data when user is provided
  useEffect(() => {
    const fetchManagerData = async () => {
      if (!userIdentifier) {
        setManager(null);
        setUserDepartmentId(null);
        return;
      }
      
      setIsLoading(true);
      try {
        console.log('[ManagerData] Buscando dados do gerente');
        
        // If userIdentifier is an object User, fetch the current manager
        if (typeof userIdentifier === 'object') {
          const result = await getCurrentUserManager();
          
          if (result.error) {
            console.error('[ManagerData] Erro ao buscar dados do gerente:', result.error);
            return;
          }
          
          if (result.data) {
            console.log('[ManagerData] Dados do gerente encontrados:', result.data);
            setManager(result.data);
            if (result.data.department_id) {
              setUserDepartmentId(result.data.department_id);
            }
          } else {
            console.log('[ManagerData] Nenhum registro de gerente encontrado para este usuário');
            setManager(null);
          }
        } 
        // If it's a string, assume it's a manager ID
        else if (typeof userIdentifier === 'string') {
          await fetchManager(userIdentifier);
        }
      } catch (error) {
        console.error('[ManagerData] Erro ao buscar dados do gerente:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Use setTimeout to avoid deadlock with auth state change
    setTimeout(() => {
      fetchManagerData();
    }, 0);
  }, [userIdentifier, ...dependencies]);

  return {
    manager, 
    userDepartmentId, 
    isAdmin, 
    isLoading,
    departments,
    isSaving,
    fetchManager,
    fetchDepartments,
    handleUpdateManager 
  };
};

// Import for updateManager
import { updateManager } from '@/integrations/supabase/managers';
