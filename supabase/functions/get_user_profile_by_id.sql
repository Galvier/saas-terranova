
-- Function to get a user profile by user ID
create or replace function get_user_profile_by_id(user_id_param uuid)
returns setof profiles as $$
begin
  return query
  select *
  from profiles
  where user_id = user_id_param;
end;
$$ language plpgsql security definer;
