
-- Function to get all departments
create or replace function get_all_departments()
returns json as $$
declare
  result json;
begin
  select json_agg(
    json_build_object(
      'id', id,
      'name', name
    )
  ) into result
  from departments;
  
  return result;
end;
$$ language plpgsql security definer;
