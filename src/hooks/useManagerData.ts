
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Manager } from '@/integrations/supabase/types/manager';
import { Department } from '@/integrations/supabase/types/department';
import { getManagerById, updateManager } from '@/integrations/supabase/managers';
import { getAllDepartments } from '@/integrations/supabase/departments';

export const useManagerData = (managerId: string | undefined) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [manager, setManager] = useState<Manager | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const { toast } = useToast();

  const fetchManager = async (id: string) => {
    setIsLoading(true);
    try {
      console.log("Fetching manager with ID:", id);
      const result = await getManagerById(id);
      
      if (result.error) {
        throw new Error(result.message || "Error fetching manager data");
      }

      if (result.data) {
        console.log("Manager data received:", result.data);
        setManager(result.data);
        return result.data;
      } else {
        toast({
          title: "Erro",
          description: "Gestor não encontrado",
          variant: "destructive",
        });
        return null;
      }
    } catch (error: any) {
      console.error("Error fetching manager:", error);
      toast({
        title: "Erro ao carregar gerente",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const result = await getAllDepartments();

      if (result.error) {
        throw new Error(result.message || "Error fetching departments");
      }

      if (result.data) {
        setDepartments(result.data);
      }
    } catch (error: any) {
      toast({
        title: "Erro ao carregar departamentos",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUpdateManager = async (values: {
    name: string;
    email: string;
    department_id: string;
    is_active: boolean;
  }) => {
    if (!managerId) return;
    
    setIsSaving(true);
    try {
      const result = await updateManager(managerId, values);

      if (result.error) {
        throw new Error(result.message || "Error updating manager");
      }

      toast({
        title: "Gerente atualizado",
        description: "Gerente atualizado com sucesso.",
      });
      return true;
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar gerente",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isLoading,
    isSaving,
    manager,
    departments,
    fetchManager,
    fetchDepartments,
    handleUpdateManager
  };
};
