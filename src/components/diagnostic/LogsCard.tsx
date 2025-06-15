
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileText, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { getLatestLogs, getAuthSyncLogs, testLogCreation, LogEntry } from '@/services/logService';
import { CustomBadge } from '@/components/ui/custom-badge';
import { useAuth } from '@/hooks/useAuth';

const getLogLevelClass = (level: string) => {
  switch (level.toLowerCase()) {
    case 'error':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'warning':
    case 'warn':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'info':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

interface LogsCardProps {
  mode?: 'all' | 'sync';
  limit?: number;
  title?: string;
  description?: string;
}

export function LogsCard({ 
  mode = 'all', 
  limit = 5, 
  title = 'Logs do Sistema', 
  description = 'Registros recentes de atividade do sistema' 
}: LogsCardProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [systemStatus, setSystemStatus] = useState<'healthy' | 'warning' | 'error'>('healthy');
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  const fetchLogs = async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      console.log('[LogsCard] Buscando logs, autenticado:', isAuthenticated);
      
      const result = mode === 'sync' 
        ? await getAuthSyncLogs(limit) 
        : await getLatestLogs(limit);
        
      if (result.error) {
        console.error('[LogsCard] Erro ao buscar logs:', result.error);
        setHasError(true);
        setSystemStatus('error');
        toast({
          title: 'Sistema de Logs',
          description: `Problema detectado: ${result.error.message}`,
          variant: 'destructive'
        });
      } else {
        setLogs(result.data || []);
        setSystemStatus('healthy');
        console.log('[LogsCard] Logs obtidos com sucesso:', result.data?.length || 0);
      }
    } catch (error: any) {
      console.error('[LogsCard] Erro ao buscar logs:', error);
      setHasError(true);
      setSystemStatus('error');
      toast({
        title: 'Erro no Sistema de Logs',
        description: 'Falha na comunicação com o sistema de auditoria',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestLog = async () => {
    setIsTesting(true);
    try {
      const result = await testLogCreation();
      if (result.error) {
        console.error('[LogsCard] Erro ao criar log de teste:', result.error);
        setSystemStatus('warning');
        toast({
          title: 'Teste de Log',
          description: `Problema no teste: ${result.error.message}`,
          variant: 'destructive'
        });
      } else {
        console.log('[LogsCard] Log de teste criado com sucesso');
        setSystemStatus('healthy');
        toast({
          title: 'Sistema Funcionando',
          description: 'Log de teste criado com sucesso - sistema corrigido!',
        });
        await fetchLogs();
      }
    } catch (error: any) {
      console.error('[LogsCard] Erro ao criar log de teste:', error);
      setSystemStatus('error');
      toast({
        title: 'Erro Crítico',
        description: 'Falha no sistema de auditoria',
        variant: 'destructive'
      });
    } finally {
      setIsTesting(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [mode, limit]);

  const renderSystemStatus = () => {
    if (systemStatus === 'healthy') {
      return (
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span className="text-sm text-green-700 font-medium">Sistema de Logs Funcionando</span>
        </div>
      );
    }
    
    if (systemStatus === 'warning') {
      return (
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <span className="text-sm text-yellow-700 font-medium">Sistema com Avisos</span>
        </div>
      );
    }
    
    return (
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="h-4 w-4 text-red-500" />
        <span className="text-sm text-red-700 font-medium">Problema no Sistema</span>
      </div>
    );
  };

  const renderError = () => (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <AlertTriangle className="h-10 w-10 text-amber-500 mb-4" />
      <h3 className="font-medium text-lg mb-2">Sistema de Logs com Problemas</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Problemas detectados no sistema de auditoria. Correções foram aplicadas.
      </p>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={fetchLogs} 
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
            Verificando correções...
          </>
        ) : (
          'Verificar Sistema'
        )}
      </Button>
    </div>
  );

  const renderEmpty = () => (
    <div className="text-center py-8 text-muted-foreground">
      <p>Sistema inicializado - ainda sem logs</p>
      <p className="text-sm mt-2">
        {isAuthenticated 
          ? 'Teste o sistema de auditoria com um log de exemplo'
          : 'Faça login para acessar o sistema de auditoria'}
      </p>
    </div>
  );

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="mr-2 h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
        {renderSystemStatus()}
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : hasError ? (
          renderError()
        ) : logs.length === 0 ? (
          renderEmpty()
        ) : (
          <ScrollArea className="h-full">
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className={`p-3 border rounded-md ${getLogLevelClass(log.level)}`}>
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-grow">
                      <div className="font-medium break-words">{log.message}</div>
                      <div className="text-xs mt-1 opacity-70">
                        {new Date(log.created_at).toLocaleString()}
                      </div>
                    </div>
                    <CustomBadge variant="outline" className="shrink-0">
                      {log.level.toUpperCase()}
                    </CustomBadge>
                  </div>
                  {log.details && (
                    <div className="mt-2 pt-2 border-t border-gray-200 text-sm overflow-auto max-h-24">
                      <pre className="text-xs whitespace-pre-wrap break-words">
                        {typeof log.details === 'object'
                          ? JSON.stringify(log.details, null, 2)
                          : log.details}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
      <CardFooter className="border-t bg-muted/50 flex justify-between items-center">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleTestLog} 
          disabled={isTesting || !isAuthenticated}
        >
          {isTesting ? (
            <>
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              Testando sistema...
            </>
          ) : (
            'Testar Sistema Corrigido'
          )}
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={fetchLogs} 
          disabled={isLoading}
          title="Atualizar logs"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
