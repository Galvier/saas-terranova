
-- Function to update a manager
create or replace function update_manager(
  manager_id uuid,
  manager_name text,
  manager_email text,
  manager_department_id uuid,
  manager_is_active boolean
)
returns void as $$
begin
  update managers
  set 
    name = manager_name,
    email = manager_email,
    department_id = manager_department_id,
    is_active = manager_is_active,
    updated_at = now()
  where id = manager_id;
end;
$$ language plpgsql security definer;
