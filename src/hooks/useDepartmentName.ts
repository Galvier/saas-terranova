
import { useEffect, useState } from 'react';
import { Department } from '@/integrations/supabase';

export const useDepartmentName = (
  selectedDepartment: string, 
  departments: Department[]
) => {
  const [departmentName, setDepartmentName] = useState<string>("");
  
  // Set department name when department is selected
  useEffect(() => {
    if (selectedDepartment === 'all') {
      setDepartmentName("Todos os departamentos");
    } else {
      const dept = departments.find(d => d.id === selectedDepartment);
      setDepartmentName(dept?.name || "");
    }
  }, [selectedDepartment, departments]);
  
  return departmentName;
};
