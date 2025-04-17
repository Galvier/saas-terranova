
-- Function to run diagnostic write test
create or replace function run_diagnostic_write_test(test_id text)
returns boolean as $$
declare
  result boolean;
begin
  -- Simple write test
  insert into diagnostic_tests (test_id, created_at)
  values (test_id, now());
  
  -- Clean up
  delete from diagnostic_tests where test_id = test_id;
  
  return true;
end;
$$ language plpgsql security definer;
