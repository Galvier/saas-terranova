
-- Function to get a manager by ID
create or replace function get_manager_by_id(manager_id uuid)
returns table (
  id uuid,
  name text,
  email text,
  department_id uuid,
  is_active boolean,
  role text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
language plpgsql
security definer
as $$
begin
  return query
  select 
    m.id,
    m.name,
    m.email,
    m.department_id,
    m.is_active,
    m.role,
    m.created_at,
    m.updated_at
  from managers m
  where m.id = manager_id;
end;
$$;
