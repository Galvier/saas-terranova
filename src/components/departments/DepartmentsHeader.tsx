
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface DepartmentsHeaderProps {
  onCreateDepartment: () => void;
}

export const DepartmentsHeader: React.FC<DepartmentsHeaderProps> = ({
  onCreateDepartment
}) => {
  return (
    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Setores</h1>
        <p className="text-muted-foreground">
          Gerencie os setores da sua organização
        </p>
      </div>
      <Button onClick={onCreateDepartment}>
        <Plus className="mr-2 h-4 w-4" />
        Novo Setor
      </Button>
    </header>
  );
};
