
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getAllDepartments, createDepartment, updateDepartment } from '@/integrations/supabase/departments';
import { Department } from '@/integrations/supabase';
import { useRealTimeSubscription } from './useRealTimeSubscription';

export function useDepartmentsData() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  // Function to fetch departments
  const fetchDepartments = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await getAllDepartments();
      
      if (error) {
        toast({
          title: "Erro ao carregar setores",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      console.log('Departments data fetched:', data);
      setDepartments(data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast({
        title: "Erro ao carregar setores",
        description: "Ocorreu um erro ao carregar os setores.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Set up real-time subscription
  useRealTimeSubscription({
    tables: ['departments', 'managers'],
    onData: fetchDepartments
  });

  // Fetch departments on component mount
  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  // Function to create a new department
  const handleCreateDepartment = useCallback(() => {
    setSelectedDepartment(null);
    setIsEditDialogOpen(true);
  }, []);

  // Function to edit a department
  const handleEditDepartment = useCallback((department: Department) => {
    setSelectedDepartment(department);
    setIsEditDialogOpen(true);
  }, []);

  // Function to save a department
  const handleSaveDepartment = useCallback(async (formValues: { 
    name: string, 
    description: string, 
    is_active: boolean, 
    manager_id?: string | null 
  }) => {
    setIsProcessing(true);
    try {
      if (selectedDepartment) {
        // Update existing department
        const { error } = await updateDepartment(
          selectedDepartment.id,
          formValues.name,
          formValues.description,
          formValues.is_active,
          selectedDepartment.manager_id // Keep the existing manager_id
        );
        
        if (error) {
          toast({
            title: "Erro ao atualizar setor",
            description: error.message,
            variant: "destructive",
          });
          return;
        }
        
        toast({
          title: "Setor atualizado",
          description: `O setor "${formValues.name}" foi atualizado com sucesso.`,
        });
      } else {
        // Create new department
        const { error } = await createDepartment(
          formValues.name,
          formValues.description,
          formValues.is_active,
          null // New departments don't have managers initially
        );
        
        if (error) {
          toast({
            title: "Erro ao criar setor",
            description: error.message,
            variant: "destructive",
          });
          return;
        }
        
        toast({
          title: "Setor criado",
          description: `O setor "${formValues.name}" foi criado com sucesso.`,
        });
      }
      
      // Close dialog and refresh departments
      setIsEditDialogOpen(false);
      fetchDepartments();
    } catch (error) {
      console.error('Error saving department:', error);
      toast({
        title: "Erro ao salvar setor",
        description: "Ocorreu um erro ao salvar o setor.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [selectedDepartment, toast, fetchDepartments]);

  return {
    departments,
    isLoading,
    selectedDepartment,
    isEditDialogOpen,
    isProcessing,
    setIsEditDialogOpen,
    handleCreateDepartment,
    handleEditDepartment,
    handleSaveDepartment,
    fetchDepartments
  };
}
