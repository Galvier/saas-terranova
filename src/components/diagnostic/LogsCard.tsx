
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileText, RefreshCw, AlertTriangle } from 'lucide-react';
import { getLatestLogs, getAuthSyncLogs, testLogCreation, LogEntry } from '@/services/logService';
import { CustomBadge } from '@/components/ui/custom-badge';
import { useAuth } from '@/hooks/useAuth';

const getLogLevelClass = (level: string) => {
  switch (level.toLowerCase()) {
    case 'error':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'warning':
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
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  const fetchLogs = async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      // Skip fetching if not authenticated
      if (!isAuthenticated) {
        setLogs([]);
        setIsLoading(false);
        console.log('[LogsCard] Not authenticated, skipping log fetch');
        return;
      }
      
      const result = mode === 'sync' 
        ? await getAuthSyncLogs(limit) 
        : await getLatestLogs(limit);
        
      if (result.error) {
        console.error('[LogsCard] Error fetching logs:', result.error);
        setHasError(true);
        toast({
          title: 'Erro ao buscar logs',
          description: result.error.message,
          variant: 'destructive'
        });
      } else {
        setLogs(result.data || []);
        console.log('[LogsCard] Successfully fetched logs:', result.data?.length || 0);
      }
    } catch (error) {
      console.error('[LogsCard] Error fetching logs:', error);
      setHasError(true);
      toast({
        title: 'Erro inesperado',
        description: 'Não foi possível buscar os logs do sistema',
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
        console.error('[LogsCard] Error creating test log:', result.error);
        toast({
          title: 'Erro ao criar log de teste',
          description: result.error.message,
          variant: 'destructive'
        });
      } else {
        console.log('[LogsCard] Test log created successfully');
        toast({
          title: 'Log de teste criado',
          description: 'O log foi criado com sucesso. Atualizando...',
        });
        await fetchLogs();
      }
    } catch (error) {
      console.error('[LogsCard] Error creating test log:', error);
      toast({
        title: 'Erro inesperado',
        description: 'Não foi possível criar o log de teste',
        variant: 'destructive'
      });
    } finally {
      setIsTesting(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchLogs();
    } else {
      setIsLoading(false);
      setLogs([]);
    }
  }, [mode, limit, isAuthenticated]);

  // Error view
  const renderError = () => (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <AlertTriangle className="h-10 w-10 text-amber-500 mb-4" />
      <h3 className="font-medium text-lg mb-2">Erro ao carregar logs</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Não foi possível recuperar os registros do sistema.
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
            Tentando novamente...
          </>
        ) : (
          'Tentar novamente'
        )}
      </Button>
    </div>
  );

  // Empty state
  const renderEmpty = () => (
    <div className="text-center py-8 text-muted-foreground">
      <p>Nenhum log encontrado</p>
      {!isAuthenticated && (
        <p className="text-sm mt-2">
          Faça login para visualizar os logs do sistema
        </p>
      )}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="mr-2 h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : hasError ? (
          renderError()
        ) : logs.length === 0 ? (
          renderEmpty()
        ) : (
          <ScrollArea className="h-[250px]">
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className={`p-3 border rounded-md ${getLogLevelClass(log.level)}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{log.message}</div>
                      <div className="text-xs mt-1 opacity-70">
                        {new Date(log.created_at).toLocaleString()}
                      </div>
                    </div>
                    <CustomBadge variant="outline">
                      {log.level.toUpperCase()}
                    </CustomBadge>
                  </div>
                  {log.details && (
                    <div className="mt-2 pt-2 border-t border-gray-200 text-sm overflow-auto max-h-24">
                      <pre className="text-xs whitespace-pre-wrap">
                        {JSON.stringify(log.details, null, 2)}
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
              Testando...
            </>
          ) : (
            'Criar log de teste'
          )}
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={fetchLogs} 
          disabled={isLoading || !isAuthenticated}
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
