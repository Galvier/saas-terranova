
import React from 'react';
import { User, CircleUser, CircleUserRound } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface UserProfileIndicatorProps {
  selectedDepartment: string;
  departmentName?: string;
}

const UserProfileIndicator: React.FC<UserProfileIndicatorProps> = ({ 
  selectedDepartment,
  departmentName
}) => {
  const { user, isAdmin } = useAuth();
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-muted/50 text-sm">
            {isAdmin ? (
              <CircleUserRound className="h-4 w-4 text-primary" />
            ) : (
              <CircleUser className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="hidden sm:inline">
              {isAdmin ? 'Administrador' : 'Gestor'}
            </span>
            
            {selectedDepartment && selectedDepartment !== 'all' && (
              <>
                <span className="hidden sm:inline mx-1 text-muted-foreground">|</span>
                <Badge variant="outline" className="bg-primary/10">
                  {departmentName || selectedDepartment}
                </Badge>
              </>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {isAdmin 
              ? 'Perfil de Administrador: Acesso a todos os departamentos' 
              : 'Perfil de Gestor: Acesso limitado ao seu departamento'}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default UserProfileIndicator;
