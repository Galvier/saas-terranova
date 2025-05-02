
import { useEffect, useState } from 'react';

export const useInitialDepartment = (
  isAdmin: boolean,
  userDepartmentId: string | null | undefined
) => {
  const [selectedDepartment, setSelectedDepartment] = useState<string>(isAdmin ? "all" : userDepartmentId || "");
  
  // Set initial department
  useEffect(() => {
    if (userDepartmentId && !isAdmin) {
      setSelectedDepartment(userDepartmentId);
    }
  }, [userDepartmentId, isAdmin]);
  
  return {
    selectedDepartment,
    setSelectedDepartment
  };
};
