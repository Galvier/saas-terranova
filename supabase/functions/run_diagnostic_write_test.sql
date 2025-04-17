
-- Function to run a write test
create or replace function run_diagnostic_write_test(test_id text)
returns boolean as $$
begin
  -- Create test table if it doesn't exist
  perform create_diagnostic_table_if_not_exists();
  
  -- Insert test record
  insert into public._diagnosis_test (id, test_value, created_at)
  values (test_id, 'test', now());
  
  -- Delete test record
  delete from public._diagnosis_test where id = test_id;
  
  return true;
exception
  when others then
    return false;
end;
$$ language plpgsql security definer;
