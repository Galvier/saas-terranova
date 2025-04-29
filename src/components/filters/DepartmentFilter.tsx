
import React, { useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Department } from '@/integrations/supabase';
import { useAuth } from '@/hooks/useAuth';

interface DepartmentFilterProps {
  departments: Department[];
  selectedDepartment: string;
  onDepartmentChange: (departmentId: string) => void;
  className?: string;
}

const DepartmentFilter: React.FC<DepartmentFilterProps> = ({
  departments,
  selectedDepartment,
  onDepartmentChange,
  className = ''
}) => {
  const { user, isAdmin } = useAuth();
  
  // Filter manager's departments when not admin
  const userDepartment = React.useMemo(() => {
    if (!isAdmin && departments.length > 0) {
      // Find department of the current user (if they're a manager)
      return departments.find(dept => dept.manager_id === user?.id)?.id || 'all';
    }
    return null;
  }, [departments, isAdmin, user]);
  
  // Use localStorage to persist user preference
  useEffect(() => {
    try {
      const savedDepartment = localStorage.getItem('selectedDepartment');
      if (savedDepartment) {
        // Only apply saved preference if user is admin or it's their department
        if (isAdmin || savedDepartment === userDepartment) {
          onDepartmentChange(savedDepartment);
        }
      } else if (userDepartment) {
        // Default to user's department if they're a manager
        onDepartmentChange(userDepartment);
      }
    } catch (error) {
      console.error("Error loading saved department preference:", error);
    }
  }, [userDepartment, isAdmin]);
  
  // Save preference whenever it changes
  useEffect(() => {
    try {
      if (selectedDepartment) {
        localStorage.setItem('selectedDepartment', selectedDepartment);
      }
    } catch (error) {
      console.error("Error saving department preference:", error);
    }
  }, [selectedDepartment]);

  return (
    <Select
      value={selectedDepartment}
      onValueChange={onDepartmentChange}
      disabled={!isAdmin && userDepartment !== null}
    >
      <SelectTrigger className={`w-full ${className}`}>
        <SelectValue placeholder="Selecione um departamento" />
      </SelectTrigger>
      <SelectContent>
        {/* Only show "All departments" for admins */}
        {isAdmin && <SelectItem value="all">Todos os departamentos</SelectItem>}
        
        {departments.map((dept) => {
          // For non-admins, only show their department
          if (!isAdmin && dept.id !== userDepartment) return null;
          
          return (
            <SelectItem key={dept.id} value={dept.id}>
              {dept.name}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};

export default DepartmentFilter;
