
import React from 'react';
import { MoreHorizontal, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Manager } from '@/integrations/supabase';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileManagerCard from './MobileManagerCard';

interface ManagersTableProps {
  managers: Manager[];
  onEdit: (manager: Manager) => void;
  onDelete: (manager: Manager) => void;
  onTogglePassword: (manager: Manager) => void;
  onChangePassword: (manager: Manager) => void;
}

const ManagersTable: React.FC<ManagersTableProps> = ({
  managers,
  onEdit,
  onDelete,
  onTogglePassword,
  onChangePassword,
}) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="mobile-container space-y-4">
        {managers.map((manager) => (
          <MobileManagerCard
            key={manager.id}
            manager={manager}
            onEdit={onEdit}
            onDelete={onDelete}
            onTogglePassword={onTogglePassword}
            onChangePassword={onChangePassword}
          />
        ))}
      </div>
    );
  }

  const getAccessLevelBadge = (accessLevel: string) => {
    const variants = {
      'admin': 'destructive',
      'manager': 'default',
      'viewer': 'secondary'
    } as const;
    
    const labels = {
      'admin': 'Administrador',
      'manager': 'Gestor',
      'viewer': 'Visualizador'
    };

    return (
      <Badge variant={variants[accessLevel as keyof typeof variants] || 'secondary'}>
        {labels[accessLevel as keyof typeof labels] || accessLevel}
      </Badge>
    );
  };

  return (
    <div className="rounded-md border overflow-hidden">
      <div className="table-responsive">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="hidden sm:table-cell">Email</TableHead>
              <TableHead className="hidden md:table-cell">Departamento</TableHead>
              <TableHead className="hidden lg:table-cell">Nível de Acesso</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {managers.map((manager) => (
              <TableRow key={manager.id}>
                <TableCell className="font-medium">
                  <div>
                    <div>{manager.name}</div>
                    <div className="sm:hidden text-xs text-muted-foreground">
                      {manager.email}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">{manager.email}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {manager.department?.name || 'Sem departamento'}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {getAccessLevelBadge(manager.access_level)}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Ações</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onEdit(manager)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onChangePassword(manager)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Alterar Senha
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onTogglePassword(manager)}>
                        {manager.show_password ? (
                          <>
                            <EyeOff className="mr-2 h-4 w-4" />
                            Ocultar Senha
                          </>
                        ) : (
                          <>
                            <Eye className="mr-2 h-4 w-4" />
                            Mostrar Senha
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDelete(manager)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ManagersTable;
