
-- Function to get all departments
create or replace function get_all_departments()
returns setof departments as $$
begin
  return query select * from departments order by name;
end;
$$ language plpgsql security definer;
