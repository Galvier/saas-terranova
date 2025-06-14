
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/PageHeader';

interface DepartmentsHeaderProps {
  onCreateDepartment: () => void;
}

const DepartmentsHeader: React.FC<DepartmentsHeaderProps> = ({
  onCreateDepartment,
}) => {
  return (
    <div className="mobile-container">
      <PageHeader 
        title="Departamentos" 
        subtitle="Gerencie os departamentos da empresa"
      />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="w-full sm:w-auto">
          {/* Espaço para filtros se necessário */}
        </div>
        
        <Button 
          className="flex items-center gap-2 w-full sm:w-auto mobile-touch"
          onClick={onCreateDepartment}
        >
          <Plus className="h-4 w-4" />
          Novo Departamento
        </Button>
      </div>
    </div>
  );
};

export default DepartmentsHeader;
