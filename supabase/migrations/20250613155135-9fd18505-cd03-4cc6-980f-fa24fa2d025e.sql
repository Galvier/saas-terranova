
-- Verificar e criar políticas RLS para user_settings
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can view their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can insert their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON public.user_settings;

-- Criar políticas para user_settings
CREATE POLICY "Users can view their own settings" 
ON public.user_settings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" 
ON public.user_settings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" 
ON public.user_settings 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Verificar e criar políticas RLS para backup_settings
ALTER TABLE public.backup_settings ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can view their own backup settings" ON public.backup_settings;
DROP POLICY IF EXISTS "Users can insert their own backup settings" ON public.backup_settings;
DROP POLICY IF EXISTS "Users can update their own backup settings" ON public.backup_settings;

-- Criar políticas para backup_settings
CREATE POLICY "Users can view their own backup settings" 
ON public.backup_settings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own backup settings" 
ON public.backup_settings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own backup settings" 
ON public.backup_settings 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Verificar e criar políticas RLS para backup_history
ALTER TABLE public.backup_history ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can view their own backup history" ON public.backup_history;
DROP POLICY IF EXISTS "Users can insert their own backup history" ON public.backup_history;

-- Criar políticas para backup_history
CREATE POLICY "Users can view their own backup history" 
ON public.backup_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own backup history" 
ON public.backup_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);
