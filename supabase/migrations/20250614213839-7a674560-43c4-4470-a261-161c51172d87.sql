
-- FASE 1: CORREÇÕES CRÍTICAS DE SEGURANÇA

-- 1. Habilitar RLS na tabela logs e criar políticas
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;

-- Política para logs: apenas admins podem ver todos os logs, usuários veem apenas seus próprios
CREATE POLICY "Admins can view all logs, users view their own"
ON public.logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.managers m 
    WHERE m.user_id = auth.uid() AND m.role = 'admin'
  ) OR user_id = auth.uid()
);

-- Política para inserção de logs: qualquer usuário autenticado pode criar logs
CREATE POLICY "Authenticated users can insert logs"
ON public.logs
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- 2. Criar políticas RLS para departments
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Managers can view departments" ON public.departments;
DROP POLICY IF EXISTS "Admins can manage departments" ON public.departments;

-- Gestores podem ver departamentos (seu próprio ou se for admin)
CREATE POLICY "Managers can view departments"
ON public.departments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.managers m 
    WHERE m.user_id = auth.uid() 
    AND (m.role = 'admin' OR m.department_id = departments.id)
  )
);

-- Apenas admins podem gerenciar departamentos
CREATE POLICY "Admins can manage departments"
ON public.departments
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.managers m 
    WHERE m.user_id = auth.uid() AND m.role = 'admin'
  )
);

-- 3. Criar políticas RLS para diagnostic_tests
ALTER TABLE public.diagnostic_tests ENABLE ROW LEVEL SECURITY;

-- Apenas admins podem acessar testes de diagnóstico
CREATE POLICY "Only admins can access diagnostic tests"
ON public.diagnostic_tests
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.managers m 
    WHERE m.user_id = auth.uid() AND m.role = 'admin'
  )
);

-- 4. Criar políticas RLS para managers_backup
ALTER TABLE public.managers_backup ENABLE ROW LEVEL SECURITY;

-- Apenas admins podem acessar backups de managers
CREATE POLICY "Only admins can access managers backup"
ON public.managers_backup
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.managers m 
    WHERE m.user_id = auth.uid() AND m.role = 'admin'
  )
);

-- 5. Criar políticas RLS para metrics_definition
ALTER TABLE public.metrics_definition ENABLE ROW LEVEL SECURITY;

-- Gestores podem ver métricas de seus departamentos, admins veem todas
CREATE POLICY "Managers can view department metrics"
ON public.metrics_definition
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.managers m 
    WHERE m.user_id = auth.uid() 
    AND (m.role = 'admin' OR m.department_id = metrics_definition.department_id)
  )
);

-- Apenas admins podem gerenciar definições de métricas
CREATE POLICY "Admins can manage metric definitions"
ON public.metrics_definition
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.managers m 
    WHERE m.user_id = auth.uid() AND m.role = 'admin'
  )
);

-- 6. Criar políticas RLS para profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver e gerenciar apenas seus próprios perfis
CREATE POLICY "Users can manage their own profiles"
ON public.profiles
FOR ALL
USING (auth.uid() = id);

-- 7. Criar políticas RLS para settings
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Apenas admins podem gerenciar configurações globais
CREATE POLICY "Only admins can manage global settings"
ON public.settings
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.managers m 
    WHERE m.user_id = auth.uid() AND m.role = 'admin'
  )
);

-- 8. Habilitar RLS nas tabelas managers, metrics_values, notifications se ainda não estiver
ALTER TABLE public.managers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metrics_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metric_justifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_dashboard_config ENABLE ROW LEVEL SECURITY;

-- Políticas para managers
DROP POLICY IF EXISTS "Managers can view other managers" ON public.managers;
DROP POLICY IF EXISTS "Admins can manage all managers" ON public.managers;

CREATE POLICY "Managers can view other managers"
ON public.managers
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.managers m 
    WHERE m.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all managers"
ON public.managers
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.managers m 
    WHERE m.user_id = auth.uid() AND m.role = 'admin'
  )
);

-- Políticas para metrics_values
DROP POLICY IF EXISTS "Managers can view department metric values" ON public.metrics_values;
DROP POLICY IF EXISTS "Managers can insert metric values" ON public.metrics_values;

CREATE POLICY "Managers can view department metric values"
ON public.metrics_values
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.managers m 
    JOIN public.metrics_definition md ON md.department_id = m.department_id
    WHERE m.user_id = auth.uid() 
    AND md.id = metrics_values.metrics_definition_id
    AND (m.role = 'admin' OR m.department_id = md.department_id)
  )
);

CREATE POLICY "Managers can insert metric values"
ON public.metrics_values
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.managers m 
    JOIN public.metrics_definition md ON md.department_id = m.department_id
    WHERE m.user_id = auth.uid() 
    AND md.id = metrics_values.metrics_definition_id
  )
);

-- Políticas para notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Admins can create notifications"
ON public.notifications
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.managers m 
    WHERE m.user_id = auth.uid() AND m.role = 'admin'
  )
);

-- Políticas para notification_templates
DROP POLICY IF EXISTS "Admins can manage notification templates" ON public.notification_templates;

CREATE POLICY "Managers can view notification templates"
ON public.notification_templates
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.managers m 
    WHERE m.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage notification templates"
ON public.notification_templates
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.managers m 
    WHERE m.user_id = auth.uid() AND m.role = 'admin'
  )
);

-- Políticas para notification_settings
DROP POLICY IF EXISTS "Admins can manage notification settings" ON public.notification_settings;

CREATE POLICY "Managers can view notification settings"
ON public.notification_settings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.managers m 
    WHERE m.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage notification settings"
ON public.notification_settings
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.managers m 
    WHERE m.user_id = auth.uid() AND m.role = 'admin'
  )
);

-- Políticas para metric_justifications
DROP POLICY IF EXISTS "Users can manage their own justifications" ON public.metric_justifications;
DROP POLICY IF EXISTS "Admins can view all justifications" ON public.metric_justifications;

CREATE POLICY "Users can manage their own justifications"
ON public.metric_justifications
FOR ALL
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all justifications"
ON public.metric_justifications
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.managers m 
    WHERE m.user_id = auth.uid() AND m.role = 'admin'
  ) OR user_id = auth.uid()
);

-- Políticas para admin_dashboard_config
DROP POLICY IF EXISTS "Users can manage their own dashboard config" ON public.admin_dashboard_config;

CREATE POLICY "Users can manage their own dashboard config"
ON public.admin_dashboard_config
FOR ALL
USING (user_id = auth.uid());

-- FASE 2: CORREÇÕES DE CONFIGURAÇÃO - Funções com search_path seguro

-- Função para verificar se o usuário é admin (com search_path seguro)
CREATE OR REPLACE FUNCTION public.is_admin(user_id_param uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM managers 
    WHERE user_id = user_id_param AND role = 'admin'
  );
END;
$$;

-- Atualizar função diagnose_auth_sync_issues com search_path seguro
CREATE OR REPLACE FUNCTION public.diagnose_auth_sync_issues()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'managers_count', (SELECT COUNT(*) FROM managers),
    'synced_users_count', (SELECT COUNT(*) FROM managers WHERE user_id IS NOT NULL),
    'active_managers_count', (SELECT COUNT(*) FROM managers WHERE is_active = true),
    'admin_count', (SELECT COUNT(*) FROM managers WHERE role = 'admin'),
    'timestamp', now()
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Criar função para logging seguro
CREATE OR REPLACE FUNCTION public.create_security_log(
  log_level text,
  log_message text,
  log_details jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  log_id uuid;
BEGIN
  INSERT INTO logs (level, message, details, user_id)
  VALUES (log_level, log_message, log_details, auth.uid())
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Função para audit trail
CREATE OR REPLACE FUNCTION public.audit_sensitive_operation(
  operation_type text,
  table_name text,
  record_id uuid,
  old_values jsonb DEFAULT NULL,
  new_values jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO logs (level, message, details, user_id)
  VALUES (
    'info',
    format('Audit: %s operation on %s', operation_type, table_name),
    jsonb_build_object(
      'operation', operation_type,
      'table', table_name,
      'record_id', record_id,
      'old_values', old_values,
      'new_values', new_values,
      'timestamp', now(),
      'user_agent', current_setting('request.headers', true)::jsonb->>'user-agent'
    ),
    auth.uid()
  );
END;
$$;
