
import React from 'react';
import { Settings, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DepartmentFilter from '@/components/filters/DepartmentFilter';
import UserProfileIndicator from '@/components/UserProfileIndicator';
import DashboardToggle from '@/components/dashboard/DashboardToggle';
import { Department } from '@/integrations/supabase';

interface DashboardHeaderProps {
  departments: Department[];
  selectedDepartment: string;
  onDepartmentChange: (departmentId: string) => void;
  departmentName: string;
  isAdmin: boolean;
  viewMode: 'all' | 'favorites';
  onViewModeChange: (mode: 'all' | 'favorites') => void;
  onOpenMetricSelection: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  departments,
  selectedDepartment,
  onDepartmentChange,
  departmentName,
  isAdmin,
  viewMode,
  onViewModeChange,
  onOpenMetricSelection
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center w-full">
        <DepartmentFilter
          departments={departments}
          selectedDepartment={selectedDepartment}
          onDepartmentChange={onDepartmentChange}
          className="w-full sm:w-[280px]"
        />
        
        <UserProfileIndicator 
          selectedDepartment={selectedDepartment}
          departmentName={departmentName}
        />
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:justify-end">
        {isAdmin && (
          <>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onOpenMetricSelection}
              className="flex items-center gap-1"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Configurar dashboard</span>
            </Button>
            
            <DashboardToggle 
              viewMode={viewMode}
              onViewModeChange={onViewModeChange}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardHeader;
