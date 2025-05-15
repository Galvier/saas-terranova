
import React from 'react';
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
import { Edit, MoreHorizontal, Trash2, Eye, RefreshCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import type { Manager } from '@/integrations/supabase';

interface ManagersTableProps {
  managers: Manager[];
  isLoading: boolean;
  onDeleteManager: (manager: Manager) => void;
  isAdmin: boolean;
}

export const ManagersTable = ({ managers, isLoading, onDeleteManager, isAdmin }: ManagersTableProps) => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();

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

  // Check if current user's email is in the managers list with a different role
  const currentUserEmail = user?.email?.toLowerCase();
  const currentUserManager = managers.find(m => m.email.toLowerCase() === currentUserEmail);
  const hasRoleMismatch = currentUserManager && user?.user_metadata?.role !== currentUserManager.role;

  return (
    <>
      {hasRoleMismatch && (
        <div className="mb-4 p-4 border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 rounded-md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-amber-800 dark:text-amber-300">Atualização de permissões detectada</h3>
              <p className="text-sm text-amber-700 dark:text-amber-400">
                Sua função foi alterada para "{currentUserManager.role}", mas seus dados ainda não foram atualizados.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleSyncUserData} className="flex items-center gap-1">
              <RefreshCcw className="h-3.5 w-3.5" />
              Sincronizar
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
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6">
                  Carregando gestores...
                </TableCell>
              </TableRow>
            ) : managers.length > 0 ? (
              managers.map((manager) => (
                <TableRow key={manager.id} className={manager.email.toLowerCase() === currentUserEmail ? "bg-primary/5" : undefined}>
                  <TableCell className="font-medium">{manager.name}</TableCell>
                  <TableCell>{manager.email}</TableCell>
                  <TableCell>{manager.department_name || 'Não definido'}</TableCell>
                  <TableCell>{manager.role || 'Gestor'}</TableCell>
                  <TableCell>
                    <CustomBadge variant={manager.is_active ? "success" : "secondary"}>
                      {manager.is_active ? 'Ativo' : 'Inativo'}
                    </CustomBadge>
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
                        {manager.email.toLowerCase() === currentUserEmail && (
                          <DropdownMenuItem onClick={handleSyncUserData}>
                            <RefreshCcw className="mr-2 h-4 w-4" />
                            Sincronizar dados
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  Nenhum gestor encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
};
