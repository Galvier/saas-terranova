
-- Create a table for diagnostic tests if it doesn't exist
create or replace function create_diagnostic_table_if_not_exists()
returns void as $$
begin
  -- Check if the table exists
  if not exists (
    select from information_schema.tables 
    where table_schema = 'public' 
    and table_name = 'diagnostic_tests'
  ) then
    -- Create the table if it doesn't exist
    create table public.diagnostic_tests (
      id uuid not null default gen_random_uuid() primary key,
      created_at timestamp with time zone not null default now(),
      test_id text not null,
      test_type text,
      created_by uuid references auth.users(id)
    );
    
    -- Add RLS policies if needed
    alter table public.diagnostic_tests enable row level security;
    
    -- Allow anonymous access for diagnostic purposes
    create policy "Allow anonymous diagnostic tests" 
      on public.diagnostic_tests for insert 
      to anon
      with check (true);
      
    -- Allow authenticated users to see their own tests
    create policy "Allow users to see their own diagnostic tests" 
      on public.diagnostic_tests for select 
      to authenticated
      using (created_by = auth.uid());
  end if;
end;
$$ language plpgsql security definer;

-- Grant execute permission to anonymous users
grant execute on function create_diagnostic_table_if_not_exists() to anon;
