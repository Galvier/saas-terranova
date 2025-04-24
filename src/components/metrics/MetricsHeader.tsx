
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PageHeader from '@/components/PageHeader';
import { Department } from '@/integrations/supabase';

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
      
      <div className="flex justify-between items-center gap-4 mb-6">
        <Select
          value={selectedDepartment}
          onValueChange={setSelectedDepartment}
        >
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Todos os departamentos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os departamentos</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button 
          className="flex items-center gap-2"
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
