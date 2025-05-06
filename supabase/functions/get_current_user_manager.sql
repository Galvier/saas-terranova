
-- Function to get the manager record for the current authenticated user
create or replace function get_current_user_manager()
returns table (
  id uuid,
  name text,
  email text,
  department_id uuid,
  department_name text,
  is_active boolean,
  role text,
  user_id uuid,
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
    d.name as department_name,
    m.is_active,
    m.role,
    m.user_id,
    m.created_at,
    m.updated_at
  from managers m
  left join departments d on m.department_id = d.id
  where m.user_id = auth.uid();
end;
$$;
