
CREATE OR REPLACE FUNCTION public.create_security_log(
  log_level text,
  log_message text,
  log_details jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  new_log_id uuid;
  current_user_id uuid;
BEGIN
  -- Obter o ID do usuário atual
  current_user_id := auth.uid();
  
  -- Inserir o log
  INSERT INTO public.logs (
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
$function$;
