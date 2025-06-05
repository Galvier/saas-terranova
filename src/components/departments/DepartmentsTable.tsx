
import React from 'react';
import { Check, X, MoreHorizontal, Eye, Star } from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Department } from '@/integrations/supabase';

interface DepartmentsTableProps {
  departments: Department[];
  onEdit: (department: Department) => void;
  onDelete: (department: Department) => void;
  isAdmin?: boolean;
}

const DepartmentsTable: React.FC<DepartmentsTableProps> = ({
  departments,
  onEdit,
  onDelete,
  isAdmin = false,
}) => {
  console.log('[DepartmentsTable] Rendering with isAdmin:', isAdmin);

  const renderManagers = (department: Department) => {
    if (!department.managers || department.managers.length === 0) {
      return <span className="text-muted-foreground">-</span>;
    }

    return (
      <div className="space-y-1">
        {department.managers.map((manager) => (
          <div key={manager.id} className="flex items-center gap-1">
            <span className="text-sm">{manager.name}</span>
            {manager.is_primary && (
              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" title="Gestor Primário" />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Gestores</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {departments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Nenhum setor encontrado.
                </TableCell>
              </TableRow>
            ) : (
              departments.map((department) => (
                <TableRow key={department.id}>
                  <TableCell className="font-medium">{department.name}</TableCell>
                  <TableCell>{department.description}</TableCell>
                  <TableCell>
                    {renderManagers(department)}
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell className="text-right">
                    {isAdmin ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(department)}>
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDelete(department)}>
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <div className="flex justify-end">
                        <Button variant="ghost" size="sm" className="h-8 px-3 text-muted-foreground cursor-default">
                          <Eye className="mr-1 h-3.5 w-3.5" />
                          Visualizar
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DepartmentsTable;
