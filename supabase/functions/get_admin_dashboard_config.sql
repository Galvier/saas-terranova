
-- Function to get an admin's dashboard configuration
CREATE OR REPLACE FUNCTION get_admin_dashboard_config(user_id_param UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  metric_ids TEXT[],
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    config.id, 
    config.user_id, 
    config.metric_ids, 
    config.created_at, 
    config.updated_at
  FROM 
    public.admin_dashboard_config config
  WHERE 
    config.user_id = user_id_param;
END;
$$ LANGUAGE plpgsql;
