
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CustomBadge } from '@/components/ui/custom-badge';
import { AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { ConnectionInfo, TableInfo, DiagnosticResult } from '@/utils/supabaseDiagnostic';

interface DiagnosticSummaryProps {
  connection: ConnectionInfo | null;
  tables: TableInfo[];
  writeTest: DiagnosticResult | null;
  syncStatus: DiagnosticResult | null;
}

export function DiagnosticSummary({ connection, tables, writeTest, syncStatus }: DiagnosticSummaryProps) {
  const errorTables = tables.filter(t => t.status === 'error');
  const emptyTables = tables.filter(t => t.status === 'empty');
  const okTables = tables.filter(t => t.status === 'ok');
  
  const overallStatus = connection?.connected && errorTables.length === 0 && writeTest?.status === 'success' ? 'healthy' : 'issues';
  
  return (
    <div className="space-y-6">
      {/* Status Geral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {overallStatus === 'healthy' ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-500" />
            )}
            Status Geral do Sistema
          </CardTitle>
          <CardDescription>
            Resumo do estado de saúde do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{okTables.length}</div>
              <div className="text-sm text-muted-foreground">Tabelas OK</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">{emptyTables.length}</div>
              <div className="text-sm text-muted-foreground">Tabelas Vazias</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{errorTables.length}</div>
              <div className="text-sm text-muted-foreground">Tabelas com Erro</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {connection?.responseTime || 0}ms
              </div>
              <div className="text-sm text-muted-foreground">Latência</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alertas Críticos */}
      {errorTables.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Problemas Críticos Detectados</AlertTitle>
          <AlertDescription>
            <div className="mt-2 space-y-2">
              <p>As seguintes tabelas apresentam problemas graves:</p>
              <ul className="list-disc pl-5 space-y-1">
                {errorTables.map(table => (
                  <li key={table.name}>
                    <strong>{table.name}</strong>: {table.message}
                    {table.name === 'users' && (
                      <div className="mt-1 text-sm">
                        <strong>Solução:</strong> Esta tabela faz parte do sistema de autenticação do Supabase. 
                        Verifique se o Supabase Auth está configurado corretamente ou se você tem permissão para acessar auth.users.
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Avisos sobre Tabelas Vazias */}
      {emptyTables.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Tabelas Vazias Detectadas</AlertTitle>
          <AlertDescription>
            <div className="mt-2 space-y-2">
              <p>As seguintes tabelas estão vazias e podem precisar de dados iniciais:</p>
              <ul className="list-disc pl-5 space-y-1">
                {emptyTables.map(table => (
                  <li key={table.name}>
                    <strong>{table.name}</strong>
                    {table.name === 'metrics' && (
                      <span className="text-sm"> - Considere criar algumas métricas de exemplo</span>
                    )}
                    {table.name === 'settings' && (
                      <span className="text-sm"> - Configure as configurações iniciais do sistema</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Problemas de Sincronização */}
      {syncStatus?.details && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Status de Sincronização</AlertTitle>
          <AlertDescription>
            <div className="mt-2 space-y-2">
              <p>Sincronização entre auth.users e managers:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Managers cadastrados: {syncStatus.details.managers_count}</li>
                <li>Managers sincronizados: {syncStatus.details.synced_users_count}</li>
                <li>Triggers ativos: {syncStatus.details.auth_triggers + syncStatus.details.manager_triggers}</li>
              </ul>
              {syncStatus.details.synced_users_count < syncStatus.details.managers_count && (
                <p className="text-amber-600 font-medium">
                  Alguns managers não possuem contas de usuário associadas.
                </p>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
