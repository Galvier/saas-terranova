
import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import PageHeader from '@/components/PageHeader';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAllDepartments, deleteDepartment } from '@/integrations/supabase';
import DepartmentsTable from '@/components/departments/DepartmentsTable';
import { DepartmentEditDialog } from '@/components/departments/DepartmentEditDialog';
import { DeleteDepartmentDialog } from '@/components/departments/DeleteDepartmentDialog';
import type { Department } from '@/integrations/supabase';

const Departments = () => {
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [deletingDepartment, setDeletingDepartment] = useState<Department | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();

  const { data: departments = [], isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const result = await getAllDepartments();
      if (result.error) throw new Error(result.message);
      return result.data || [];
    }
  });

  const handleCreateDepartment = () => {
    if (!isAdmin) return;
    setEditingDepartment(null);
    setIsEditDialogOpen(true);
  };

  const handleEditDepartment = (department: Department) => {
    if (!isAdmin) return;
    setEditingDepartment(department);
    setIsEditDialogOpen(true);
  };

  const handleDeleteDepartment = (department: Department) => {
    if (!isAdmin) return;
    setDeletingDepartment(department);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (deletingDepartment && isAdmin) {
      try {
        const result = await deleteDepartment(deletingDepartment.id);
        if (result.error) {
          throw new Error(result.message);
        }
        
        toast({
          title: "Setor removido",
          description: `${deletingDepartment.name} foi removido com sucesso.`
        });
        
        queryClient.invalidateQueries({ queryKey: ['departments'] });
      } catch (error: any) {
        toast({
          title: "Erro ao remover setor",
          description: error.message,
          variant: "destructive"
        });
      }
      
      setDeletingDepartment(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleDialogSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['departments'] });
    setIsEditDialogOpen(false);
    setEditingDepartment(null);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Setores"
        subtitle="Gerencie os setores da sua organização"
        actionButton={
          isAdmin ? (
            <Button onClick={handleCreateDepartment}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Setor
            </Button>
          ) : undefined
        }
      />

      <DepartmentsTable
        departments={departments}
        onEdit={handleEditDepartment}
        onDelete={handleDeleteDepartment}
        isAdmin={isAdmin}
      />

      {isAdmin && (
        <>
          <DepartmentEditDialog
            department={editingDepartment}
            isOpen={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            onSuccess={handleDialogSuccess}
          />

          <DeleteDepartmentDialog
            department={deletingDepartment}
            isOpen={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            onConfirm={confirmDelete}
          />
        </>
      )}
    </div>
  );
};

export default Departments;
