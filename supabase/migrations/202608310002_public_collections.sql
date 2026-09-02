-- Public content collections for insurance, offers, testimonials, and gallery.
-- File-only migration; it does not touch booking or scheduling resources.

create table public.insurance_providers (
  id uuid primary key default gen_random_uuid(),
  name_ar text not null,
  name_en text,
  image_path text,
  image_alt_ar text,
  image_alt_en text,
  website_url text,
  display_order integer not null default 0,
  is_active boolean not null default false,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint insurance_name_ar_length check (name_ar = btrim(name_ar) and char_length(name_ar) between 2 and 160),
  constraint insurance_name_en_length check (name_en is null or (name_en = btrim(name_en) and char_length(name_en) between 2 and 160)),
  constraint insurance_website_https check (website_url is null or (char_length(website_url) <= 2000 and website_url ~ '^https://[^[:space:]]+$')),
  constraint insurance_image_path check (image_path is null or (split_part(image_path, '/', 1) = 'insurance' and split_part(image_path, '/', 2) = id::text and image_path ~ '^insurance/[0-9a-f-]{36}/[A-Za-z0-9][A-Za-z0-9._-]{0,199}$')),
  constraint insurance_alt_lengths check ((image_alt_ar is null or char_length(image_alt_ar) <= 180) and (image_alt_en is null or char_length(image_alt_en) <= 180)),
  constraint insurance_order_nonnegative check (display_order >= 0),
  constraint insurance_deleted_not_active check (deleted_at is null or is_active = false)
);

create table public.offers (
  id uuid primary key default gen_random_uuid(),
  title_ar text not null,
  title_en text,
  description_ar text not null,
  description_en text,
  image_path text,
  image_alt_ar text,
  image_alt_en text,
  cta_label_ar text,
  cta_label_en text,
  cta_url text,
  start_at timestamptz,
  end_at timestamptz,
  display_order integer not null default 0,
  is_active boolean not null default false,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint offers_title_lengths check (char_length(title_ar) between 2 and 180 and (title_en is null or char_length(title_en) between 2 and 180)),
  constraint offers_description_lengths check (char_length(description_ar) between 4 and 2000 and (description_en is null or char_length(description_en) between 4 and 2000)),
  constraint offers_cta_lengths check ((cta_label_ar is null or char_length(cta_label_ar) <= 80) and (cta_label_en is null or char_length(cta_label_en) <= 80)),
  constraint offers_cta_url_safe check (cta_url is null or cta_url ~ '^/[A-Za-z0-9/_?=&.-]*$' or cta_url ~ '^https://[^[:space:]]+$'),
  constraint offers_time_order check (end_at is null or start_at is null or end_at > start_at),
  constraint offers_image_path check (image_path is null or (split_part(image_path, '/', 1) = 'offers' and split_part(image_path, '/', 2) = id::text and image_path ~ '^offers/[0-9a-f-]{36}/[A-Za-z0-9][A-Za-z0-9._-]{0,199}$')),
  constraint offers_alt_lengths check ((image_alt_ar is null or char_length(image_alt_ar) <= 180) and (image_alt_en is null or char_length(image_alt_en) <= 180)),
  constraint offers_order_nonnegative check (display_order >= 0),
  constraint offers_deleted_not_active check (deleted_at is null or is_active = false)
);

create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  display_name text,
  anonymous_label_ar text,
  anonymous_label_en text,
  review_ar text not null,
  review_en text,
  rating smallint,
  source text,
  source_url text,
  display_order integer not null default 0,
  is_active boolean not null default false,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint testimonials_identity_present check (nullif(btrim(display_name), '') is not null or nullif(btrim(anonymous_label_ar), '') is not null),
  constraint testimonials_identity_lengths check ((display_name is null or char_length(display_name) <= 120) and (anonymous_label_ar is null or char_length(anonymous_label_ar) <= 120) and (anonymous_label_en is null or char_length(anonymous_label_en) <= 120)),
  constraint testimonials_review_lengths check (char_length(review_ar) between 10 and 2000 and (review_en is null or char_length(review_en) between 10 and 2000)),
  constraint testimonials_rating_range check (rating is null or rating between 1 and 5),
  constraint testimonials_source_lengths check ((source is null or char_length(source) <= 120) and (source_url is null or (char_length(source_url) <= 2000 and source_url ~ '^https://[^[:space:]]+$'))),
  constraint testimonials_order_nonnegative check (display_order >= 0),
  constraint testimonials_deleted_not_active check (deleted_at is null or is_active = false)
);

create table public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  image_path text not null,
  image_alt_ar text not null,
  image_alt_en text,
  caption_ar text,
  caption_en text,
  category text,
  display_order integer not null default 0,
  is_active boolean not null default false,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint gallery_image_path check (split_part(image_path, '/', 1) = 'gallery' and split_part(image_path, '/', 2) = id::text and image_path ~ '^gallery/[0-9a-f-]{36}/[A-Za-z0-9][A-Za-z0-9._-]{0,199}$'),
  constraint gallery_alt_lengths check (char_length(image_alt_ar) between 2 and 180 and (image_alt_en is null or char_length(image_alt_en) <= 180)),
  constraint gallery_caption_lengths check ((caption_ar is null or char_length(caption_ar) <= 500) and (caption_en is null or char_length(caption_en) <= 500)),
  constraint gallery_category_length check (category is null or char_length(category) <= 100),
  constraint gallery_order_nonnegative check (display_order >= 0),
  constraint gallery_deleted_not_active check (deleted_at is null or is_active = false)
);

create index insurance_public_order_idx on public.insurance_providers (display_order, name_ar) where is_active and deleted_at is null;
create index offers_public_order_idx on public.offers (display_order, start_at) where is_active and deleted_at is null;
create index testimonials_public_order_idx on public.testimonials (display_order) where is_active and deleted_at is null;
create index gallery_public_order_idx on public.gallery_items (display_order, created_at desc) where is_active and deleted_at is null;

create trigger insurance_set_updated_at before update on public.insurance_providers for each row execute function private.set_updated_at();
create trigger offers_set_updated_at before update on public.offers for each row execute function private.set_updated_at();
create trigger testimonials_set_updated_at before update on public.testimonials for each row execute function private.set_updated_at();
create trigger gallery_set_updated_at before update on public.gallery_items for each row execute function private.set_updated_at();
create trigger insurance_lifecycle before insert or update of deleted_at, is_active on public.insurance_providers for each row execute function private.enforce_content_lifecycle();
create trigger offers_lifecycle before insert or update of deleted_at, is_active on public.offers for each row execute function private.enforce_content_lifecycle();
create trigger testimonials_lifecycle before insert or update of deleted_at, is_active on public.testimonials for each row execute function private.enforce_content_lifecycle();
create trigger gallery_lifecycle before insert or update of deleted_at, is_active on public.gallery_items for each row execute function private.enforce_content_lifecycle();

alter table public.insurance_providers enable row level security;
alter table public.offers enable row level security;
alter table public.testimonials enable row level security;
alter table public.gallery_items enable row level security;

revoke all on table public.insurance_providers, public.offers, public.testimonials, public.gallery_items from anon, authenticated;
grant select on table public.insurance_providers, public.offers, public.testimonials, public.gallery_items to anon, authenticated;
grant insert, update on table public.insurance_providers, public.offers, public.testimonials, public.gallery_items to authenticated;
grant select, insert, update, delete on table public.insurance_providers, public.offers, public.testimonials, public.gallery_items to service_role;

create policy insurance_public_read on public.insurance_providers for select to anon, authenticated using (is_active and deleted_at is null);
create policy insurance_manager_read on public.insurance_providers for select to authenticated using ((select private.can_manage_content()));
create policy insurance_manager_insert on public.insurance_providers for insert to authenticated with check ((select private.can_manage_content()) and deleted_at is null);
create policy insurance_manager_update on public.insurance_providers for update to authenticated using ((select private.can_manage_content())) with check ((select private.can_manage_content()));
create policy offers_public_read on public.offers for select to anon, authenticated using (is_active and deleted_at is null and (start_at is null or start_at <= now()) and (end_at is null or end_at > now()));
create policy offers_manager_read on public.offers for select to authenticated using ((select private.can_manage_content()));
create policy offers_manager_insert on public.offers for insert to authenticated with check ((select private.can_manage_content()) and deleted_at is null);
create policy offers_manager_update on public.offers for update to authenticated using ((select private.can_manage_content())) with check ((select private.can_manage_content()));
create policy testimonials_public_read on public.testimonials for select to anon, authenticated using (is_active and deleted_at is null);
create policy testimonials_manager_read on public.testimonials for select to authenticated using ((select private.can_manage_content()));
create policy testimonials_manager_insert on public.testimonials for insert to authenticated with check ((select private.can_manage_content()) and deleted_at is null);
create policy testimonials_manager_update on public.testimonials for update to authenticated using ((select private.can_manage_content())) with check ((select private.can_manage_content()));
create policy gallery_public_read on public.gallery_items for select to anon, authenticated using (is_active and deleted_at is null);
create policy gallery_manager_read on public.gallery_items for select to authenticated using ((select private.can_manage_content()));
create policy gallery_manager_insert on public.gallery_items for insert to authenticated with check ((select private.can_manage_content()) and deleted_at is null);
create policy gallery_manager_update on public.gallery_items for update to authenticated using ((select private.can_manage_content())) with check ((select private.can_manage_content()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-content-images', 'site-content-images', true, 5242880, array['image/jpeg','image/png','image/webp']::text[])
on conflict (id) do update set name=excluded.name, public=excluded.public, file_size_limit=excluded.file_size_limit, allowed_mime_types=excluded.allowed_mime_types;

create policy site_content_images_manager_insert on storage.objects for insert to authenticated with check (
  bucket_id = 'site-content-images' and (select private.can_manage_content())
  and array_length(storage.foldername(name), 1) = 2
  and (storage.foldername(name))[1] in ('insurance','offers','gallery')
  and (storage.foldername(name))[2] ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
);
create policy site_content_images_manager_update on storage.objects for update to authenticated
using (bucket_id='site-content-images' and (select private.can_manage_content()))
with check (bucket_id='site-content-images' and (select private.can_manage_content()) and array_length(storage.foldername(name),1)=2 and (storage.foldername(name))[1] in ('insurance','offers','gallery') and (storage.foldername(name))[2] ~ '^[0-9a-f-]{36}$');
create policy site_content_images_manager_delete on storage.objects for delete to authenticated using (bucket_id='site-content-images' and (select private.can_manage_content()));

comment on table public.testimonials is 'Only verified, administrator-approved testimonials may be published.';
comment on table public.gallery_items is 'Facility images only; patient before/after content is not enabled.';
