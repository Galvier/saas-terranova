
-- 1. Criar bucket de avatars se não existir
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars', 
  'avatars', 
  true, 
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- 2. Criar políticas RLS para o bucket de avatars
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Anyone can upload an avatar" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Anyone can update their own avatar" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'avatars');

CREATE POLICY "Anyone can delete their own avatar" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'avatars');

-- 3. Corrigir a função update_notification_setting para resolver ambiguidade
CREATE OR REPLACE FUNCTION public.update_notification_setting(setting_key_param text, new_value jsonb)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Verificar se o usuário é admin
  IF NOT EXISTS (
    SELECT 1 FROM public.managers 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can update notification settings';
  END IF;
  
  -- Usar alias para evitar ambiguidade
  UPDATE public.notification_settings ns
  SET setting_value = new_value, updated_at = now()
  WHERE ns.setting_key = setting_key_param;
  
  RETURN FOUND;
END;
$function$;

-- 4. Garantir que existem as configurações padrão de notificação
INSERT INTO public.notification_settings (setting_key, setting_value, description) VALUES
('monthly_deadline_day', '25', 'Dia limite mensal para preenchimento de métricas'),
('reminder_days_before', '[3, 5, 7]', 'Dias antes do prazo para enviar lembretes'),
('admin_summary_frequency', '"weekly"', 'Frequência de resumos para administradores'),
('business_hours_start', '"08:00"', 'Horário de início do expediente'),
('business_hours_end', '"18:00"', 'Horário de fim do expediente'),
('enable_achievement_notifications', 'true', 'Habilitar notificações de metas atingidas'),
('enable_reminder_notifications', 'true', 'Habilitar lembretes de preenchimento')
ON CONFLICT (setting_key) DO NOTHING;

-- 5. Verificar se a função save_user_settings está correta
CREATE OR REPLACE FUNCTION public.save_user_settings(p_user_id uuid, p_theme text, p_animations_enabled boolean DEFAULT true, p_notification_preferences jsonb DEFAULT '{"email": true, "alerts": true, "system": true}'::jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  settings_id UUID;
BEGIN
  -- Verificar se já existem configurações para este usuário
  SELECT id INTO settings_id FROM user_settings WHERE user_id = p_user_id;
  
  IF settings_id IS NULL THEN
    -- Inserir novas configurações
    INSERT INTO user_settings (
      user_id,
      theme,
      animations_enabled,
      notification_preferences,
      updated_at
    ) VALUES (
      p_user_id,
      p_theme,
      p_animations_enabled,
      p_notification_preferences,
      NOW()
    )
    RETURNING id INTO settings_id;
  ELSE
    -- Atualizar configurações existentes
    UPDATE user_settings SET
      theme = p_theme,
      animations_enabled = p_animations_enabled,
      notification_preferences = p_notification_preferences,
      updated_at = NOW()
    WHERE user_id = p_user_id;
  END IF;
  
  RETURN settings_id;
END;
$function$;
