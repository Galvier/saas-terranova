
-- Enable REPLICA IDENTITY FULL for the departments table
ALTER TABLE public.departments REPLICA IDENTITY FULL;

-- Enable REPLICA IDENTITY FULL for the managers table
ALTER TABLE public.managers REPLICA IDENTITY FULL;

-- Add the tables to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.departments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.managers;
