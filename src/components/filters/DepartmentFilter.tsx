
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
  const { user, isAdmin, userDepartmentId } = useAuth();
  
  // Set initial department based on user role
  useEffect(() => {
    try {
      // Try to load from localStorage if user has a saved preference
      const savedDepartment = localStorage.getItem('selectedDepartment');
      
      if (savedDepartment) {
        // Only apply saved preference if user is admin or it's their department
        if (isAdmin || savedDepartment === userDepartmentId) {
          onDepartmentChange(savedDepartment);
          return;
        }
      }
      
      // If no saved preference or not applicable, use defaults
      if (!isAdmin && userDepartmentId) {
        // Managers default to their department
        onDepartmentChange(userDepartmentId);
      } else if (isAdmin) {
        // Admins default to "all departments"
        onDepartmentChange('all');
      }
    } catch (error) {
      console.error("Error setting initial department:", error);
    }
  }, [isAdmin, userDepartmentId, onDepartmentChange]);
  
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
      disabled={!isAdmin && userDepartmentId !== null}
    >
      <SelectTrigger className={`w-full ${className}`}>
        <SelectValue placeholder="Selecione um departamento" />
      </SelectTrigger>
      <SelectContent>
        {/* Only show "All departments" for admins */}
        {isAdmin && <SelectItem value="all">Todos os departamentos</SelectItem>}
        
        {departments.map((dept) => {
          // For non-admins, only show their department
          if (!isAdmin && dept.id !== userDepartmentId) return null;
          
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
