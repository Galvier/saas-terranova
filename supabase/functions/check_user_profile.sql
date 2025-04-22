
-- Function to check if a user profile exists
create or replace function check_user_profile(user_id uuid)
returns boolean as $$
declare
  profile_exists boolean;
begin
  select exists(
    select 1 from profiles where id = user_id
  ) into profile_exists;
  
  return profile_exists;
end;
$$ language plpgsql security definer;
