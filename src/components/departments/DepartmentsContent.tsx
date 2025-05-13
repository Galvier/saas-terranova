
import React from 'react';
import { Department } from '@/integrations/supabase';
import DepartmentsTable from '@/components/departments/DepartmentsTable';

interface DepartmentsContentProps {
  isLoading: boolean;
  departments: Department[];
  onEditDepartment: (department: Department) => void;
  onDeletedDepartment: () => void;
}

export const DepartmentsContent: React.FC<DepartmentsContentProps> = ({
  isLoading,
  departments,
  onEditDepartment,
  onDeletedDepartment
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <p>Carregando setores...</p>
      </div>
    );
  }

  return (
    <DepartmentsTable 
      departments={departments} 
      onEdit={onEditDepartment}
      onDelete={onDeletedDepartment}
    />
  );
};
