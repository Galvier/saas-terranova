import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/PageHeader';
import { Loader2, AlertCircle, CheckCircle, Database, RefreshCw, Server, FileDown } from 'lucide-react';
import { 
  runFullDiagnostic, 
  ConnectionInfo, 
  TableInfo, 
  DiagnosticResult,
  getSupabaseUrlUtil 
} from '@/utils/supabaseDiagnostic';
import { CustomBadge } from '@/components/ui/custom-badge';
import ConnectionWarning from '@/components/diagnostic/ConnectionWarning';

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
  const [isLoading, setIsLoading] = useState(false);
  const [connection, setConnection] = useState<ConnectionInfo | null>(null);
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [writeTest, setWriteTest] = useState<DiagnosticResult | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const runDiagnostic = async () => {
    setIsLoading(true);
    setConnectionError(null);
    
    try {
      const results = await runFullDiagnostic(ESSENTIAL_TABLES);
      
      setConnection(results.connection);
      setTables(results.tables);
      setWriteTest(results.writeTest);
      setLastUpdate(new Date());
      
      if (!results.connection.connected) {
        setConnectionError('Não foi possível estabelecer conexão com o banco de dados.');
        toast({
          title: 'Problema de conexão',
          description: 'Não foi possível conectar ao Supabase. Verifique sua conexão com a internet.',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Diagnóstico concluído',
          description: 'Conexão com o Supabase estabelecida com sucesso.'
        });
      }
    } catch (error: any) {
      console.error('Error running diagnostic:', error);
      setConnectionError(error?.message || 'Erro ao executar diagnóstico');
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
    runDiagnostic();
  }, []);

  const generateReport = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      connection,
      tables,
      writeTest,
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

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader 
        title="Diagnóstico do Sistema" 
        subtitle="Verifique a conexão com o banco de dados e o estado das tabelas" 
      />
      
      <ConnectionWarning 
        visible={!!connectionError} 
        message={connectionError || undefined} 
      />
      
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
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <CheckCircle className="mr-2 h-5 w-5" />
              Resumo
            </CardTitle>
            <CardDescription>
              Visão geral do diagnóstico
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!tables.length ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Tabelas verificadas:</span>
                  <span className="text-sm">{tables.length}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Tabelas OK:</span>
                  <span className="text-sm">{tables.filter(t => t.status === "ok").length}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Tabelas vazias:</span>
                  <span className="text-sm">{tables.filter(t => t.status === "empty").length}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Tabelas com erro:</span>
                  <span className="text-sm">{tables.filter(t => t.status === "error").length}</span>
                </div>
                
                {lastUpdate && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Última atualização:</span>
                    <span className="text-sm">{lastUpdate.toLocaleTimeString()}</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
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
          )}
        </CardContent>
        <CardFooter className="border-t bg-muted/50 px-6 py-4 flex justify-between">
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
