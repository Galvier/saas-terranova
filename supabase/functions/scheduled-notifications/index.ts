
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationTemplate {
  id: string;
  title: string;
  message: string;
  type: string;
}

interface ScheduledNotification {
  id: string;
  template_id: string;
  target_type: string;
  target_id?: string;
  schedule_type: string;
  schedule_time?: string;
  schedule_day?: number;
  last_sent_at?: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const now = new Date()
    const currentTime = now.toTimeString().split(' ')[0].substring(0, 5) // HH:MM
    const currentDay = now.getDay() // 0-6
    const currentDate = now.getDate() // 1-31

    console.log(`Checking scheduled notifications at ${currentTime}`)

    // Buscar notificações agendadas que devem ser enviadas
    const { data: scheduledNotifications, error: scheduleError } = await supabaseClient
      .from('scheduled_notifications')
      .select(`
        *,
        notification_templates (
          id,
          title,
          message,
          type
        )
      `)
      .eq('is_active', true)

    if (scheduleError) {
      throw scheduleError
    }

    let sentCount = 0

    for (const schedule of scheduledNotifications as any[]) {
      const template = schedule.notification_templates as NotificationTemplate
      let shouldSend = false

      // Verificar se deve enviar baseado no tipo de agendamento
      switch (schedule.schedule_type) {
        case 'daily':
          if (schedule.schedule_time === currentTime) {
            // Verificar se já foi enviado hoje
            const lastSent = schedule.last_sent_at ? new Date(schedule.last_sent_at) : null
            const today = new Date().toDateString()
            
            if (!lastSent || lastSent.toDateString() !== today) {
              shouldSend = true
            }
          }
          break

        case 'weekly':
          if (schedule.schedule_time === currentTime && schedule.schedule_day === currentDay) {
            // Verificar se já foi enviado esta semana
            const lastSent = schedule.last_sent_at ? new Date(schedule.last_sent_at) : null
            const weekStart = new Date(now)
            weekStart.setDate(now.getDate() - now.getDay())
            weekStart.setHours(0, 0, 0, 0)
            
            if (!lastSent || lastSent < weekStart) {
              shouldSend = true
            }
          }
          break

        case 'monthly':
          if (schedule.schedule_time === currentTime && schedule.schedule_day === currentDate) {
            // Verificar se já foi enviado este mês
            const lastSent = schedule.last_sent_at ? new Date(schedule.last_sent_at) : null
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
            
            if (!lastSent || lastSent < monthStart) {
              shouldSend = true
            }
          }
          break

        case 'once':
          if (schedule.scheduled_for) {
            const scheduledTime = new Date(schedule.scheduled_for)
            if (scheduledTime <= now && !schedule.last_sent_at) {
              shouldSend = true
            }
          }
          break
      }

      if (shouldSend && template) {
        console.log(`Sending scheduled notification: ${template.title}`)

        // Enviar notificação usando a função de broadcast
        const { data: notificationCount, error: broadcastError } = await supabaseClient
          .rpc('broadcast_notification_from_template', {
            template_id_param: template.id,
            target_type: schedule.target_type,
            department_id_param: schedule.target_id || null
          })

        if (broadcastError) {
          console.error('Error broadcasting notification:', broadcastError)
          continue
        }

        // Atualizar last_sent_at
        await supabaseClient
          .from('scheduled_notifications')
          .update({ 
            last_sent_at: now.toISOString(),
            updated_at: now.toISOString()
          })
          .eq('id', schedule.id)

        // Se for agendamento único, desativar
        if (schedule.schedule_type === 'once') {
          await supabaseClient
            .from('scheduled_notifications')
            .update({ 
              is_active: false,
              updated_at: now.toISOString()
            })
            .eq('id', schedule.id)
        }

        sentCount += notificationCount || 0
      }
    }

    // Verificar métricas em atraso (executar apenas uma vez por dia às 09:00)
    if (currentTime === '09:00') {
      await checkOverdueMetrics(supabaseClient)
    }

    return new Response(
      JSON.stringify({
        success: true,
        sentNotifications: sentCount,
        timestamp: now.toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in scheduled notifications:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

async function checkOverdueMetrics(supabaseClient: any) {
  try {
    // Buscar métricas que não foram atualizadas há mais de 7 dias
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: overdueMetrics, error } = await supabaseClient
      .from('metrics_definition')
      .select(`
        *,
        departments (name),
        metrics_values (date)
      `)
      .eq('is_active', true)

    if (error) {
      console.error('Error fetching metrics:', error)
      return
    }

    for (const metric of overdueMetrics) {
      const lastValue = metric.metrics_values
        ?.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

      if (!lastValue || new Date(lastValue.date) < sevenDaysAgo) {
        const daysSinceUpdate = lastValue 
          ? Math.floor((Date.now() - new Date(lastValue.date).getTime()) / (1000 * 60 * 60 * 24))
          : 'mais de 30'

        // Notificar administradores sobre métrica em atraso
        const { data: admins } = await supabaseClient
          .from('managers')
          .select('user_id')
          .eq('role', 'admin')
          .eq('is_active', true)
          .not('user_id', 'is', null)

        for (const admin of admins || []) {
          await supabaseClient.rpc('create_notification', {
            target_user_id: admin.user_id,
            notification_title: 'Métrica em Atraso',
            notification_message: `A métrica "${metric.name}" do departamento "${metric.departments?.name}" não foi atualizada há ${daysSinceUpdate} dias`,
            notification_type: 'warning',
            notification_metadata: {
              metric_id: metric.id,
              metric_name: metric.name,
              department_name: metric.departments?.name,
              days_overdue: daysSinceUpdate,
              alert_type: 'metric_overdue'
            }
          })
        }
      }
    }
  } catch (error) {
    console.error('Error checking overdue metrics:', error)
  }
}
