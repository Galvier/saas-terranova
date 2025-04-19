
-- Function to safely check if a table exists and get its approximate row count
-- without triggering row-level security policy recursion
CREATE OR REPLACE FUNCTION public.check_table_exists(table_name text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  table_exists boolean;
  row_count bigint;
  result jsonb;
BEGIN
  -- Check if the table exists in the public schema
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = check_table_exists.table_name
  ) INTO table_exists;
  
  -- Default count is 0
  row_count := 0;
  
  -- Only try to count rows if the table exists
  IF table_exists THEN
    -- Use dynamic SQL to count rows safely
    EXECUTE format('SELECT count(*) FROM public.%I', check_table_exists.table_name) INTO row_count;
  END IF;
  
  -- Construct the result as JSON
  result := jsonb_build_object(
    'exists', table_exists,
    'count', row_count
  );
  
  RETURN result;
END;
$$;

-- Provide a function that simply returns the client encoding
-- This is used as a lightweight connection test
CREATE OR REPLACE FUNCTION public.pg_client_encoding()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT current_setting('client_encoding');
$$;
