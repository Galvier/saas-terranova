
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import AppLogo from '@/components/AppLogo';
import { Loader2, Check, AlertTriangle, Eye, EyeOff, Shield, RefreshCw } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { authService, UserRegistrationData } from '@/services/authService';
import { testSupabaseConnection, checkDatabaseTables } from '@/integrations/supabase/supabaseClient';

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
  const { toast } = useToast();

  // Verifica a conexão com o Supabase e se já existem usuários
  useEffect(() => {
    checkForExistingUsers();
  }, [navigate, toast]);

  const checkForExistingUsers = async () => {
    setIsCheckingConnection(true);
    
    try {
      console.log("Iniciando verificação de conexão...");
      // Primeiro, testa a conexão com o Supabase
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
      
      // Verifica tabelas
      const tables = await checkDatabaseTables();
      setTableStatus(tables);
      
      console.log("Verificando existência de usuários...");
      // Verifica se já existem usuários
      // Isso será feito através da tabela de perfis no public schema
      const { session, user } = await authService.getSession();
      if (session) {
        // Se já temos uma sessão, redirecionamos para o dashboard
        console.log("Sessão ativa encontrada, redirecionando...");
        toast({
          title: "Sessão ativa",
          description: "Você já está logado. Redirecionando para o dashboard."
        });
        navigate('/dashboard');
        return;
      }
      
      // Em uma implementação real, verificaríamos se existem usuários no banco
      // Por simplicidade, vamos assumir que não existem
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
        
        // Verifica tabelas
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

  const handleSubmit = async (e: React.FormEvent) => {
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
    
    // Teste de conexão antes de prosseguir
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
    
    // Dados para registro do usuário
    const userData: UserRegistrationData = {
      name,
      email,
      password,
      role: 'admin' // O primeiro usuário sempre será admin
    };
    
    try {
      console.log("Iniciando registro de usuário admin:", email);
      
      // Chama o serviço de autenticação para registrar o usuário
      const result = await authService.registerUser(userData);
      
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
      
      // Registro bem-sucedido
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

  if (isCheckingConnection) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Verificando conexão com o banco de dados...</p>
      </div>
    </div>;
  }

  if (connectionStatus === false) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center max-w-md text-center p-4">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-bold mb-2">Erro de conexão</h2>
        <p className="text-muted-foreground mb-4">
          {connectionDetails || "Não foi possível conectar ao banco de dados. Verifique sua conexão e tente novamente."}
        </p>
        <div className="flex flex-col space-y-2 w-full max-w-xs">
          <Button 
            onClick={handleTestConnection}
            variant="default"
            disabled={isTesting}
          >
            {isTesting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testando...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Testar conexão
              </>
            )}
          </Button>
          <Button 
            onClick={() => window.location.reload()}
            variant="outline"
          >
            Recarregar página
          </Button>
        </div>
      </div>
    </div>;
  }

  if (hasUsers) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center max-w-md text-center p-4">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Configuração já realizada</h2>
        <p className="text-muted-foreground mb-6">
          O sistema já possui usuários cadastrados. Por favor, acesse a página de login.
        </p>
        <Button 
          onClick={() => navigate('/login')}
        >
          Ir para login
        </Button>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <AppLogo />
        </div>
        
        {/* Status da conexão */}
        <div className="w-full mb-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className={`h-3 w-3 rounded-full mr-2 ${connectionStatus ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            <span className="text-sm text-muted-foreground">
              Conexão: {connectionStatus ? 'Estabelecida' : 'Instável'}
            </span>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleTestConnection}
            disabled={isTesting}
          >
            {isTesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            <span className="ml-1 text-xs">Testar</span>
          </Button>
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
        
        {/* Detalhes técnicos */}
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
  );
};

export default FirstAccess;
