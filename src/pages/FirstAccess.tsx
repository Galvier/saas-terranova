
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import AppLogo from '@/components/AppLogo';
import { Loader2, Check, AlertTriangle, Eye, EyeOff, Shield } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const FirstAccess = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [hasUsers, setHasUsers] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Simulação da verificação se já existem usuários
  useEffect(() => {
    const checkForExistingUsers = async () => {
      // Em uma implementação real, isso verificaria o Supabase
      // Aqui vamos simular que não existem usuários inicialmente
      setTimeout(() => {
        setHasUsers(false);
      }, 1000);
    };

    checkForExistingUsers();
  }, []);

  // Redirecionamento se já existirem usuários
  useEffect(() => {
    if (hasUsers) {
      navigate('/login');
    }
  }, [hasUsers, navigate]);

  // Cálculo da força da senha
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    
    // Comprimento mínimo
    if (password.length >= 8) strength += 25;
    
    // Contém letras maiúsculas e minúsculas
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    
    // Contém números
    if (/[0-9]/.test(password)) strength += 25;
    
    // Contém caracteres especiais
    if (/[^a-zA-Z0-9]/.test(password)) strength += 25;
    
    setPasswordStrength(strength);
  }, [password]);

  const getStrengthColor = () => {
    if (passwordStrength < 50) return 'bg-red-500';
    if (passwordStrength < 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (passwordStrength < 50) return 'Fraca';
    if (passwordStrength < 75) return 'Média';
    return 'Forte';
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    if (!name || !email || !password) {
      toast({
        title: "Campos incompletos",
        description: "Todos os campos são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Senhas não conferem",
        description: "A senha e a confirmação precisam ser idênticas",
        variant: "destructive"
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 8 caracteres",
        variant: "destructive"
      });
      return;
    }

    if (passwordStrength < 50) {
      toast({
        title: "Senha fraca",
        description: "Use uma combinação de letras, números e símbolos",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    // Simulação de criação do usuário inicial com Supabase
    setTimeout(() => {
      // Em uma implementação real, isso usaria Supabase
      // supabase.auth.signUp({ email, password })
      //  .then(() => supabase.from('users').insert({...}))
      
      setIsLoading(false);
      setSuccessMessage("Administrador inicial criado com sucesso!");
      
      toast({
        title: "Configuração concluída",
        description: "Usuário administrador criado com sucesso"
      });
      
      // Redireciona para login após 3 segundos
      setTimeout(() => {
        navigate('/login', { 
          state: { email: email } // Passa o email para preencher no login
        });
      }, 3000);
    }, 2000);
  };

  if (hasUsers) {
    return <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <AppLogo />
        </div>
        
        <Card className="border-primary/20 shadow-lg">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle className="text-2xl font-bold">Configuração Inicial</CardTitle>
            </div>
            <CardDescription>
              Configure o primeiro usuário administrador para acessar o sistema
            </CardDescription>
          </CardHeader>
          
          {successMessage ? (
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
          ) : (
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
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pr-10"
                      minLength={8}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-1 text-muted-foreground"
                      onClick={toggleShowPassword}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  
                  {password && (
                    <div className="space-y-1 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Força da senha:</span>
                        <span className={`text-xs font-medium ${
                          passwordStrength < 50 ? 'text-red-500' : 
                          passwordStrength < 75 ? 'text-yellow-500' : 'text-green-500'
                        }`}>
                          {getStrengthText()}
                        </span>
                      </div>
                      <Progress value={passwordStrength} className={getStrengthColor()} />
                      
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="flex items-center gap-1 text-xs">
                          <div className={`h-2 w-2 rounded-full ${password.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <span className={password.length >= 8 ? 'text-green-700' : 'text-muted-foreground'}>
                            Mínimo 8 caracteres
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <div className={`h-2 w-2 rounded-full ${/[A-Z]/.test(password) && /[a-z]/.test(password) ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <span className={/[A-Z]/.test(password) && /[a-z]/.test(password) ? 'text-green-700' : 'text-muted-foreground'}>
                            Maiúsculas e minúsculas
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <div className={`h-2 w-2 rounded-full ${/[0-9]/.test(password) ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <span className={/[0-9]/.test(password) ? 'text-green-700' : 'text-muted-foreground'}>
                            Números
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <div className={`h-2 w-2 rounded-full ${/[^a-zA-Z0-9]/.test(password) ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <span className={/[^a-zA-Z0-9]/.test(password) ? 'text-green-700' : 'text-muted-foreground'}>
                            Símbolos
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
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
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" /> As senhas não conferem
                    </p>
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
          )}
        </Card>
      </div>
    </div>
  );
};

export default FirstAccess;
