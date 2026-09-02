-- Content foundation: articles, categories, FAQ, settings, and article images.
-- File-only migration. It does not alter booking, appointments, availability, or RPCs.

create table public.article_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_ar text not null,
  name_en text,
  description_ar text,
  description_en text,
  display_order integer not null default 0,
  is_active boolean not null default false,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint article_categories_slug_format check (
    slug = btrim(slug)
    and char_length(slug) between 2 and 80
    and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  constraint article_categories_name_ar_length check (
    name_ar = btrim(name_ar) and char_length(name_ar) between 2 and 120
  ),
  constraint article_categories_name_en_length check (
    name_en is null or (name_en = btrim(name_en) and char_length(name_en) between 2 and 120)
  ),
  constraint article_categories_description_ar_length check (
    description_ar is null or char_length(description_ar) <= 500
  ),
  constraint article_categories_description_en_length check (
    description_en is null or char_length(description_en) <= 500
  ),
  constraint article_categories_display_order_nonnegative check (display_order >= 0),
  constraint article_categories_deleted_not_active check (deleted_at is null or is_active = false)
);

create table public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_ar text not null,
  title_en text,
  excerpt_ar text not null,
  excerpt_en text,
  content_ar text not null,
  content_en text,
  image_path text,
  image_alt_ar text,
  image_alt_en text,
  author_name_ar text,
  author_name_en text,
  author_doctor_id uuid references public.doctors(id) on delete set null,
  category_id uuid references public.article_categories(id) on delete set null,
  is_featured boolean not null default false,
  display_order integer not null default 0,
  published_at timestamptz,
  scheduled_publish_at timestamptz,
  scheduled_unpublish_at timestamptz,
  is_active boolean not null default false,
  deleted_at timestamptz,
  seo_title_ar text,
  seo_title_en text,
  seo_description_ar text,
  seo_description_en text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint articles_slug_format check (
    slug = btrim(slug)
    and char_length(slug) between 2 and 100
    and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  constraint articles_title_ar_length check (
    title_ar = btrim(title_ar) and char_length(title_ar) between 4 and 180
  ),
  constraint articles_title_en_length check (
    title_en is null or (title_en = btrim(title_en) and char_length(title_en) between 4 and 180)
  ),
  constraint articles_excerpt_ar_length check (
    excerpt_ar = btrim(excerpt_ar) and char_length(excerpt_ar) between 20 and 500
  ),
  constraint articles_excerpt_en_length check (
    excerpt_en is null or (excerpt_en = btrim(excerpt_en) and char_length(excerpt_en) between 20 and 500)
  ),
  constraint articles_content_ar_length check (char_length(content_ar) between 40 and 100000),
  constraint articles_content_en_length check (content_en is null or char_length(content_en) between 40 and 100000),
  constraint articles_content_no_html check (
    content_ar !~* '<[a-z!/][^>]*>'
    and (content_en is null or content_en !~* '<[a-z!/][^>]*>')
  ),
  constraint articles_image_path_format check (
    image_path is null
    or (
      split_part(image_path, '/', 1) = id::text
      and image_path ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/[A-Za-z0-9][A-Za-z0-9._-]{0,199}$'
    )
  ),
  constraint articles_image_alt_ar_length check (image_alt_ar is null or char_length(image_alt_ar) <= 180),
  constraint articles_image_alt_en_length check (image_alt_en is null or char_length(image_alt_en) <= 180),
  constraint articles_author_name_ar_length check (author_name_ar is null or char_length(author_name_ar) <= 120),
  constraint articles_author_name_en_length check (author_name_en is null or char_length(author_name_en) <= 120),
  constraint articles_display_order_nonnegative check (display_order >= 0),
  constraint articles_schedule_order check (
    scheduled_unpublish_at is null
    or scheduled_publish_at is null
    or scheduled_unpublish_at > scheduled_publish_at
  ),
  constraint articles_seo_title_ar_length check (seo_title_ar is null or char_length(seo_title_ar) <= 70),
  constraint articles_seo_title_en_length check (seo_title_en is null or char_length(seo_title_en) <= 70),
  constraint articles_seo_description_ar_length check (seo_description_ar is null or char_length(seo_description_ar) <= 180),
  constraint articles_seo_description_en_length check (seo_description_en is null or char_length(seo_description_en) <= 180),
  constraint articles_deleted_not_active check (deleted_at is null or is_active = false)
);

create table public.article_references (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles(id) on delete cascade,
  title text not null,
  url text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint article_references_title_length check (
    title = btrim(title) and char_length(title) between 2 and 240
  ),
  constraint article_references_https_url check (
    char_length(url) <= 2000 and url ~ '^https://[^[:space:]]+$'
  ),
  constraint article_references_display_order_nonnegative check (display_order >= 0),
  unique (article_id, url)
);

create table public.faq_items (
  id uuid primary key default gen_random_uuid(),
  question_ar text not null,
  question_en text,
  answer_ar text not null,
  answer_en text,
  category text,
  service_id uuid references public.services(id) on delete set null,
  display_order integer not null default 0,
  is_active boolean not null default false,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint faq_question_ar_length check (char_length(question_ar) between 4 and 300),
  constraint faq_question_en_length check (question_en is null or char_length(question_en) between 4 and 300),
  constraint faq_answer_ar_length check (char_length(answer_ar) between 4 and 3000),
  constraint faq_answer_en_length check (answer_en is null or char_length(answer_en) between 4 and 3000),
  constraint faq_category_length check (category is null or char_length(category) <= 100),
  constraint faq_display_order_nonnegative check (display_order >= 0),
  constraint faq_deleted_not_active check (deleted_at is null or is_active = false)
);

create table public.site_settings (
  id boolean primary key default true check (id),
  organization_name_ar text,
  organization_name_en text,
  about_ar text,
  about_en text,
  vision_ar text,
  vision_en text,
  mission_ar text,
  mission_en text,
  values_ar text[],
  values_en text[],
  phone text,
  whatsapp text,
  email text,
  address_ar text,
  address_en text,
  maps_url text,
  latitude numeric(9,6),
  longitude numeric(9,6),
  working_hours_ar text,
  working_hours_en text,
  social_links jsonb not null default '{}'::jsonb,
  default_seo_title_ar text,
  default_seo_title_en text,
  default_seo_description_ar text,
  default_seo_description_en text,
  medical_disclaimer_ar text,
  medical_disclaimer_en text,
  announcement_ar text,
  announcement_en text,
  announcement_url text,
  announcement_is_active boolean not null default false,
  updated_at timestamptz not null default now(),
  constraint site_settings_email_length check (email is null or char_length(email) <= 254),
  constraint site_settings_phone_length check (phone is null or char_length(phone) <= 40),
  constraint site_settings_whatsapp_length check (whatsapp is null or char_length(whatsapp) <= 40),
  constraint site_settings_maps_https check (maps_url is null or maps_url ~ '^https://[^[:space:]]+$'),
  constraint site_settings_latitude_range check (latitude is null or latitude between -90 and 90),
  constraint site_settings_longitude_range check (longitude is null or longitude between -180 and 180),
  constraint site_settings_social_links_object check (jsonb_typeof(social_links) = 'object'),
  constraint site_settings_announcement_url check (
    announcement_url is null
    or announcement_url ~ '^/[A-Za-z0-9/_-]*$'
    or announcement_url ~ '^https://[^[:space:]]+$'
  )
);

create index articles_public_order_idx on public.articles (is_featured desc, display_order, published_at desc)
  where is_active = true and deleted_at is null;
create index articles_category_idx on public.articles (category_id, published_at desc)
  where is_active = true and deleted_at is null;
create index articles_deleted_at_idx on public.articles (deleted_at) where deleted_at is not null;
create index article_categories_public_order_idx on public.article_categories (display_order, name_ar)
  where is_active = true and deleted_at is null;
create index faq_items_public_order_idx on public.faq_items (display_order)
  where is_active = true and deleted_at is null;

create or replace function private.enforce_content_lifecycle()
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
  if new.deleted_at is not null then new.is_active = false; end if;
  return new;
end;
$$;

revoke all on function private.enforce_content_lifecycle() from public, anon, authenticated;

create trigger article_categories_set_updated_at before update on public.article_categories
for each row execute function private.set_updated_at();
create trigger articles_set_updated_at before update on public.articles
for each row execute function private.set_updated_at();
create trigger faq_items_set_updated_at before update on public.faq_items
for each row execute function private.set_updated_at();
create trigger site_settings_set_updated_at before update on public.site_settings
for each row execute function private.set_updated_at();

create trigger article_categories_enforce_lifecycle before insert or update of deleted_at, is_active
on public.article_categories for each row execute function private.enforce_content_lifecycle();
create trigger articles_enforce_lifecycle before insert or update of deleted_at, is_active
on public.articles for each row execute function private.enforce_content_lifecycle();
create trigger faq_items_enforce_lifecycle before insert or update of deleted_at, is_active
on public.faq_items for each row execute function private.enforce_content_lifecycle();

alter table public.article_categories enable row level security;
alter table public.articles enable row level security;
alter table public.article_references enable row level security;
alter table public.faq_items enable row level security;
alter table public.site_settings enable row level security;

revoke all on table public.article_categories, public.articles, public.article_references,
  public.faq_items, public.site_settings from anon, authenticated;
grant select on table public.article_categories, public.articles, public.article_references,
  public.faq_items, public.site_settings to anon, authenticated;
grant insert, update on table public.article_categories, public.articles, public.article_references,
  public.faq_items, public.site_settings to authenticated;
grant delete on table public.article_references to authenticated;
grant select, insert, update, delete on table public.article_categories, public.articles,
  public.article_references, public.faq_items, public.site_settings to service_role;

create policy article_categories_public_read on public.article_categories for select to anon, authenticated
using (is_active = true and deleted_at is null);
create policy article_categories_manager_read on public.article_categories for select to authenticated
using ((select private.can_manage_content()));
create policy article_categories_manager_insert on public.article_categories for insert to authenticated
with check ((select private.can_manage_content()) and deleted_at is null);
create policy article_categories_manager_update on public.article_categories for update to authenticated
using ((select private.can_manage_content())) with check ((select private.can_manage_content()));

create policy articles_public_read on public.articles for select to anon, authenticated
using (
  is_active = true and deleted_at is null
  and (scheduled_publish_at is null or scheduled_publish_at <= now())
  and (scheduled_unpublish_at is null or scheduled_unpublish_at > now())
);
create policy articles_manager_read on public.articles for select to authenticated
using ((select private.can_manage_content()));
create policy articles_manager_insert on public.articles for insert to authenticated
with check ((select private.can_manage_content()) and deleted_at is null);
create policy articles_manager_update on public.articles for update to authenticated
using ((select private.can_manage_content())) with check ((select private.can_manage_content()));

create policy article_references_public_read on public.article_references for select to anon, authenticated
using (exists (
  select 1 from public.articles a where a.id = article_id and a.is_active = true
    and a.deleted_at is null
    and (a.scheduled_publish_at is null or a.scheduled_publish_at <= now())
    and (a.scheduled_unpublish_at is null or a.scheduled_unpublish_at > now())
));
create policy article_references_manager_all on public.article_references for all to authenticated
using ((select private.can_manage_content())) with check ((select private.can_manage_content()));

create policy faq_items_public_read on public.faq_items for select to anon, authenticated
using (is_active = true and deleted_at is null);
create policy faq_items_manager_read on public.faq_items for select to authenticated
using ((select private.can_manage_content()));
create policy faq_items_manager_insert on public.faq_items for insert to authenticated
with check ((select private.can_manage_content()) and deleted_at is null);
create policy faq_items_manager_update on public.faq_items for update to authenticated
using ((select private.can_manage_content())) with check ((select private.can_manage_content()));

create policy site_settings_public_read on public.site_settings for select to anon, authenticated using (true);
create policy site_settings_manager_insert on public.site_settings for insert to authenticated
with check ((select private.can_manage_content()));
create policy site_settings_manager_update on public.site_settings for update to authenticated
using ((select private.can_manage_content())) with check ((select private.can_manage_content()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('article-images', 'article-images', true, 5242880,
  array['image/jpeg', 'image/png', 'image/webp']::text[])
on conflict (id) do update set
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy article_images_manager_insert on storage.objects for insert to authenticated
with check (
  bucket_id = 'article-images' and (select private.can_manage_content())
  and array_length(storage.foldername(name), 1) = 1
  and (storage.foldername(name))[1] ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
);
create policy article_images_manager_update on storage.objects for update to authenticated
using (bucket_id = 'article-images' and (select private.can_manage_content()))
with check (
  bucket_id = 'article-images' and (select private.can_manage_content())
  and array_length(storage.foldername(name), 1) = 1
  and (storage.foldername(name))[1] ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
);
create policy article_images_manager_delete on storage.objects for delete to authenticated
using (bucket_id = 'article-images' and (select private.can_manage_content()));

comment on column public.articles.content_ar is 'Trusted Markdown subset rendered without raw HTML.';
comment on column public.articles.content_en is 'Trusted Markdown subset rendered without raw HTML.';
comment on table public.site_settings is 'Single-row, non-secret public site content and contact settings.';
