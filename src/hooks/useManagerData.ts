
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { Manager } from '@/integrations/supabase/types/manager';
import { getCurrentUserManager } from '@/integrations/supabase/managers';

interface UseManagerDataReturn {
  manager: Manager | null;
  userDepartmentId: string | null;
  isAdmin: boolean;
  isLoading: boolean;
}

export const useManagerData = (
  user: User | null,
  dependencies: any[] = []
): UseManagerDataReturn => {
  const [manager, setManager] = useState<Manager | null>(null);
  const [userDepartmentId, setUserDepartmentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Determinar se o usuário é um administrador com base nos metadados ou na função de gerente
  const isAdmin = user?.user_metadata?.role === 'admin' || manager?.role === 'admin';

  useEffect(() => {
    const fetchManagerData = async () => {
      if (!user) {
        setManager(null);
        setUserDepartmentId(null);
        return;
      }
      
      try {
        setIsLoading(true);
        console.log('[ManagerData] Buscando dados do gerente para o usuário:', user.id);
        
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
      } catch (error) {
        console.error('[ManagerData] Erro ao buscar dados do gerente:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Use setTimeout para evitar deadlock com auth state change
    if (user) {
      setTimeout(() => {
        fetchManagerData();
      }, 0);
    } else {
      setManager(null);
      setUserDepartmentId(null);
    }
  }, [user, ...dependencies]);

  return { manager, userDepartmentId, isAdmin, isLoading: isLoading };
};
