
import React from 'react';
import { useMetricsContext } from '@/contexts/MetricsContext';
import UserProfileIndicator from '@/components/UserProfileIndicator';
import DateFilter from '@/components/filters/DateFilter';

const MetricsFilters = () => {
  const { 
    selectedDepartment,
    departmentName,
    selectedDate,
    dateRangeType,
    setSelectedDate,
    setDateRangeType
  } = useMetricsContext();

  return (
    <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
      <UserProfileIndicator 
        selectedDepartment={selectedDepartment}
        departmentName={departmentName}
      />
      
      <DateFilter
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        dateRangeType={dateRangeType}
        onDateRangeTypeChange={setDateRangeType}
        className="w-full sm:w-auto"
      />
    </div>
  );
};

export default MetricsFilters;
