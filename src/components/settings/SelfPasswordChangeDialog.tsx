
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { updateUserPassword } from '@/services/auth/recovery';
import { supabase } from '@/integrations/supabase/client';
import PasswordInput from '@/components/managers/PasswordInput';

interface SelfPasswordChangeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const SelfPasswordChangeDialog: React.FC<SelfPasswordChangeDialogProps> = ({
  isOpen,
  onOpenChange,
  onSuccess
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
        description: "A nova senha deve ter pelo menos 8 caracteres",
        variant: "destructive"
      });
      return;
    }

    if (newPassword === currentPassword) {
      toast({
        title: "Erro",
        description: "A nova senha deve ser diferente da senha atual",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Primeiro, verificar se a senha atual está correta tentando um re-auth
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        throw new Error('Usuário não encontrado');
      }

      // Tentar fazer login com a senha atual para validar
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword
      });

      if (authError) {
        toast({
          title: "Erro",
          description: "Senha atual incorreta",
          variant: "destructive"
        });
        return;
      }

      // Se chegou aqui, a senha atual está correta, então atualizar
      const result = await updateUserPassword(newPassword);
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      toast({
        title: "Sucesso",
        description: "Sua senha foi alterada com sucesso"
      });
      
      onSuccess();
      onOpenChange(false);
      setCurrentPassword('');
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
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Alterar Minha Senha</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <PasswordInput
            label="Senha Atual"
            value={currentPassword}
            onChange={setCurrentPassword}
            placeholder="Digite sua senha atual"
          />

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
              disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
            >
              {isLoading ? 'Alterando...' : 'Alterar Senha'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
