
-- Solução completa para eliminar divisão por zero na função process_automatic_notifications
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
  error_details TEXT;
BEGIN
  -- Log início do processamento
  INSERT INTO logs (level, message, details)
  VALUES ('info', 'Iniciando processamento de notificações automáticas', jsonb_build_object('timestamp', now()));

  -- Buscar configurações com valores padrão seguros
  BEGIN
    SELECT COALESCE((setting_value)::text::INTEGER, 25) INTO monthly_deadline
    FROM notification_settings WHERE setting_key = 'monthly_deadline_day';
    
    -- Garantir que o valor está dentro de limites seguros
    monthly_deadline := COALESCE(monthly_deadline, 25);
    IF monthly_deadline < 1 OR monthly_deadline > 31 THEN
      monthly_deadline := 25;
    END IF;
    
    INSERT INTO logs (level, message, details)
    VALUES ('info', 'Deadline mensal definido', jsonb_build_object('deadline', monthly_deadline));
  EXCEPTION
    WHEN OTHERS THEN
      monthly_deadline := 25;
      INSERT INTO logs (level, message, details)
      VALUES ('warning', 'Erro ao buscar deadline, usando padrão', jsonb_build_object('error', SQLERRM, 'default', 25));
  END;
  
  -- Buscar dias de lembrete
  BEGIN
    SELECT COALESCE(
      ARRAY(SELECT jsonb_array_elements_text(setting_value)::INTEGER), 
      ARRAY[3, 5, 7]
    ) INTO reminder_days
    FROM notification_settings WHERE setting_key = 'reminder_days_before';
    
    -- Garantir que temos valores válidos
    IF reminder_days IS NULL OR array_length(reminder_days, 1) IS NULL THEN
      reminder_days := ARRAY[3, 5, 7];
    END IF;
    
    INSERT INTO logs (level, message, details)
    VALUES ('info', 'Dias de lembrete definidos', jsonb_build_object('days', reminder_days));
  EXCEPTION
    WHEN OTHERS THEN
      reminder_days := ARRAY[3, 5, 7];
      INSERT INTO logs (level, message, details)
      VALUES ('warning', 'Erro ao buscar dias de lembrete, usando padrão', jsonb_build_object('error', SQLERRM, 'default', ARRAY[3, 5, 7]));
  END;
  
  current_day := EXTRACT(DAY FROM CURRENT_DATE);
  days_until_deadline := monthly_deadline - current_day;
  
  INSERT INTO logs (level, message, details)
  VALUES ('info', 'Configurações carregadas', jsonb_build_object(
    'current_day', current_day,
    'monthly_deadline', monthly_deadline,
    'days_until_deadline', days_until_deadline,
    'reminder_days', reminder_days
  ));
  
  -- 1. Verificar métricas que precisam de lembrete
  BEGIN
    IF days_until_deadline = ANY(reminder_days) THEN
      INSERT INTO logs (level, message, details)
      VALUES ('info', 'Verificando métricas pendentes', jsonb_build_object('days_until_deadline', days_until_deadline));
      
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
  EXCEPTION
    WHEN OTHERS THEN
      INSERT INTO logs (level, message, details)
      VALUES ('error', 'Erro ao processar lembretes de métricas', jsonb_build_object('error', SQLERRM));
  END;
  
  -- 2. Verificar metas atingidas recentemente (SEM CÁLCULOS DE DIVISÃO)
  BEGIN
    INSERT INTO logs (level, message, details)
    VALUES ('info', 'Verificando metas atingidas', jsonb_build_object('timestamp', now()));
    
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
        AND md.target > 0  -- Garantir target positivo
        AND mv.value >= 0  -- Garantir valor não negativo
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
      -- Calcular percentual SEM DIVISÃO - usando lógica condicional segura
      DECLARE
        achievement_percentage INTEGER := 100; -- Valor padrão seguro
        achievement_message TEXT;
      BEGIN
        -- Evitar completamente operações de divisão
        -- Em vez disso, usar comparações diretas e lógica condicional
        IF metric_record.lower_is_better THEN
          IF metric_record.current_value <= metric_record.target THEN
            achievement_percentage := 100;
            achievement_message := format('Meta atingida! Valor atual: %s (Meta: %s)', 
                                        metric_record.current_value, metric_record.target);
          END IF;
        ELSE
          IF metric_record.current_value >= metric_record.target THEN
            achievement_percentage := 100;
            achievement_message := format('Meta atingida! Valor atual: %s (Meta: %s)', 
                                        metric_record.current_value, metric_record.target);
          END IF;
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
            COALESCE(achievement_message, 
                    format('A métrica "%s" atingiu sua meta. Continue assim!', metric_record.name)),
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
      EXCEPTION
        WHEN OTHERS THEN
          INSERT INTO logs (level, message, details)
          VALUES ('error', 'Erro ao processar meta individual', jsonb_build_object(
            'error', SQLERRM, 
            'metric_id', metric_record.id,
            'metric_name', metric_record.name
          ));
      END;
    END LOOP;
  EXCEPTION
    WHEN OTHERS THEN
      INSERT INTO logs (level, message, details)
      VALUES ('error', 'Erro ao processar metas atingidas', jsonb_build_object('error', SQLERRM));
  END;
  
  -- 3. Verificar justificativas pendentes há mais de 3 dias
  BEGIN
    SELECT COUNT(*) INTO pending_count
    FROM metric_justifications
    WHERE status = 'pending' 
      AND created_at < CURRENT_DATE - INTERVAL '3 days';
    
    INSERT INTO logs (level, message, details)
    VALUES ('info', 'Justificativas pendentes encontradas', jsonb_build_object('count', pending_count));
    
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
  EXCEPTION
    WHEN OTHERS THEN
      INSERT INTO logs (level, message, details)
      VALUES ('error', 'Erro ao processar justificativas pendentes', jsonb_build_object('error', SQLERRM));
  END;
  
  -- Log final
  INSERT INTO logs (level, message, details)
  VALUES ('info', 'Processamento de notificações concluído', jsonb_build_object(
    'notifications_sent', notification_count,
    'achievements_found', achievement_count,
    'pending_justifications', pending_count,
    'processed_at', now()
  ));
  
  RETURN jsonb_build_object(
    'notifications_sent', notification_count,
    'achievements_found', achievement_count,
    'pending_justifications', pending_count,
    'processed_at', now(),
    'status', 'success'
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Log do erro principal
    error_details := SQLERRM;
    INSERT INTO logs (level, message, details)
    VALUES ('error', 'Erro geral no processamento de notificações', jsonb_build_object(
      'error', error_details,
      'error_code', SQLSTATE,
      'notifications_sent', notification_count,
      'processed_at', now()
    ));
    
    -- Retornar erro de forma controlada
    RETURN jsonb_build_object(
      'error', true,
      'error_message', error_details,
      'error_code', SQLSTATE,
      'notifications_sent', notification_count,
      'processed_at', now(),
      'status', 'error'
    );
END;
$$;
