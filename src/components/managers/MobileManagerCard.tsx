
import React from 'react';
import { Button } from '@/components/ui/button';
import { CustomBadge } from '@/components/ui/custom-badge';
import { Edit, MoreHorizontal, Trash2, RefreshCcw, UserPlus, AlertCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Manager } from '@/integrations/supabase';

interface MobileManagerCardProps {
  manager: Manager;
  isAdmin: boolean;
  isCurrentUser: boolean;
  hasAuthUser: boolean;
  isFixingInconsistencies: boolean;
  onEdit: (id: string) => void;
  onDelete: (manager: Manager) => void;
  onCreateAuth: (manager: Manager) => void;
  onSyncData: () => void;
}

export const MobileManagerCard: React.FC<MobileManagerCardProps> = ({
  manager,
  isAdmin,
  isCurrentUser,
  hasAuthUser,
  isFixingInconsistencies,
  onEdit,
  onDelete,
  onCreateAuth,
  onSyncData,
}) => {
  return (
    <div className={`bg-card p-4 rounded-lg border shadow-sm ${isCurrentUser ? "bg-primary/5 border-primary/20" : ""}`}>
      {/* Header with name and actions */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base truncate">{manager.name}</h3>
          <p className="text-sm text-muted-foreground truncate">{manager.email}</p>
        </div>
        {(isAdmin || isCurrentUser) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 ml-2 flex-shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {isAdmin && (
                <>
                  <DropdownMenuItem onClick={() => onEdit(manager.id)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                  {!hasAuthUser && (
                    <DropdownMenuItem onClick={() => onCreateAuth(manager)}>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Criar conta de acesso
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem 
                    onClick={() => onDelete(manager)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </DropdownMenuItem>
                </>
              )}
              {isCurrentUser && (
                <DropdownMenuItem onClick={onSyncData}>
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Sincronizar dados
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Department and Role */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">DEPARTAMENTO</span>
          <span className="text-sm">{manager.department_name || 'Não definido'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">FUNÇÃO</span>
          <span className="text-sm">{manager.role || 'Gestor'}</span>
        </div>
      </div>

      {/* Status and Account badges */}
      <div className="flex items-center justify-between pt-3 border-t">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">STATUS:</span>
            <CustomBadge variant={manager.is_active ? "success" : "secondary"} className="text-xs">
              {manager.is_active ? 'Ativo' : 'Inativo'}
            </CustomBadge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">CONTA:</span>
            {isFixingInconsistencies ? (
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 animate-spin rounded-full border border-muted-foreground border-t-transparent" />
                <span className="text-xs text-muted-foreground">Verificando...</span>
              </div>
            ) : hasAuthUser ? (
              <CustomBadge variant="default" className="text-xs">Sincronizada</CustomBadge>
            ) : (
              <div className="flex items-center gap-1">
                <CustomBadge variant="destructive" className="text-xs">Não sincronizada</CustomBadge>
                <AlertCircle className="h-3 w-3 text-amber-500" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
