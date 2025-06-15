
import React from 'react';
import { Check, X, MoreHorizontal, Edit, Trash2, Eye, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Department } from '@/integrations/supabase';
import { useAuth } from '@/hooks/useAuth';

interface MobileDepartmentCardProps {
  department: Department;
  onEdit: (department: Department) => void;
  onDelete: (department: Department) => void;
}

const MobileDepartmentCard: React.FC<MobileDepartmentCardProps> = ({
  department,
  onEdit,
  onDelete
}) => {
  const { isAdmin } = useAuth();

  const renderManagers = () => {
    if (!department.managers || department.managers.length === 0) {
      return <span className="text-muted-foreground text-sm">Nenhum gestor</span>;
    }

    return (
      <div className="space-y-1">
        {department.managers.map((manager) => (
          <div key={manager.id} className="flex items-center gap-1">
            <span className="text-sm">{manager.name}</span>
            {manager.is_primary && (
              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="mobile-card bg-card border rounded-lg p-4 space-y-3">
      {/* Header com nome e ações */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-medium text-base line-clamp-2">{department.name}</h3>
        </div>
        
        {isAdmin ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(department)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(department)}>
                <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="ghost" size="sm" className="h-8 px-3 text-muted-foreground cursor-default">
            <Eye className="mr-1 h-3.5 w-3.5" />
            Visualizar
          </Button>
        )}
      </div>

      {/* Descrição */}
      {department.description && (
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">Descrição:</span> {department.description}
        </div>
      )}

      {/* Gestores */}
      <div className="space-y-1">
        <div className="text-sm font-medium">Gestores:</div>
        {renderManagers()}
      </div>

      {/* Status */}
      <div className="flex items-center justify-between pt-2 border-t">
        {department.is_active ? (
          <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
            <Check className="mr-1 h-3.5 w-3.5 text-green-700" />
            <span>Ativo</span>
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-rose-50 text-rose-700 hover:bg-rose-50">
            <X className="mr-1 h-3.5 w-3.5 text-rose-700" />
            <span>Inativo</span>
          </Badge>
        )}
      </div>
    </div>
  );
};

export default MobileDepartmentCard;
