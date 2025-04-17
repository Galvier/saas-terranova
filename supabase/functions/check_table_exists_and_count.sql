
-- Function to check if a table exists and count its rows
create or replace function check_table_exists_and_count(table_name text)
returns json as $$
declare
  exists_result boolean;
  count_result integer;
  result json;
begin
  -- Check if table exists
  execute format('
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = ''public'' 
      AND table_name = %L
    )', table_name) 
  into exists_result;
  
  -- Count rows if table exists
  if exists_result then
    execute format('SELECT COUNT(*) FROM %I', table_name) into count_result;
  else
    count_result := 0;
  end if;
  
  -- Create JSON result
  select json_build_object(
    'exists', exists_result,
    'count', count_result
  ) into result;
  
  return result;
end;
$$ language plpgsql security definer;
