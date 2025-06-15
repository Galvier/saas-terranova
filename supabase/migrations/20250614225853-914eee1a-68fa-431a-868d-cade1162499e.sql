
-- MIGRAÇÃO DE EMERGÊNCIA: Correção de Políticas RLS Recursivas e Search Path

-- 1. Remover todas as políticas RLS problemáticas da tabela managers
DROP POLICY IF EXISTS "Managers can view other managers" ON public.managers;
DROP POLICY IF EXISTS "Admins can manage all managers" ON public.managers;
DROP POLICY IF EXISTS "Authenticated managers can view managers" ON public.managers;
DROP POLICY IF EXISTS "Admins can insert managers" ON public.managers;
DROP POLICY IF EXISTS "Admins can update managers" ON public.managers;
DROP POLICY IF EXISTS "Admins can delete managers" ON public.managers;

-- 2. Criar funções SECURITY DEFINER com search_path fixo
CREATE OR REPLACE FUNCTION public.is_admin_user(user_id_param uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM managers 
    WHERE user_id = user_id_param AND role = 'admin' AND is_active = true
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_active_manager(user_id_param uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM managers 
    WHERE user_id = user_id_param AND is_active = true
  );
END;
$$;

-- 3. Corrigir função check_function_exists com search_path fixo
CREATE OR REPLACE FUNCTION public.check_function_exists(function_name text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  exists_result boolean;
  result json;
BEGIN
  -- Verificar se a função existe
  SELECT EXISTS (
    SELECT 1
    FROM pg_proc
    WHERE proname = function_name
    AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) INTO exists_result;
  
  -- Criar resultado JSON
  SELECT json_build_object(
    'exists', exists_result
  ) INTO result;
  
  RETURN result;
END;
$$;

-- 4. Corrigir função create_security_log com search_path fixo
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
  new_log_id uuid;
  current_user_id uuid;
BEGIN
  -- Obter o ID do usuário atual
  current_user_id := auth.uid();
  
  -- Inserir o log
  INSERT INTO logs (
    level,
    message,
    details,
    user_id,
    created_at
  ) VALUES (
    log_level,
    log_message,
    log_details,
    current_user_id,
    now()
  ) RETURNING id INTO new_log_id;
  
  RETURN new_log_id;
END;
$$;

-- 5. Implementar novas políticas RLS não-recursivas para managers
CREATE POLICY "Active managers can view all managers"
ON public.managers
FOR SELECT
USING (public.is_active_manager());

CREATE POLICY "Admins can insert managers"
ON public.managers
FOR INSERT
WITH CHECK (public.is_admin_user());

CREATE POLICY "Admins can update managers"
ON public.managers
FOR UPDATE
USING (public.is_admin_user());

CREATE POLICY "Admins can delete managers"
ON public.managers
FOR DELETE
USING (public.is_admin_user());

-- 6. Corrigir outras funções com search_path mutável
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
    'auth_triggers', 1,
    'manager_triggers', 1,
    'timestamp', now()
  ) INTO result;
  
  RETURN result;
END;
$$;

-- 7. Garantir que RLS está habilitado
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;

-- 8. Política para logs: usuários podem ver seus próprios logs, admins veem todos
DROP POLICY IF EXISTS "Admins can view all logs, users view their own" ON public.logs;
DROP POLICY IF EXISTS "Authenticated users can insert logs" ON public.logs;

CREATE POLICY "Users can view logs"
ON public.logs
FOR SELECT
USING (
  user_id = auth.uid() OR public.is_admin_user()
);

CREATE POLICY "Authenticated users can create logs"
ON public.logs
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- 9. Log de auditoria da correção
INSERT INTO public.logs (level, message, details, user_id)
VALUES (
  'info',
  'Correção crítica de segurança aplicada',
  jsonb_build_object(
    'action', 'emergency_security_fix',
    'issues_fixed', ARRAY[
      'recursive_rls_policies',
      'mutable_search_path_functions',
      'security_definer_functions_created'
    ],
    'timestamp', now()
  ),
  auth.uid()
);
