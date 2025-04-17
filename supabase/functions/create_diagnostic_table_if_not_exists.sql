
-- Function to create a test table if it doesn't exist
create or replace function create_diagnostic_table_if_not_exists()
returns void as $$
begin
  execute '
    create table if not exists public._diagnosis_test (
      id text primary key,
      test_value text,
      created_at timestamp with time zone
    )
  ';
end;
$$ language plpgsql security definer;
