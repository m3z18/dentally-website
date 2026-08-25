create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create type public.appointment_status as enum (
  'pending',
  'confirmed',
  'cancelled',
  'completed',
  'no_show'
);

create type public.admin_role as enum (
  'admin',
  'receptionist',
  'manager',
  'doctor'
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_ar text not null,
  is_active boolean not null default true,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint services_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint services_name_length check (char_length(name_ar) between 2 and 120)
);

create table public.availability (
  id uuid primary key default gen_random_uuid(),
  day_of_week smallint not null unique,
  start_time time not null,
  end_time time not null,
  slot_duration_minutes integer not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint availability_day_range check (day_of_week between 0 and 6),
  constraint availability_time_range check (start_time < end_time),
  constraint availability_duration_range check (slot_duration_minutes between 5 and 240)
);

create table public.blocked_times (
  id uuid primary key default gen_random_uuid(),
  block_date date not null,
  start_time time not null,
  end_time time not null,
  reason text,
  created_at timestamptz not null default now(),
  constraint blocked_times_time_range check (start_time < end_time),
  constraint blocked_times_reason_length check (reason is null or char_length(reason) <= 240)
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role public.admin_role not null default 'admin',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_name_length check (char_length(full_name) between 2 and 120)
);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  booking_reference text not null unique,
  service_id uuid not null references public.services(id) on delete restrict,
  appointment_date date not null,
  appointment_time time not null,
  patient_name text not null,
  patient_phone text not null,
  notes text,
  status public.appointment_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint appointments_reference_format check (booking_reference ~ '^DEN-[A-Z0-9]{5}$'),
  constraint appointments_name_length check (char_length(patient_name) between 2 and 120),
  constraint appointments_saudi_phone check (patient_phone ~ '^05[0-9]{8}$'),
  constraint appointments_notes_length check (notes is null or char_length(notes) <= 500)
);

-- When doctors are introduced, replace this index with a partial unique index
-- on (doctor_id, appointment_date, appointment_time).
create unique index appointments_one_active_booking_per_slot
  on public.appointments (appointment_date, appointment_time)
  where status <> 'cancelled';

create index appointments_date_status_idx
  on public.appointments (appointment_date, status, appointment_time);
create index appointments_patient_phone_idx on public.appointments (patient_phone);
create index blocked_times_date_idx on public.blocked_times (block_date, start_time);

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger services_set_updated_at
before update on public.services
for each row execute function private.set_updated_at();

create trigger availability_set_updated_at
before update on public.availability
for each row execute function private.set_updated_at();

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function private.set_updated_at();

create trigger appointments_set_updated_at
before update on public.appointments
for each row execute function private.set_updated_at();

create or replace function private.is_active_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and is_active = true
      and role in ('admin', 'manager', 'receptionist')
  );
$$;

create or replace function private.assert_slot_available(
  p_date date,
  p_time time,
  p_exclude_appointment_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_schedule public.availability%rowtype;
  v_now timestamp := timezone('Asia/Riyadh', now());
  v_slot_end time;
begin
  if p_date < v_now::date or (p_date = v_now::date and p_time <= v_now::time) then
    raise exception 'PAST_SLOT' using errcode = 'P0001';
  end if;

  select * into v_schedule
  from public.availability
  where day_of_week = extract(dow from p_date)::smallint
    and is_active = true;

  if not found then
    raise exception 'DAY_CLOSED' using errcode = 'P0001';
  end if;

  v_slot_end := p_time + make_interval(mins => v_schedule.slot_duration_minutes);

  if p_time < v_schedule.start_time
    or v_slot_end > v_schedule.end_time
    or mod(
      extract(epoch from (p_time - v_schedule.start_time))::integer,
      v_schedule.slot_duration_minutes * 60
    ) <> 0 then
    raise exception 'OUTSIDE_AVAILABILITY' using errcode = 'P0001';
  end if;

  if exists (
    select 1
    from public.blocked_times b
    where b.block_date = p_date
      and p_time < b.end_time
      and v_slot_end > b.start_time
  ) then
    raise exception 'BLOCKED_SLOT' using errcode = 'P0001';
  end if;

  if exists (
    select 1
    from public.appointments a
    where a.appointment_date = p_date
      and a.appointment_time = p_time
      and a.status <> 'cancelled'
      and (p_exclude_appointment_id is null or a.id <> p_exclude_appointment_id)
  ) then
    raise exception 'SLOT_TAKEN' using errcode = 'P0001';
  end if;
end;
$$;

create or replace function public.get_available_slots(p_date date)
returns table (slot_time time)
language sql
stable
security definer
set search_path = ''
as $$
  with schedule as (
    select a.start_time, a.end_time, a.slot_duration_minutes
    from public.availability a
    where a.day_of_week = extract(dow from p_date)::smallint
      and a.is_active = true
  ), slots as (
    select generated::time as slot_time, s.slot_duration_minutes
    from schedule s
    cross join lateral generate_series(
      p_date + s.start_time,
      p_date + s.end_time - make_interval(mins => s.slot_duration_minutes),
      make_interval(mins => s.slot_duration_minutes)
    ) generated
  )
  select s.slot_time
  from slots s
  where (p_date + s.slot_time) > timezone('Asia/Riyadh', now())
    and not exists (
      select 1
      from public.blocked_times b
      where b.block_date = p_date
        and s.slot_time < b.end_time
        and (s.slot_time + make_interval(mins => s.slot_duration_minutes)) > b.start_time
    )
    and not exists (
      select 1
      from public.appointments a
      where a.appointment_date = p_date
        and a.appointment_time = s.slot_time
        and a.status <> 'cancelled'
    )
  order by s.slot_time;
$$;

create or replace function private.enforce_appointment_slot()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status <> 'cancelled' and (
    tg_op = 'INSERT'
    or old.status = 'cancelled'
    or new.appointment_date <> old.appointment_date
    or new.appointment_time <> old.appointment_time
  ) then
    perform private.assert_slot_available(
      new.appointment_date,
      new.appointment_time,
      case when tg_op = 'UPDATE' then new.id else null end
    );
  end if;
  return new;
end;
$$;

create trigger appointments_enforce_slot
before insert or update of appointment_date, appointment_time, status
on public.appointments
for each row execute function private.enforce_appointment_slot();

create or replace function public.create_appointment(
  p_service_slug text,
  p_date date,
  p_time time,
  p_patient_name text,
  p_patient_phone text,
  p_notes text default null
)
returns table (
  appointment_id uuid,
  booking_reference text,
  status public.appointment_status
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_service_id uuid;
  v_appointment_id uuid;
  v_reference text;
  v_attempt integer;
begin
  if char_length(btrim(p_patient_name)) not between 2 and 120 then
    raise exception 'INVALID_NAME' using errcode = 'P0001';
  end if;

  if p_patient_phone !~ '^05[0-9]{8}$' then
    raise exception 'INVALID_PHONE' using errcode = 'P0001';
  end if;

  if p_notes is not null and char_length(p_notes) > 500 then
    raise exception 'INVALID_NOTES' using errcode = 'P0001';
  end if;

  select id into v_service_id
  from public.services
  where slug = p_service_slug and is_active = true;

  if v_service_id is null then
    raise exception 'INVALID_SERVICE' using errcode = 'P0001';
  end if;

  perform private.assert_slot_available(p_date, p_time, null);

  for v_attempt in 1..10 loop
    v_reference := 'DEN-' || upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 5));
    begin
      insert into public.appointments (
        booking_reference,
        service_id,
        appointment_date,
        appointment_time,
        patient_name,
        patient_phone,
        notes,
        status
      ) values (
        v_reference,
        v_service_id,
        p_date,
        p_time,
        btrim(p_patient_name),
        p_patient_phone,
        nullif(btrim(p_notes), ''),
        'pending'
      )
      returning id into v_appointment_id;

      return query select v_appointment_id, v_reference, 'pending'::public.appointment_status;
      return;
    exception when unique_violation then
      if exists (
        select 1 from public.appointments a
        where a.appointment_date = p_date
          and a.appointment_time = p_time
          and a.status <> 'cancelled'
      ) then
        raise exception 'SLOT_TAKEN' using errcode = 'P0001';
      end if;
    end;
  end loop;

  raise exception 'REFERENCE_GENERATION_FAILED' using errcode = 'P0001';
end;
$$;

create or replace function public.admin_update_appointment(
  p_appointment_id uuid,
  p_status public.appointment_status,
  p_date date,
  p_time time
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_current_date date;
  v_current_time time;
  v_current_status public.appointment_status;
begin
  if not private.is_active_admin() then
    raise exception 'UNAUTHORIZED' using errcode = '42501';
  end if;

  select appointment_date, appointment_time, status
  into v_current_date, v_current_time, v_current_status
  from public.appointments
  where id = p_appointment_id;

  if not found then
    raise exception 'APPOINTMENT_NOT_FOUND' using errcode = 'P0001';
  end if;

  if p_status <> 'cancelled' and (
    p_date <> v_current_date
    or p_time <> v_current_time
    or v_current_status = 'cancelled'
    or p_status in ('pending', 'confirmed')
  ) then
    perform private.assert_slot_available(p_date, p_time, p_appointment_id);
  end if;

  update public.appointments
  set status = p_status,
      appointment_date = p_date,
      appointment_time = p_time
  where id = p_appointment_id;
exception when unique_violation then
  raise exception 'SLOT_TAKEN' using errcode = 'P0001';
end;
$$;

alter table public.services enable row level security;
alter table public.appointments enable row level security;
alter table public.availability enable row level security;
alter table public.blocked_times enable row level security;
alter table public.profiles enable row level security;

revoke all on table public.services from anon, authenticated;
revoke all on table public.appointments from anon, authenticated;
revoke all on table public.availability from anon, authenticated;
revoke all on table public.blocked_times from anon, authenticated;
revoke all on table public.profiles from anon, authenticated;

grant select on table public.services to anon, authenticated;
grant select, update on table public.appointments to authenticated;
grant select, insert, update on table public.availability to authenticated;
grant select, insert, delete on table public.blocked_times to authenticated;
grant select on table public.profiles to authenticated;
grant usage on schema private to authenticated;
revoke all on function private.set_updated_at() from public, anon, authenticated;
revoke all on function private.is_active_admin() from public, anon, authenticated;
revoke all on function private.assert_slot_available(date, time, uuid) from public, anon, authenticated;
revoke all on function private.enforce_appointment_slot() from public, anon, authenticated;
grant execute on function private.is_active_admin() to authenticated;

create policy services_public_read
on public.services for select
to anon, authenticated
using (is_active = true and is_public = true);

create policy services_admin_read
on public.services for select
to authenticated
using ((select private.is_active_admin()));

create policy appointments_admin_read
on public.appointments for select
to authenticated
using ((select private.is_active_admin()));

create policy appointments_admin_update
on public.appointments for update
to authenticated
using ((select private.is_active_admin()))
with check ((select private.is_active_admin()));

create policy availability_admin_read
on public.availability for select
to authenticated
using ((select private.is_active_admin()));

create policy availability_admin_insert
on public.availability for insert
to authenticated
with check ((select private.is_active_admin()));

create policy availability_admin_update
on public.availability for update
to authenticated
using ((select private.is_active_admin()))
with check ((select private.is_active_admin()));

create policy blocked_times_admin_read
on public.blocked_times for select
to authenticated
using ((select private.is_active_admin()));

create policy blocked_times_admin_insert
on public.blocked_times for insert
to authenticated
with check ((select private.is_active_admin()));

create policy blocked_times_admin_delete
on public.blocked_times for delete
to authenticated
using ((select private.is_active_admin()));

create policy profiles_read_own_or_admin
on public.profiles for select
to authenticated
using (id = (select auth.uid()) or (select private.is_active_admin()));

revoke all on function public.get_available_slots(date) from public, anon, authenticated;
revoke all on function public.create_appointment(text, date, time, text, text, text) from public, anon, authenticated;
revoke all on function public.admin_update_appointment(uuid, public.appointment_status, date, time) from public, anon;

grant execute on function public.get_available_slots(date) to service_role;
grant execute on function public.create_appointment(text, date, time, text, text, text) to service_role;
grant execute on function public.admin_update_appointment(uuid, public.appointment_status, date, time) to authenticated;

comment on index public.appointments_one_active_booking_per_slot is
  'Prevents double booking for every non-cancelled appointment. Add doctor_id to the key when doctors are introduced.';

comment on table public.availability is
  'Working hours. Seed values are temporary and must be replaced after official hours are approved.';
