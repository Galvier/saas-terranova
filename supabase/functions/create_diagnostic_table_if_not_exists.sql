
-- Create diagnostic tests table if it doesn't exist
create or replace function create_diagnostic_table_if_not_exists()
returns void as $$
begin
  execute '
    CREATE TABLE IF NOT EXISTS public.diagnostic_tests (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      test_id TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    )
  ';
end;
$$ language plpgsql security definer;
