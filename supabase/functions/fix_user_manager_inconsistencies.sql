
-- Function to manually fix inconsistencies between auth.users and managers
CREATE OR REPLACE FUNCTION public.fix_user_manager_inconsistencies()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_count int := 0;
  result jsonb;
BEGIN
  -- Insert log before starting
  INSERT INTO logs (level, message, details) 
  VALUES (
    'info', 
    'Starting user-manager inconsistency fix', 
    jsonb_build_object('timestamp', now())
  );
  
  -- Update managers with null user_id where an auth user exists with matching email
  WITH updates AS (
    UPDATE public.managers m
    SET user_id = u.id
    FROM auth.users u
    WHERE m.email = u.email
    AND m.user_id IS NULL
    RETURNING m.id, m.email, u.id as user_id
  )
  SELECT COUNT(*) INTO updated_count FROM updates;
  
  -- Add detailed log of what was updated
  INSERT INTO logs (level, message, details) 
  VALUES (
    'info', 
    'User-manager inconsistency fix completed', 
    jsonb_build_object(
      'managers_updated', updated_count,
      'timestamp', now()
    )
  );
  
  -- Return results
  SELECT jsonb_build_object(
    'managers_updated', updated_count,
    'timestamp', now()
  ) INTO result;
  
  RETURN result;
END;
$$;
