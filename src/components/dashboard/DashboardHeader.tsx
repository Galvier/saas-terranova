
import React from 'react';
import { Calendar, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/PageHeader';
import DateFilter from '@/components/filters/DateFilter';
import DepartmentFilter from '@/components/filters/DepartmentFilter';
import { Department } from '@/integrations/supabase';
import { DateRangeType } from '@/components/filters/DateFilter';
import { useIsMobile } from '@/hooks/use-mobile';

interface DashboardHeaderProps {
  departments: Department[];
  selectedDepartment: string;
  setSelectedDepartment: (value: string) => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  dateRangeType: DateRangeType;
  setDateRangeType: (type: DateRangeType) => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  departments,
  selectedDepartment,
  setSelectedDepartment,
  selectedDate,
  setSelectedDate,
  dateRangeType,
  setDateRangeType,
  onRefresh,
  isRefreshing = false,
}) => {
  const isMobile = useIsMobile();

  return (
    <div className="mobile-container">
      <PageHeader 
        title="Dashboard" 
        subtitle="Visão geral das métricas e desempenho"
      />
      
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <DepartmentFilter 
            departments={departments}
            selectedDepartment={selectedDepartment}
            onDepartmentChange={setSelectedDepartment}
            className="w-full sm:w-[280px]"
          />
          
          <DateFilter
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            dateRangeType={dateRangeType}
            onDateRangeTypeChange={setDateRangeType}
            className="w-full sm:w-auto"
          />
        </div>
        
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            size={isMobile ? "default" : "sm"}
            onClick={onRefresh}
            disabled={isRefreshing}
            className={`flex items-center gap-2 ${isMobile ? 'w-full mobile-touch' : ''}`}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
