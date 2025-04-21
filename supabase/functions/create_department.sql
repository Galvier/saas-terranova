
-- Function to create a new department
create or replace function create_department(
  department_name text,
  department_description text,
  department_is_active boolean
)
returns json as $$
declare
  new_id uuid;
begin
  insert into departments (name, description, is_active)
  values (department_name, department_description, department_is_active)
  returning id into new_id;
  
  return json_build_object('id', new_id);
end;
$$ language plpgsql security definer;
