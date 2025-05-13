
-- Function to save an admin's dashboard configuration
CREATE OR REPLACE FUNCTION save_admin_dashboard_config(
  metrics_ids TEXT[],
  user_id UUID
) RETURNS TEXT AS $$
DECLARE
  config_id UUID;
BEGIN
  -- Check if config exists for this user
  SELECT id INTO config_id 
  FROM public.admin_dashboard_config 
  WHERE user_id = $2;
  
  IF config_id IS NULL THEN
    -- Insert new config
    INSERT INTO public.admin_dashboard_config (
      user_id, 
      metric_ids, 
      created_at, 
      updated_at
    ) VALUES (
      $2, 
      $1, 
      NOW(), 
      NOW()
    )
    RETURNING id INTO config_id;
    
    RETURN config_id::TEXT;
  ELSE
    -- Update existing config
    UPDATE public.admin_dashboard_config
    SET 
      metric_ids = $1,
      updated_at = NOW()
    WHERE id = config_id;
    
    RETURN config_id::TEXT;
  END IF;
END;
$$ LANGUAGE plpgsql;
