
-- Function to get the manager record for the currently authenticated user
CREATE OR REPLACE FUNCTION get_current_user_manager()
RETURNS SETOF managers
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID;
BEGIN
  -- Get the current authenticated user's ID
  current_user_id := auth.uid();
  
  -- Return the manager record for this user
  RETURN QUERY
  SELECT m.*
  FROM managers m
  WHERE m.user_id = current_user_id;
END;
$$;
