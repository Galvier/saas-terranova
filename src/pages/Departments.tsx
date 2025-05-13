
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
    isProcessing,
    setIsEditDialogOpen,
    handleCreateDepartment,
    handleEditDepartment,
    handleSaveDepartment,
    fetchDepartments
  } = useDepartmentsData();

  return (
    <div className="container mx-auto py-10 space-y-6 animate-fade-in">
      <DepartmentsHeader 
        onCreateDepartment={handleCreateDepartment} 
      />

      <DepartmentsContent
        isLoading={isLoading}
        departments={departments}
        onEditDepartment={handleEditDepartment}
        onDeletedDepartment={fetchDepartments}
      />

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
