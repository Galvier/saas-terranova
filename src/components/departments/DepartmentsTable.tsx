
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Department } from '@/integrations/supabase';
import { Badge } from '@/components/ui/badge';
import { DepartmentActions } from './DepartmentActions';

interface DepartmentsTableProps {
  departments: Department[];
  onEditDepartment: (department: Department) => void;
  onDeletedDepartment: () => void;
}

export const DepartmentsTable = ({ departments = [], onEditDepartment, onDeletedDepartment }: DepartmentsTableProps) => {
  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Nome</TableHead>
            <TableHead className="w-[350px]">Descrição</TableHead>
            <TableHead className="w-[200px]">Gestor</TableHead>
            <TableHead className="w-[100px]">Status</TableHead>
            <TableHead className="w-[80px] text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!departments || departments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                Nenhum setor encontrado
              </TableCell>
            </TableRow>
          ) : (
            departments.map((department) => (
              <TableRow key={department.id}>
                <TableCell className="font-medium">{department.name}</TableCell>
                <TableCell>{department.description || "-"}</TableCell>
                <TableCell>{department.manager_name || "-"}</TableCell>
                <TableCell>
                  {department.is_active ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-50">
                      Ativo
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-50">
                      Inativo
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DepartmentActions 
                    department={department} 
                    onEdit={onEditDepartment}
                    onDeleted={onDeletedDepartment}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default DepartmentsTable;
