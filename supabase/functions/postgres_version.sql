
-- Stored procedure to check Postgres version
create or replace function postgres_version()
returns text as $$
begin
  return current_setting('server_version');
end;
$$ language plpgsql security definer;
