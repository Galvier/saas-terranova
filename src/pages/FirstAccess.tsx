
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { authCredentials } from '@/services/auth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { PasswordStrength } from '@/components/auth/PasswordStrength';

const FirstAccess = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const { toast } = useToast();
  const navigate = useNavigate();

  // Calculate password strength when password changes
  const calculatePasswordStrength = (password: string) => {
    let score = 0;
    
    // Length check
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    
    // Complexity checks
    if (/[A-Z]/.test(password)) score += 1; // Has uppercase
    if (/[a-z]/.test(password)) score += 1; // Has lowercase
    if (/[0-9]/.test(password)) score += 1; // Has number
    if (/[^A-Za-z0-9]/.test(password)) score += 1; // Has special char
    
    return Math.min(5, score);
  };

  // Handle password change and update strength
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordStrength(calculatePasswordStrength(newPassword));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password) {
      toast({
        title: 'Erro ao registrar',
        description: 'Por favor, preencha todos os campos.',
        variant: 'destructive',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Senhas não conferem',
        description: 'As senhas digitadas não são iguais.',
        variant: 'destructive',
      });
      return;
    }

    if (passwordStrength < 3) {
      toast({
        title: 'Senha fraca',
        description: 'Por favor, escolha uma senha mais forte.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      
      const result = await authCredentials.register({
        email: email,
        password: password,
        name: name,
        role: 'admin'
      });

      if (result.error) {
        toast({
          title: 'Erro ao registrar',
          description: result.error.message,
          variant: 'destructive',
        });
      } else {
        setSuccessMessage('Registro realizado com sucesso!');
        
        toast({
          title: 'Registro bem-sucedido',
          description: 'Seu acesso foi criado com sucesso.',
        });
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      toast({
        title: 'Erro inesperado',
        description: 'Ocorreu um erro ao tentar registrar o usuário.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Form success view
  if (successMessage) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 pb-6 text-center">
            <div className="rounded-full bg-green-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="h-8 w-8 text-green-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-green-700 mb-2">{successMessage}</h3>
            <p className="text-muted-foreground mb-4">
              Redirecionando para a página de login em instantes...
            </p>
            <div className="flex justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Criar Acesso Administrativo</CardTitle>
          <CardDescription>
            Crie o primeiro usuário administrador do sistema.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                placeholder="Digite seu nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
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
                onChange={(e) => setEmail(e.target.value)}
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
                  onChange={handlePasswordChange}
                  required
                  className="pr-10"
                  minLength={8}
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
                required
                minLength={8}
              />
              {password && confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-500 mt-1">As senhas não conferem</p>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-2">
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
            <Button 
              type="button" 
              variant="outline" 
              className="w-full mt-2"
              onClick={() => navigate('/login')}
              disabled={isLoading}
            >
              Voltar para login
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default FirstAccess;
