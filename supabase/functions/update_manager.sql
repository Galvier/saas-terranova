
-- Function to update a manager
CREATE OR REPLACE FUNCTION update_manager(
  manager_id uuid,
  manager_name text,
  manager_email text,
  manager_department_id uuid,
  manager_is_active boolean,
  manager_role text default null
)
RETURNS jsonb AS $$
DECLARE
  old_email text;
  old_role text;
  user_id uuid;
  v_result jsonb;
BEGIN
  -- Get current email and role
  SELECT email, role, user_id INTO old_email, old_role, user_id FROM managers WHERE id = manager_id;
  
  -- If email is changing, update user relationship
  IF old_email != manager_email THEN
    -- Find user with new email
    SELECT id INTO user_id FROM auth.users WHERE email = manager_email;
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
  WHERE id = manager_id
  RETURNING jsonb_build_object(
    'id', id,
    'role', role,
    'name', name
  ) INTO v_result;
  
  -- If role has changed, directly update auth user metadata to ensure immediate effect
  IF old_role IS DISTINCT FROM COALESCE(manager_role, old_role) AND user_id IS NOT NULL THEN
    UPDATE auth.users
    SET raw_user_meta_data = jsonb_build_object(
      'role', COALESCE(manager_role, old_role),
      'department_id', manager_department_id,
      'display_name', manager_name
    )
    WHERE id = user_id;
    
    -- Log role change
    INSERT INTO logs (level, message, details) 
    VALUES (
      'info', 
      'Manager role updated', 
      jsonb_build_object(
        'manager_id', manager_id,
        'old_role', old_role,
        'new_role', COALESCE(manager_role, old_role),
        'user_id', user_id
      )
    );
  END IF;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
