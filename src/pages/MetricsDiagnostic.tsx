
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHeader from '@/components/PageHeader';
import { useToast } from '@/hooks/use-toast';
import { testSupabaseConnection, checkDatabaseTables } from '@/integrations/supabase/client';
import { validateConnection } from '@/utils/debugTools';
import { supabase } from '@/integrations/supabase/core';
import DbFunctionTester from '@/components/diagnostic/DbFunctionTester';

const MetricsDiagnostic = () => {
  const { toast } = useToast();
  const [connectionStatus, setConnectionStatus] = React.useState<any>(null);

  const checkConnection = async () => {
    const result = await validateConnection(supabase);
    setConnectionStatus(result);
    
    if (result.valid) {
      toast({
        title: "Connection Successful",
        description: `Connected to database in ${result.responseTime}ms`,
      });
    } else {
      toast({
        title: "Connection Failed",
        description: result.message,
        variant: "destructive"
      });
    }
  };

  React.useEffect(() => {
    checkConnection();
  }, []);

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader 
        title="Diagnóstico de Métricas" 
        subtitle="Ferramenta para testar funções relacionadas ao módulo de métricas" 
      />
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Status da Conexão</CardTitle>
        </CardHeader>
        <CardContent>
          {connectionStatus ? (
            <div className="space-y-2">
              <div>
                <span className="font-medium">Status:</span> 
                <span className={connectionStatus.valid ? "text-green-600" : "text-red-600"}>
                  {connectionStatus.valid ? " Conectado" : " Desconectado"}
                </span>
              </div>
              <div>
                <span className="font-medium">Mensagem:</span> {connectionStatus.message}
              </div>
              {connectionStatus.responseTime && (
                <div>
                  <span className="font-medium">Tempo de resposta:</span> {connectionStatus.responseTime}ms
                </div>
              )}
              {connectionStatus.version && (
                <div>
                  <span className="font-medium">Versão do PostgreSQL:</span> {connectionStatus.version}
                </div>
              )}
            </div>
          ) : (
            <div>Verificando conexão...</div>
          )}
        </CardContent>
      </Card>
      
      <Tabs defaultValue="create">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="create">Criar Métrica</TabsTrigger>
          <TabsTrigger value="get">Listar Métricas</TabsTrigger>
          <TabsTrigger value="test">Função Personalizada</TabsTrigger>
        </TabsList>
        
        <TabsContent value="create" className="space-y-4">
          <DbFunctionTester 
            functionName="create_metric_definition"
            defaultParams={{
              metric_name: "Teste Diagnóstico",
              metric_description: "Métrica criada para teste",
              metric_unit: "unidades",
              metric_target: 100,
              metric_department_id: null, // Precisa ser substituído por um ID válido
              metric_frequency: "monthly",
              metric_is_active: true,
              metric_icon_name: "chart-line",
              metric_lower_is_better: false,
              metric_visualization_type: "card",
              metric_priority: "normal",
              metric_default_period: "month"
            }}
          />
          <div className="text-sm text-muted-foreground">
            <p>Nota: Para testar a criação de uma métrica, você precisa substituir o 
               <code>metric_department_id</code> por um ID válido de departamento existente.</p>
          </div>
        </TabsContent>
        
        <TabsContent value="get">
          <DbFunctionTester 
            functionName="get_metrics_by_department"
            defaultParams={{
              department_id_param: null,
              date_param: new Date().toISOString().split('T')[0]
            }}
          />
        </TabsContent>
        
        <TabsContent value="test">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Lista de funções disponíveis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <ul className="list-disc pl-5 space-y-1">
                <li><code>create_metric_definition</code> - Cria nova métrica</li>
                <li><code>update_metric_definition</code> - Atualiza uma métrica existente</li>
                <li><code>delete_metric_definition</code> - Exclui uma métrica</li>
                <li><code>get_metrics_by_department</code> - Lista métricas por departamento</li>
                <li><code>record_metric_value</code> - Registra um valor para uma métrica</li>
                <li><code>get_metric_history</code> - Obtém histórico de valores de uma métrica</li>
              </ul>
              <p className="mt-4">Para testar essas funções, acesse a página de Diagnóstico do Sistema.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MetricsDiagnostic;
