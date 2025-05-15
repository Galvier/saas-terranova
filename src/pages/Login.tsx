
import React, { useState, useEffect } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2 } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import ConnectionStatus from '@/components/auth/ConnectionStatus';
import AppLogo from '@/components/AppLogo';
import { supabase } from '@/integrations/supabase/client';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading, isAuthenticated, refreshUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [loginAttempted, setLoginAttempted] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  // Check connection to Supabase on component mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Simple query to check connection
        const { data } = await supabase.rpc('postgres_version');
        setConnectionStatus(data ? 'connected' : 'error');
      } catch (err) {
        console.error('[Login] Connection error:', err);
        setConnectionStatus('error');
      }
    };

    checkConnection();
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    // Only redirect after login attempt or if user was already authenticated
    if (isAuthenticated && (loginAttempted || !isLoading)) {
      // Always force a refresh of user data after login to ensure we have the latest permissions
      refreshUser().then(() => {
        // Get the intended destination or default to dashboard
        const from = location.state?.from || "/dashboard";
        navigate(from, { replace: true });
      });
    }
  }, [isAuthenticated, isLoading, loginAttempted, navigate, location.state?.from, refreshUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor preencha email e senha",
        variant: "destructive"
      });
      return;
    }

    try {
      const success = await login(email, password);
      setLoginAttempted(true);
      
      if (!success) {
        toast({
          title: "Falha no login",
          description: "Email ou senha incorretos",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error("[Login] Error:", error);
      toast({
        title: "Erro no login",
        description: error.message || "Ocorreu um erro durante o login",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-muted/40">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center space-y-2">
          <AppLogo className="w-12 h-12 mb-2" />
          <h1 className="text-2xl font-bold">Business Manager</h1>
          <p className="text-sm text-muted-foreground">Faça login para acessar o painel administrativo</p>
        </div>

        <ConnectionStatus status={connectionStatus} />
        
        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Digite seu email e senha para acessar
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu.email@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-xs"
                    type="button"
                    onClick={() => navigate('/redefinir-senha')}
                    disabled={isLoading}
                  >
                    Esqueceu a senha?
                  </Button>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
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
                    Autenticando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>
              <div className="text-sm text-center text-muted-foreground mt-2">
                Primeiro acesso?{' '}
                <Button 
                  variant="link" 
                  className="p-0 h-auto"
                  type="button"
                  onClick={() => navigate('/primeiro-acesso')}
                  disabled={isLoading}
                >
                  Registre-se
                </Button>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
