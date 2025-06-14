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
import { Link } from 'react-router-dom';
import { TriggerCard } from '@/components/diagnostic/TriggerCard';
import { LogsCard } from '@/components/diagnostic/LogsCard';
import { DiagnosticSummary } from '@/components/diagnostic/DiagnosticSummary';
import { SystemHealth } from '@/components/diagnostic/SystemHealth';
import { RecommendationsCard } from '@/components/diagnostic/RecommendationsCard';
import { TableUsageAnalysis } from '@/components/diagnostic/TableUsageAnalysis';
import { useAuth } from '@/hooks/useAuth';
import { SecurityHealthCard } from '@/components/diagnostic/SecurityHealthCard';
import { SecurityAuditLogs } from '@/components/diagnostic/SecurityAuditLogs';
import { SecuritySummary } from '@/components/diagnostic/SecuritySummary';

const ESSENTIAL_TABLES = [
  'profiles',
  'departments', 
  'managers',
  'settings',
  'user_settings',
  'logs',
  'metrics_definition',
  'metrics_values',
  'notifications',
  'notification_settings',
  'notification_templates',
  'metric_justifications',
  'admin_dashboard_config',
  'backup_settings',
  'backup_history',
  'backup_data',
  'push_subscriptions',
  'scheduled_notifications',
  'department_managers',
  'diagnostic_tests'
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
      supabaseUrl: getSupabaseUrlUtil(),
      summary: {
        totalTables: tables.length,
        okTables: tables.filter(t => t.status === 'ok').length,
        emptyTables: tables.filter(t => t.status === 'empty').length,
        errorTables: tables.filter(t => t.status === 'error').length,
        connectionStatus: connection?.connected ? 'connected' : 'disconnected',
        writeTestStatus: writeTest?.status || 'unknown'
      }
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `supabase-diagnostic-${new Date().toISOString().split('T')[0]}.json`;
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
          <h1 className="text-3xl font-bold">Diagnóstico Completo do Sistema</h1>
          <p className="text-muted-foreground">
            Análise detalhada do estado de saúde do sistema e recomendações
          </p>
          {lastUpdate && (
            <p className="text-xs text-muted-foreground mt-1">
              Última atualização: {lastUpdate.toLocaleString()}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild className="flex items-center gap-2">
            <Link to="/">
              <Home className="h-4 w-4" />
              <span className="hidden md:inline">Dashboard</span>
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
                <span className="hidden md:inline">Executando...</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                <span className="hidden md:inline">Executar Diagnóstico</span>
                <span className="inline md:hidden">Executar</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Resumo e Saúde Geral */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SystemHealth 
          connection={connection}
          tables={tables}
          writeTest={writeTest}
          syncStatus={syncStatus}
        />
        <SecuritySummary 
          totalPolicies={tables.length}
          activePolicies={tables.filter(t => t.status === 'ok').length}
          criticalIssues={tables.filter(t => t.status === 'error').length}
          warnings={tables.filter(t => t.status === 'empty').length}
          lastSecurityCheck={lastUpdate}
        />
      </div>

      {/* Cards de Status Rápido */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-sm">
              <Server className="mr-2 h-4 w-4" />
              Conexão
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!connection ? (
              <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
            ) : (
              <div className="space-y-2">
                <CustomBadge 
                  variant={connection.connected ? "success" : "destructive"}
                  className="w-full justify-center"
                >
                  {connection.connected ? (
                    <><CheckCircle className="mr-1 h-3 w-3" /> Conectado</>
                  ) : (
                    <><AlertCircle className="mr-1 h-3 w-3" /> Erro</>
                  )}
                </CustomBadge>
                <div className="text-xs text-center text-muted-foreground">
                  {connection.responseTime}ms
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-sm">
              <Database className="mr-2 h-4 w-4" />
              Escrita
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!writeTest ? (
              <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
            ) : (
              <div className="space-y-2">
                <CustomBadge 
                  variant={writeTest.status === "success" ? "success" : "destructive"}
                  className="w-full justify-center"
                >
                  {writeTest.status === "success" ? (
                    <><CheckCircle className="mr-1 h-3 w-3" /> OK</>
                  ) : (
                    <><AlertCircle className="mr-1 h-3 w-3" /> Erro</>
                  )}
                </CustomBadge>
                <div className="text-xs text-center text-muted-foreground">
                  {writeTest.status === "success" ? "Funcionando" : "Falhou"}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <TriggerCard syncStatus={syncStatus} isLoading={isLoading} />
      </div>

      {/* Resumo dos Problemas */}
      <DiagnosticSummary 
        connection={connection}
        tables={tables}
        writeTest={writeTest}
        syncStatus={syncStatus}
      />

      {/* Componentes de Segurança */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SecurityHealthCard />
        <SecurityAuditLogs />
      </div>

      {/* Análise de Uso das Tabelas */}
      <TableUsageAnalysis tables={tables} />

      {/* Recomendações */}
      <RecommendationsCard 
        connection={connection}
        tables={tables}
        writeTest={writeTest}
        syncStatus={syncStatus}
      />

      {/* Logs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <LogsCard mode="all" title="Logs Recentes" description="Últimos registros do sistema" limit={5} />
        <LogsCard mode="sync" title="Logs de Sincronização" description="Registros de sincronização entre auth.users e managers" limit={5} />
      </div>
      
      {/* Detalhes das Tabelas */}
      <Card>
        <CardHeader>
          <CardTitle>Status Detalhado das Tabelas</CardTitle>
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
                    <TableHead>Detalhes</TableHead>
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
                        {table.recordCount !== null ? table.recordCount.toLocaleString() : "N/A"}
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
            Gerar Relatório Completo
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
                Executar Novo Diagnóstico
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Diagnostic;
