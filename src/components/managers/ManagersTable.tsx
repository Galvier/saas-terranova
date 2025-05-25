
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CustomBadge } from '@/components/ui/custom-badge';
import { Edit, MoreHorizontal, Trash2, Eye, RefreshCcw, AlertCircle, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { CreateAuthDialog } from './CreateAuthDialog';
import { createAuthForManager } from '@/integrations/supabase/managers';
import type { Manager } from '@/integrations/supabase';

interface ManagersTableProps {
  managers: Manager[];
  isLoading: boolean;
  onDeleteManager: (manager: Manager) => void;
  isAdmin: boolean;
  onRefreshData: () => void;
}

export const ManagersTable = ({ 
  managers, 
  isLoading, 
  onDeleteManager, 
  isAdmin,
  onRefreshData
}: ManagersTableProps) => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [createAuthDialog, setCreateAuthDialog] = useState<{
    isOpen: boolean;
    manager: Manager | null;
  }>({ isOpen: false, manager: null });

  const handleEditManager = (id: string) => {
    if (isAdmin) {
      navigate(`/managers/edit/${id}`);
    } else {
      // For non-admins, just view the manager details
      navigate(`/managers/edit/${id}`);
    }
  };

  const handleSyncUserData = async () => {
    try {
      await refreshUser();
      toast({
        title: "Dados sincronizados",
        description: "Suas permissões foram atualizadas"
      });
    } catch (error) {
      console.error("Erro ao sincronizar dados:", error);
      toast({
        title: "Erro na sincronização",
        description: "Não foi possível atualizar seus dados",
        variant: "destructive"
      });
    }
  };

  const handleCreateAuth = async (managerId: string, password: string): Promise<boolean> => {
    try {
      const result = await createAuthForManager(managerId, password);
      
      if (result.error) {
        throw new Error(result.message);
      }
      
      return true;
    } catch (error: any) {
      console.error('Erro ao criar conta de auth:', error);
      throw error;
    }
  };

  const handleCreateAuthClick = (manager: Manager) => {
    setCreateAuthDialog({
      isOpen: true,
      manager
    });
  };

  const handleCreateAuthSuccess = () => {
    // Refresh the data to show updated sync status
    onRefreshData();
  };

  // Check if current user's email is in the managers list
  const currentUserEmail = user?.email?.toLowerCase();
  const currentUserManager = managers.find(m => m.email?.toLowerCase() === currentUserEmail);
  
  // Check for any mismatch between auth metadata and manager role
  const userMetadataRole = user?.user_metadata?.role;
  const hasRoleMismatch = currentUserManager && userMetadataRole !== currentUserManager.role;

  return (
    <>
      {hasRoleMismatch && (
        <div className="mb-4 p-4 border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 rounded-md">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between">
            <div>
              <h3 className="text-sm font-medium text-amber-800 dark:text-amber-300">Atualização de permissões detectada</h3>
              <p className="text-sm text-amber-700 dark:text-amber-400">
                Sua função no banco é "{currentUserManager.role}", mas seus metadados mostram "{userMetadataRole}".
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleSyncUserData} className="flex items-center gap-1 self-start sm:self-center">
              <RefreshCcw className="h-3.5 w-3.5" />
              Sincronizar dados
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Departamento</TableHead>
              <TableHead>Função</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Conta</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6">
                  Carregando gestores...
                </TableCell>
              </TableRow>
            ) : managers.length > 0 ? (
              managers.map((manager) => {
                const hasAuthUser = !!manager.user_id;
                
                return (
                  <TableRow key={manager.id} className={manager.email?.toLowerCase() === currentUserEmail ? "bg-primary/5" : undefined}>
                    <TableCell className="font-medium">{manager.name}</TableCell>
                    <TableCell>{manager.email}</TableCell>
                    <TableCell>{manager.department_name || 'Não definido'}</TableCell>
                    <TableCell>
                      <span className="flex items-center">
                        {manager.role || 'Gestor'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <CustomBadge variant={manager.is_active ? "success" : "secondary"}>
                        {manager.is_active ? 'Ativo' : 'Inativo'}
                      </CustomBadge>
                    </TableCell>
                    <TableCell>
                      {hasAuthUser ? (
                        <CustomBadge variant="default">Sincronizada</CustomBadge>
                      ) : (
                        <div className="flex items-center gap-1">
                          <CustomBadge variant="destructive">Não sincronizada</CustomBadge>
                          <AlertCircle className="h-4 w-4 text-amber-500" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {isAdmin ? (
                            <>
                              <DropdownMenuItem onClick={() => handleEditManager(manager.id)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              {!hasAuthUser && (
                                <DropdownMenuItem onClick={() => handleCreateAuthClick(manager)}>
                                  <UserPlus className="mr-2 h-4 w-4" />
                                  Criar conta de acesso
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                onClick={() => onDeleteManager(manager)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir
                              </DropdownMenuItem>
                            </>
                          ) : (
                            <DropdownMenuItem onClick={() => handleEditManager(manager.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Visualizar
                            </DropdownMenuItem>
                          )}
                          {manager.email?.toLowerCase() === currentUserEmail && (
                            <DropdownMenuItem onClick={handleSyncUserData}>
                              <RefreshCcw className="mr-2 h-4 w-4" />
                              Sincronizar dados
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                  Nenhum gestor encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <CreateAuthDialog
        isOpen={createAuthDialog.isOpen}
        onOpenChange={(open) => setCreateAuthDialog({ isOpen: open, manager: null })}
        manager={createAuthDialog.manager}
        onSuccess={handleCreateAuthSuccess}
        onCreateAuth={handleCreateAuth}
      />
    </>
  );
};
