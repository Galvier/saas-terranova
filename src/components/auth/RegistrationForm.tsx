
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Loader2, Check, Eye, EyeOff } from 'lucide-react';
import { PasswordStrength } from './PasswordStrength';

interface RegistrationFormProps {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  passwordStrength: number;
  showPassword: boolean;
  isLoading: boolean;
  successMessage: string;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onToggleShowPassword: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  name,
  email,
  password,
  confirmPassword,
  passwordStrength,
  showPassword,
  isLoading,
  successMessage,
  onNameChange,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onToggleShowPassword,
  onSubmit,
}) => {
  if (successMessage) {
    return (
      <CardContent className="pt-4 pb-6 text-center">
        <div className="rounded-full bg-green-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-medium text-green-700 mb-2">{successMessage}</h3>
        <p className="text-muted-foreground mb-4">
          Redirecionando para a página de login em instantes...
        </p>
        <div className="flex justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      </CardContent>
    );
  }

  return (
    <form onSubmit={onSubmit}>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome completo</Label>
          <Input
            id="name"
            placeholder="Digite seu nome completo"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email corporativo</Label>
          <Input
            id="email"
            type="email"
            placeholder="seu.email@empresa.com"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              required
              className="pr-10"
              minLength={8}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-1 text-muted-foreground"
              onClick={onToggleShowPassword}
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
            onChange={(e) => onConfirmPasswordChange(e.target.value)}
            required
            minLength={8}
          />
          {password && confirmPassword && password !== confirmPassword && (
            <p className="text-xs text-red-500 mt-1">As senhas não conferem</p>
          )}
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Criando administrador...
            </>
          ) : (
            'Criar conta administrativa'
          )}
        </Button>
      </CardFooter>
    </form>
  );
};
