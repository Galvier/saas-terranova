
-- 1. Remover a tabela legada 'metrics' (substituída por metrics_definition)
DROP TABLE IF EXISTS public.metrics CASCADE;

-- 2. Remover políticas existentes para evitar conflitos
DROP POLICY IF EXISTS "Users can manage their own push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Admins can manage scheduled notifications" ON public.scheduled_notifications;
DROP POLICY IF EXISTS "Managers can view department relationships" ON public.department_managers;
DROP POLICY IF EXISTS "Admins can manage department relationships" ON public.department_managers;

-- 3. Verificar e criar tabelas ausentes identificadas no diagnóstico

-- Tabela para armazenar configurações de push notifications
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela para notificações agendadas
CREATE TABLE IF NOT EXISTS public.scheduled_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.notification_templates(id),
  target_type TEXT NOT NULL, -- 'user', 'department', 'all'
  target_id UUID, -- user_id ou department_id dependendo do target_type
  schedule_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
  schedule_time TIME,
  schedule_day INTEGER, -- para agendamentos mensais (dia do mês)
  scheduled_for TIMESTAMP WITH TIME ZONE,
  last_sent_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela para relacionamento departamento-gestor (many-to-many)
CREATE TABLE IF NOT EXISTS public.department_managers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  manager_id UUID NOT NULL REFERENCES public.managers(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(department_id, manager_id)
);

-- 4. Habilitar RLS nas tabelas
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.department_managers ENABLE ROW LEVEL SECURITY;

-- 5. Criar políticas RLS

-- Políticas para push_subscriptions
CREATE POLICY "Users can manage their own push subscriptions"
  ON public.push_subscriptions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.managers m 
      WHERE m.user_id = auth.uid() AND m.user_id = push_subscriptions.user_id
    )
  );

-- Políticas para scheduled_notifications (apenas admins)
CREATE POLICY "Admins can manage scheduled notifications"
  ON public.scheduled_notifications
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.managers m 
      WHERE m.user_id = auth.uid() AND m.role = 'admin'
    )
  );

-- Políticas para department_managers
CREATE POLICY "Managers can view department relationships"
  ON public.department_managers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.managers m 
      WHERE m.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage department relationships"
  ON public.department_managers
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.managers m 
      WHERE m.user_id = auth.uid() AND m.role = 'admin'
    )
  );
