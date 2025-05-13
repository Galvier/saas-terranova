
import React from 'react';
import { useDepartmentsData } from '@/hooks/useDepartmentsData';
import { DepartmentEditDialog } from '@/components/departments/DepartmentEditDialog';
import { DepartmentsHeader } from '@/components/departments/DepartmentsHeader';
import { DepartmentsContent } from '@/components/departments/DepartmentsContent';

const DepartmentsPage = () => {
  const {
    departments,
    isLoading,
    selectedDepartment,
    isEditDialogOpen,
    handleDepartmentCreate,
    handleDepartmentEdit,
    handleCloseEditDialog,
    handleEditSuccess,
    handleCreateSuccess,
    refetch
  } = useDepartmentsData();

  return (
    <div className="container mx-auto py-10 space-y-6 animate-fade-in">
      <DepartmentsHeader 
        onCreateDepartment={handleDepartmentCreate} 
      />

      <DepartmentsContent
        isLoading={isLoading}
        departments={departments}
        onEditDepartment={handleDepartmentEdit}
        onDeletedDepartment={refetch}
      />

      <DepartmentEditDialog 
        isOpen={isEditDialogOpen}
        onOpenChange={handleCloseEditDialog}
        onSave={handleEditSuccess}
        department={selectedDepartment}
        isEditing={false}
      />
    </div>
  );
};

export default DepartmentsPage;
