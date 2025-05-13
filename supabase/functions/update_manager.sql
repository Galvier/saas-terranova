
-- Function to update a manager
create or replace function update_manager(
  manager_id uuid,
  manager_name text,
  manager_email text,
  manager_department_id uuid,
  manager_is_active boolean,
  manager_role text default null
)
returns jsonb as $$
DECLARE
  old_email text;
  user_id uuid;
BEGIN
  -- Get current email
  SELECT email INTO old_email FROM managers WHERE id = manager_id;
  
  -- If email is changing, update user relationship
  IF old_email != manager_email THEN
    -- Find user with new email
    SELECT id INTO user_id FROM auth.users WHERE email = manager_email;
  ELSE
    -- Keep the same user_id
    SELECT user_id INTO user_id FROM managers WHERE id = manager_id;
  END IF;
  
  -- Update the manager
  UPDATE managers SET
    name = manager_name,
    email = manager_email,
    department_id = manager_department_id,
    is_active = manager_is_active,
    updated_at = NOW(),
    role = COALESCE(manager_role, role),
    user_id = user_id
  WHERE id = manager_id;
  
  RETURN jsonb_build_object('id', manager_id);
END;
$$ language plpgsql security definer;
