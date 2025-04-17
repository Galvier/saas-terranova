
-- Function to get postgres version
create or replace function postgres_version()
returns text as $$
declare
  version_info text;
begin
  select version() into version_info;
  return version_info;
end;
$$ language plpgsql security definer;
