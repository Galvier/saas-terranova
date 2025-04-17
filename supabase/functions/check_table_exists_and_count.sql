
-- Function to check if a table exists and count records
create or replace function check_table_exists_and_count(table_name text)
returns json as $$
declare
  result json;
  rec record;
  cnt int;
begin
  -- Check if table exists
  select into rec 1 from information_schema.tables 
    where table_schema = 'public' and table_name = check_table_exists_and_count.table_name;
  
  if rec is null then
    result := json_build_object('exists', false, 'count', null);
    return result;
  end if;
  
  -- Count records in the table
  execute format('select count(*) from public.%I', table_name) into cnt;
  
  result := json_build_object('exists', true, 'count', cnt);
  return result;
end;
$$ language plpgsql security definer;
