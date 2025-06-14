
-- Criar tabela para armazenar dados completos dos backups
CREATE TABLE public.backup_data (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  backup_history_id uuid NOT NULL REFERENCES public.backup_history(id) ON DELETE CASCADE,
  backup_content jsonb NOT NULL,
  compressed boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Índice para melhorar performance nas consultas
CREATE INDEX idx_backup_data_history_id ON public.backup_data(backup_history_id);
CREATE INDEX idx_backup_data_created_at ON public.backup_data(created_at);

-- Função para manter apenas os 30 backups mais recentes por usuário
CREATE OR REPLACE FUNCTION public.cleanup_old_backups()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  backup_count integer;
  old_backup_ids uuid[];
BEGIN
  -- Contar backups do usuário
  SELECT COUNT(*) INTO backup_count
  FROM public.backup_history
  WHERE user_id = NEW.user_id;
  
  -- Se passou de 30, remover os mais antigos
  IF backup_count > 30 THEN
    SELECT ARRAY(
      SELECT id 
      FROM public.backup_history 
      WHERE user_id = NEW.user_id 
      ORDER BY created_at ASC 
      LIMIT (backup_count - 30)
    ) INTO old_backup_ids;
    
    -- Remover dados de backup relacionados (CASCADE vai cuidar disso)
    DELETE FROM public.backup_history 
    WHERE id = ANY(old_backup_ids);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger para executar limpeza automática após inserção
CREATE TRIGGER trigger_cleanup_old_backups
  AFTER INSERT ON public.backup_history
  FOR EACH ROW
  EXECUTE FUNCTION public.cleanup_old_backups();

-- Função para restaurar backup
CREATE OR REPLACE FUNCTION public.restore_backup_data(backup_history_id_param uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id uuid;
  backup_content jsonb;
  table_name text;
  table_data jsonb;
  restored_tables text[] := '{}';
  restored_records integer := 0;
  result jsonb;
BEGIN
  -- Verificar usuário autenticado
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Usuário não autenticado');
  END IF;
  
  -- Buscar dados do backup
  SELECT bd.backup_content INTO backup_content
  FROM public.backup_data bd
  JOIN public.backup_history bh ON bd.backup_history_id = bh.id
  WHERE bd.backup_history_id = backup_history_id_param
    AND bh.user_id = current_user_id;
    
  IF backup_content IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Backup não encontrado ou não autorizado');
  END IF;
  
  -- Restaurar dados de cada tabela (implementação simplificada para user_settings)
  IF backup_content->'data'->>'user_settings' IS NOT NULL THEN
    table_data := backup_content->'data'->'user_settings';
    
    -- Limpar configurações existentes do usuário
    DELETE FROM public.user_settings WHERE user_id = current_user_id;
    
    -- Inserir dados restaurados (assumindo que os dados já contêm user_id correto)
    INSERT INTO public.user_settings (user_id, theme, density, animations_enabled, notification_preferences)
    SELECT 
      current_user_id,
      COALESCE((item->>'theme')::text, 'system'),
      COALESCE((item->>'density')::text, 'default'),
      COALESCE((item->>'animations_enabled')::boolean, true),
      COALESCE(item->'notification_preferences', '{"email": true, "alerts": true, "system": true}'::jsonb)
    FROM jsonb_array_elements(table_data) as item;
    
    restored_tables := array_append(restored_tables, 'user_settings');
  END IF;
  
  -- Registrar log da restauração
  INSERT INTO public.logs (level, message, details, user_id)
  VALUES (
    'info',
    'Backup restaurado com sucesso',
    jsonb_build_object(
      'backup_history_id', backup_history_id_param,
      'restored_tables', restored_tables,
      'user_id', current_user_id
    ),
    current_user_id
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'restored_tables', restored_tables,
    'message', 'Backup restaurado com sucesso'
  );
END;
$$;

-- RLS para backup_data
ALTER TABLE public.backup_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own backup data" 
  ON public.backup_data 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.backup_history bh 
      WHERE bh.id = backup_data.backup_history_id 
        AND bh.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own backup data" 
  ON public.backup_data 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.backup_history bh 
      WHERE bh.id = backup_data.backup_history_id 
        AND bh.user_id = auth.uid()
    )
  );
