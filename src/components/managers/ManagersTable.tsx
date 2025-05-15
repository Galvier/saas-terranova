
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
import { Edit, MoreHorizontal, Trash2, Eye } from 'lucide-react';
import type { Manager } from '@/integrations/supabase';

interface ManagersTableProps {
  managers: Manager[];
  isLoading: boolean;
  onDeleteManager: (manager: Manager) => void;
  isAdmin: boolean;
}

export const ManagersTable = ({ managers, isLoading, onDeleteManager, isAdmin }: ManagersTableProps) => {
  const navigate = useNavigate();

  const handleEditManager = (id: string) => {
    if (isAdmin) {
      navigate(`/managers/edit/${id}`);
    } else {
      // For non-admins, just view the manager details
      navigate(`/managers/edit/${id}`);
    }
  };

  return (
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
              <TableRow key={manager.id}>
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
  );
};
