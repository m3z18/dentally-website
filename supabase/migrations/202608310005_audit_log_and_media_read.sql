-- Metadata-only audit trail and read-only media listing for content managers.
create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null check (action in ('create','update','publish','hide','soft_delete','restore')),
  entity_type text not null,
  entity_id text not null,
  created_at timestamptz not null default now(),
  constraint audit_entity_type_safe check (entity_type ~ '^[a-z][a-z0-9_]{1,63}$'),
  constraint audit_entity_id_length check (char_length(entity_id) between 1 and 100)
);
create index audit_logs_recent_idx on public.audit_logs(created_at desc);
create index audit_logs_entity_idx on public.audit_logs(entity_type,entity_id,created_at desc);
alter table public.audit_logs enable row level security;
revoke all on table public.audit_logs from anon,authenticated;
grant select on table public.audit_logs to authenticated;
grant select,insert on table public.audit_logs to service_role;
create policy audit_logs_manager_read on public.audit_logs for select to authenticated using ((select private.can_manage_content()));

create function private.audit_content_change() returns trigger language plpgsql security definer set search_path='' as $$
declare next_action text;
declare record_id text;
declare old_record jsonb;
declare new_record jsonb;
declare visibility_key text;
begin
  record_id := coalesce(new.id::text,old.id::text);
  old_record := case when tg_op='INSERT' then '{}'::jsonb else to_jsonb(old) end;
  new_record := to_jsonb(new);
  visibility_key := case when tg_table_name='services' then 'is_public' else 'is_active' end;
  if tg_op='INSERT' then next_action:='create';
  elsif old_record->>'deleted_at' is null and new_record->>'deleted_at' is not null then next_action:='soft_delete';
  elsif old_record->>'deleted_at' is not null and new_record->>'deleted_at' is null then next_action:='restore';
  elsif old_record->>visibility_key is distinct from new_record->>visibility_key and new_record->>visibility_key='true' then next_action:='publish';
  elsif old_record->>visibility_key is distinct from new_record->>visibility_key and new_record->>visibility_key='false' then next_action:='hide';
  else next_action:='update'; end if;
  insert into public.audit_logs(actor_user_id,action,entity_type,entity_id) values(auth.uid(),next_action,tg_table_name,record_id);
  return new;
end; $$;
revoke all on function private.audit_content_change() from public;

create trigger audit_doctors after insert or update on public.doctors for each row execute function private.audit_content_change();
create trigger audit_articles after insert or update on public.articles for each row execute function private.audit_content_change();
create trigger audit_article_categories after insert or update on public.article_categories for each row execute function private.audit_content_change();
create trigger audit_faq_items after insert or update on public.faq_items for each row execute function private.audit_content_change();
create trigger audit_insurance_providers after insert or update on public.insurance_providers for each row execute function private.audit_content_change();
create trigger audit_offers after insert or update on public.offers for each row execute function private.audit_content_change();
create trigger audit_testimonials after insert or update on public.testimonials for each row execute function private.audit_content_change();
create trigger audit_gallery_items after insert or update on public.gallery_items for each row execute function private.audit_content_change();
create trigger audit_services after insert or update on public.services for each row execute function private.audit_content_change();
create trigger audit_specialties after insert or update on public.specialties for each row execute function private.audit_content_change();
create trigger audit_branches after insert or update on public.branches for each row execute function private.audit_content_change();
create trigger audit_site_settings after insert or update on public.site_settings for each row execute function private.audit_content_change();

-- Bucket objects are public to fetch, but listing remains available only to content managers.
create policy content_media_manager_list on storage.objects for select to authenticated
using (bucket_id in ('doctor-images','article-images','service-images','site-content-images') and (select private.can_manage_content()));
