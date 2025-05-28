
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
    <div className="space-y-4">
      {/* Main header row - stacked on mobile, side-by-side on desktop */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center w-full lg:w-auto">
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
        
        {/* Admin controls - stack on mobile, row on larger screens */}
        {isAdmin && (
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onOpenMetricSelection}
              className="flex items-center gap-2 justify-center sm:justify-start"
            >
              <Settings className="h-4 w-4" />
              <span className="sm:hidden md:inline">Configurar</span>
              <span className="hidden sm:inline md:hidden">Config</span>
              <span className="hidden md:inline">dashboard</span>
            </Button>
            
            <DashboardToggle 
              viewMode={viewMode}
              onViewModeChange={onViewModeChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardHeader;
