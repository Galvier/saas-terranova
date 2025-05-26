
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
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();

  console.log('[Departments] Current user isAdmin:', isAdmin);

  const { data: departments = [], isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const result = await getAllDepartments();
      if (result.error) throw new Error(result.message);
      return result.data || [];
    }
  });

  const handleCreateDepartment = () => {
    if (!isAdmin) {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para criar setores",
        variant: "destructive"
      });
      return;
    }
    setEditingDepartment(null);
    setIsEditDialogOpen(true);
  };

  const handleEditDepartment = (department: Department) => {
    if (!isAdmin) {
      toast({
        title: "Acesso negado", 
        description: "Você não tem permissão para editar setores",
        variant: "destructive"
      });
      return;
    }
    setEditingDepartment(department);
    setIsEditDialogOpen(true);
  };

  const handleDeleteDepartment = (department: Department) => {
    if (!isAdmin) {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para excluir setores", 
        variant: "destructive"
      });
      return;
    }
    setDeletingDepartment(department);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (deletingDepartment && isAdmin) {
      setIsDeleting(true);
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
      } finally {
        setIsDeleting(false);
        setDeletingDepartment(null);
        setIsDeleteDialogOpen(false);
      }
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
        subtitle={isAdmin ? "Gerencie os setores da sua organização" : "Visualize os setores da organização"}
        actionButton={
          isAdmin ? (
            <Button onClick={handleCreateDepartment}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Setor
            </Button>
          ) : undefined
        }
      />

      {!isAdmin && (
        <div className="mb-4 p-4 border border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 rounded-md">
          <p className="text-sm text-blue-700 dark:text-blue-400">
            <strong>Visualização somente leitura:</strong> Como gestor, você pode visualizar os setores mas não pode realizar edições, criações ou exclusões. Entre em contato com um administrador para alterações.
          </p>
        </div>
      )}

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
            isDeleting={isDeleting}
          />
        </>
      )}
    </div>
  );
};

export default Departments;
