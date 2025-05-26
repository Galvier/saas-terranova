
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Department, createDepartment, updateDepartment } from '@/integrations/supabase';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DepartmentEditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  department: Department | null;
}

export const DepartmentEditDialog: React.FC<DepartmentEditDialogProps> = ({
  isOpen,
  onOpenChange,
  onSuccess,
  department
}) => {
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [isActive, setIsActive] = React.useState(true);
  const [isEditing, setIsEditing] = React.useState(false);
  const { toast } = useToast();

  // Reset form when department changes
  React.useEffect(() => {
    if (department) {
      setName(department.name);
      setDescription(department.description || '');
      setIsActive(department.is_active);
    } else {
      // Default values for new department
      setName('');
      setDescription('');
      setIsActive(true);
    }
  }, [department]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(true);

    try {
      if (department) {
        // Update existing department
        const result = await updateDepartment(
          department.id,
          name,
          description,
          isActive
        );
        
        if (result.error) {
          throw new Error(result.message);
        }

        toast({
          title: "Setor atualizado",
          description: `${name} foi atualizado com sucesso.`
        });
      } else {
        // Create new department
        const result = await createDepartment(
          name,
          description,
          isActive
        );
        
        if (result.error) {
          throw new Error(result.message);
        }

        toast({
          title: "Setor criado",
          description: `${name} foi criado com sucesso.`
        });
      }

      onSuccess();
    } catch (error: any) {
      toast({
        title: department ? "Erro ao atualizar setor" : "Erro ao criar setor",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsEditing(false);
    }
  };

  const isNewDepartment = !department;
  const title = isNewDepartment ? 'Criar Novo Setor' : 'Editar Setor';
  const buttonText = isNewDepartment ? 'Criar Setor' : 'Salvar Alterações';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form className="space-y-4 py-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Setor <span className="text-destructive">*</span></Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Ex: Marketing" 
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea 
              id="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Descrição do setor" 
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch checked={isActive} onCheckedChange={setIsActive} id="is-active" />
            <Label htmlFor="is-active">Ativo</Label>
          </div>

          <DialogFooter className="pt-4">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isEditing}>
              {isEditing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                buttonText
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DepartmentEditDialog;
