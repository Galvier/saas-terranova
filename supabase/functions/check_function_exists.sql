
-- Função para verificar se uma função específica existe no banco de dados
CREATE OR REPLACE FUNCTION public.check_function_exists(function_name text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
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
