
-- Atualizar a função broadcast_notification_from_template para processar variáveis
CREATE OR REPLACE FUNCTION public.broadcast_notification_from_template(
  template_id_param uuid, 
  target_type text DEFAULT 'all'::text, 
  department_id_param uuid DEFAULT NULL::uuid, 
  variables jsonb DEFAULT '{}'::jsonb
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  template_record RECORD;
  user_record RECORD;
  notification_count INTEGER := 0;
  final_title TEXT;
  final_message TEXT;
  department_name TEXT;
  metric_info RECORD;
BEGIN
  -- Buscar o template
  SELECT * INTO template_record
  FROM notification_templates
  WHERE id = template_id_param AND is_active = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Template not found or inactive';
  END IF;
  
  -- Preparar título e mensagem base
  final_title := template_record.title;
  final_message := template_record.message;
  
  -- Buscar informações do departamento se especificado
  IF department_id_param IS NOT NULL THEN
    SELECT name INTO department_name FROM departments WHERE id = department_id_param;
  END IF;
  
  -- Processar variáveis básicas
  final_title := replace(final_title, '{{department_name}}', COALESCE(department_name, 'Todos os departamentos'));
  final_message := replace(final_message, '{{department_name}}', COALESCE(department_name, 'Todos os departamentos'));
  
  -- Processar variáveis customizadas passadas no parâmetro
  IF variables IS NOT NULL AND jsonb_typeof(variables) = 'object' THEN
    DECLARE
      var_key TEXT;
      var_value TEXT;
    BEGIN
      FOR var_key, var_value IN SELECT * FROM jsonb_each_text(variables)
      LOOP
        final_title := replace(final_title, '{{' || var_key || '}}', var_value);
        final_message := replace(final_message, '{{' || var_key || '}}', var_value);
      END LOOP;
    END;
  END IF;
  
  -- Processar variáveis de contexto baseadas no tipo de template
  CASE template_record.name
    WHEN 'metric_deadline_reminder' THEN
      -- Buscar informações da métrica se fornecida
      IF variables ? 'metric_id' THEN
        SELECT name, target, unit INTO metric_info
        FROM metrics_definition 
        WHERE id = (variables->>'metric_id')::uuid;
        
        IF FOUND THEN
          final_title := replace(final_title, '{{metric_name}}', metric_info.name);
          final_message := replace(final_message, '{{metric_name}}', metric_info.name);
          final_message := replace(final_message, '{{target}}', metric_info.target::text);
          final_message := replace(final_message, '{{unit}}', metric_info.unit);
        END IF;
      END IF;
      
    WHEN 'goal_achieved' THEN
      IF variables ? 'achievement_percentage' THEN
        final_title := replace(final_title, '{{achievement_percentage}}', variables->>'achievement_percentage');
        final_message := replace(final_message, '{{achievement_percentage}}', variables->>'achievement_percentage');
      END IF;
      
    WHEN 'pending_justification_admin' THEN
      IF variables ? 'pending_count' THEN
        final_title := replace(final_title, '{{count}}', variables->>'pending_count');
        final_message := replace(final_message, '{{count}}', variables->>'pending_count');
      END IF;
  END CASE;
  
  -- Adicionar data atual
  final_title := replace(final_title, '{{current_date}}', to_char(CURRENT_DATE, 'DD/MM/YYYY'));
  final_message := replace(final_message, '{{current_date}}', to_char(CURRENT_DATE, 'DD/MM/YYYY'));
  
  -- Adicionar período atual
  final_title := replace(final_title, '{{current_period}}', to_char(CURRENT_DATE, 'MM/YYYY'));
  final_message := replace(final_message, '{{current_period}}', to_char(CURRENT_DATE, 'MM/YYYY'));
  
  -- Enviar para usuários baseado no target_type
  CASE target_type
    WHEN 'all' THEN
      FOR user_record IN 
        SELECT DISTINCT m.user_id, m.name
        FROM managers m 
        WHERE m.user_id IS NOT NULL AND m.is_active = true
      LOOP
        -- Processar variáveis específicas do usuário
        DECLARE
          user_title TEXT := final_title;
          user_message TEXT := final_message;
        BEGIN
          user_title := replace(user_title, '{{user_name}}', user_record.name);
          user_message := replace(user_message, '{{user_name}}', user_record.name);
          
          INSERT INTO notifications (user_id, title, message, type, metadata)
          VALUES (
            user_record.user_id,
            user_title,
            user_message,
            template_record.type,
            jsonb_build_object(
              'template_id', template_id_param, 
              'broadcast_type', target_type,
              'processed_variables', variables
            )
          );
          notification_count := notification_count + 1;
        END;
      END LOOP;
      
    WHEN 'admins' THEN
      FOR user_record IN 
        SELECT DISTINCT m.user_id, m.name
        FROM managers m 
        WHERE m.user_id IS NOT NULL AND m.is_active = true AND m.role = 'admin'
      LOOP
        DECLARE
          user_title TEXT := final_title;
          user_message TEXT := final_message;
        BEGIN
          user_title := replace(user_title, '{{user_name}}', user_record.name);
          user_message := replace(user_message, '{{user_name}}', user_record.name);
          
          INSERT INTO notifications (user_id, title, message, type, metadata)
          VALUES (
            user_record.user_id,
            user_title,
            user_message,
            template_record.type,
            jsonb_build_object(
              'template_id', template_id_param, 
              'broadcast_type', target_type,
              'processed_variables', variables
            )
          );
          notification_count := notification_count + 1;
        END;
      END LOOP;
      
    WHEN 'department' THEN
      FOR user_record IN 
        SELECT DISTINCT m.user_id, m.name
        FROM managers m 
        WHERE m.user_id IS NOT NULL AND m.is_active = true 
        AND m.department_id = department_id_param
      LOOP
        DECLARE
          user_title TEXT := final_title;
          user_message TEXT := final_message;
        BEGIN
          user_title := replace(user_title, '{{user_name}}', user_record.name);
          user_message := replace(user_message, '{{user_name}}', user_record.name);
          
          INSERT INTO notifications (user_id, title, message, type, metadata)
          VALUES (
            user_record.user_id,
            user_title,
            user_message,
            template_record.type,
            jsonb_build_object(
              'template_id', template_id_param, 
              'broadcast_type', target_type, 
              'department_id', department_id_param,
              'processed_variables', variables
            )
          );
          notification_count := notification_count + 1;
        END;
      END LOOP;
  END CASE;
  
  RETURN notification_count;
END;
$function$;
