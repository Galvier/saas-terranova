
-- Criar tabela para configurações globais de notificações
CREATE TABLE IF NOT EXISTS public.notification_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir configurações padrão (removendo ON CONFLICT pois vamos verificar se já existe)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.notification_settings WHERE setting_key = 'monthly_deadline_day') THEN
    INSERT INTO public.notification_settings (setting_key, setting_value, description) VALUES
    ('monthly_deadline_day', '25', 'Dia limite para preenchimento de métricas mensais'),
    ('reminder_days_before', '[3, 5, 7]', 'Dias de antecedência para enviar lembretes'),
    ('admin_summary_frequency', '"weekly"', 'Frequência de resumos para admins'),
    ('business_hours_start', '"08:00"', 'Início do horário comercial'),
    ('business_hours_end', '"18:00"', 'Fim do horário comercial'),
    ('enable_achievement_notifications', 'true', 'Habilitar notificações de metas atingidas'),
    ('enable_reminder_notifications', 'true', 'Habilitar lembretes de preenchimento');
  END IF;
END $$;

-- Inserir templates de notificação específicos (verificando se já existem)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.notification_templates WHERE name = 'metric_deadline_reminder') THEN
    INSERT INTO public.notification_templates (name, title, message, type, category, is_active) VALUES
    ('metric_deadline_reminder', 'Lembrete: Métrica pendente', 'A métrica "{{metric_name}}" do departamento {{department_name}} precisa ser preenchida até {{deadline_date}}.', 'warning', 'metric_reminder', true),
    ('goal_achieved', 'Parabéns! Meta atingida', 'A métrica "{{metric_name}}" atingiu {{achievement_percentage}}% da meta. Continue assim!', 'success', 'achievement', true),
    ('pending_justification_admin', 'Justificativas Pendentes', 'Existem {{count}} justificativas aguardando sua análise há mais de {{days}} dias.', 'warning', 'admin_alert', true),
    ('daily_admin_summary', 'Resumo Diário', 'Resumo do dia: {{metrics_updated}} métricas atualizadas, {{goals_achieved}} metas atingidas, {{pending_justifications}} justificativas pendentes.', 'info', 'summary', true);
  END IF;
END $$;

-- Habilitar Row Level Security na nova tabela
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

-- Criar política para que apenas admins possam modificar configurações
CREATE POLICY "Admins can manage notification settings" 
  ON public.notification_settings 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.managers 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Criar função para buscar configurações de notificação
CREATE OR REPLACE FUNCTION public.get_notification_setting(setting_key_param TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  setting_value JSONB;
BEGIN
  SELECT setting_value INTO setting_value
  FROM public.notification_settings
  WHERE setting_key = setting_key_param;
  
  RETURN COALESCE(setting_value, 'null'::jsonb);
END;
$$;

-- Criar função para atualizar configurações de notificação
CREATE OR REPLACE FUNCTION public.update_notification_setting(setting_key_param TEXT, new_value JSONB)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se o usuário é admin
  IF NOT EXISTS (
    SELECT 1 FROM public.managers 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can update notification settings';
  END IF;
  
  UPDATE public.notification_settings
  SET setting_value = new_value, updated_at = now()
  WHERE setting_key = setting_key_param;
  
  RETURN FOUND;
END;
$$;

-- Criar função para processar notificações automáticas
CREATE OR REPLACE FUNCTION public.process_automatic_notifications()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  monthly_deadline INTEGER;
  reminder_days INTEGER[];
  current_day INTEGER;
  days_until_deadline INTEGER;
  notification_count INTEGER := 0;
  metric_record RECORD;
  admin_record RECORD;
  pending_count INTEGER;
  achievement_count INTEGER := 0;
BEGIN
  -- Buscar configurações
  SELECT (setting_value)::INTEGER INTO monthly_deadline
  FROM notification_settings WHERE setting_key = 'monthly_deadline_day';
  
  SELECT ARRAY(SELECT jsonb_array_elements_text(setting_value)::INTEGER) INTO reminder_days
  FROM notification_settings WHERE setting_key = 'reminder_days_before';
  
  current_day := EXTRACT(DAY FROM CURRENT_DATE);
  days_until_deadline := monthly_deadline - current_day;
  
  -- 1. Verificar métricas que precisam de lembrete
  IF days_until_deadline = ANY(reminder_days) THEN
    FOR metric_record IN 
      SELECT md.id, md.name, d.name as department_name, md.department_id
      FROM metrics_definition md
      LEFT JOIN departments d ON md.department_id = d.id
      WHERE md.frequency = 'monthly' 
        AND md.is_active = true
        AND NOT EXISTS (
          SELECT 1 FROM metrics_values mv 
          WHERE mv.metrics_definition_id = md.id 
            AND date_trunc('month', mv.date) = date_trunc('month', CURRENT_DATE)
        )
    LOOP
      -- Enviar notificação para gestores do departamento
      FOR admin_record IN 
        SELECT m.user_id 
        FROM managers m 
        WHERE (m.department_id = metric_record.department_id OR m.role = 'admin')
          AND m.user_id IS NOT NULL 
          AND m.is_active = true
      LOOP
        INSERT INTO notifications (user_id, title, message, type, metadata)
        VALUES (
          admin_record.user_id,
          'Lembrete: Métrica pendente',
          format('A métrica "%s" do departamento %s precisa ser preenchida até o dia %s.',
                 metric_record.name, 
                 metric_record.department_name, 
                 monthly_deadline),
          'warning',
          jsonb_build_object(
            'template_id', (SELECT id FROM notification_templates WHERE name = 'metric_deadline_reminder'),
            'metric_id', metric_record.id,
            'department_id', metric_record.department_id,
            'deadline_day', monthly_deadline,
            'alert_type', 'metric_reminder'
          )
        );
        notification_count := notification_count + 1;
      END LOOP;
    END LOOP;
  END IF;
  
  -- 2. Verificar metas atingidas recentemente
  FOR metric_record IN 
    SELECT md.id, md.name, md.target, md.lower_is_better, d.name as department_name, md.department_id,
           mv.value as current_value
    FROM metrics_definition md
    LEFT JOIN departments d ON md.department_id = d.id
    LEFT JOIN LATERAL (
      SELECT value FROM metrics_values 
      WHERE metrics_definition_id = md.id 
      ORDER BY date DESC LIMIT 1
    ) mv ON true
    WHERE md.is_active = true 
      AND mv.value IS NOT NULL
      AND md.target IS NOT NULL
      AND (
        (NOT md.lower_is_better AND mv.value >= md.target) OR
        (md.lower_is_better AND mv.value <= md.target)
      )
      AND NOT EXISTS (
        SELECT 1 FROM notifications 
        WHERE metadata->>'metric_id' = md.id::text 
          AND metadata->>'alert_type' = 'goal_achieved'
          AND created_at > CURRENT_DATE - INTERVAL '7 days'
      )
  LOOP
    -- Calcular percentual de achievement
    DECLARE
      achievement_percentage NUMERIC;
    BEGIN
      IF metric_record.lower_is_better THEN
        achievement_percentage := ROUND(((metric_record.target / metric_record.current_value) * 100), 1);
      ELSE
        achievement_percentage := ROUND(((metric_record.current_value / metric_record.target) * 100), 1);
      END IF;
      
      -- Enviar notificação para gestores do departamento
      FOR admin_record IN 
        SELECT m.user_id 
        FROM managers m 
        WHERE (m.department_id = metric_record.department_id OR m.role = 'admin')
          AND m.user_id IS NOT NULL 
          AND m.is_active = true
      LOOP
        INSERT INTO notifications (user_id, title, message, type, metadata)
        VALUES (
          admin_record.user_id,
          'Parabéns! Meta atingida',
          format('A métrica "%s" atingiu %s%% da meta. Continue assim!',
                 metric_record.name, 
                 achievement_percentage),
          'success',
          jsonb_build_object(
            'template_id', (SELECT id FROM notification_templates WHERE name = 'goal_achieved'),
            'metric_id', metric_record.id,
            'department_id', metric_record.department_id,
            'achievement_percentage', achievement_percentage,
            'alert_type', 'goal_achieved'
          )
        );
        notification_count := notification_count + 1;
        achievement_count := achievement_count + 1;
      END LOOP;
    END;
  END LOOP;
  
  -- 3. Verificar justificativas pendentes há mais de 3 dias
  SELECT COUNT(*) INTO pending_count
  FROM metric_justifications
  WHERE status = 'pending' 
    AND created_at < CURRENT_DATE - INTERVAL '3 days';
  
  IF pending_count > 0 THEN
    FOR admin_record IN 
      SELECT m.user_id 
      FROM managers m 
      WHERE m.role = 'admin'
        AND m.user_id IS NOT NULL 
        AND m.is_active = true
    LOOP
      INSERT INTO notifications (user_id, title, message, type, metadata)
      VALUES (
        admin_record.user_id,
        'Justificativas Pendentes',
        format('Existem %s justificativas aguardando sua análise há mais de 3 dias.',
               pending_count),
        'warning',
        jsonb_build_object(
          'template_id', (SELECT id FROM notification_templates WHERE name = 'pending_justification_admin'),
          'pending_count', pending_count,
          'alert_type', 'pending_justifications'
        )
      );
      notification_count := notification_count + 1;
    END LOOP;
  END IF;
  
  RETURN jsonb_build_object(
    'notifications_sent', notification_count,
    'achievements_found', achievement_count,
    'pending_justifications', pending_count,
    'processed_at', now()
  );
END;
$$;
