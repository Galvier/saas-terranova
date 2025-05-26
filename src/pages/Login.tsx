import React, { useState, useEffect } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { ConnectionStatus } from '@/components/auth/ConnectionStatus';
import AppLogo from '@/components/AppLogo';
import { supabase } from '@/integrations/supabase/client';
import { createLog } from '@/services/logService';

// Interface for ConnectionStatus component
interface StatusMapping {
  checking: boolean;
  connected: boolean | null;
  error: boolean;
}

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const { login, isLoading, isAuthenticated, refreshUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [loginAttempted, setLoginAttempted] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loginButtonDisabled, setLoginButtonDisabled] = useState(false);

  // Map ConnectionStatus component properties
  const statusMapping: StatusMapping = {
    checking: connectionStatus === 'checking',
    connected: connectionStatus === 'connected',
    error: connectionStatus === 'error'
  };

  // Force light mode on this page
  useEffect(() => {
    // Save current theme
    const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    
    // Apply light theme
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    
    // Cleanup function to restore theme when leaving page
    return () => {
      document.documentElement.classList.remove('light');
      if (currentTheme === 'dark') {
        document.documentElement.classList.add('dark');
      }
    };
  }, []);

  // Check connection to Supabase on component mount
  useEffect(() => {
    console.log('[Login] Inicializando componente de Login...');
    
    const checkConnection = async () => {
      try {
        setConnectionStatus('checking');
        console.log('[Login] Verificando conexão com Supabase...');
        
        // Simple query to check connection
        const { data } = await supabase.rpc('postgres_version');
        setConnectionStatus(data ? 'connected' : 'error');
        console.log('[Login] Verificação de conexão bem-sucedida:', data);
        
        // Log connection attempt (without requiring auth)
        try {
          await createLog('info', 'Tentativa de conexão', { 
            status: 'success',
            timestamp: new Date().toISOString() 
          });
        } catch (e) {
          console.warn('[Login] Falha ao registrar tentativa de conexão:', e);
        }
      } catch (err) {
        console.error('[Login] Erro de conexão:', err);
        setConnectionStatus('error');
        
        // Try to log failure, but this will likely fail too
        try {
          await createLog('error', 'Falha na conexão', { 
            error: err instanceof Error ? err.message : String(err),
            timestamp: new Date().toISOString() 
          });
        } catch (e) {
          console.warn('[Login] Falha ao registrar erro de conexão:', e);
        }
      }
    };

    checkConnection();
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('[Login] Usuário autenticado, redirecionando...');
      
      // Get the intended destination or default to dashboard
      const from = location.state?.from || "/dashboard";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state?.from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginButtonDisabled(true);
    
    if (!email || !password) {
      setLoginError("Por favor preencha email e senha");
      setLoginButtonDisabled(false);
      return;
    }

    try {
      console.log('[Login] Tentando login para:', email);
      
      // Log login attempt (without requiring auth)
      try {
        await createLog('info', 'Tentativa de login', { 
          email,
          timestamp: new Date().toISOString() 
        });
      } catch (e) {
        console.warn('[Login] Falha ao registrar tentativa de login:', e);
      }
      
      const success = await login(email, password);
      setLoginAttempted(true);
      
      if (!success) {
        setLoginError("Email ou senha incorretos");
        
        // Log login failure
        try {
          await createLog('error', 'Falha no login', { 
            email,
            timestamp: new Date().toISOString() 
          });
        } catch (e) {
          console.warn('[Login] Falha ao registrar erro de login:', e);
        }
      } else {
        // Refresh user data immediately after successful login
        try {
          await refreshUser();
        } catch (refreshError) {
          console.error('[Login] Erro ao atualizar dados do usuário:', refreshError);
        }
      }
    } catch (error: any) {
      console.error("[Login] Erro:", error);
      setLoginError(error.message || "Ocorreu um erro durante o login");
      
      // Log error
      try {
        await createLog('error', 'Erro no login', { 
          email,
          error: error.message,
          timestamp: new Date().toISOString() 
        });
      } catch (e) {
        console.warn('[Login] Falha ao registrar erro de login:', e);
      }
    } finally {
      setLoginButtonDisabled(false);
    }
  };

  const handleRetryConnection = async () => {
    setConnectionStatus('checking');
    try {
      // Simple query to check connection
      const { data } = await supabase.rpc('postgres_version');
      setConnectionStatus(data ? 'connected' : 'error');
      console.log('[Login] Resultado da tentativa de conexão:', data);
    } catch (err) {
      console.error('[Login] Erro na tentativa de conexão:', err);
      setConnectionStatus('error');
    }
  };
  
  const handleRefreshPermissions = async () => {
    setIsRefreshing(true);
    try {
      await refreshUser();
      toast({
        title: "Permissões atualizadas",
        description: "Suas permissões foram sincronizadas com sucesso",
      });
    } catch (error) {
      console.error('[Login] Erro ao atualizar permissões:', error);
      toast({
        title: "Erro na atualização",
        description: "Não foi possível atualizar suas permissões",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <AppLogo />
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">Business Manager</h1>
            <p className="text-sm text-gray-600">Faça login para acessar o painel administrativo</p>
          </div>
        </div>

        <ConnectionStatus 
          isCheckingConnection={statusMapping.checking}
          connectionStatus={statusMapping.connected}
          onRetryConnection={handleRetryConnection}
          connectionDetails={connectionStatus === 'error' 
            ? "Não foi possível conectar ao banco de dados. Verifique sua conexão e tente novamente." 
            : undefined}
        />
        
        {connectionStatus === 'connected' && (
          <Card className="bg-white border border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900">Login</CardTitle>
              <CardDescription className="text-gray-600">
                Digite seu email e senha para acessar
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {loginError && (
                  <Alert variant="destructive" className="bg-red-50 border-red-200">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-red-800">{loginError}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu.email@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    required
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-gray-700">Senha</Label>
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-xs text-terranova-blue"
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
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2">
                <Button 
                  type="submit" 
                  className="w-full bg-terranova-blue hover:bg-terranova-blue/90 text-white" 
                  disabled={isLoading || loginButtonDisabled}
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
                <div className="w-full mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs flex items-center justify-center mt-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                    onClick={handleRefreshPermissions}
                    type="button"
                    disabled={!isAuthenticated || isLoading || isRefreshing}
                  >
                    <RefreshCw className={`h-3 w-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Sincronizar permissões
                  </Button>
                </div>
              </CardFooter>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Login;
