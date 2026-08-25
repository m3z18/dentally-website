-- The server-only Supabase client uses service_role for trusted booking RPCs
-- and operational checks. Some projects do not retain the default table grants
-- after custom privilege changes, so restore them explicitly.
grant usage on schema public to service_role;

grant select, insert, update, delete on table
  public.services,
  public.appointments,
  public.availability,
  public.blocked_times,
  public.profiles
to service_role;
