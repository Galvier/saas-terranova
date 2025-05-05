
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/PageHeader';
import { Department } from '@/integrations/supabase';
import DepartmentFilter from '@/components/filters/DepartmentFilter';

interface MetricsHeaderProps {
  departments: Department[];
  selectedDepartment: string;
  setSelectedDepartment: (value: string) => void;
  setIsCreateDialogOpen: (value: boolean) => void;
}

const MetricsHeader: React.FC<MetricsHeaderProps> = ({
  departments,
  selectedDepartment,
  setSelectedDepartment,
  setIsCreateDialogOpen,
}) => {
  return (
    <>
      <PageHeader 
        title="Métricas" 
        subtitle="Gerencie as métricas de desempenho da empresa"
      />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <DepartmentFilter 
          departments={departments}
          selectedDepartment={selectedDepartment}
          onDepartmentChange={setSelectedDepartment}
          className="w-full sm:w-[280px]"
        />

        <Button 
          className="flex items-center gap-2 w-full sm:w-auto bg-terranova-blue hover:bg-terranova-blue-light"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Nova Métrica
        </Button>
      </div>
    </>
  );
};

export default MetricsHeader;
