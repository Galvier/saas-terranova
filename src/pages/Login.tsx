
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import AppLogo from '@/components/AppLogo';
import { Loader2, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { authService } from '@/services/authService';
import { testSupabaseConnection } from '@/integrations/supabase/supabaseClient';

interface LocationState {
  email?: string;
  from?: string;
}

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isCheckingConnection, setIsCheckingConnection] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<boolean | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Configuração inicial - verifica conexão e sessão
  useEffect(() => {
    const initialize = async () => {
      setIsCheckingConnection(true);
      
      try {
        // Verifica a conexão com o Supabase
        const connected = await testSupabaseConnection();
        setConnectionStatus(connected);
        
        if (!connected) {
          toast({
            title: "Erro de conexão",
            description: "Não foi possível conectar ao banco de dados. Tente novamente mais tarde.",
            variant: "destructive"
          });
          setIsCheckingConnection(false);
          return;
        }
        
        // Verifica se há uma sessão ativa
        const { session } = await authService.getSession();
        
        if (session) {
          // Se já temos uma sessão, redirecionamos para o dashboard
          console.log('Sessão ativa encontrada, redirecionando...');
          navigate('/dashboard');
          return;
        }
        
        // Finaliza a verificação
        setIsCheckingConnection(false);
      } catch (error) {
        console.error('Erro ao inicializar:', error);
        setConnectionStatus(false);
        setIsCheckingConnection(false);
        toast({
          title: "Erro de inicialização",
          description: "Falha ao conectar com o servidor. Verifique sua conexão.",
          variant: "destructive"
        });
      }
    };
    
    initialize();
  }, [navigate, toast]);

  // Recupera email da navegação (se vindo de primeiro acesso)
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
    
    try {
      // Tenta fazer login usando o serviço de autenticação
      const result = await authService.loginUser({
        email,
        password
      });
      
      if (result.status === 'error') {
        setIsLoading(false);
        toast({
          title: "Erro no login",
          description: result.message,
          variant: "destructive"
        });
        return;
      }
      
      setIsLoading(false);
      
      // Prepara redirecionamento
      const state = location.state as LocationState;
      const redirectTo = state?.from || '/dashboard';
      
      // Cria navegação shallow para prevenir botão de voltar retornando ao login
      navigate(redirectTo, { replace: true });
      
    } catch (error: any) {
      setIsLoading(false);
      
      toast({
        title: "Erro no login",
        description: error.message || "Por favor, verifique suas credenciais",
        variant: "destructive"
      });
    }
  };

  if (isCheckingConnection) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Verificando conexão...</p>
      </div>
    </div>;
  }

  if (connectionStatus === false) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center max-w-md text-center p-4">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-bold mb-2">Erro de conexão</h2>
        <p className="text-muted-foreground mb-6">
          Não foi possível conectar ao banco de dados. Verifique sua conexão e tente novamente.
        </p>
        <Button 
          onClick={() => window.location.reload()}
          variant="outline"
        >
          Tentar novamente
        </Button>
      </div>
    </div>;
  }

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
                        description: "Funcionalidade em desenvolvimento"
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
      </div>
    </div>
  );
};

export default Login;
