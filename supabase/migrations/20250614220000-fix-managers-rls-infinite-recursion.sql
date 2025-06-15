
-- Corrigir recursão infinita nas políticas RLS da tabela managers

-- Primeiro, remover todas as políticas existentes que causam recursão
DROP POLICY IF EXISTS "Managers can view other managers" ON public.managers;
DROP POLICY IF EXISTS "Admins can manage all managers" ON public.managers;

-- Criar função segura para verificar se usuário é admin
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM managers 
    WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true
  );
END;
$$;

-- Criar função segura para verificar se usuário é manager ativo
CREATE OR REPLACE FUNCTION public.is_active_manager()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM managers 
    WHERE user_id = auth.uid() AND is_active = true
  );
END;
$$;

-- Criar novas políticas usando as funções de segurança
CREATE POLICY "Authenticated managers can view managers"
ON public.managers
FOR SELECT
USING (public.is_active_manager());

CREATE POLICY "Admins can manage all managers"
ON public.managers
FOR ALL
USING (public.is_admin_user());

-- Política para inserção de novos managers (apenas admins)
CREATE POLICY "Admins can insert managers"
ON public.managers
FOR INSERT
WITH CHECK (public.is_admin_user());

-- Política para atualização (apenas admins)
CREATE POLICY "Admins can update managers"
ON public.managers
FOR UPDATE
USING (public.is_admin_user());

-- Política para deletar (apenas admins)
CREATE POLICY "Admins can delete managers"
ON public.managers
FOR DELETE
USING (public.is_admin_user());
