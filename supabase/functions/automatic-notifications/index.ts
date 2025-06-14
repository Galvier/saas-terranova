
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DatabaseResponse {
  data?: any;
  error?: any;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    console.log("Iniciando processamento de notificações automáticas...");

    let notificationCount = 0;
    let achievementCount = 0;
    let pendingCount = 0;
    let metricsWithoutTargetsCount = 0;
    let overdueMissedCount = 0;

    // Log início do processamento
    await supabase.from('logs').insert({
      level: 'info',
      message: 'Iniciando processamento de notificações automáticas via edge function',
      details: { timestamp: new Date().toISOString() }
    });

    // 1. Buscar configurações
    const { data: deadlineData } = await supabase
      .from('notification_settings')
      .select('setting_value')
      .eq('setting_key', 'monthly_deadline_day')
      .single();

    const { data: reminderData } = await supabase
      .from('notification_settings')
      .select('setting_value')
      .eq('setting_key', 'reminder_days_before')
      .single();

    const monthlyDeadline = deadlineData?.setting_value ? parseInt(String(deadlineData.setting_value)) : 25;
    const reminderDays = reminderData?.setting_value ? 
      (Array.isArray(reminderData.setting_value) ? reminderData.setting_value.map(d => parseInt(String(d))) : [3, 5, 7]) : 
      [3, 5, 7];

    const currentDay = new Date().getDate();
    const daysUntilDeadline = monthlyDeadline - currentDay;

    console.log('Configurações:', { monthlyDeadline, reminderDays, currentDay, daysUntilDeadline });

    // 2. Verificar métricas que precisam de lembrete POR DEPARTAMENTO
    if (reminderDays.includes(daysUntilDeadline)) {
      console.log('Verificando métricas pendentes por departamento...');
      
      const { data: pendingMetrics, error: metricsError } = await supabase
        .from('metrics_definition')
        .select(`
          id, name, department_id,
          departments!inner(name)
        `)
        .eq('frequency', 'monthly')
        .eq('is_active', true);

      if (metricsError) {
        console.error('Erro ao buscar métricas:', metricsError);
      } else if (pendingMetrics && pendingMetrics.length > 0) {
        // Agrupar métricas por departamento
        const metricsByDepartment = pendingMetrics.reduce((acc, metric) => {
          const deptId = metric.department_id || 'no_department';
          if (!acc[deptId]) {
            acc[deptId] = [];
          }
          acc[deptId].push(metric);
          return acc;
        }, {} as Record<string, any[]>);

        // Processar cada departamento separadamente
        for (const [departmentId, metrics] of Object.entries(metricsByDepartment)) {
          const pendingMetricsForDept = [];
          
          for (const metric of metrics) {
            // Verificar se já tem valor para este mês
            const { data: existingValue } = await supabase
              .from('metrics_values')
              .select('id')
              .eq('metrics_definition_id', metric.id)
              .gte('date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0])
              .lt('date', new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString().split('T')[0])
              .single();

            if (!existingValue) {
              pendingMetricsForDept.push(metric);
            }
          }

          if (pendingMetricsForDept.length > 0) {
            // Buscar apenas gestores DESTE departamento específico
            const { data: departmentManagers } = await supabase
              .from('managers')
              .select('user_id, name')
              .eq('department_id', departmentId === 'no_department' ? null : departmentId)
              .eq('is_active', true)
              .not('user_id', 'is', null);

            if (departmentManagers && departmentManagers.length > 0) {
              const departmentName = metrics[0]?.departments?.name || 'Sem Departamento';
              const metricNames = pendingMetricsForDept.map(m => m.name).join(', ');

              for (const manager of departmentManagers) {
                await supabase.from('notifications').insert({
                  user_id: manager.user_id,
                  title: `Lembrete: ${pendingMetricsForDept.length} métrica(s) pendente(s)`,
                  message: `As seguintes métricas do departamento ${departmentName} precisam ser preenchidas até o dia ${monthlyDeadline}: ${metricNames}`,
                  type: 'warning',
                  metadata: {
                    department_id: departmentId === 'no_department' ? null : departmentId,
                    department_name: departmentName,
                    pending_metrics_count: pendingMetricsForDept.length,
                    deadline_day: monthlyDeadline,
                    alert_type: 'department_metrics_reminder'
                  }
                });
                notificationCount++;
              }
            }
          }
        }
      }
    }

    // 3. Verificar métricas sem metas definidas (para admins)
    console.log('Verificando métricas sem metas definidas...');
    
    const { data: metricsWithoutTargets, error: targetsError } = await supabase
      .from('metrics_definition')
      .select(`
        id, name, department_id,
        departments(name)
      `)
      .eq('is_active', true)
      .or('target.is.null,target.eq.0');

    if (targetsError) {
      console.error('Erro ao buscar métricas sem metas:', targetsError);
    } else if (metricsWithoutTargets && metricsWithoutTargets.length > 0) {
      metricsWithoutTargetsCount = metricsWithoutTargets.length;

      // Verificar se já enviamos notificação recente sobre métricas sem metas
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data: recentTargetNotification } = await supabase
        .from('notifications')
        .select('id')
        .eq('metadata->>alert_type', 'metrics_without_targets')
        .gte('created_at', sevenDaysAgo.toISOString())
        .single();

      if (!recentTargetNotification) {
        const { data: admins } = await supabase
          .from('managers')
          .select('user_id')
          .eq('role', 'admin')
          .eq('is_active', true)
          .not('user_id', 'is', null);

        if (admins && admins.length > 0) {
          // Agrupar por departamento para o resumo
          const departmentSummary = metricsWithoutTargets.reduce((acc, metric) => {
            const deptName = metric.departments?.name || 'Sem Departamento';
            acc[deptName] = (acc[deptName] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);

          const summaryText = Object.entries(departmentSummary)
            .map(([dept, count]) => `${dept}: ${count}`)
            .join('; ');

          for (const admin of admins) {
            await supabase.from('notifications').insert({
              user_id: admin.user_id,
              title: `Atenção: ${metricsWithoutTargetsCount} métrica(s) sem meta definida`,
              message: `Existem métricas ativas sem metas configuradas: ${summaryText}. Configure as metas para melhor acompanhamento dos resultados.`,
              type: 'warning',
              metadata: {
                metrics_without_targets_count: metricsWithoutTargetsCount,
                departments_affected: Object.keys(departmentSummary).length,
                alert_type: 'metrics_without_targets'
              }
            });
            notificationCount++;
          }
        }
      }
    }

    // 4. Verificar métricas não preenchidas após o deadline do mês atual
    if (currentDay > monthlyDeadline) {
      console.log('Verificando métricas não preenchidas após deadline...');
      
      const { data: overdueMetrics, error: overdueError } = await supabase
        .from('metrics_definition')
        .select(`
          id, name, department_id,
          departments(name)
        `)
        .eq('frequency', 'monthly')
        .eq('is_active', true);

      if (overdueError) {
        console.error('Erro ao buscar métricas em atraso:', overdueError);
      } else if (overdueMetrics && overdueMetrics.length > 0) {
        const overdueMissedByDepartment = {} as Record<string, any[]>;

        for (const metric of overdueMetrics) {
          // Verificar se tem valor para este mês
          const { data: existingValue } = await supabase
            .from('metrics_values')
            .select('id')
            .eq('metrics_definition_id', metric.id)
            .gte('date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0])
            .lt('date', new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString().split('T')[0])
            .single();

          if (!existingValue) {
            const deptId = metric.department_id || 'no_department';
            const deptName = metric.departments?.name || 'Sem Departamento';
            
            if (!overdueMissedByDepartment[deptId]) {
              overdueMissedByDepartment[deptId] = [];
            }
            overdueMissedByDepartment[deptId].push({
              ...metric,
              department_name: deptName
            });
          }
        }

        // Notificar gestores sobre métricas em atraso em seus departamentos
        for (const [departmentId, overdueMetricsForDept] of Object.entries(overdueMissedByDepartment)) {
          if (overdueMetricsForDept.length > 0) {
            // Verificar se já enviamos notificação recente para este departamento
            const threeDaysAgo = new Date();
            threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
            
            const { data: recentOverdueNotification } = await supabase
              .from('notifications')
              .select('id')
              .eq('metadata->>department_id', departmentId === 'no_department' ? null : departmentId)
              .eq('metadata->>alert_type', 'department_metrics_overdue')
              .gte('created_at', threeDaysAgo.toISOString())
              .single();

            if (!recentOverdueNotification) {
              // Buscar gestores DESTE departamento específico
              const { data: departmentManagers } = await supabase
                .from('managers')
                .select('user_id')
                .eq('department_id', departmentId === 'no_department' ? null : departmentId)
                .eq('is_active', true)
                .not('user_id', 'is', null);

              if (departmentManagers && departmentManagers.length > 0) {
                const departmentName = overdueMetricsForDept[0].department_name;
                const metricNames = overdueMetricsForDept.map(m => m.name).join(', ');
                const daysOverdue = currentDay - monthlyDeadline;

                for (const manager of departmentManagers) {
                  await supabase.from('notifications').insert({
                    user_id: manager.user_id,
                    title: `Urgente: ${overdueMetricsForDept.length} métrica(s) em atraso`,
                    message: `As seguintes métricas do departamento ${departmentName} estão ${daysOverdue} dia(s) em atraso: ${metricNames}. Preencha o mais rápido possível.`,
                    type: 'error',
                    metadata: {
                      department_id: departmentId === 'no_department' ? null : departmentId,
                      department_name: departmentName,
                      overdue_metrics_count: overdueMetricsForDept.length,
                      days_overdue: daysOverdue,
                      alert_type: 'department_metrics_overdue'
                    }
                  });
                  notificationCount++;
                  overdueMissedCount++;
                }
              }
            }
          }
        }

        // Notificar admins sobre resumo geral de métricas em atraso
        const totalOverdue = Object.values(overdueMissedByDepartment).reduce((sum, metrics) => sum + metrics.length, 0);
        
        if (totalOverdue > 0) {
          // Verificar se já enviamos notificação recente de resumo geral
          const threeDaysAgo = new Date();
          threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
          
          const { data: recentAdminOverdueNotification } = await supabase
            .from('notifications')
            .select('id')
            .eq('metadata->>alert_type', 'admin_overdue_metrics_summary')
            .gte('created_at', threeDaysAgo.toISOString())
            .single();

          if (!recentAdminOverdueNotification) {
            const { data: admins } = await supabase
              .from('managers')
              .select('user_id')
              .eq('role', 'admin')
              .eq('is_active', true)
              .not('user_id', 'is', null);

            if (admins && admins.length > 0) {
              // Criar resumo por departamento
              const departmentSummary = Object.entries(overdueMissedByDepartment)
                .map(([deptId, metrics]) => `${metrics[0].department_name}: ${metrics.length} métrica(s)`)
                .join('; ');

              const daysOverdue = currentDay - monthlyDeadline;

              for (const admin of admins) {
                await supabase.from('notifications').insert({
                  user_id: admin.user_id,
                  title: `Resumo: ${totalOverdue} métrica(s) em atraso`,
                  message: `Existem ${totalOverdue} métricas ${daysOverdue} dia(s) em atraso distribuídas em: ${departmentSummary}. Considere acompanhar mais de perto estes departamentos.`,
                  type: 'error',
                  metadata: {
                    total_overdue: totalOverdue,
                    days_overdue: daysOverdue,
                    departments_affected: Object.keys(overdueMissedByDepartment).length,
                    alert_type: 'admin_overdue_metrics_summary'
                  }
                });
                notificationCount++;
              }
            }
          }
        }
      }
    }

    // 5. Verificar metas atingidas POR DEPARTAMENTO (para gestores) e RESUMO GERAL (para admins)
    console.log('Verificando metas atingidas...');
    
    const { data: metricsWithValues, error: valuesError } = await supabase
      .from('metrics_definition')
      .select(`
        id, name, target, lower_is_better, department_id,
        departments(name)
      `)
      .eq('is_active', true)
      .not('target', 'is', null);

    if (valuesError) {
      console.error('Erro ao buscar métricas com metas:', valuesError);
    } else if (metricsWithValues && metricsWithValues.length > 0) {
      const achievedMetricsByDepartment = {} as Record<string, any[]>;
      const unachievedMetricsByDepartment = {} as Record<string, any[]>;

      for (const metric of metricsWithValues) {
        // Buscar último valor
        const { data: latestValue } = await supabase
          .from('metrics_values')
          .select('value')
          .eq('metrics_definition_id', metric.id)
          .order('date', { ascending: false })
          .limit(1)
          .single();

        if (latestValue && latestValue.value !== null && metric.target > 0) {
          const currentValue = parseFloat(String(latestValue.value));
          const target = parseFloat(String(metric.target));
          
          // Verificar se meta foi atingida
          let metaAtingida = false;
          if (metric.lower_is_better) {
            metaAtingida = currentValue <= target;
          } else {
            metaAtingida = currentValue >= target;
          }

          const deptId = metric.department_id || 'no_department';
          const deptName = metric.departments?.name || 'Sem Departamento';

          if (metaAtingida) {
            if (!achievedMetricsByDepartment[deptId]) {
              achievedMetricsByDepartment[deptId] = [];
            }
            achievedMetricsByDepartment[deptId].push({
              ...metric,
              current_value: currentValue,
              department_name: deptName
            });
          } else {
            if (!unachievedMetricsByDepartment[deptId]) {
              unachievedMetricsByDepartment[deptId] = [];
            }
            unachievedMetricsByDepartment[deptId].push({
              ...metric,
              current_value: currentValue,
              department_name: deptName
            });
          }
        }
      }

      // Notificar gestores sobre metas atingidas em seus departamentos
      for (const [departmentId, achievedMetrics] of Object.entries(achievedMetricsByDepartment)) {
        if (achievedMetrics.length > 0) {
          // Verificar se já enviamos notificação recente para este departamento
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          
          const { data: recentNotification } = await supabase
            .from('notifications')
            .select('id')
            .eq('metadata->>department_id', departmentId === 'no_department' ? null : departmentId)
            .eq('metadata->>alert_type', 'department_goals_achieved')
            .gte('created_at', sevenDaysAgo.toISOString())
            .single();

          if (!recentNotification) {
            // Buscar gestores DESTE departamento específico
            const { data: departmentManagers } = await supabase
              .from('managers')
              .select('user_id')
              .eq('department_id', departmentId === 'no_department' ? null : departmentId)
              .eq('is_active', true)
              .not('user_id', 'is', null);

            if (departmentManagers && departmentManagers.length > 0) {
              const departmentName = achievedMetrics[0].department_name;
              const metricNames = achievedMetrics.map(m => m.name).join(', ');

              for (const manager of departmentManagers) {
                await supabase.from('notifications').insert({
                  user_id: manager.user_id,
                  title: `Parabéns! ${achievedMetrics.length} meta(s) atingida(s)`,
                  message: `O departamento ${departmentName} atingiu ${achievedMetrics.length} meta(s): ${metricNames}. Excelente trabalho!`,
                  type: 'success',
                  metadata: {
                    department_id: departmentId === 'no_department' ? null : departmentId,
                    department_name: departmentName,
                    achieved_metrics_count: achievedMetrics.length,
                    alert_type: 'department_goals_achieved'
                  }
                });
                notificationCount++;
                achievementCount++;
              }
            }
          }
        }
      }

      // Notificar admins sobre resumo geral de metas NÃO atingidas
      const totalUnachieved = Object.values(unachievedMetricsByDepartment).reduce((sum, metrics) => sum + metrics.length, 0);
      
      if (totalUnachieved > 0) {
        // Verificar se já enviamos notificação recente de resumo geral
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const { data: recentAdminNotification } = await supabase
          .from('notifications')
          .select('id')
          .eq('metadata->>alert_type', 'admin_unachieved_goals_summary')
          .gte('created_at', sevenDaysAgo.toISOString())
          .single();

        if (!recentAdminNotification) {
          const { data: admins } = await supabase
            .from('managers')
            .select('user_id')
            .eq('role', 'admin')
            .eq('is_active', true)
            .not('user_id', 'is', null);

          if (admins && admins.length > 0) {
            // Criar resumo por departamento
            const departmentSummary = Object.entries(unachievedMetricsByDepartment)
              .map(([deptId, metrics]) => `${metrics[0].department_name}: ${metrics.length} meta(s)`)
              .join('; ');

            for (const admin of admins) {
              await supabase.from('notifications').insert({
                user_id: admin.user_id,
                title: `Resumo: ${totalUnachieved} meta(s) não atingida(s)`,
                message: `Existem ${totalUnachieved} metas não atingidas distribuídas em: ${departmentSummary}. Considere acompanhar mais de perto estes departamentos.`,
                type: 'warning',
                metadata: {
                  total_unachieved: totalUnachieved,
                  departments_affected: Object.keys(unachievedMetricsByDepartment).length,
                  alert_type: 'admin_unachieved_goals_summary'
                }
              });
              notificationCount++;
            }
          }
        }
      }
    }

    // 6. Verificar justificativas pendentes (só para admins)
    console.log('Verificando justificativas pendentes...');
    
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    const { data: pendingJustifications, error: justError } = await supabase
      .from('metric_justifications')
      .select('id')
      .eq('status', 'pending')
      .lt('created_at', threeDaysAgo.toISOString());

    if (justError) {
      console.error('Erro ao buscar justificativas:', justError);
    } else {
      pendingCount = pendingJustifications?.length || 0;
      
      if (pendingCount > 0) {
        const { data: admins } = await supabase
          .from('managers')
          .select('user_id')
          .eq('role', 'admin')
          .eq('is_active', true)
          .not('user_id', 'is', null);

        if (admins && admins.length > 0) {
          for (const admin of admins) {
            await supabase.from('notifications').insert({
              user_id: admin.user_id,
              title: 'Justificativas Pendentes',
              message: `Existem ${pendingCount} justificativas aguardando sua análise há mais de 3 dias.`,
              type: 'warning',
              metadata: {
                pending_count: pendingCount,
                alert_type: 'pending_justifications'
              }
            });
            notificationCount++;
          }
        }
      }
    }

    // Log final
    await supabase.from('logs').insert({
      level: 'info',
      message: 'Processamento de notificações concluído via edge function com melhorias',
      details: {
        notifications_sent: notificationCount,
        achievements_found: achievementCount,
        pending_justifications: pendingCount,
        metrics_without_targets: metricsWithoutTargetsCount,
        overdue_missed_count: overdueMissedCount,
        processed_at: new Date().toISOString(),
        strategy: 'enhanced_department_filtered_notifications'
      }
    });

    console.log('Processamento concluído:', {
      notifications_sent: notificationCount,
      achievements_found: achievementCount,
      pending_justifications: pendingCount,
      metrics_without_targets: metricsWithoutTargetsCount,
      overdue_missed_count: overdueMissedCount
    });

    return new Response(JSON.stringify({
      success: true,
      result: {
        notifications_sent: notificationCount,
        achievements_found: achievementCount,
        pending_justifications: pendingCount,
        metrics_without_targets: metricsWithoutTargetsCount,
        overdue_missed_count: overdueMissedCount,
        processed_at: new Date().toISOString(),
        status: 'success',
        strategy: 'enhanced_department_filtered_notifications'
      },
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error) {
    console.error("Erro na edge function:", error);
    
    // Log do erro
    try {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );
      
      await supabase.from('logs').insert({
        level: 'error',
        message: 'Erro na edge function de notificações com filtros por departamento',
        details: {
          error: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString()
        }
      });
    } catch (logError) {
      console.error("Erro ao fazer log:", logError);
    }
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  }
});
