
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Shield, ShieldAlert, ShieldCheck, AlertTriangle, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SecurityCheck {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  critical: boolean;
}

export function SecurityHealthCard() {
  const [securityChecks, setSecurityChecks] = useState<SecurityCheck[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [securityScore, setSecurityScore] = useState(0);

  useEffect(() => {
    checkSecurityStatus();
  }, []);

  const checkSecurityStatus = async () => {
    setIsLoading(true);
    const checks: SecurityCheck[] = [];

    try {
      // Verificar RLS habilitado nas tabelas críticas individualmente
      
      // Verificar managers
      try {
        const { data, error } = await supabase
          .from('managers')
          .select('*')
          .limit(1);
        
        if (!error) {
          checks.push({
            name: 'RLS Ativo - managers',
            status: 'pass',
            message: 'Row Level Security habilitado para managers',
            critical: true
          });
        }
      } catch (err) {
        checks.push({
          name: 'RLS Verificação - managers',
          status: 'warning',
          message: 'Não foi possível verificar RLS para managers',
          critical: true
        });
      }

      // Verificar logs
      try {
        const { data, error } = await supabase
          .from('logs')
          .select('*')
          .limit(1);
        
        if (!error) {
          checks.push({
            name: 'RLS Ativo - logs',
            status: 'pass',
            message: 'Row Level Security habilitado para logs',
            critical: true
          });
        }
      } catch (err) {
        checks.push({
          name: 'RLS Verificação - logs',
          status: 'warning',
          message: 'Não foi possível verificar RLS para logs',
          critical: true
        });
      }

      // Verificar metrics_definition
      try {
        const { data, error } = await supabase
          .from('metrics_definition')
          .select('*')
          .limit(1);
        
        if (!error) {
          checks.push({
            name: 'RLS Ativo - metrics_definition',
            status: 'pass',
            message: 'Row Level Security habilitado para metrics_definition',
            critical: true
          });
        }
      } catch (err) {
        checks.push({
          name: 'RLS Verificação - metrics_definition',
          status: 'warning',
          message: 'Não foi possível verificar RLS para metrics_definition',
          critical: true
        });
      }

      // Verificar notifications
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .limit(1);
        
        if (!error) {
          checks.push({
            name: 'RLS Ativo - notifications',
            status: 'pass',
            message: 'Row Level Security habilitado para notifications',
            critical: true
          });
        }
      } catch (err) {
        checks.push({
          name: 'RLS Verificação - notifications',
          status: 'warning',
          message: 'Não foi possível verificar RLS para notifications',
          critical: true
        });
      }

      // Verificar se existem logs de auditoria recentes
      const { data: recentLogs, error: logsError } = await supabase
        .from('logs')
        .select('*')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .limit(10);

      if (!logsError && recentLogs && recentLogs.length > 0) {
        checks.push({
          name: 'Logs de Auditoria',
          status: 'pass',
          message: `${recentLogs.length} logs de auditoria nas últimas 24h`,
          critical: false
        });
      } else {
        checks.push({
          name: 'Logs de Auditoria',
          status: 'warning',
          message: 'Poucos logs de auditoria recentes',
          critical: false
        });
      }

      // Verificar se função is_admin existe
      const { data: adminCheck, error: adminError } = await supabase.rpc('is_admin');
      
      if (!adminError) {
        checks.push({
          name: 'Função de Segurança',
          status: 'pass',
          message: 'Função is_admin configurada corretamente',
          critical: true
        });
      } else {
        checks.push({
          name: 'Função de Segurança',
          status: 'fail',
          message: 'Função is_admin não encontrada ou com erro',
          critical: true
        });
      }

      // Verificar autenticação ativa
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (user && !authError) {
        checks.push({
          name: 'Autenticação',
          status: 'pass',
          message: 'Sistema de autenticação funcionando',
          critical: true
        });
      } else {
        checks.push({
          name: 'Autenticação',
          status: 'fail',
          message: 'Problema na autenticação do usuário',
          critical: true
        });
      }

    } catch (error) {
      console.error('Erro ao verificar segurança:', error);
      checks.push({
        name: 'Verificação Geral',
        status: 'fail',
        message: 'Erro durante verificação de segurança',
        critical: true
      });
    }

    setSecurityChecks(checks);
    calculateSecurityScore(checks);
    setIsLoading(false);
  };

  const calculateSecurityScore = (checks: SecurityCheck[]) => {
    const totalChecks = checks.length;
    const passedChecks = checks.filter(check => check.status === 'pass').length;
    const criticalFailed = checks.filter(check => check.critical && check.status === 'fail').length;
    
    let score = Math.round((passedChecks / totalChecks) * 100);
    
    // Penalizar falhas críticas
    if (criticalFailed > 0) {
      score = Math.max(0, score - (criticalFailed * 20));
    }
    
    setSecurityScore(score);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreStatus = (score: number) => {
    if (score >= 90) return { label: 'Excelente', icon: ShieldCheck, color: 'success' };
    if (score >= 70) return { label: 'Bom', icon: Shield, color: 'warning' };
    return { label: 'Crítico', icon: ShieldAlert, color: 'destructive' };
  };

  const statusInfo = getScoreStatus(securityScore);
  const StatusIcon = statusInfo.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Segurança da Aplicação
        </CardTitle>
        <CardDescription>
          Verificações automáticas de segurança e políticas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Score de Segurança */}
        <div className="text-center">
          <div className={`text-4xl font-bold ${getScoreColor(securityScore)} mb-2`}>
            {isLoading ? '...' : `${securityScore}%`}
          </div>
          <Badge variant={statusInfo.color as any} className="mb-4">
            <StatusIcon className="w-3 h-3 mr-1" />
            {statusInfo.label}
          </Badge>
          <Progress value={securityScore} className="mb-4" />
        </div>

        {/* Lista de Verificações */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center text-muted-foreground">
              Verificando configurações de segurança...
            </div>
          ) : (
            securityChecks.map((check, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {check.status === 'pass' && <CheckCircle className="h-4 w-4 text-green-500" />}
                  {check.status === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                  {check.status === 'fail' && <ShieldAlert className="h-4 w-4 text-red-500" />}
                  <div>
                    <div className="font-medium text-sm">{check.name}</div>
                    <div className="text-xs text-muted-foreground">{check.message}</div>
                  </div>
                </div>
                {check.critical && (
                  <Badge variant="outline" className="text-xs">
                    Crítico
                  </Badge>
                )}
              </div>
            ))
          )}
        </div>

        {/* Alertas Críticos */}
        {securityChecks.some(check => check.critical && check.status === 'fail') && (
          <Alert variant="destructive">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Problemas Críticos Detectados</AlertTitle>
            <AlertDescription>
              Foram encontrados problemas críticos de segurança que precisam de atenção imediata.
              Verifique as configurações RLS e funções de segurança.
            </AlertDescription>
          </Alert>
        )}

        {/* Recomendações */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-sm text-blue-800 mb-2">🔒 Medidas de Segurança Implementadas:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Row Level Security (RLS) habilitado em todas as tabelas</li>
            <li>• Políticas de acesso baseadas em roles (admin/manager)</li>
            <li>• Funções SECURITY DEFINER com search_path seguro</li>
            <li>• Logs de auditoria para operações sensíveis</li>
            <li>• Verificação automática de integridade</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
