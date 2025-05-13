
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { getAllDepartments, createDepartment, Department } from '@/integrations/supabase';
import { useRealTimeSubscription } from '@/hooks/useRealTimeSubscription';

export const useDepartmentsData = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const { toast } = useToast();

  // Use react-query to fetch departments
  const {
    data: departments = [],
    refetch,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const result = await getAllDepartments();
      if (result.error) {
        throw new Error(result.message);
      }
      return result.data || [];
    },
  });

  // Set up real-time subscription for departments and managers tables
  const { isSubscribed } = useRealTimeSubscription({
    tables: ['departments', 'managers'],
    onData: () => {
      console.log('Real-time update received, refetching departments...');
      refetch();
    },
  });

  console.log('Departments data:', departments);
  console.log('Real-time subscription active:', isSubscribed);

  // Dialog handlers
  const handleCloseCreateDialog = () => {
    setIsCreateDialogOpen(false);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setSelectedDepartment(null);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setSelectedDepartment(null);
  };

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
    toast({
      title: 'Setor criado',
      description: 'O setor foi criado com sucesso.',
    });
    refetch();
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setSelectedDepartment(null);
    toast({
      title: 'Setor atualizado',
      description: 'O setor foi atualizado com sucesso.',
    });
    refetch();
  };

  const handleDeleteSuccess = () => {
    setIsDeleteDialogOpen(false);
    setSelectedDepartment(null);
    toast({
      title: 'Setor excluído',
      description: 'O setor foi excluído com sucesso.',
    });
    refetch();
  };

  // Department action handlers
  const handleDepartmentCreate = () => {
    setIsCreateDialogOpen(true);
  };

  const handleDepartmentEdit = (department: Department) => {
    setSelectedDepartment(department);
    setIsEditDialogOpen(true);
  };

  const handleDepartmentDelete = (department: Department) => {
    setSelectedDepartment(department);
    setIsDeleteDialogOpen(true);
  };

  return {
    departments,
    isLoading,
    isError,
    isSubscribed,
    selectedDepartment,
    isCreateDialogOpen,
    isEditDialogOpen,
    isDeleteDialogOpen,
    handleDepartmentCreate,
    handleDepartmentEdit,
    handleDepartmentDelete,
    handleCloseCreateDialog,
    handleCloseEditDialog,
    handleCloseDeleteDialog,
    handleCreateSuccess,
    handleEditSuccess,
    handleDeleteSuccess,
    refetch
  };
};
