
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getAllDepartments, createDepartment, updateDepartment } from '@/integrations/supabase/departments';
import { supabase } from '@/integrations/supabase/client';
import { Department } from '@/integrations/supabase';
import { DepartmentsTable } from '@/components/departments/DepartmentsTable';
import { DepartmentEditDialog } from '@/components/departments/DepartmentEditDialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const DepartmentsPage = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  // Fetch departments on component mount
  useEffect(() => {
    fetchDepartments();
  }, []);

  // Set up real-time subscription
  useEffect(() => {
    // Subscribe to changes in the managers and departments tables
    const managersChannel = supabase
      .channel('departments-managers-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'managers' }, 
        () => {
          console.log('Manager changed, refreshing departments');
          fetchDepartments();
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'departments' }, 
        () => {
          console.log('Department changed, refreshing departments');
          fetchDepartments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(managersChannel);
    };
  }, []);

  const fetchDepartments = async () => {
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
  };

  const handleCreateDepartment = () => {
    setSelectedDepartment(null);
    setIsEditDialogOpen(true);
  };

  const handleEditDepartment = (department: Department) => {
    setSelectedDepartment(department);
    setIsEditDialogOpen(true);
  };

  const handleSaveDepartment = async (formValues: { name: string, description: string, is_active: boolean, manager_id?: string | null }) => {
    setIsProcessing(true);
    try {
      // Transformar "null" string em valor null real
      const managerId = formValues.manager_id === "null" ? null : formValues.manager_id;
      
      if (selectedDepartment) {
        // Update existing department
        const { error } = await updateDepartment(
          selectedDepartment.id,
          formValues.name,
          formValues.description,
          formValues.is_active,
          managerId
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
          managerId
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
  };

  return (
    <div className="container mx-auto py-10 space-y-6 animate-fade-in">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Setores</h1>
          <p className="text-muted-foreground">
            Gerencie os setores da sua organização
          </p>
        </div>
        <Button onClick={handleCreateDepartment}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Setor
        </Button>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <p>Carregando setores...</p>
        </div>
      ) : (
        <DepartmentsTable 
          departments={departments} 
          onEditDepartment={handleEditDepartment}
          onDeletedDepartment={fetchDepartments}
        />
      )}

      <DepartmentEditDialog 
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleSaveDepartment}
        department={selectedDepartment}
        isEditing={isProcessing}
      />
    </div>
  );
};

export default DepartmentsPage;
