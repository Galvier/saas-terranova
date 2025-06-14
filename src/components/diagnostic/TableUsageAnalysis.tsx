
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Database, CheckCircle, AlertTriangle, XCircle, FileText } from 'lucide-react';
import { TableInfo } from '@/utils/supabaseDiagnostic';

interface TableUsageInfo {
  name: string;
  usage: 'active' | 'minimal' | 'unused';
  usedIn: string[];
  description: string;
  recordCount?: number;
  status?: 'ok' | 'empty' | 'error';
}

interface TableUsageAnalysisProps {
  tables: TableInfo[];
}

export function TableUsageAnalysis({ tables }: TableUsageAnalysisProps) {
  // Análise de uso das tabelas baseada no código do projeto
  const tableUsageMap: Record<string, TableUsageInfo> = {
    'users': {
      name: 'users (auth.users)',
      usage: 'active',
      usedIn: ['Authentication', 'User Management', 'Managers Sync'],
      description: 'Tabela principal de autenticação do Supabase'
    },
    'profiles': {
      name: 'profiles',
      usage: 'minimal',
      usedIn: ['User Profile Settings'],
      description: 'Perfis estendidos de usuários'
    },
    'departments': {
      name: 'departments',
      usage: 'active',
      usedIn: ['Department Management', 'Metrics Assignment', 'Manager Assignment'],
      description: 'Departamentos da organização'
    },
    'managers': {
      name: 'managers',
      usage: 'active',
      usedIn: ['Manager Management', 'Authentication Sync', 'Department Assignment'],
      description: 'Gestores do sistema'
    },
    'metrics': {
      name: 'metrics (legacy)',
      usage: 'unused',
      usedIn: [],
      description: 'Tabela legada de métricas (substituída por metrics_definition)'
    },
    'metrics_definition': {
      name: 'metrics_definition',
      usage: 'active',
      usedIn: ['Metrics Management', 'Dashboard', 'KPI Cards', 'Analytics'],
      description: 'Definições das métricas do sistema'
    },
    'metrics_values': {
      name: 'metrics_values',
      usage: 'active',
      usedIn: ['Metrics Recording', 'Dashboard Charts', 'Performance Analysis'],
      description: 'Valores registrados das métricas'
    },
    'settings': {
      name: 'settings',
      usage: 'minimal',
      usedIn: ['System Configuration'],
      description: 'Configurações gerais do sistema'
    },
    'user_settings': {
      name: 'user_settings',
      usage: 'active',
      usedIn: ['User Preferences', 'Theme Settings', 'Interface Configuration'],
      description: 'Configurações individuais dos usuários'
    },
    'logs': {
      name: 'logs',
      usage: 'active',
      usedIn: ['System Logging', 'Audit Trail', 'Diagnostic Logs'],
      description: 'Logs de sistema e auditoria'
    },
    'admin_dashboard_config': {
      name: 'admin_dashboard_config',
      usage: 'active',
      usedIn: ['Admin Dashboard', 'Metric Selection'],
      description: 'Configurações do dashboard administrativo'
    },
    'notifications': {
      name: 'notifications',
      usage: 'active',
      usedIn: ['Notification System', 'User Alerts', 'System Messages'],
      description: 'Notificações do sistema'
    },
    'notification_settings': {
      name: 'notification_settings',
      usage: 'active',
      usedIn: ['Notification Configuration', 'System Settings'],
      description: 'Configurações de notificações'
    },
    'notification_templates': {
      name: 'notification_templates',
      usage: 'active',
      usedIn: ['Notification System', 'Template Management'],
      description: 'Templates de notificações'
    },
    'metric_justifications': {
      name: 'metric_justifications',
      usage: 'active',
      usedIn: ['Metric Justifications', 'Admin Review', 'Performance Analysis'],
      description: 'Justificativas para métricas'
    },
    'backup_settings': {
      name: 'backup_settings',
      usage: 'active',
      usedIn: ['Backup Configuration', 'Auto Backup'],
      description: 'Configurações de backup'
    },
    'backup_history': {
      name: 'backup_history',
      usage: 'active',
      usedIn: ['Backup Management', 'History Tracking'],
      description: 'Histórico de backups'
    },
    'backup_data': {
      name: 'backup_data',
      usage: 'active',
      usedIn: ['Backup Storage', 'Data Recovery'],
      description: 'Dados dos backups'
    },
    'push_subscriptions': {
      name: 'push_subscriptions',
      usage: 'minimal',
      usedIn: ['Push Notifications'],
      description: 'Assinaturas para notificações push'
    },
    'scheduled_notifications': {
      name: 'scheduled_notifications',
      usage: 'minimal',
      usedIn: ['Scheduled Notifications'],
      description: 'Notificações agendadas'
    },
    'department_managers': {
      name: 'department_managers',
      usage: 'minimal',
      usedIn: ['Department Management'],
      description: 'Relacionamento departamento-gestor'
    },
    'diagnostic_tests': {
      name: 'diagnostic_tests',
      usage: 'active',
      usedIn: ['System Diagnostic', 'Health Checks'],
      description: 'Testes de diagnóstico do sistema'
    }
  };

  // Combinar dados das tabelas com informações de uso
  const enrichedTables = tables.map(table => {
    const usageInfo = tableUsageMap[table.name] || {
      name: table.name,
      usage: 'unused' as const,
      usedIn: [],
      description: 'Tabela não identificada no mapeamento'
    };

    return {
      ...usageInfo,
      recordCount: table.recordCount,
      status: table.status
    };
  });

  // Adicionar tabelas não encontradas no banco
  const tablesInDatabase = new Set(tables.map(t => t.name));
  const missingTables = Object.entries(tableUsageMap)
    .filter(([tableName]) => !tablesInDatabase.has(tableName))
    .map(([, info]) => ({
      ...info,
      status: 'error' as const,
      recordCount: null
    }));

  const allTables = [...enrichedTables, ...missingTables];

  // Estatísticas
  const stats = {
    total: allTables.length,
    active: allTables.filter(t => t.usage === 'active').length,
    minimal: allTables.filter(t => t.usage === 'minimal').length,
    unused: allTables.filter(t => t.usage === 'unused').length,
    missing: missingTables.length
  };

  const getUsageBadge = (usage: string) => {
    switch (usage) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Ativa</Badge>;
      case 'minimal':
        return <Badge variant="secondary"><AlertTriangle className="w-3 h-3 mr-1" />Mínima</Badge>;
      case 'unused':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Não Usada</Badge>;
      default:
        return <Badge variant="outline">Desconhecida</Badge>;
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'ok':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'empty':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Database className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Análise de Uso das Tabelas
        </CardTitle>
        <CardDescription>
          Identificação de tabelas ativas, subutilizadas e não utilizadas no sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Estatísticas Resumidas */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-sm text-muted-foreground">Ativas</div>
          </div>
          <div className="text-center p-3 bg-amber-50 rounded-lg">
            <div className="text-2xl font-bold text-amber-600">{stats.minimal}</div>
            <div className="text-sm text-muted-foreground">Mínimas</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{stats.unused}</div>
            <div className="text-sm text-muted-foreground">Não Usadas</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-600">{stats.missing}</div>
            <div className="text-sm text-muted-foreground">Ausentes</div>
          </div>
        </div>

        {/* Tabela Detalhada */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Tabela</TableHead>
                <TableHead>Uso</TableHead>
                <TableHead className="text-right">Registros</TableHead>
                <TableHead>Usado em</TableHead>
                <TableHead>Descrição</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allTables
                .sort((a, b) => {
                  // Ordenar por uso (ativa, mínima, não usada) e depois por nome
                  const usageOrder = { active: 0, minimal: 1, unused: 2 };
                  const aOrder = usageOrder[a.usage as keyof typeof usageOrder] ?? 3;
                  const bOrder = usageOrder[b.usage as keyof typeof usageOrder] ?? 3;
                  
                  if (aOrder !== bOrder) return aOrder - bOrder;
                  return a.name.localeCompare(b.name);
                })
                .map((table) => (
                  <TableRow key={table.name}>
                    <TableCell>{getStatusIcon(table.status)}</TableCell>
                    <TableCell className="font-medium">{table.name}</TableCell>
                    <TableCell>{getUsageBadge(table.usage)}</TableCell>
                    <TableCell className="text-right">
                      {table.recordCount !== null && table.recordCount !== undefined 
                        ? table.recordCount.toLocaleString() 
                        : table.status === 'error' ? 'N/A' : '0'}
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      {table.usedIn.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {table.usedIn.slice(0, 3).map((usage, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {usage}
                            </Badge>
                          ))}
                          {table.usedIn.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{table.usedIn.length - 3}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Não usado</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate" title={table.description}>
                      {table.description}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>

        {/* Recomendações */}
        {(stats.unused > 0 || stats.missing > 0) && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Recomendações:</h4>
            {stats.unused > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  <strong>Tabelas não utilizadas:</strong> Considere remover as tabelas que não estão sendo usadas para otimizar o banco de dados.
                </p>
              </div>
            )}
            {stats.missing > 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>Tabelas ausentes:</strong> Algumas tabelas esperadas não foram encontradas no banco de dados. Verifique se as migrações foram executadas corretamente.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
