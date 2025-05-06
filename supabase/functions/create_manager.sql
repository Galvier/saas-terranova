
-- Function to create a manager
create or replace function create_manager(
  manager_name text,
  manager_email text,
  manager_department_id uuid,
  manager_is_active boolean,
  manager_password text default null,
  manager_role text default 'manager'
)
returns jsonb as $$
DECLARE
  new_id uuid;
  user_id uuid;
BEGIN
  -- Check if user with this email already exists
  SELECT id INTO user_id FROM auth.users WHERE email = manager_email;
  
  -- Insert the new manager
  INSERT INTO managers (
    name, 
    email,
    department_id,
    is_active,
    role,
    user_id
  )
  VALUES (
    manager_name, 
    manager_email,
    manager_department_id,
    manager_is_active,
    manager_role,
    user_id
  )
  RETURNING id INTO new_id;
  
  RETURN jsonb_build_object('id', new_id);
END;
$$ language plpgsql security definer;
