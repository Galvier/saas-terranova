
-- Function to get a manager by ID
create or replace function get_manager_by_id(manager_id uuid)
returns json as $$
declare
  result json;
begin
  select json_build_object(
    'id', id,
    'name', name,
    'email', email,
    'department_id', department_id,
    'is_active', is_active
  ) into result
  from managers
  where id = manager_id;
  
  return result;
end;
$$ language plpgsql security definer;
