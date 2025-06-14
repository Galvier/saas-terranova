
-- Correção final para erro de divisão por zero na função process_automatic_notifications
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
  -- Buscar configurações com valores padrão seguros
  SELECT COALESCE((setting_value)::text::INTEGER, 25) INTO monthly_deadline
  FROM notification_settings WHERE setting_key = 'monthly_deadline_day';
  
  SELECT COALESCE(
    ARRAY(SELECT jsonb_array_elements_text(setting_value)::INTEGER), 
    ARRAY[3, 5, 7]
  ) INTO reminder_days
  FROM notification_settings WHERE setting_key = 'reminder_days_before';
  
  current_day := EXTRACT(DAY FROM CURRENT_DATE);
  days_until_deadline := monthly_deadline - current_day;
  
  -- 1. Verificar métricas que precisam de lembrete
  IF days_until_deadline = ANY(reminder_days) THEN
    FOR metric_record IN 
      SELECT md.id, md.name, COALESCE(d.name, 'Sem Departamento') as department_name, md.department_id
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
            'template_id', COALESCE((SELECT id FROM notification_templates WHERE name = 'metric_deadline_reminder'), null),
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
  
  -- 2. Verificar metas atingidas recentemente (com proteção total contra divisão por zero)
  FOR metric_record IN 
    SELECT md.id, md.name, md.target, md.lower_is_better, 
           COALESCE(d.name, 'Sem Departamento') as department_name, 
           md.department_id,
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
      AND md.target != 0  -- Evitar targets zero
      AND mv.value != 0   -- Evitar valores zero
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
    -- Calcular percentual de achievement com proteção total contra divisão por zero
    DECLARE
      achievement_percentage NUMERIC := 100;
    BEGIN
      -- Verificar se é seguro fazer o cálculo
      IF metric_record.target IS NOT NULL AND metric_record.target != 0 
         AND metric_record.current_value IS NOT NULL AND metric_record.current_value != 0 THEN
        
        IF metric_record.lower_is_better THEN
          -- Para métricas onde menor é melhor
          achievement_percentage := ROUND(((metric_record.target::NUMERIC / metric_record.current_value::NUMERIC) * 100), 1);
        ELSE
          -- Para métricas onde maior é melhor
          achievement_percentage := ROUND(((metric_record.current_value::NUMERIC / metric_record.target::NUMERIC) * 100), 1);
        END IF;
        
        -- Garantir que o valor está dentro de limites razoáveis
        achievement_percentage := LEAST(GREATEST(achievement_percentage, 0), 999);
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
            'template_id', COALESCE((SELECT id FROM notification_templates WHERE name = 'goal_achieved'), null),
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
          'template_id', COALESCE((SELECT id FROM notification_templates WHERE name = 'pending_justification_admin'), null),
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
EXCEPTION
  WHEN division_by_zero THEN
    -- Capturar especificamente erros de divisão por zero
    RETURN jsonb_build_object(
      'error', true,
      'error_message', 'Division by zero prevented',
      'notifications_sent', notification_count,
      'processed_at', now()
    );
  WHEN OTHERS THEN
    -- Em caso de outros erros
    RETURN jsonb_build_object(
      'error', true,
      'error_message', SQLERRM,
      'notifications_sent', notification_count,
      'processed_at', now()
    );
END;
$$;
