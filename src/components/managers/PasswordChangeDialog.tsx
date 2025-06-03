
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { updateUserPassword } from '@/services/auth/recovery';
import PasswordInput from '@/components/managers/PasswordInput';
import type { Manager } from '@/integrations/supabase';

interface PasswordChangeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  manager: Manager | null;
  onSuccess: () => void;
}

export const PasswordChangeDialog: React.FC<PasswordChangeDialogProps> = ({
  isOpen,
  onOpenChange,
  manager,
  onSuccess
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!manager) return;
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não conferem",
        variant: "destructive"
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Erro", 
        description: "A senha deve ter pelo menos 8 caracteres",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await updateUserPassword(newPassword);
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      toast({
        title: "Sucesso",
        description: `Senha alterada com sucesso para ${manager.name}`
      });
      
      onSuccess();
      onOpenChange(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast({
        title: "Erro",
        description: `Erro ao alterar senha: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setNewPassword('');
    setConfirmPassword('');
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Alterar Senha</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Gestor:</Label>
            <p className="text-sm text-muted-foreground">
              {manager?.name} ({manager?.email})
            </p>
          </div>

          <PasswordInput
            label="Nova Senha"
            value={newPassword}
            onChange={setNewPassword}
            showStrengthIndicator={true}
            placeholder="Digite a nova senha"
          />

          <PasswordInput
            label="Confirmar Nova Senha"
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="Confirme a nova senha"
            isConfirmPassword={true}
            confirmValue={newPassword}
          />

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !newPassword || !confirmPassword}
            >
              {isLoading ? 'Alterando...' : 'Alterar Senha'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
