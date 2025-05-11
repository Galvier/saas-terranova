
create or replace function get_all_departments()
returns setof departments
language sql
security definer
as $$
  SELECT * FROM public.departments ORDER BY name ASC;
$$;
