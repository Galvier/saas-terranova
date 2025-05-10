
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { MoreVertical, Pencil, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Department } from '@/integrations/supabase';
import { useToast } from '@/hooks/use-toast';
import { deleteDepartment } from '@/integrations/supabase/departments';

interface DepartmentActionsProps {
  department: Department;
  onEdit: (department: Department) => void;
  onDeleted: () => void;
}

export const DepartmentActions = ({ department, onEdit, onDeleted }: DepartmentActionsProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const { error } = await deleteDepartment(department.id);
      
      if (error) {
        toast({
          title: "Erro ao excluir setor",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Setor excluído",
        description: `O setor "${department.name}" foi excluído com sucesso.`,
      });
      onDeleted();
    } catch (error) {
      console.error('Error deleting department:', error);
      toast({
        title: "Erro ao excluir setor",
        description: "Ocorreu um erro ao tentar excluir o setor.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menu</span>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(department)} className="cursor-pointer">
          <Pencil className="mr-2 h-4 w-4" />
          <span>Editar</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={handleDelete} 
          className="cursor-pointer text-destructive focus:text-destructive"
          disabled={isDeleting}
        >
          <Trash className="mr-2 h-4 w-4" />
          <span>{isDeleting ? 'Excluindo...' : 'Excluir'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DepartmentActions;
