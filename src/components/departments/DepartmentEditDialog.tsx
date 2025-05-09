
import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Department } from '@/integrations/supabase';

interface DepartmentFormValues {
  name: string;
  description: string;
  is_active: boolean;
}

interface DepartmentEditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (values: DepartmentFormValues) => Promise<void>;
  department: Department | null;
  isEditing: boolean;
}

export const DepartmentEditDialog = ({
  isOpen,
  onOpenChange,
  onSave,
  department,
  isEditing
}: DepartmentEditDialogProps) => {
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<DepartmentFormValues>();
  const [isActive, setIsActive] = useState(true);

  // Reset form when department changes
  useEffect(() => {
    if (department) {
      setValue('name', department.name);
      setValue('description', department.description || '');
      setIsActive(department.is_active || true);
    } else {
      reset({
        name: '',
        description: '',
      });
      setIsActive(true);
    }
  }, [department, reset, setValue]);

  const onSubmit = async (data: DepartmentFormValues) => {
    await onSave({
      ...data,
      is_active: isActive
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{department ? 'Editar Setor' : 'Novo Setor'}</DialogTitle>
          <DialogDescription>
            {department 
              ? 'Atualize as informações do setor abaixo.' 
              : 'Preencha as informações para criar um novo setor.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Setor</Label>
            <Input
              id="name"
              placeholder="Digite o nome do setor"
              {...register('name', { required: true })}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-red-500 text-xs italic">Nome é obrigatório</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Digite uma descrição para o setor"
              {...register('description')}
              rows={3}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_active"
              checked={isActive}
              onCheckedChange={(checked) => setIsActive(checked as boolean)}
            />
            <Label htmlFor="is_active" className="cursor-pointer">
              Setor ativo
            </Label>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isEditing}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isEditing}>
              {isEditing ? "Salvando..." : department ? "Salvar Alterações" : "Criar Setor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DepartmentEditDialog;
