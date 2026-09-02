-- Internal slug redirects. No external URLs are accepted, preventing open redirects.
create table public.content_redirects (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('doctor','article','service')),
  old_slug text not null,
  new_slug text not null,
  created_at timestamptz not null default now(),
  constraint content_redirects_slugs check (
    old_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' and
    new_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' and old_slug <> new_slug
  ),
  unique(entity_type, old_slug)
);

create index content_redirects_target_idx on public.content_redirects(entity_type,new_slug);
alter table public.content_redirects enable row level security;
revoke all on table public.content_redirects from anon,authenticated;
grant select on table public.content_redirects to anon,authenticated;
grant insert,update,delete on table public.content_redirects to authenticated;
grant select,insert,update,delete on table public.content_redirects to service_role;
create policy content_redirects_public_read on public.content_redirects for select to anon,authenticated using (
  (entity_type='doctor' and exists(select 1 from public.doctors where slug=new_slug and is_active and deleted_at is null))
  or (entity_type='article' and exists(select 1 from public.articles where slug=new_slug and is_active and deleted_at is null and published_at<=now() and (scheduled_publish_at is null or scheduled_publish_at<=now()) and (scheduled_unpublish_at is null or scheduled_unpublish_at>now())))
  or (entity_type='service' and exists(select 1 from public.services where slug=new_slug and is_public and deleted_at is null))
);
create policy content_redirects_manager_insert on public.content_redirects for insert to authenticated with check ((select private.can_manage_content()));
create policy content_redirects_manager_update on public.content_redirects for update to authenticated using ((select private.can_manage_content())) with check ((select private.can_manage_content()));
create policy content_redirects_manager_delete on public.content_redirects for delete to authenticated using ((select private.can_manage_content()));

create function private.remember_content_slug() returns trigger language plpgsql set search_path='' as $$
declare kind text := tg_argv[0];
begin
  if new.slug is distinct from old.slug then
    delete from public.content_redirects where entity_type=kind and old_slug=new.slug;
    update public.content_redirects set new_slug=new.slug where entity_type=kind and new_slug=old.slug;
    insert into public.content_redirects(entity_type,old_slug,new_slug) values(kind,old.slug,new.slug)
    on conflict(entity_type,old_slug) do update set new_slug=excluded.new_slug;
  end if;
  return new;
end; $$;
revoke all on function private.remember_content_slug() from public;

create trigger doctors_remember_slug after update of slug on public.doctors for each row execute function private.remember_content_slug('doctor');
create trigger articles_remember_slug after update of slug on public.articles for each row execute function private.remember_content_slug('article');
create trigger services_remember_slug after update of slug on public.services for each row execute function private.remember_content_slug('service');
