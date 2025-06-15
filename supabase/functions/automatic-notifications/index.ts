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

interface FrequencyConfig {
  daily?: { reminder_hour: number; };
  weekly?: { reminder_day: number; reminder_hour: number; };
  monthly?: { deadline_day: number; reminder_days: number[]; };
  quarterly?: { reminder_days_before: number[]; };
  yearly?: { reminder_days_before: number[]; };
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

    console.log("Iniciando processamento expandido de notificações automáticas...");

    let notificationCount = 0;
    let achievementCount = 0;
    let pendingCount = 0;
    let metricsWithoutTargetsCount = 0;
    let overdueMissedCount = 0;

    // Log início do processamento
    await supabase.from('logs').insert({
      level: 'info',
      message: 'Iniciando processamento expandido de notificações automáticas',
      details: { timestamp: new Date().toISOString() }
    });

    // 1. Buscar configurações para todas as frequências
    const { data: frequencySettings } = await supabase
      .from('notification_settings')
      .select('setting_key, setting_value')
      .in('setting_key', [
        'daily_reminder_config',
        'weekly_reminder_config', 
        'monthly_reminder_config',
        'quarterly_reminder_config',
        'yearly_reminder_config'
      ]);

    // Configurações padrão
    const defaultConfigs: FrequencyConfig = {
      daily: { reminder_hour: 18 }, // 6 PM
      weekly: { reminder_day: 1, reminder_hour: 9 }, // Segunda-feira 9 AM
      monthly: { deadline_day: 25, reminder_days: [3, 5, 7] },
      quarterly: { reminder_days_before: [7, 15, 30] },
      yearly: { reminder_days_before: [15, 30, 60] }
    };

    // Processar configurações do banco ou usar padrões
    const configs: FrequencyConfig = { ...defaultConfigs };
    if (frequencySettings) {
      for (const setting of frequencySettings) {
        const key = setting.setting_key.replace('_reminder_config', '') as keyof FrequencyConfig;
        if (setting.setting_value) {
          configs[key] = setting.setting_value as any;
        }
      }
    }

    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDate();
    const currentWeekDay = now.getDay(); // 0 = Sunday
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    console.log('Configurações e tempo atual:', { configs, currentHour, currentDay, currentWeekDay });

    // 2. MÉTRICAS DIÁRIAS - Lembrete no final do dia se não preenchida
    if (currentHour === configs.daily?.reminder_hour) {
      console.log('Verificando métricas diárias pendentes...');
      
      await processMetricReminders(supabase, 'daily', 'hoje', (metric) => {
        // Verificar se tem valor para hoje
        return supabase
          .from('metrics_values')
          .select('id')
          .eq('metrics_definition_id', metric.id)
          .eq('date', now.toISOString().split('T')[0])
          .single();
      });
    }

    // 3. MÉTRICAS SEMANAIS - Lembrete às segundas-feiras
    if (currentWeekDay === configs.weekly?.reminder_day && currentHour === configs.weekly?.reminder_hour) {
      console.log('Verificando métricas semanais pendentes...');
      
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay() + 1); // Segunda-feira desta semana
      
      await processMetricReminders(supabase, 'weekly', 'desta semana', (metric) => {
        return supabase
          .from('metrics_values')
          .select('id')
          .eq('metrics_definition_id', metric.id)
          .gte('date', weekStart.toISOString().split('T')[0])
          .single();
      });
    }

    // 4. MÉTRICAS MENSAIS - Sistema existente melhorado
    const monthlyConfig = configs.monthly!;
    const daysUntilDeadline = monthlyConfig.deadline_day - currentDay;
    
    if (monthlyConfig.reminder_days.includes(daysUntilDeadline)) {
      console.log('Verificando métricas mensais pendentes por departamento...');
      
      await processMonthlyMetrics(supabase, monthlyConfig.deadline_day);
      notificationCount += await getNotificationCountFromLogs(supabase, 'monthly');
    }

    // 5. MÉTRICAS TRIMESTRAIS - Lembretes nos últimos dias do trimestre
    const quarterlyConfig = configs.quarterly!;
    const quarterEnd = getQuarterEnd(now);
    const daysUntilQuarterEnd = Math.ceil((quarterEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (quarterlyConfig.reminder_days_before.includes(daysUntilQuarterEnd)) {
      console.log('Verificando métricas trimestrais pendentes...');
      
      await processMetricReminders(supabase, 'quarterly', 'deste trimestre', (metric) => {
        const quarterStart = getQuarterStart(now);
        return supabase
          .from('metrics_values')
          .select('id')
          .eq('metrics_definition_id', metric.id)
          .gte('date', quarterStart.toISOString().split('T')[0])
          .lt('date', quarterEnd.toISOString().split('T')[0])
          .single();
      });
    }

    // 6. MÉTRICAS ANUAIS - Lembretes nos últimos dias do ano
    const yearlyConfig = configs.yearly!;
    const yearEnd = new Date(currentYear, 11, 31); // 31 de dezembro
    const daysUntilYearEnd = Math.ceil((yearEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (yearlyConfig.reminder_days_before.includes(daysUntilYearEnd)) {
      console.log('Verificando métricas anuais pendentes...');
      
      await processMetricReminders(supabase, 'yearly', 'deste ano', (metric) => {
        const yearStart = new Date(currentYear, 0, 1);
        return supabase
          .from('metrics_values')
          .select('id')
          .eq('metrics_definition_id', metric.id)
          .gte('date', yearStart.toISOString().split('T')[0])
          .lt('date', yearEnd.toISOString().split('T')[0])
          .single();
      });
    }

    // 7. Verificar métricas sem metas definidas (mantido do sistema original)
    await checkMetricsWithoutTargets(supabase);

    // 8. Verificar metas atingidas (mantido do sistema original)
    await checkAchievedGoals(supabase);

    // 9. Verificar justificativas pendentes (mantido do sistema original)
    await checkPendingJustifications(supabase);

    // Log final
    await supabase.from('logs').insert({
      level: 'info',
      message: 'Processamento expandido de notificações concluído',
      details: {
        notifications_sent: notificationCount,
        achievements_found: achievementCount,
        pending_justifications: pendingCount,
        metrics_without_targets: metricsWithoutTargetsCount,
        overdue_missed_count: overdueMissedCount,
        processed_at: new Date().toISOString(),
        strategy: 'expanded_frequency_notifications'
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
        strategy: 'expanded_frequency_notifications'
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
        message: 'Erro na edge function expandida de notificações',
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

// Função auxiliar para processar lembretes de métricas por frequência
async function processMetricReminders(
  supabase: any, 
  frequency: string, 
  period: string, 
  checkExistingValue: (metric: any) => Promise<any>
) {
  const { data: pendingMetrics, error: metricsError } = await supabase
    .from('metrics_definition')
    .select(`
      id, name, department_id,
      departments!inner(name)
    `)
    .eq('frequency', frequency)
    .eq('is_active', true);

  if (metricsError) {
    console.error(`Erro ao buscar métricas ${frequency}:`, metricsError);
    return;
  }

  if (!pendingMetrics || pendingMetrics.length === 0) return;

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
      // Verificar se já tem valor para o período
      const { data: existingValue } = await checkExistingValue(metric);
      
      if (!existingValue) {
        pendingMetricsForDept.push(metric);
      }
    }

    if (pendingMetricsForDept.length > 0) {
      // Verificar se já enviamos lembrete recente
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      
      const { data: recentNotification } = await supabase
        .from('notifications')
        .select('id')
        .eq('metadata->>department_id', departmentId === 'no_department' ? null : departmentId)
        .eq('metadata->>alert_type', `${frequency}_metrics_reminder`)
        .gte('created_at', threeDaysAgo.toISOString())
        .single();

      if (!recentNotification) {
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
              title: `Lembrete: ${pendingMetricsForDept.length} métrica(s) ${frequency} pendente(s)`,
              message: `As seguintes métricas ${frequency}s do departamento ${departmentName} precisam ser preenchidas ${period}: ${metricNames}`,
              type: 'warning',
              metadata: {
                department_id: departmentId === 'no_department' ? null : departmentId,
                department_name: departmentName,
                pending_metrics_count: pendingMetricsForDept.length,
                frequency: frequency,
                period: period,
                alert_type: `${frequency}_metrics_reminder`
              }
            });
          }
        }
      }
    }
  }
}

// Função para processar métricas mensais (mantida do sistema original)
async function processMonthlyMetrics(supabase: any, monthlyDeadline: number) {
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
    return;
  }

  if (!pendingMetrics || pendingMetrics.length === 0) return;

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
        }
      }
    }
  }
}

// Funções auxiliares para trimestres
function getQuarterStart(date: Date): Date {
  const quarter = Math.floor(date.getMonth() / 3);
  return new Date(date.getFullYear(), quarter * 3, 1);
}

function getQuarterEnd(date: Date): Date {
  const quarter = Math.floor(date.getMonth() / 3);
  return new Date(date.getFullYear(), quarter * 3 + 3, 0); // Último dia do trimestre
}

// Funções auxiliares mantidas do sistema original
async function checkMetricsWithoutTargets(supabase: any) {
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
    return;
  }

  if (metricsWithoutTargets && metricsWithoutTargets.length > 0) {
    const metricsWithoutTargetsCount = metricsWithoutTargets.length;

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
        }
      }
    }
  }
}

async function checkAchievedGoals(supabase: any) {
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
    return;
  }

  if (metricsWithValues && metricsWithValues.length > 0) {
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
          }
        }
      }
    }
  }
}

async function checkPendingJustifications(supabase: any) {
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  
  const { data: pendingJustifications, error: justError } = await supabase
    .from('metric_justifications')
    .select('id')
    .eq('status', 'pending')
    .lt('created_at', threeDaysAgo.toISOString());

  if (justError) {
    console.error('Erro ao buscar justificativas:', justError);
    return;
  }

  const pendingCount = pendingJustifications?.length || 0;
  
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
      }
    }
  }
}

async function getNotificationCountFromLogs(supabase: any, type: string): Promise<number> {
  // Função auxiliar para contar notificações por tipo
  return 0; // Placeholder
}
