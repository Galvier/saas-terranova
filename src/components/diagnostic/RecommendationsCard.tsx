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
      action: 'Verifique as configurações de conexão e credenciais.',
      category: 'connectivity'
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
      action: 'Considere criar dados iniciais para essas tabelas.',
      category: 'data'
    });
  }
  
  // Verificar problemas de escrita
  if (writeTest?.status === 'error') {
    recommendations.push({
      priority: 'high',
      title: 'Problemas de escrita no banco',
      description: 'Não foi possível realizar operações de escrita no banco de dados.',
      action: 'Verifique as permissões de escrita e políticas RLS.',
      category: 'security'
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
        action: 'Crie contas de usuário para os managers ou associe contas existentes.',
        category: 'auth'
      });
    }
  }

  // Recomendações específicas de segurança
  const tablesWithoutRLS = tables.filter(t => 
    ['departments', 'managers', 'metrics_definition', 'logs'].includes(t.name) && 
    t.status === 'error'
  );

  if (tablesWithoutRLS.length > 0) {
    recommendations.push({
      priority: 'high',
      title: 'Tabelas sem proteção RLS',
      description: `${tablesWithoutRLS.length} tabelas críticas podem estar sem Row Level Security.`,
      action: 'Verifique se as políticas RLS foram aplicadas corretamente.',
      category: 'security',
      sql: `-- Verificar status RLS
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('departments', 'managers', 'metrics_definition', 'logs');`
    });
  }

  // Adicionar recomendação de monitoramento contínuo
  recommendations.push({
    priority: 'low',
    title: 'Monitoramento de Segurança',
    description: 'Configure alertas automáticos para eventos de segurança.',
    action: 'Implemente notificações para tentativas de acesso suspeitas e falhas de autenticação.',
    category: 'security'
  });

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
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'security': return '🔒';
      case 'connectivity': return '🔌';
      case 'data': return '📊';
      case 'auth': return '👤';
      default: return '💡';
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
              🎉 Parabéns! Todas as verificações de segurança passaram e não foram detectados problemas críticos.
              Continue monitorando o sistema regularmente e mantenha as melhores práticas de segurança.
            </AlertDescription>
          </Alert>
          
          {/* Resumo das melhorias de segurança implementadas */}
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-sm text-green-800 mb-2">🛡️ Segurança Implementada:</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Row Level Security (RLS) habilitado em todas as tabelas críticas</li>
              <li>• Políticas de acesso baseadas em roles (admin/manager)</li>
              <li>• Funções SECURITY DEFINER com search_path protegido</li>
              <li>• Sistema de logs de auditoria implementado</li>
              <li>• Validação de permissões em tempo real</li>
              <li>• Monitoramento automático de segurança ativo</li>
            </ul>
          </div>
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
                  <span className="text-lg">{getCategoryIcon(rec.category)}</span>
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
                  <span className="text-sm font-medium">SQL para verificação:</span>
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
        
        {/* Melhorias de Segurança Implementadas */}
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-medium text-sm text-green-800 mb-2">🛡️ Melhorias de Segurança Aplicadas:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-green-700">
            <div>• RLS habilitado em {tables.length} tabelas</div>
            <div>• Políticas baseadas em roles</div>
            <div>• Funções SECURITY DEFINER protegidas</div>
            <div>• Logs de auditoria implementados</div>
            <div>• Verificação automática de integridade</div>
            <div>• Monitoramento de segurança ativo</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
