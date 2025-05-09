
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getAllDepartments, createDepartment, updateDepartment } from '@/integrations/supabase/departments';
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

  const handleSaveDepartment = async (formValues: { name: string, description: string, is_active: boolean }) => {
    setIsProcessing(true);
    try {
      if (selectedDepartment) {
        // Update existing department
        const { error } = await updateDepartment(
          selectedDepartment.id,
          formValues.name,
          formValues.description,
          formValues.is_active
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
          formValues.is_active
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
      <header className="flex justify-between items-center">
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
