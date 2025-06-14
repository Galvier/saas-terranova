
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Shield, Download, RefreshCw, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuditLog {
  id: string;
  level: string;
  message: string;
  details?: any;
  created_at: string;
  user_id?: string;
}

export function SecurityAuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSecurityLogs();
  }, []);

  const fetchSecurityLogs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('logs')
        .select('*')
        .or('level.eq.error,level.eq.warn,message.ilike.%security%,message.ilike.%audit%')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Erro ao buscar logs de segurança:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os logs de segurança.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warn':
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Shield className="h-4 w-4 text-gray-500" />;
    }
  };

  const getLevelBadge = (level: string) => {
    switch (level.toLowerCase()) {
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
      case 'warn':
      case 'warning':
        return <Badge variant="secondary">Aviso</Badge>;
      case 'info':
        return <Badge variant="outline">Info</Badge>;
      default:
        return <Badge variant="outline">{level}</Badge>;
    }
  };

  const exportLogs = () => {
    const exportData = logs.map(log => ({
      timestamp: log.created_at,
      level: log.level,
      message: log.message,
      details: log.details,
      user_id: log.user_id
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-audit-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast({
      title: 'Logs exportados',
      description: 'Os logs de auditoria foram exportados com sucesso.'
    });
  };

  const createTestSecurityLog = async () => {
    try {
      const { data, error } = await supabase.rpc('create_security_log', {
        log_level: 'info',
        log_message: 'Teste de log de segurança gerado pelo usuário',
        log_details: {
          test: true,
          timestamp: new Date().toISOString(),
          action: 'manual_test'
        }
      });

      if (error) throw error;

      toast({
        title: 'Log de teste criado',
        description: 'Um log de teste foi criado com sucesso.'
      });
      
      fetchSecurityLogs();
    } catch (error) {
      console.error('Erro ao criar log de teste:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o log de teste.',
        variant: 'destructive'
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Logs de Auditoria de Segurança
            </CardTitle>
            <CardDescription>
              Registro de eventos relacionados à segurança do sistema
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={createTestSecurityLog}
            >
              Teste
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportLogs}
              disabled={logs.length === 0}
            >
              <Download className="h-4 w-4 mr-1" />
              Exportar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchSecurityLogs}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Carregando logs de segurança...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Nenhum log de segurança encontrado.</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Nível</TableHead>
                  <TableHead className="w-[150px]">Data/Hora</TableHead>
                  <TableHead>Mensagem</TableHead>
                  <TableHead className="w-[100px]">Detalhes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getLevelIcon(log.level)}
                        {getLevelBadge(log.level)}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(log.created_at).toLocaleString('pt-BR')}
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate">
                      {log.message}
                    </TableCell>
                    <TableCell>
                      {log.details && (
                        <Badge variant="outline" className="text-xs">
                          JSON
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
