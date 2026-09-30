-- Kukki Kitchen — yorum önerileri ve tarif sürümleri
-- Supabase Dashboard → SQL Editor'e yapıştırıp "Run" ile çalıştırın (0005'ten sonra, bir kez).

-- ─────────────────────────────────────────────────────────────
-- Öneriler: yorum "öneri" olarak işaretlenebilir; durumunu sadece tarif sahibi değiştirir
-- ─────────────────────────────────────────────────────────────
alter table public.comments
  add column is_suggestion boolean not null default false,
  add column suggestion_status text check (suggestion_status in ('open', 'applied', 'dismissed')),
  -- Hangi sürümde uygulandı (öneri sahibine ileride XP vermek için kayıt)
  add column resolved_version int,
  add column resolved_at timestamptz,
  add constraint comments_suggestion_consistency check (
    (is_suggestion and suggestion_status is not null) or (not is_suggestion and suggestion_status is null)
  );

-- Yorum eklenirken durum alanlarını istemci belirleyemez
create function public.comments_before_insert()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  -- Kendi tarifine öneri yazılmaz (düz yorum olur)
  if new.is_suggestion and exists (
    select 1 from public.recipes r where r.id = new.recipe_id and r.author_id = new.user_id
  ) then
    new.is_suggestion := false;
  end if;
  new.suggestion_status := case when new.is_suggestion then 'open' else null end;
  new.resolved_version := null;
  new.resolved_at := null;
  new.body := btrim(new.body);
  return new;
end;
$$;

create trigger comments_before_insert
  before insert on public.comments
  for each row execute function public.comments_before_insert();

-- Yorumlarda doğrudan UPDATE yok (0001'de politika yok); durum değişikliği sadece aşağıdaki RPC ile

create function public.resolve_suggestion(p_comment_id uuid, p_status text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_status not in ('open', 'applied', 'dismissed') then
    raise exception 'Geçersiz durum';
  end if;

  update public.comments c
  set suggestion_status = p_status,
      resolved_at = case when p_status = 'open' then null else now() end,
      resolved_version = case when p_status = 'open' then null else c.resolved_version end
  from public.recipes r
  where c.id = p_comment_id
    and c.is_suggestion
    and r.id = c.recipe_id
    and r.author_id = auth.uid();

  if not found then
    raise exception 'Bu öneriyi sadece tarif sahibi yönetebilir';
  end if;
end;
$$;

revoke all on function public.resolve_suggestion(uuid, text) from public, anon;
grant execute on function public.resolve_suggestion(uuid, text) to authenticated;

-- ─────────────────────────────────────────────────────────────
-- Sürümler: tarif sahibi "yeni sürüm yayınla" deyince tarifin o anki hali saklanır
-- ─────────────────────────────────────────────────────────────
create table public.recipe_versions (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  version int not null check (version >= 1),
  note text not null default '' check (char_length(note) <= 200),
  snapshot jsonb not null,
  created_at timestamptz not null default now(),
  unique (recipe_id, version)
);

alter table public.recipe_versions enable row level security;

create policy "Görebildiği tarifin sürümlerini okur"
  on public.recipe_versions for select to authenticated
  using (public.can_view_recipe(recipe_id));

-- Ekleme/değiştirme sadece publish_recipe_version RPC'si ile; istemci sadece okuyabilir
revoke all on public.recipe_versions from public, anon, authenticated;
grant select on public.recipe_versions to authenticated;

create function public.publish_recipe_version(p_recipe_id uuid, p_note text, p_applied uuid[])
returns int
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_version int;
  v_snapshot jsonb;
begin
  if coalesce(array_length(p_applied, 1), 0) > 200 then
    raise exception 'Bir sürümde en fazla 200 öneri işaretlenebilir';
  end if;

  -- Sahiplik kontrolü + aynı anda iki yayında numara çakışmasın diye satır kilidi
  select to_jsonb(r) - 'author_id' - 'visibility' - 'created_at'
  into v_snapshot
  from (
    select id, title, emoji, description, minutes, difficulty, tags, tip, ingredients, steps,
           author_id, visibility, created_at, updated_at
    from public.recipes
    where id = p_recipe_id and author_id = auth.uid()
    for update
  ) r;

  if v_snapshot is null then
    raise exception 'Sürümü sadece tarif sahibi yayınlayabilir';
  end if;

  select coalesce(max(version), 0) + 1 into v_version
  from public.recipe_versions where recipe_id = p_recipe_id;

  insert into public.recipe_versions (recipe_id, version, note, snapshot)
  values (p_recipe_id, v_version, left(btrim(coalesce(p_note, '')), 200), v_snapshot);

  -- Uygulanan öneriler (sadece bu tarifin önerileri)
  update public.comments
  set suggestion_status = 'applied', resolved_version = v_version, resolved_at = now()
  where recipe_id = p_recipe_id
    and is_suggestion
    and id = any(coalesce(p_applied, '{}'));

  return v_version;
end;
$$;

revoke all on function public.publish_recipe_version(uuid, text, uuid[]) from public, anon;
grant execute on function public.publish_recipe_version(uuid, text, uuid[]) to authenticated;
