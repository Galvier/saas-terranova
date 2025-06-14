
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle, AlertTriangle, XCircle, Lock } from 'lucide-react';

interface SecuritySummaryProps {
  totalPolicies: number;
  activePolicies: number;
  criticalIssues: number;
  warnings: number;
  lastSecurityCheck?: Date;
}

export function SecuritySummary({ 
  totalPolicies, 
  activePolicies, 
  criticalIssues, 
  warnings,
  lastSecurityCheck 
}: SecuritySummaryProps) {
  
  const policyCompleteness = totalPolicies > 0 ? Math.round((activePolicies / totalPolicies) * 100) : 0;
  
  const getSecurityStatus = () => {
    if (criticalIssues > 0) return { status: 'Crítico', color: 'destructive', icon: XCircle };
    if (warnings > 3) return { status: 'Atenção', color: 'warning', icon: AlertTriangle };
    if (policyCompleteness >= 95) return { status: 'Excelente', color: 'success', icon: CheckCircle };
    return { status: 'Bom', color: 'default', icon: Shield };
  };

  const securityStatus = getSecurityStatus();
  const StatusIcon = securityStatus.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Resumo de Segurança
        </CardTitle>
        <CardDescription>
          Visão geral do estado de segurança da aplicação
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Geral */}
        <div className="text-center">
          <Badge variant={securityStatus.color as any} className="mb-2">
            <StatusIcon className="w-3 h-3 mr-1" />
            {securityStatus.status}
          </Badge>
          <div className="text-sm text-muted-foreground">
            Status geral de segurança
          </div>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{activePolicies}</div>
            <div className="text-sm text-muted-foreground">Políticas Ativas</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold">{policyCompleteness}%</div>
            <div className="text-sm text-muted-foreground">Cobertura RLS</div>
          </div>
        </div>

        {/* Progresso da Implementação */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Implementação de Segurança</span>
            <span>{policyCompleteness}%</span>
          </div>
          <Progress value={policyCompleteness} />
        </div>

        {/* Alertas */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 p-2 border rounded">
            <XCircle className="h-4 w-4 text-red-500" />
            <div>
              <div className="font-medium text-sm">{criticalIssues}</div>
              <div className="text-xs text-muted-foreground">Críticos</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 border rounded">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <div>
              <div className="font-medium text-sm">{warnings}</div>
              <div className="text-xs text-muted-foreground">Avisos</div>
            </div>
          </div>
        </div>

        {/* Última Verificação */}
        {lastSecurityCheck && (
          <div className="text-xs text-muted-foreground text-center">
            Última verificação: {lastSecurityCheck.toLocaleString('pt-BR')}
          </div>
        )}

        {/* Principais Melhorias Implementadas */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <h4 className="font-medium text-sm text-green-800 mb-2">✅ Segurança Implementada:</h4>
          <ul className="text-xs text-green-700 space-y-1">
            <li>• RLS habilitado em todas as tabelas críticas</li>
            <li>• Políticas baseadas em roles (admin/manager)</li>
            <li>• Funções SECURITY DEFINER protegidas</li>
            <li>• Auditoria automática de operações</li>
            <li>• Validação de permissões em tempo real</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
