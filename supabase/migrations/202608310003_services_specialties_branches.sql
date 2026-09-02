-- Backward-compatible public content enhancements for services, specialties, and branches.
-- No appointment, availability, blocked-time, booking RPC, or uniqueness changes.

create table public.specialties (
  id uuid primary key default gen_random_uuid(), slug text not null unique,
  name_ar text not null, name_en text, description_ar text, description_en text,
  display_order integer not null default 0, is_active boolean not null default false,
  deleted_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint specialties_slug_format check (slug=btrim(slug) and char_length(slug) between 2 and 80 and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint specialties_name_lengths check (char_length(name_ar) between 2 and 160 and (name_en is null or char_length(name_en) between 2 and 160)),
  constraint specialties_description_lengths check ((description_ar is null or char_length(description_ar)<=1000) and (description_en is null or char_length(description_en)<=1000)),
  constraint specialties_order_nonnegative check (display_order>=0),
  constraint specialties_deleted_not_active check (deleted_at is null or is_active=false)
);

alter table public.services
  add column name_en text,
  add column description_ar text,
  add column description_en text,
  add column content_ar text,
  add column content_en text,
  add column image_path text,
  add column image_alt_ar text,
  add column image_alt_en text,
  add column specialty_id uuid references public.specialties(id) on delete set null,
  add column display_order integer not null default 0,
  add column seo_title_ar text,
  add column seo_title_en text,
  add column seo_description_ar text,
  add column seo_description_en text,
  add column deleted_at timestamptz;

-- New content-only services must never become bookable implicitly.
alter table public.services alter column is_active set default false;

alter table public.services
  add constraint services_name_en_length check (name_en is null or char_length(name_en) between 2 and 120),
  add constraint services_description_lengths check ((description_ar is null or char_length(description_ar)<=1000) and (description_en is null or char_length(description_en)<=1000)),
  add constraint services_content_lengths check ((content_ar is null or char_length(content_ar)<=100000) and (content_en is null or char_length(content_en)<=100000)),
  add constraint services_content_no_html check ((content_ar is null or content_ar !~* '<[a-z!/][^>]*>') and (content_en is null or content_en !~* '<[a-z!/][^>]*>')),
  add constraint services_image_path check (image_path is null or (split_part(image_path,'/',1)=id::text and image_path ~ '^[0-9a-f-]{36}/[A-Za-z0-9][A-Za-z0-9._-]{0,199}$')),
  add constraint services_image_alt_lengths check ((image_alt_ar is null or char_length(image_alt_ar)<=180) and (image_alt_en is null or char_length(image_alt_en)<=180)),
  add constraint services_order_nonnegative check (display_order>=0),
  add constraint services_seo_lengths check ((seo_title_ar is null or char_length(seo_title_ar)<=70) and (seo_title_en is null or char_length(seo_title_en)<=70) and (seo_description_ar is null or char_length(seo_description_ar)<=180) and (seo_description_en is null or char_length(seo_description_en)<=180));

alter table public.doctors add column specialty_id uuid references public.specialties(id) on delete set null;

create table public.branches (
  id uuid primary key default gen_random_uuid(), slug text not null unique,
  name_ar text not null, name_en text, address_ar text, address_en text,
  phone text, whatsapp text, email text, maps_url text,
  latitude numeric(9,6), longitude numeric(9,6), working_hours_ar text, working_hours_en text,
  display_order integer not null default 0, is_active boolean not null default false,
  deleted_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint branches_slug_format check (slug=btrim(slug) and char_length(slug) between 2 and 80 and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint branches_name_lengths check (char_length(name_ar) between 2 and 160 and (name_en is null or char_length(name_en) between 2 and 160)),
  constraint branches_contact_lengths check ((phone is null or char_length(phone)<=40) and (whatsapp is null or char_length(whatsapp)<=40) and (email is null or char_length(email)<=254)),
  constraint branches_maps_https check (maps_url is null or maps_url ~ '^https://[^[:space:]]+$'),
  constraint branches_coordinates check ((latitude is null or latitude between -90 and 90) and (longitude is null or longitude between -180 and 180)),
  constraint branches_order_nonnegative check (display_order>=0),
  constraint branches_deleted_not_active check (deleted_at is null or is_active=false)
);

create index services_public_content_idx on public.services(display_order,name_ar) where is_public and deleted_at is null;
create index specialties_public_idx on public.specialties(display_order,name_ar) where is_active and deleted_at is null;
create index branches_public_idx on public.branches(display_order,name_ar) where is_active and deleted_at is null;

create trigger specialties_set_updated_at before update on public.specialties for each row execute function private.set_updated_at();
create trigger branches_set_updated_at before update on public.branches for each row execute function private.set_updated_at();
create trigger specialties_lifecycle before insert or update of deleted_at,is_active on public.specialties for each row execute function private.enforce_content_lifecycle();
create trigger branches_lifecycle before insert or update of deleted_at,is_active on public.branches for each row execute function private.enforce_content_lifecycle();

alter table public.specialties enable row level security;
alter table public.branches enable row level security;
revoke all on table public.specialties,public.branches from anon,authenticated;
grant select on table public.specialties,public.branches to anon,authenticated;
grant insert,update on table public.specialties,public.branches to authenticated;
grant select,insert,update,delete on table public.specialties,public.branches to service_role;

drop policy if exists services_public_read on public.services;
drop policy if exists services_admin_read on public.services;
create policy services_public_read on public.services for select to anon,authenticated using (is_public and deleted_at is null);
-- Preserve the original operational read access for active admin, manager, and
-- receptionist profiles. This lets appointments resolve historical or hidden
-- services without granting content-management access to receptionist or doctor.
create policy services_admin_read on public.services for select to authenticated using ((select private.is_active_admin()));
create policy services_manager_insert on public.services for insert to authenticated with check ((select private.can_manage_content()) and deleted_at is null);
create policy services_manager_update on public.services for update to authenticated using ((select private.can_manage_content())) with check ((select private.can_manage_content()));
revoke insert,update,delete on table public.services from authenticated;
grant insert(id,slug,name_ar,name_en,description_ar,description_en,content_ar,content_en,image_path,image_alt_ar,image_alt_en,specialty_id,display_order,seo_title_ar,seo_title_en,seo_description_ar,seo_description_en,is_public,deleted_at) on public.services to authenticated;
grant update(name_ar,name_en,description_ar,description_en,content_ar,content_en,image_path,image_alt_ar,image_alt_en,specialty_id,display_order,seo_title_ar,seo_title_en,seo_description_ar,seo_description_en,is_public,deleted_at) on public.services to authenticated;

create policy specialties_public_read on public.specialties for select to anon,authenticated using (is_active and deleted_at is null);
create policy specialties_manager_read on public.specialties for select to authenticated using ((select private.can_manage_content()));
create policy specialties_manager_insert on public.specialties for insert to authenticated with check ((select private.can_manage_content()) and deleted_at is null);
create policy specialties_manager_update on public.specialties for update to authenticated using ((select private.can_manage_content())) with check ((select private.can_manage_content()));
create policy branches_public_read on public.branches for select to anon,authenticated using (is_active and deleted_at is null);
create policy branches_manager_read on public.branches for select to authenticated using ((select private.can_manage_content()));
create policy branches_manager_insert on public.branches for insert to authenticated with check ((select private.can_manage_content()) and deleted_at is null);
create policy branches_manager_update on public.branches for update to authenticated using ((select private.can_manage_content())) with check ((select private.can_manage_content()));

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('service-images','service-images',true,5242880,array['image/jpeg','image/png','image/webp']::text[])
on conflict(id) do update set name=excluded.name,public=excluded.public,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
create policy service_images_manager_insert on storage.objects for insert to authenticated with check(bucket_id='service-images' and (select private.can_manage_content()) and array_length(storage.foldername(name),1)=1 and (storage.foldername(name))[1] ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$');
create policy service_images_manager_update on storage.objects for update to authenticated using(bucket_id='service-images' and (select private.can_manage_content())) with check(bucket_id='service-images' and (select private.can_manage_content()) and array_length(storage.foldername(name),1)=1 and (storage.foldername(name))[1] ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$');
create policy service_images_manager_delete on storage.objects for delete to authenticated using(bucket_id='service-images' and (select private.can_manage_content()));

comment on column public.doctors.specialty_id is 'Optional content relation only; not used by booking or availability.';
comment on table public.branches is 'Public branch information only; booking is intentionally not branch-aware.';
