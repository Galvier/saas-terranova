
create or replace function get_all_departments()
returns table (
  id uuid,
  name text,
  description text,
  is_active boolean,
  manager_id uuid,
  created_at timestamptz,
  updated_at timestamptz,
  manager_name text
) as $$
begin
  return query 
  select 
    d.id,
    d.name,
    d.description,
    d.is_active,
    d.manager_id,
    d.created_at,
    d.updated_at,
    m.name as manager_name
  from departments d
  left join managers m on d.manager_id = m.id
  order by d.name;
end;
$$ language plpgsql security definer;
