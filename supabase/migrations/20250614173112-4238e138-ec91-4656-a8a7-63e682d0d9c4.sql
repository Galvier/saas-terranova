
-- Primeiro, remover a função existente e recriar com o tipo correto
DROP FUNCTION IF EXISTS public.update_notification_setting(text, jsonb);

-- Criar a função update_notification_setting correta
CREATE OR REPLACE FUNCTION public.update_notification_setting(
  setting_key_param text,
  new_value jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Atualizar ou inserir a configuração
  INSERT INTO public.notification_settings (setting_key, setting_value, description)
  VALUES (
    setting_key_param,
    new_value,
    'Configuração para ' || setting_key_param
  )
  ON CONFLICT (setting_key) 
  DO UPDATE SET 
    setting_value = new_value,
    updated_at = now();
END;
$$;

-- Adicionar uma constraint única na chave se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'notification_settings_setting_key_key'
  ) THEN
    ALTER TABLE public.notification_settings 
    ADD CONSTRAINT notification_settings_setting_key_key UNIQUE (setting_key);
  END IF;
END;
$$;
