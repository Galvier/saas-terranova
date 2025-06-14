
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, ExternalLink, Copy } from 'lucide-react';
import { ConnectionInfo, TableInfo, DiagnosticResult } from '@/utils/supabaseDiagnostic';
import { useToast } from '@/hooks/use-toast';

interface RecommendationsCardProps {
  connection: ConnectionInfo | null;
  tables: TableInfo[];
  writeTest: DiagnosticResult | null;
  syncStatus: DiagnosticResult | null;
}

export function RecommendationsCard({ connection, tables, writeTest, syncStatus }: RecommendationsCardProps) {
  const { toast } = useToast();
  
  const recommendations = [];
  
  // Verificar problemas de conexão
  if (!connection?.connected) {
    recommendations.push({
      priority: 'high',
      title: 'Problema de Conexão',
      description: 'A conexão com o Supabase está falhando.',
      action: 'Verifique as configurações de conexão e credenciais.'
    });
  }
  
  // Verificar tabela users
  const usersTable = tables.find(t => t.name === 'users');
  if (usersTable?.status === 'error') {
    recommendations.push({
      priority: 'high',
      title: 'Tabela users não encontrada',
      description: 'A tabela users do sistema de autenticação não está acessível.',
      action: 'Esta tabela faz parte do auth.users do Supabase. Verifique as permissões de acesso.',
      sql: 'SELECT * FROM auth.users LIMIT 1; -- Teste de acesso'
    });
  }
  
  // Verificar tabelas vazias importantes
  const emptyImportantTables = tables.filter(t => 
    t.status === 'empty' && ['departments', 'managers', 'metrics_definition'].includes(t.name)
  );
  
  if (emptyImportantTables.length > 0) {
    recommendations.push({
      priority: 'medium',
      title: 'Tabelas importantes estão vazias',
      description: `As tabelas ${emptyImportantTables.map(t => t.name).join(', ')} estão vazias.`,
      action: 'Considere criar dados iniciais para essas tabelas.'
    });
  }
  
  // Verificar problemas de escrita
  if (writeTest?.status === 'error') {
    recommendations.push({
      priority: 'high',
      title: 'Problemas de escrita no banco',
      description: 'Não foi possível realizar operações de escrita no banco de dados.',
      action: 'Verifique as permissões de escrita e políticas RLS.'
    });
  }
  
  // Verificar sincronização
  if (syncStatus?.details) {
    const { managers_count, synced_users_count } = syncStatus.details;
    if (synced_users_count < managers_count) {
      recommendations.push({
        priority: 'medium',
        title: 'Managers sem usuários associados',
        description: `${managers_count - synced_users_count} managers não possuem contas de usuário.`,
        action: 'Crie contas de usuário para os managers ou associe contas existentes.'
      });
    }
  }
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copiado!',
      description: 'SQL copiado para a área de transferência.',
    });
  };
  
  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };
  
  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return 'Normal';
    }
  };
  
  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-green-500" />
            Recomendações
          </CardTitle>
          <CardDescription>
            Sugestões para melhorar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertDescription>
              🎉 Parabéns! Não foram detectados problemas que precisem de atenção imediata.
              Continue monitorando o sistema regularmente.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Recomendações ({recommendations.length})
        </CardTitle>
        <CardDescription>
          Ações sugeridas para resolver problemas detectados
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.map((rec, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{rec.title}</h4>
                  <Badge variant={getPriorityVariant(rec.priority) as any}>
                    {getPriorityLabel(rec.priority)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{rec.description}</p>
              </div>
            </div>
            
            <div className="bg-muted/50 p-3 rounded text-sm">
              <strong>Ação recomendada:</strong> {rec.action}
            </div>
            
            {rec.sql && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">SQL para teste:</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(rec.sql!)}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copiar
                  </Button>
                </div>
                <pre className="bg-black text-green-400 p-2 rounded text-xs overflow-x-auto">
                  {rec.sql}
                </pre>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
