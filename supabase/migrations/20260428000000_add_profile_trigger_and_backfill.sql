-- Auto-create a profile row whenever a new auth user is created.
-- Uses SECURITY DEFINER so it bypasses RLS and always succeeds,
-- removing the dependency on the client-side INSERT fallback in fetchProfile.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, total_xp, onboarding_complete)
  values (new.id, 0, false)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill profile rows for any existing auth.users that never got one
-- (covers users who signed up before this trigger was added or before
-- RLS policies were properly applied).
insert into public.profiles (id, total_xp, onboarding_complete)
select id, 0, false
from auth.users
where id not in (select id from public.profiles)
on conflict (id) do nothing;
