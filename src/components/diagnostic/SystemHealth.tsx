
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CustomBadge } from '@/components/ui/custom-badge';
import { Activity, Database, Shield, Zap } from 'lucide-react';
import { ConnectionInfo, TableInfo, DiagnosticResult } from '@/utils/supabaseDiagnostic';

interface SystemHealthProps {
  connection: ConnectionInfo | null;
  tables: TableInfo[];
  writeTest: DiagnosticResult | null;
  syncStatus: DiagnosticResult | null;
}

export function SystemHealth({ connection, tables, writeTest, syncStatus }: SystemHealthProps) {
  const calculateHealthScore = () => {
    let score = 0;
    let maxScore = 0;
    
    // Conexão (25 pontos)
    maxScore += 25;
    if (connection?.connected) score += 25;
    
    // Tabelas (40 pontos)
    maxScore += 40;
    const okTables = tables.filter(t => t.status === 'ok').length;
    const totalTables = tables.length;
    if (totalTables > 0) {
      score += Math.round((okTables / totalTables) * 40);
    }
    
    // Teste de escrita (20 pontos)
    maxScore += 20;
    if (writeTest?.status === 'success') score += 20;
    
    // Sincronização (15 pontos)
    maxScore += 15;
    if (syncStatus?.status === 'success') score += 15;
    
    return Math.round((score / maxScore) * 100);
  };

  const healthScore = calculateHealthScore();
  
  const getHealthStatus = (score: number) => {
    if (score >= 90) return { status: 'Excelente', color: 'success', icon: '🟢' };
    if (score >= 75) return { status: 'Bom', color: 'success', icon: '🟡' };
    if (score >= 50) return { status: 'Regular', color: 'warning', icon: '🟠' };
    return { status: 'Crítico', color: 'destructive', icon: '🔴' };
  };

  const health = getHealthStatus(healthScore);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Saúde do Sistema
        </CardTitle>
        <CardDescription>
          Pontuação geral baseada em múltiplos fatores
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="text-4xl font-bold mb-2">{healthScore}%</div>
          <CustomBadge variant={health.color as any} className="text-sm">
            {health.icon} {health.status}
          </CustomBadge>
          <Progress value={healthScore} className="mt-4" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Database className="h-5 w-5 text-blue-500" />
            <div>
              <div className="font-medium">Conexão</div>
              <div className="text-sm text-muted-foreground">
                {connection?.connected ? 'Conectado' : 'Desconectado'}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Shield className="h-5 w-5 text-green-500" />
            <div>
              <div className="font-medium">Tabelas</div>
              <div className="text-sm text-muted-foreground">
                {tables.filter(t => t.status === 'ok').length} de {tables.length} OK
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Zap className="h-5 w-5 text-purple-500" />
            <div>
              <div className="font-medium">Escrita</div>
              <div className="text-sm text-muted-foreground">
                {writeTest?.status === 'success' ? 'Funcionando' : 'Com problemas'}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Activity className="h-5 w-5 text-orange-500" />
            <div>
              <div className="font-medium">Sincronização</div>
              <div className="text-sm text-muted-foreground">
                {syncStatus?.status === 'success' ? 'Ativa' : 'Inativa'}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
