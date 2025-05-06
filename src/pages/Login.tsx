
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import AppLogo from '@/components/AppLogo';
import { Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface LocationState {
  email?: string;
  from?: string;
}

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { login } = useAuth();

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
    setLoginError(null);

    try {
      const success = await login(email, password);
      
      if (success) {
        // Redirect after successful login
        const state = location.state as LocationState;
        const redirectTo = state?.from || '/dashboard';
        navigate(redirectTo, { replace: true });
      }
    } catch (error: any) {
      console.error("Erro de login não capturado:", error);
      setLoginError(error.message || "Ocorreu um erro inesperado. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <AppLogo />
        </div>
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Entrar</CardTitle>
            <CardDescription className="text-center">
              Entre com suas credenciais para acessar o sistema
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {loginError && (
                <Alert variant="destructive" className="text-sm">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <AlertDescription>{loginError}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nome@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  <button 
                    type="button"
                    className="text-xs text-primary underline-offset-4 hover:underline"
                    onClick={(e) => {
                      e.preventDefault();
                      toast({
                        title: "Recuperação de senha",
                        description: "Funcionalidade em desenvolvimento"
                      });
                    }}
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    minLength={6}
                    className="pr-10 w-full"
                  />
                  <button
                    type="button"
                    className="absolute right-0 top-0 h-full px-3 py-1 text-muted-foreground"
                    onClick={toggleShowPassword}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
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
              
              <div className="flex justify-center w-full mt-4">
                <Link to="/diagnostico" className="text-xs text-primary underline-offset-4 hover:underline">
                  Acessar Diagnóstico do Sistema
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
