
-- Function to get a manager by ID
create or replace function get_manager_by_id(manager_id uuid)
returns setof managers
language plpgsql
security definer
as $$
begin
  return query
  select * from managers
  where id = manager_id;
end;
$$;
