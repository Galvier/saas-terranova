
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
import { Edit, MoreHorizontal, Trash2, RefreshCcw, AlertCircle, UserPlus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { CreateAuthDialog } from './CreateAuthDialog';
import { MobileManagerCard } from './MobileManagerCard';
import { createAuthForManager } from '@/integrations/supabase/managers';
import { translateRole } from '@/utils/roleTranslations';
import type { Manager } from '@/integrations/supabase';

interface ManagersTableProps {
  managers: Manager[];
  isLoading: boolean;
  onDeleteManager: (manager: Manager) => void;
  isAdmin: boolean;
  onRefreshData: () => void;
  isFixingInconsistencies?: boolean;
}

export const ManagersTable = ({ 
  managers, 
  isLoading, 
  onDeleteManager, 
  isAdmin,
  onRefreshData,
  isFixingInconsistencies = false
}: ManagersTableProps) => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [createAuthDialog, setCreateAuthDialog] = useState<{
    isOpen: boolean;
    manager: Manager | null;
  }>({ isOpen: false, manager: null });

  const handleEditManager = (id: string) => {
    // Apenas admins podem editar gestores
    if (isAdmin) {
      navigate(`/managers/edit/${id}`);
    } else {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para editar gestores",
        variant: "destructive"
      });
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
    if (!isAdmin) {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para criar contas de acesso",
        variant: "destructive"
      });
      return;
    }
    setCreateAuthDialog({
      isOpen: true,
      manager
    });
  };

  const handleCreateAuthSuccess = () => {
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
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-amber-800 dark:text-amber-300">Atualização de permissões detectada</h3>
              <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                Sua função no banco é "{translateRole(currentUserManager.role)}", mas seus metadados mostram "{translateRole(userMetadataRole)}".
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSyncUserData} 
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <RefreshCcw className="h-3.5 w-3.5" />
              Sincronizar dados
            </Button>
          </div>
        </div>
      )}

      {/* Mensagem informativa para gestores não-admin */}
      {!isAdmin && (
        <div className="mb-4 p-4 border border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 rounded-md">
          <p className="text-sm text-blue-700 dark:text-blue-400">
            <strong>Visualização somente leitura:</strong> Como gestor, você pode visualizar a lista de gestores mas não pode realizar edições, criações ou exclusões. Entre em contato com um administrador para alterações.
          </p>
        </div>
      )}

      {/* Mobile Cards - visible only on small screens */}
      <div className="md:hidden space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm text-muted-foreground">Carregando gestores...</span>
            </div>
          </div>
        ) : managers.length > 0 ? (
          managers.map((manager) => {
            const hasAuthUser = !!manager.user_id;
            const isCurrentUser = manager.email?.toLowerCase() === currentUserEmail;
            
            return (
              <MobileManagerCard
                key={manager.id}
                manager={manager}
                isAdmin={isAdmin}
                isCurrentUser={isCurrentUser}
                hasAuthUser={hasAuthUser}
                isFixingInconsistencies={isFixingInconsistencies}
                onEdit={handleEditManager}
                onDelete={onDeleteManager}
                onCreateAuth={handleCreateAuthClick}
                onSyncData={handleSyncUserData}
              />
            );
          })
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">Nenhum gestor encontrado</p>
          </div>
        )}
      </div>

      {/* Desktop Table - hidden on small screens */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Departamento</TableHead>
              <TableHead>Função</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Conta</TableHead>
              {(isAdmin || currentUserManager) && <TableHead className="text-right">Ações</TableHead>}
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
                // Debug log for each manager
                console.log(`[ManagersTable] ${manager.name}: user_id=${manager.user_id}`);
                
                const hasAuthUser = !!manager.user_id;
                const isCurrentUser = manager.email?.toLowerCase() === currentUserEmail;
                
                return (
                  <TableRow key={manager.id} className={isCurrentUser ? "bg-primary/5" : undefined}>
                    <TableCell className="font-medium">{manager.name}</TableCell>
                    <TableCell>{manager.email}</TableCell>
                    <TableCell>{manager.department_name || 'Não definido'}</TableCell>
                    <TableCell>
                      <span className="flex items-center">
                        {translateRole(manager.role)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <CustomBadge variant={manager.is_active ? "success" : "secondary"}>
                        {manager.is_active ? 'Ativo' : 'Inativo'}
                      </CustomBadge>
                    </TableCell>
                    <TableCell>
                      {isFixingInconsistencies ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm text-muted-foreground">Verificando...</span>
                        </div>
                      ) : hasAuthUser ? (
                        <CustomBadge variant="default">Sincronizada</CustomBadge>
                      ) : (
                        <div className="flex items-center gap-1">
                          <CustomBadge variant="destructive">Não sincronizada</CustomBadge>
                          <AlertCircle className="h-4 w-4 text-amber-500" />
                        </div>
                      )}
                    </TableCell>
                    {(isAdmin || isCurrentUser) && (
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {isAdmin && (
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
                            )}
                            {isCurrentUser && (
                              <DropdownMenuItem onClick={handleSyncUserData}>
                                <RefreshCcw className="mr-2 h-4 w-4" />
                                Sincronizar dados
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
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

      {isAdmin && (
        <CreateAuthDialog
          isOpen={createAuthDialog.isOpen}
          onOpenChange={(open) => setCreateAuthDialog({ isOpen: open, manager: null })}
          manager={createAuthDialog.manager}
          onSuccess={handleCreateAuthSuccess}
          onCreateAuth={handleCreateAuth}
        />
      )}
    </>
  );
};
