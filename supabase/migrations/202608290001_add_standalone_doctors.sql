-- Standalone doctor profiles and their managed public images.
-- This migration intentionally does not alter or reference scheduling resources.

create or replace function private.can_manage_content()
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
      and role in ('admin', 'manager')
  );
$$;

create or replace function private.text_array_items_valid(
  p_values text[],
  p_max_items integer,
  p_max_item_length integer
)
returns boolean
language sql
immutable
strict
set search_path = ''
as $$
  select cardinality(p_values) <= p_max_items
    and coalesce(
      bool_and(
        value = btrim(value)
        and char_length(value) between 1 and p_max_item_length
      ),
      true
    )
  from unnest(p_values) as item(value);
$$;

revoke all on function private.can_manage_content() from public, anon, authenticated;
revoke all on function private.text_array_items_valid(text[], integer, integer) from public, anon, authenticated;
grant usage on schema private to authenticated, service_role;
grant execute on function private.can_manage_content() to authenticated;
grant execute on function private.text_array_items_valid(text[], integer, integer) to authenticated, service_role;

create table public.doctors (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_ar text not null,
  name_en text,
  professional_title_ar text not null default 'د.',
  professional_title_en text,
  specialty_ar text not null,
  specialty_en text,
  short_bio_ar text not null,
  short_bio_en text,
  bio_ar text,
  bio_en text,
  qualifications_ar text[] not null default '{}',
  qualifications_en text[] not null default '{}',
  expertise_ar text[] not null default '{}',
  expertise_en text[] not null default '{}',
  languages_ar text[] not null default '{}',
  languages_en text[] not null default '{}',
  image_path text,
  image_alt_ar text,
  image_alt_en text,
  display_order integer not null default 0,
  is_active boolean not null default false,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint doctors_slug_format check (
    slug = btrim(slug)
    and char_length(slug) between 2 and 80
    and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  constraint doctors_name_ar_length check (
    name_ar = btrim(name_ar)
    and char_length(name_ar) between 2 and 120
  ),
  constraint doctors_name_en_length check (
    name_en is null
    or (name_en = btrim(name_en) and char_length(name_en) between 2 and 120)
  ),
  constraint doctors_professional_title_ar_length check (
    professional_title_ar = btrim(professional_title_ar)
    and char_length(professional_title_ar) between 1 and 40
  ),
  constraint doctors_professional_title_en_length check (
    professional_title_en is null
    or (
      professional_title_en = btrim(professional_title_en)
      and char_length(professional_title_en) between 1 and 40
    )
  ),
  constraint doctors_specialty_ar_length check (
    specialty_ar = btrim(specialty_ar)
    and char_length(specialty_ar) between 2 and 160
  ),
  constraint doctors_specialty_en_length check (
    specialty_en is null
    or (specialty_en = btrim(specialty_en) and char_length(specialty_en) between 2 and 160)
  ),
  constraint doctors_short_bio_ar_length check (
    short_bio_ar = btrim(short_bio_ar)
    and char_length(short_bio_ar) between 10 and 320
  ),
  constraint doctors_short_bio_en_length check (
    short_bio_en is null
    or (
      short_bio_en = btrim(short_bio_en)
      and char_length(short_bio_en) between 10 and 320
    )
  ),
  constraint doctors_bio_ar_length check (
    bio_ar is null
    or (bio_ar = btrim(bio_ar) and char_length(bio_ar) <= 5000)
  ),
  constraint doctors_bio_en_length check (
    bio_en is null
    or (bio_en = btrim(bio_en) and char_length(bio_en) <= 5000)
  ),
  constraint doctors_qualifications_ar_valid check (
    private.text_array_items_valid(qualifications_ar, 20, 240)
  ),
  constraint doctors_qualifications_en_valid check (
    private.text_array_items_valid(qualifications_en, 20, 240)
  ),
  constraint doctors_expertise_ar_valid check (
    private.text_array_items_valid(expertise_ar, 20, 160)
  ),
  constraint doctors_expertise_en_valid check (
    private.text_array_items_valid(expertise_en, 20, 160)
  ),
  constraint doctors_languages_ar_valid check (
    private.text_array_items_valid(languages_ar, 12, 80)
  ),
  constraint doctors_languages_en_valid check (
    private.text_array_items_valid(languages_en, 12, 80)
  ),
  constraint doctors_image_path_format check (
    image_path is null
    or (
      split_part(image_path, '/', 1) = id::text
      and image_path ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/[A-Za-z0-9][A-Za-z0-9._-]{0,199}$'
    )
  ),
  constraint doctors_image_alt_ar_length check (
    image_alt_ar is null
    or (image_alt_ar = btrim(image_alt_ar) and char_length(image_alt_ar) <= 180)
  ),
  constraint doctors_image_alt_en_length check (
    image_alt_en is null
    or (image_alt_en = btrim(image_alt_en) and char_length(image_alt_en) <= 180)
  ),
  constraint doctors_display_order_nonnegative check (display_order >= 0),
  constraint doctors_deleted_not_active check (deleted_at is null or is_active = false)
);

create index doctors_public_order_idx
  on public.doctors (display_order, name_ar)
  where is_active = true and deleted_at is null;

create index doctors_deleted_at_idx
  on public.doctors (deleted_at)
  where deleted_at is not null;

create or replace function private.enforce_doctor_lifecycle()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' then
    if old.deleted_at is null and new.deleted_at is not null then
      new.deleted_at = now();
    elsif old.deleted_at is not null and new.deleted_at is null then
      new.is_active = false;
    end if;
  end if;

  if new.deleted_at is not null then
    new.is_active = false;
  end if;

  return new;
end;
$$;

revoke all on function private.enforce_doctor_lifecycle() from public, anon, authenticated;

create trigger doctors_set_updated_at
before update on public.doctors
for each row execute function private.set_updated_at();

create trigger doctors_enforce_lifecycle
before insert or update of deleted_at, is_active on public.doctors
for each row execute function private.enforce_doctor_lifecycle();

alter table public.doctors enable row level security;

revoke all on table public.doctors from anon, authenticated;
grant select on table public.doctors to anon, authenticated;
grant insert, update on table public.doctors to authenticated;
grant select, insert, update, delete on table public.doctors to service_role;

create policy doctors_public_read
on public.doctors for select
to anon, authenticated
using (is_active = true and deleted_at is null);

create policy doctors_content_manager_read
on public.doctors for select
to authenticated
using ((select private.can_manage_content()));

create policy doctors_content_manager_insert
on public.doctors for insert
to authenticated
with check ((select private.can_manage_content()) and deleted_at is null);

create policy doctors_content_manager_update
on public.doctors for update
to authenticated
using ((select private.can_manage_content()))
with check ((select private.can_manage_content()));

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
) values (
  'doctor-images',
  'doctor-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update set
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy doctor_images_content_manager_insert
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'doctor-images'
  and (select private.can_manage_content())
  and array_length(storage.foldername(name), 1) = 1
  and (storage.foldername(name))[1] ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
);

create policy doctor_images_content_manager_update
on storage.objects for update
to authenticated
using (
  bucket_id = 'doctor-images'
  and (select private.can_manage_content())
)
with check (
  bucket_id = 'doctor-images'
  and (select private.can_manage_content())
  and array_length(storage.foldername(name), 1) = 1
  and (storage.foldername(name))[1] ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
);

create policy doctor_images_content_manager_delete
on storage.objects for delete
to authenticated
using (
  bucket_id = 'doctor-images'
  and (select private.can_manage_content())
);

comment on table public.doctors is
  'Standalone bilingual doctor profiles. Scheduling resources do not reference this table.';

comment on column public.doctors.deleted_at is
  'Soft-delete marker. Restored profiles return hidden and require explicit publishing.';

comment on column public.doctors.image_path is
  'Object path inside the public doctor-images Storage bucket; never a full URL.';
