
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Eye, EyeOff, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Manager } from '@/integrations/supabase';

interface CreateAuthDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  manager: Manager | null;
  onSuccess: () => void;
  onCreateAuth: (managerId: string, password: string) => Promise<boolean>;
}

export const CreateAuthDialog = ({
  isOpen,
  onOpenChange,
  manager,
  onSuccess,
  onCreateAuth
}: CreateAuthDialogProps) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let newPassword = '';
    
    // Garantir pelo menos um de cada tipo
    newPassword += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    newPassword += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    newPassword += '0123456789'[Math.floor(Math.random() * 10)];
    newPassword += '!@#$%^&*()'[Math.floor(Math.random() * 10)];
    
    // Adicionar mais caracteres aleatórios
    for (let i = 0; i < 8; i++) {
      newPassword += chars[Math.floor(Math.random() * chars.length)];
    }
    
    // Embaralhar
    newPassword = newPassword.split('').sort(() => 0.5 - Math.random()).join('');
    
    setPassword(newPassword);
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(password);
    toast({
      title: "Senha copiada",
      description: "A senha foi copiada para a área de transferência"
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!manager || !password) {
      toast({
        title: "Erro",
        description: "Manager ou senha não definidos",
        variant: "destructive"
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 8 caracteres",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    
    try {
      const success = await onCreateAuth(manager.id, password);
      
      if (success) {
        toast({
          title: "Conta criada",
          description: `Conta de autenticação criada para ${manager.name}`,
        });
        onSuccess();
        onOpenChange(false);
        setPassword('');
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar conta de autenticação",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  if (!manager) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Conta de Autenticação</DialogTitle>
          <DialogDescription>
            Criar conta de acesso ao sistema para <strong>{manager.name}</strong> ({manager.email})
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email de login</Label>
            <Input 
              id="email"
              type="email" 
              value={manager.email} 
              disabled 
              className="bg-muted"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Senha temporária</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={generatePassword}
                className="text-xs h-7"
              >
                Gerar senha
              </Button>
            </div>
            
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite ou gere uma senha"
                required
                minLength={8}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                {password && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={copyPassword}
                    className="h-7 w-7 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                  className="h-7 w-7 p-0"
                >
                  {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </Button>
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground">
              A senha deve ter pelo menos 8 caracteres. O usuário poderá alterá-la após o primeiro login.
            </p>
          </div>
        </form>
        
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isCreating}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isCreating || !password || password.length < 8}
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando...
              </>
            ) : (
              'Criar Conta'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
