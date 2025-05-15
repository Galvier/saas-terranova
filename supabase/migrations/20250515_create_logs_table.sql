
-- Create logs table for the application
CREATE TABLE IF NOT EXISTS public.logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level TEXT NOT NULL,
  message TEXT NOT NULL,
  details JSONB,
  user_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add appropriate indexes
CREATE INDEX IF NOT EXISTS idx_logs_level ON public.logs (level);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON public.logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_logs_user_id ON public.logs (user_id);

-- Add comment
COMMENT ON TABLE public.logs IS 'System logs including authentication and synchronization events';
