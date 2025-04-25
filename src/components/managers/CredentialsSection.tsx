
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import PasswordInput from './PasswordInput';
import AccessLevelSelect from './AccessLevelSelect';

interface CredentialsSectionProps {
  isEdit?: boolean;
  hasCredentials?: boolean;
  setHasCredentials?: (value: boolean) => void;
  email?: string;
  password?: string;
  confirmPassword?: string;
  accessLevel?: string;
  setPassword?: (value: string) => void;
  setConfirmPassword?: (value: string) => void;
  setAccessLevel?: (value: string) => void;
}

const CredentialsSection = ({
  isEdit = false,
  hasCredentials = false,
  setHasCredentials = () => {},
  email = '',
  password = '',
  confirmPassword = '',
  accessLevel = 'viewer',
  setPassword = () => {},
  setConfirmPassword = () => {},
  setAccessLevel = () => {}
}: CredentialsSectionProps) => {
  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let newPassword = '';
    
    newPassword += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    newPassword += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    newPassword += '0123456789'[Math.floor(Math.random() * 10)];
    newPassword += '!@#$%^&*()'[Math.floor(Math.random() * 10)];
    
    for (let i = 0; i < 8; i++) {
      newPassword += chars[Math.floor(Math.random() * chars.length)];
    }
    
    newPassword = newPassword.split('').sort(() => 0.5 - Math.random()).join('');
    
    setPassword(newPassword);
    setConfirmPassword(newPassword);
  };

  return (
    <div className="space-y-4 mt-6">
      <div className="flex items-center gap-2">
        <Lock className="h-4 w-4 text-blue-600" />
        <h3 className="text-lg font-medium">Credenciais de acesso</h3>
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          id="has-credentials"
          checked={hasCredentials}
          onCheckedChange={setHasCredentials}
        />
        <Label htmlFor="has-credentials">
          {isEdit ? 'Resetar senha deste gestor' : 'Criar credenciais de acesso ao sistema'}
        </Label>
      </div>
      
      {hasCredentials && (
        <div className="space-y-4 pl-2 border-l-2 border-primary/20 mt-2">
          {!isEdit && (
            <div className="space-y-2">
              <Label>Email para login</Label>
              <Input 
                type="text" 
                value={email} 
                disabled 
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                O email do gestor será utilizado como login
              </p>
            </div>
          )}
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>
                {isEdit ? 'Nova senha' : 'Senha'}
              </Label>
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
            
            <PasswordInput
              label={isEdit ? 'Nova senha' : 'Senha'}
              value={password}
              onChange={setPassword}
              showStrengthIndicator
            />
            
            <PasswordInput
              label="Confirme a senha"
              value={confirmPassword}
              onChange={setConfirmPassword}
              isConfirmPassword
              confirmValue={password}
            />
          </div>
          
          <AccessLevelSelect
            value={accessLevel}
            onChange={setAccessLevel}
          />
        </div>
      )}
      
      <Separator className="my-2" />
    </div>
  );
};

export default CredentialsSection;

