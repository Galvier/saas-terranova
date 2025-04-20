
// Removido Supabase: agora login funciona localmente apenas para demonstração.

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import AppLogo from '@/components/AppLogo';
import { Loader2, Eye, EyeOff, AlertTriangle } from 'lucide-react';

interface LocationState {
  email?: string;
  from?: string;
}

const MOCK_USERS = [
  { email: 'admin@teste.com', password: 'senha123' },
  { email: 'usuario@teste.com', password: 'senha123' }
];

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<boolean | null>(true); // Sempre true
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Sem checagem de conexão
    setIsCheckingConnection(false);
  }, []);

  useEffect(() => {
    const state = location.state as LocationState;
    if (state?.email) {
      setEmail(state.email);
      toast({
        title: "Configuração concluída",
        description: "Use as credenciais criadas para fazer login",
      });
    }
  }, [location.state, toast]);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      const found = MOCK_USERS.find(u => u.email === email && u.password === password);
      setIsLoading(false);

      if (!found) {
        toast({
          title: "Erro no login",
          description: "E-mail ou senha inválidos (Use admin@teste.com/senha123 ou usuario@teste.com/senha123)",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Login de demonstração bem-sucedido!",
        description: `Bem-vindo, ${email}!`
      });

      navigate('/dashboard', { replace: true });
    }, 800);
  };

  // Nenhum carregamento ou erro de conexão, apenas renderiza o form sempre!
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <AppLogo />
        </div>
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Entrar</CardTitle>
            <CardDescription>
              Entre com suas credenciais para acessar o sistema
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nome@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  <a 
                    href="#" 
                    className="text-sm text-primary underline-offset-4 hover:underline"
                    onClick={(e) => {
                      e.preventDefault();
                      toast({
                        title: "Recuperação de senha",
                        description: "Funcionalidade em demonstração"
                      });
                    }}
                  >
                    Esqueceu a senha?
                  </a>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="pr-10"
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
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-3">
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : 'Entrar'}
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                <span>Primeiro acesso? </span>
                <a 
                  href="/primeiro-acesso" 
                  className="text-primary hover:underline"
                >
                  Criar conta administrativa
                </a>
              </div>
            </CardFooter>
          </form>
        </Card>
        <div className="mt-4 text-xs text-muted-foreground">
          <b>Usuários de demonstração:</b>
          <ul>
            <li>admin@teste.com / senha123</li>
            <li>usuario@teste.com / senha123</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Login;

