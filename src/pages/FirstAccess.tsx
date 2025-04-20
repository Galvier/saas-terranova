
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import AppLogo from '@/components/AppLogo';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import { ConnectionStatus } from '@/components/auth/ConnectionStatus';
import { RegistrationForm } from '@/components/auth/RegistrationForm';
import { authService, UserRegistrationData } from '@/services/auth';
import { testSupabaseConnection, checkDatabaseTables } from '@/integrations/supabase/client';

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
  const [isCheckingConnection, setIsCheckingConnection] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<boolean | null>(null);
  const [connectionDetails, setConnectionDetails] = useState<string>('');
  const [isTesting, setIsTesting] = useState(false);
  const [tableStatus, setTableStatus] = useState<{[tableName: string]: {exists: boolean; count?: number; error?: string}} | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    checkForExistingUsers();
  }, [navigate, toast]);

  useEffect(() => {
    const state = location.state as { email?: string };
    if (state?.email) {
      setEmail(state.email);
      toast({
        title: "Configuração concluída",
        description: "Use as credenciais criadas para fazer login",
      });
    }
  }, [location.state, toast]);

  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 25;
    
    setPasswordStrength(strength);
  }, [password]);

  const checkForExistingUsers = async () => {
    setIsCheckingConnection(true);
    
    try {
      console.log("Iniciando verificação de conexão...");
      const connectionResult = await testSupabaseConnection();
      setConnectionStatus(connectionResult.success);
      setConnectionDetails(connectionResult.message);
      
      if (!connectionResult.success) {
        console.error("Falha na conexão:", connectionResult.message);
        toast({
          title: "Erro de conexão",
          description: connectionResult.message || "Não foi possível conectar ao banco de dados. Tente novamente mais tarde.",
          variant: "destructive"
        });
        setIsCheckingConnection(false);
        return;
      }
      
      const tables = await checkDatabaseTables();
      setTableStatus(tables);
      
      console.log("Verificando existência de usuários...");
      const { session } = await authService.getSession();
      if (session) {
        console.log("Sessão ativa encontrada, redirecionando...");
        toast({
          title: "Sessão ativa",
          description: "Você já está logado. Redirecionando para o dashboard."
        });
        navigate('/dashboard');
        return;
      }
      
      setHasUsers(false);
      setIsCheckingConnection(false);
      
      console.log("Verificação concluída com sucesso.");
    } catch (error) {
      console.error("Erro ao verificar usuários:", error);
      toast({
        title: "Erro de conexão",
        description: error instanceof Error ? error.message : "Falha ao verificar o banco de dados. Verifique sua conexão.",
        variant: "destructive"
      });
      setConnectionStatus(false);
      setIsCheckingConnection(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      const connectionResult = await testSupabaseConnection();
      setConnectionStatus(connectionResult.success);
      setConnectionDetails(connectionResult.message);
      
      if (connectionResult.success) {
        toast({
          title: "Conexão estabelecida",
          description: `Conectado ao Supabase em ${connectionResult.responseTime}ms.`
        });
        
        const tables = await checkDatabaseTables();
        setTableStatus(tables);
        
        const allTablesExist = Object.values(tables).every(table => table.exists);
        if (!allTablesExist) {
          toast({
            title: "Verificação de tabelas",
            description: "Algumas tabelas necessárias não foram encontradas.",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Falha na conexão",
          description: connectionResult.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro no teste",
        description: error instanceof Error ? error.message : "Erro ao testar conexão",
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
    
    const connectionTest = await testSupabaseConnection();
    if (!connectionTest.success) {
      setIsLoading(false);
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao banco de dados. Tente novamente.",
        variant: "destructive"
      });
      return;
    }
    
    const userData: UserRegistrationData = {
      name,
      email,
      password,
      role: 'admin'
    };
    
    try {
      console.log("Iniciando registro de usuário admin:", email);
      
      const result = await authService.register(userData);
      
      console.log("Resultado do registro:", result);
      
      if (result.status === 'error') {
        setIsLoading(false);
        toast({
          title: "Erro no cadastro",
          description: result.message,
          variant: "destructive"
        });
        return;
      }
      
      setIsLoading(false);
      setSuccessMessage("Administrador inicial criado com sucesso!");
      
      toast({
        title: "Configuração concluída",
        description: "Usuário administrador criado com sucesso"
      });
      
      setTimeout(() => {
        navigate('/login', { 
          state: { email: email }
        });
      }, 3000);
    } catch (error: any) {
      console.error("Erro ao registrar usuário:", error);
      setIsLoading(false);
      toast({
        title: "Erro inesperado",
        description: error.message || "Ocorreu um erro ao criar o usuário",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <ConnectionStatus
        isCheckingConnection={isCheckingConnection}
        connectionStatus={connectionStatus}
        onRetryConnection={handleTestConnection}
        isTesting={isTesting}
        connectionDetails={connectionDetails}
      />

      {!isCheckingConnection && connectionStatus && !hasUsers && (
        <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4">
          <div className="w-full max-w-md">
            <div className="flex justify-center mb-6">
              <AppLogo />
            </div>
            
            <div className="w-full mb-4 flex justify-between items-center">
              <div className="flex items-center">
                <div className={`h-3 w-3 rounded-full mr-2 ${connectionStatus ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <span className="text-sm text-muted-foreground">
                  Conexão: {connectionStatus ? 'Estabelecida' : 'Instável'}
                </span>
              </div>
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
              
              <RegistrationForm
                name={name}
                email={email}
                password={password}
                confirmPassword={confirmPassword}
                passwordStrength={passwordStrength}
                showPassword={showPassword}
                isLoading={isLoading}
                successMessage={successMessage}
                onNameChange={setName}
                onEmailChange={setEmail}
                onPasswordChange={setPassword}
                onConfirmPasswordChange={setConfirmPassword}
                onToggleShowPassword={() => setShowPassword(!showPassword)}
                onSubmit={handleSubmit}
              />
            </Card>
            
            {tableStatus && (
              <div className="mt-6 text-xs text-muted-foreground">
                <details>
                  <summary className="cursor-pointer hover:text-primary transition-colors">
                    Detalhes técnicos da conexão
                  </summary>
                  <div className="mt-2 p-2 bg-slate-50 rounded-md">
                    <p className="font-semibold mb-1">Status das tabelas:</p>
                    <ul className="space-y-1">
                      {Object.entries(tableStatus).map(([tableName, status]) => (
                        <li key={tableName} className="flex items-center gap-1">
                          <span className={`h-2 w-2 rounded-full ${status.exists ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          <span>{tableName}: </span>
                          {status.exists ? (
                            <span className="text-green-700">OK ({status.count} registros)</span>
                          ) : (
                            <span className="text-red-700">{status.error || 'Não encontrada'}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </details>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default FirstAccess;
