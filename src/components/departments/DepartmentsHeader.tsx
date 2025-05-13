
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

interface DepartmentsHeaderProps {
  onCreateDepartment: () => void;
}

export const DepartmentsHeader: React.FC<DepartmentsHeaderProps> = ({
  onCreateDepartment
}) => {
  return (
    <PageHeader
      title="Setores"
      subtitle="Gerencie os setores da sua organização"
      actionButton={
        <Button onClick={onCreateDepartment}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo Setor
        </Button>
      }
    />
  );
};
