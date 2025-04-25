
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PasswordStrength } from '@/components/auth/PasswordStrength';

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
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const calculatePasswordStrength = (password: string) => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 25;
    return strength;
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordStrength(calculatePasswordStrength(newPassword));
  };

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
    setPasswordStrength(calculatePasswordStrength(newPassword));
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
              <Label htmlFor="password">
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
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Digite uma senha segura"
                value={password}
                onChange={handlePasswordChange}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-1 text-muted-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            
            <PasswordStrength password={password} strength={passwordStrength} />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirme a senha</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Digite a senha novamente"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {password && confirmPassword && password !== confirmPassword && (
              <p className="text-xs text-red-500 mt-1">As senhas não conferem</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="accessLevel">Nível de acesso</Label>
            <Select 
              value={accessLevel}
              onValueChange={setAccessLevel}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o nível de acesso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="manager">Gestor</SelectItem>
                <SelectItem value="viewer">Visualizador</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Define as permissões do usuário no sistema
            </p>
          </div>
        </div>
      )}
      
      <Separator className="my-2" />
    </div>
  );
};

export default CredentialsSection;
