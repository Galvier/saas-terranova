
-- Function to sync manager data to auth.users
CREATE OR REPLACE FUNCTION public.sync_manager_to_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id UUID;
  user_exists BOOLEAN;
BEGIN
  -- Check if a user with this email already exists
  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE email = NEW.email
  ) INTO user_exists;
  
  IF user_exists THEN
    -- If a user exists, get their ID
    SELECT id INTO user_id FROM auth.users WHERE email = NEW.email LIMIT 1;
    
    -- Update the user_id field of the manager
    NEW.user_id := user_id;
    
    -- Update user metadata with manager's role and department
    UPDATE auth.users
    SET raw_user_meta_data = jsonb_build_object(
      'role', NEW.role,
      'department_id', NEW.department_id,
      'display_name', NEW.name
    )
    WHERE id = user_id;
    
    -- Log the role update for debugging
    INSERT INTO logs (level, message, details) 
    VALUES (
      'info', 
      'Manager role synced to auth user', 
      jsonb_build_object(
        'email', NEW.email,
        'role', NEW.role,
        'user_id', user_id
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;
