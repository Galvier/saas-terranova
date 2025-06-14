import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle, CheckCircle, Database, RefreshCw, Server, FileDown, Home, ShieldAlert } from 'lucide-react';
import { 
  runFullDiagnostic, 
  ConnectionInfo, 
  TableInfo, 
  DiagnosticResult,
  getSupabaseUrlUtil,
  checkAuthUsersSyncStatus
} from '@/utils/supabaseDiagnostic';
import { CustomBadge } from '@/components/ui/custom-badge';
import { Link, Navigate } from 'react-router-dom';
import { TriggerCard } from '@/components/diagnostic/TriggerCard';
import { LogsCard } from '@/components/diagnostic/LogsCard';
import { useAuth } from '@/hooks/useAuth';

const ESSENTIAL_TABLES = [
  'users',
  'profiles',
  'departments',
  'managers',
  'metrics',
  'settings',
  'logs'
];

const Diagnostic = () => {
  const { toast } = useToast();
  const { isAdmin, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [connection, setConnection] = useState<ConnectionInfo | null>(null);
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [writeTest, setWriteTest] = useState<DiagnosticResult | null>(null);
  const [syncStatus, setSyncStatus] = useState<DiagnosticResult | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [triggerFixed, setTriggerFixed] = useState(false);

  // Verificar se o usuário é admin
  if (!authLoading && !isAdmin) {
    return (
      <div className="animate-fade-in space-y-6 p-4 md:p-8 min-h-screen bg-muted/30">
        <div className="flex justify-center items-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <ShieldAlert className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle>Acesso Restrito</CardTitle>
              <CardDescription>
                Esta página é restrita apenas para administradores do sistema.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button asChild variant="outline">
                <Link to="/">
                  <Home className="mr-2 h-4 w-4" />
                  Voltar ao Dashboard
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const runDiagnostic = async () => {
    setIsLoading(true);
    try {
      const results = await runFullDiagnostic(ESSENTIAL_TABLES);
      
      setConnection(results.connection);
      setTables(results.tables);
      setWriteTest(results.writeTest);
      setSyncStatus(results.syncStatus);
      setLastUpdate(new Date());
      
      // Verificar se o problema dos triggers foi resolvido
      const syncDetails = results.syncStatus?.details;
      if (syncDetails && syncDetails.auth_triggers > 0 && syncDetails.manager_triggers > 0) {
        setTriggerFixed(true);
      }
      
      toast({
        title: 'Diagnóstico concluído',
        description: results.connection.connected 
          ? 'Conexão com o Supabase estabelecida com sucesso.' 
          : 'Problemas detectados na conexão com o Supabase.'
      });
    } catch (error) {
      console.error('Error running diagnostic:', error);
      toast({
        title: 'Erro no diagnóstico',
        description: 'Não foi possível completar todos os testes de diagnóstico.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin && !authLoading) {
      runDiagnostic();
    }
  }, [isAdmin, authLoading]);

  const generateReport = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      connection,
      tables,
      writeTest,
      syncStatus,
      supabaseUrl: getSupabaseUrlUtil()
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `supabase-diagnostic-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    toast({
      title: 'Relatório gerado',
      description: 'O relatório de diagnóstico foi baixado com sucesso.'
    });
  };

  // Se ainda está carregando a autenticação, mostrar loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6 p-4 md:p-8 min-h-screen bg-muted/30">
      <div className="flex justify-between items-start flex-col sm:flex-row gap-4">
        <div>
          <h1 className="text-2xl font-bold">Diagnóstico do Sistema</h1>
          <p className="text-muted-foreground">
            Verifique a conexão com o banco de dados e o estado das tabelas
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild className="flex items-center gap-2">
            <Link to="/">
              <Home className="h-4 w-4" />
              <span className="hidden md:inline">Voltar ao Dashboard</span>
              <span className="inline md:hidden">Dashboard</span>
            </Link>
          </Button>
          <Button 
            onClick={runDiagnostic}
            disabled={isLoading}
            size="sm"
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="hidden md:inline">Atualizando...</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                <span className="hidden md:inline">Atualizar</span>
                <span className="inline md:hidden">Atualizar</span>
              </>
            )}
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Server className="mr-2 h-5 w-5" />
              Status da Conexão
            </CardTitle>
            <CardDescription>
              Informações sobre a conexão com o Supabase
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!connection ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Status:</span>
                  <CustomBadge 
                    variant={connection.connected ? "success" : "destructive"}
                    className="flex items-center"
                  >
                    {connection.connected ? (
                      <><CheckCircle className="mr-1 h-3 w-3" /> Conectado</>
                    ) : (
                      <><AlertCircle className="mr-1 h-3 w-3" /> Desconectado</>
                    )}
                  </CustomBadge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Tempo de resposta:</span>
                  <span className="text-sm">{connection.responseTime}ms</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">URL:</span>
                  <span className="text-sm truncate max-w-[160px]" title={connection.url}>
                    {connection.url}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Última verificação:</span>
                  <span className="text-sm">
                    {connection.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Database className="mr-2 h-5 w-5" />
              Teste de Escrita
            </CardTitle>
            <CardDescription>
              Verificação de operações de escrita no banco
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!writeTest ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Status:</span>
                  <CustomBadge 
                    variant={writeTest.status === "success" ? "success" : "destructive"}
                    className="flex items-center"
                  >
                    {writeTest.status === "success" ? (
                      <><CheckCircle className="mr-1 h-3 w-3" /> Sucesso</>
                    ) : (
                      <><AlertCircle className="mr-1 h-3 w-3" /> Falha</>
                    )}
                  </CustomBadge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Mensagem:</span>
                  <span className="text-sm truncate max-w-[160px]" title={writeTest.message}>
                    {writeTest.message}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Tipo de teste:</span>
                  <span className="text-sm">INSERT/DELETE</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Tempo:</span>
                  <span className="text-sm">
                    {writeTest.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <TriggerCard syncStatus={syncStatus} isLoading={isLoading} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <LogsCard mode="all" title="Logs Recentes" description="Últimos registros do sistema" limit={5} />
        <LogsCard mode="sync" title="Logs de Sincronização" description="Registros de sincronização entre auth.users e managers" limit={5} />
      </div>

      {triggerFixed ? (
        <Alert className="bg-green-50 border-green-200 text-green-800">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertTitle>Problema resolvido</AlertTitle>
          <AlertDescription>
            <p className="mb-2">
              A recursão nos triggers de sincronização entre as tabelas auth.users e managers foi corrigida.
              Agora você deve conseguir fazer login normalmente.
            </p>
            <div className="mt-4">
              <Button asChild variant="outline" size="sm">
                <Link to="/login">
                  Voltar para a tela de login
                </Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      ) : (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro de login detectado</AlertTitle>
          <AlertDescription>
            <p className="mb-2">
              Foi detectado um problema de recursão nos triggers de sincronização entre as tabelas auth.users e managers.
              Este problema faz com que ocorra o erro "stack depth limit exceeded" durante o login.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                O erro "Database error granting user" ocorre devido a uma recursão infinita entre os triggers.
              </li>
              <li>
                O sistema não consegue atualizar os metadados do usuário durante o login.
              </li>
            </ul>
            <div className="mt-4">
              <Button onClick={runDiagnostic} variant="outline" size="sm">
                Verificar correção
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Status das Tabelas</CardTitle>
          <CardDescription>
            Verificação detalhada de cada tabela do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tables.length === 0 ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tabela</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Registros</TableHead>
                    <TableHead>Mensagem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tables.map((table) => (
                    <TableRow key={table.name}>
                      <TableCell className="font-medium">{table.name}</TableCell>
                      <TableCell>
                        <CustomBadge 
                          variant={
                            table.status === "ok" 
                              ? "success" 
                              : table.status === "empty" 
                                ? "outline" 
                                : "destructive"
                          }
                        >
                          {table.status === "ok" 
                            ? "OK" 
                            : table.status === "empty" 
                              ? "Vazia" 
                              : "Erro"}
                        </CustomBadge>
                      </TableCell>
                      <TableCell className="text-right">
                        {table.recordCount !== null ? table.recordCount : "N/A"}
                      </TableCell>
                      <TableCell className="truncate max-w-[300px]" title={table.message || ""}>
                        {table.message || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t bg-muted/50 px-6 py-4 flex justify-between flex-col sm:flex-row gap-2">
          <Button 
            variant="outline"
            onClick={generateReport}
            disabled={isLoading || !tables.length}
          >
            <FileDown className="mr-2 h-4 w-4" />
            Gerar Relatório
          </Button>
          <Button 
            onClick={runDiagnostic}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Executando diagnóstico...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Atualizar Diagnóstico
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
      
      {tables.some(t => t.status === "error") && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Problemas detectados</AlertTitle>
          <AlertDescription>
            <p className="mb-2">
              Foram encontrados problemas com algumas tabelas. Recomendações:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              {tables.filter(t => t.status === "error").map(table => (
                <li key={`fix-${table.name}`}>
                  Tabela <strong>{table.name}</strong>: {table.message || "Erro desconhecido"}. 
                  Verifique se a tabela existe e se as permissões estão corretas.
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default Diagnostic;
