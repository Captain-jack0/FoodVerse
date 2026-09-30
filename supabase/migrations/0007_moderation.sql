-- Kukki Kitchen — moderasyon: şikayet, otomatik gizleme, küfür filtresi, kademeli ceza, yönetici
-- Supabase Dashboard → SQL Editor'e yapıştırıp "Run" ile çalıştırın (0006'dan sonra, bir kez).
--
-- Kendini yönetici yapmak için (bir kez, SQL Editor'de, e-postanı yazarak):
--   update public.profiles set is_admin = true
--   where id = (select id from auth.users where email = 'SENIN@EPOSTAN.com');

-- ─────────────────────────────────────────────────────────────
-- Yönetici
-- ─────────────────────────────────────────────────────────────
-- 0001'deki sütun izinleri gereği istemci bu alanı DEĞİŞTİREMEZ (sadece SQL Editor)
alter table public.profiles add column is_admin boolean not null default false;

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select p.is_admin from public.profiles p where p.id = auth.uid()), false);
$$;

-- ─────────────────────────────────────────────────────────────
-- Cezalar: 1 saat → 1 gün → 1 hafta → 1 ay → 1 yıl → kalıcı (sadece toplulukta susturma)
-- ─────────────────────────────────────────────────────────────
create table public.user_penalties (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  level smallint not null check (level between 1 and 6),
  reason text not null default '' check (char_length(reason) <= 300),
  starts_at timestamptz not null default now(),
  -- null = kalıcı
  ends_at timestamptz,
  lifted_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index user_penalties_user_idx on public.user_penalties (user_id, created_at desc);

alter table public.user_penalties enable row level security;

create policy "Kendi cezasını ya da yönetici hepsini görür"
  on public.user_penalties for select to authenticated
  using ((select auth.uid()) = user_id or public.is_admin());

revoke all on public.user_penalties from public, anon, authenticated;
grant select on public.user_penalties to authenticated;

-- Sadece oturumdaki kullanıcı için (başkasının ceza durumunu sorgulamak mümkün değil)
create function public.is_muted()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.user_penalties p
    where p.user_id = auth.uid()
      and p.lifted_at is null
      and (p.ends_at is null or p.ends_at > now())
  );
$$;

-- ─────────────────────────────────────────────────────────────
-- Gizlenen içerik
-- ─────────────────────────────────────────────────────────────
alter table public.recipes add column hidden_at timestamptz;
alter table public.comments add column hidden_at timestamptz;

-- Tarif sahibi gizlenmiş tarifini kendisi açamasın: güncellenebilir sütunları sınırla
revoke update on public.recipes from authenticated;
grant update (title, emoji, description, minutes, difficulty, tags, source_type, source_url, tip, ingredients, steps, visibility)
  on public.recipes to authenticated;

-- Yönetici kişisel (private) tarifleri GÖREMEZ; sadece paylaşılıp şikayetle gizlenenleri görür
create or replace function public.can_view_recipe(target uuid)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (
    select 1 from public.recipes r
    where r.id = target
      and ((r.visibility = 'public' and (r.hidden_at is null or public.is_admin())) or r.author_id = (select auth.uid()))
  );
$$;

drop policy "Herkese açık ve kendi tariflerini okur" on public.recipes;
create policy "Herkese açık ve kendi tariflerini okur"
  on public.recipes for select to authenticated
  using ((visibility = 'public' and (hidden_at is null or public.is_admin())) or (select auth.uid()) = author_id);

-- Cezalı kullanıcı tarif paylaşamaz (gizli tarif ekleyip düzenlemeye devam edebilir)
drop policy "Kendi tarifini ekler" on public.recipes;
create policy "Kendi tarifini ekler"
  on public.recipes for insert to authenticated
  with check ((select auth.uid()) = author_id and hidden_at is null and (visibility = 'private' or not public.is_muted()));

drop policy "Kendi tarifini günceller" on public.recipes;
create policy "Kendi tarifini günceller"
  on public.recipes for update to authenticated
  using ((select auth.uid()) = author_id)
  with check ((select auth.uid()) = author_id and (visibility = 'private' or not public.is_muted()));

drop policy "Görebildiği tarifin yorumlarını okur" on public.comments;
create policy "Görebildiği tarifin yorumlarını okur"
  on public.comments for select to authenticated
  using (
    public.can_view_recipe(recipe_id)
    and (hidden_at is null or (select auth.uid()) = user_id or public.is_admin())
  );

drop policy "Görebildiği tarife yorum yazar" on public.comments;
create policy "Görebildiği tarife yorum yazar"
  on public.comments for insert to authenticated
  with check ((select auth.uid()) = user_id and public.can_view_recipe(recipe_id) and not public.is_muted());

drop policy "Başkasının tarifine oy verir" on public.ratings;
create policy "Başkasının tarifine oy verir"
  on public.ratings for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and public.can_view_recipe(recipe_id)
    and not public.is_muted()
    and not exists (select 1 from public.recipes r where r.id = recipe_id and r.author_id = (select auth.uid()))
  );

drop policy "Kendi oyunu değiştirir" on public.ratings;
create policy "Kendi oyunu değiştirir"
  on public.ratings for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id and not public.is_muted());

-- Yorum eklerken gizleme alanı istemciden gelemez (0006'daki tetikleyicinin genişletilmiş hali)
create or replace function public.comments_before_insert()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.is_suggestion and exists (
    select 1 from public.recipes r where r.id = new.recipe_id and r.author_id = new.user_id
  ) then
    new.is_suggestion := false;
  end if;
  new.suggestion_status := case when new.is_suggestion then 'open' else null end;
  new.resolved_version := null;
  new.resolved_at := null;
  new.hidden_at := null;
  new.body := btrim(new.body);
  return new;
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- Küfür filtresi (uygulamadaki src/features/moderation/profanity.ts ile aynı liste)
-- ponytail: basit kelime listesi; kaçaklar şikayet sistemiyle yakalanır, liste büyütülebilir
-- ─────────────────────────────────────────────────────────────
create function public.contains_profanity(p_text text)
returns boolean
language plpgsql
immutable
set search_path = ''
as $$
declare
  exact_words text[] := array['amk', 'aq', 'mk', 'oç', 'sik', 'göt', 'götü', 'götün'];
  roots text[] := array[
    'orospu', 'siktir', 'sikiş', 'sikik', 'sikim', 'yarrak', 'amcık', 'amına', 'amina', 'pezevenk',
    'yavşak', 'şerefsiz', 'kahpe', 'puşt', 'dalyarak', 'taşak', 'sürtük', 'gavat', 'ibne', 'piç'
  ];
  tok text;
begin
  if p_text is null or p_text = '' then
    return false;
  end if;
  -- Rakamla gizlenmiş harfleri aç (0→o, 1→i, 3→e, 4→a, @→a, $→s)
  foreach tok in array regexp_split_to_array(translate(lower(p_text), '0134@$', 'oieaas'), '[^a-zçğıöşü]+') loop
    if tok = any(exact_words) then
      return true;
    end if;
    if exists (select 1 from unnest(roots) r where left(tok, char_length(r)) = r) then
      return true;
    end if;
  end loop;
  return false;
end;
$$;

create function public.block_profanity()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_table_name = 'comments' then
    if public.contains_profanity(new.body) then
      raise exception 'KUFUR_ENGELI' using errcode = 'P0001';
    end if;
  elsif new.visibility = 'public' and public.contains_profanity(
    concat_ws(' ', new.title, new.description, new.tip, new.ingredients::text, new.steps::text)
  ) then
    raise exception 'KUFUR_ENGELI' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger comments_block_profanity
  before insert on public.comments
  for each row execute function public.block_profanity();

create trigger recipes_block_profanity
  before insert or update on public.recipes
  for each row execute function public.block_profanity();

-- Engellenen küfür denemeleri (yönetici tekrarlayanlara ceza verir)
create table public.moderation_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('kufur_denemesi')),
  context text not null default '' check (char_length(context) <= 40),
  created_at timestamptz not null default now()
);

create index moderation_events_user_idx on public.moderation_events (user_id, created_at desc);

alter table public.moderation_events enable row level security;

create policy "Sadece yönetici okur"
  on public.moderation_events for select to authenticated
  using (public.is_admin());

revoke all on public.moderation_events from public, anon, authenticated;
grant select on public.moderation_events to authenticated;

create function public.log_profanity_attempt(p_context text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    return;
  end if;
  -- Aynı kişiden 30 saniyede bir kayıt yeter (tablo şişirilemesin)
  if exists (
    select 1 from public.moderation_events e
    where e.user_id = auth.uid() and e.created_at > now() - interval '30 seconds'
  ) then
    return;
  end if;
  insert into public.moderation_events (user_id, kind, context)
  values (auth.uid(), 'kufur_denemesi', left(coalesce(p_context, ''), 40));
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- Şikayetler: 3 farklı kişi şikayet edince içerik otomatik gizlenir
-- ─────────────────────────────────────────────────────────────
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  target_type text not null check (target_type in ('recipe', 'comment')),
  target_id uuid not null,
  target_user_id uuid references public.profiles (id) on delete cascade,
  reason text not null check (reason in ('kufur', 'spam', 'uygunsuz', 'yanlis', 'diger')),
  note text not null default '' check (char_length(note) <= 300),
  status text not null default 'open' check (status in ('open', 'actioned', 'rejected')),
  created_at timestamptz not null default now(),
  -- Aynı içeriği aynı kişi bir kez şikayet eder
  unique (reporter_id, target_type, target_id)
);

create index reports_target_idx on public.reports (target_type, target_id, status);
create index reports_open_idx on public.reports (created_at) where status = 'open';

alter table public.reports enable row level security;

create policy "Kendi şikayetini ekler"
  on public.reports for insert to authenticated
  with check ((select auth.uid()) = reporter_id);

create policy "Kendi şikayetini ya da yönetici hepsini görür"
  on public.reports for select to authenticated
  using ((select auth.uid()) = reporter_id or public.is_admin());

revoke all on public.reports from public, anon, authenticated;
grant select, insert on public.reports to authenticated;

-- Hedefin sahibini doldurur, görünürlüğü ve kendini şikayeti engeller, durumu 'open' yapar
create function public.reports_before_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_recipe uuid;
begin
  if new.target_type = 'recipe' then
    select r.author_id, r.id into new.target_user_id, v_recipe from public.recipes r where r.id = new.target_id;
  else
    select c.user_id, c.recipe_id into new.target_user_id, v_recipe from public.comments c where c.id = new.target_id;
  end if;

  if new.target_user_id is null
    or not exists (
      select 1 from public.recipes r
      where r.id = v_recipe and ((r.visibility = 'public' and r.hidden_at is null) or r.author_id = new.reporter_id)
    ) then
    raise exception 'Şikayet edilecek içerik bulunamadı';
  end if;
  if new.target_user_id = new.reporter_id then
    raise exception 'Kendi içeriğini şikayet edemezsin';
  end if;

  new.status := 'open';
  new.note := btrim(new.note);
  return new;
end;
$$;

create trigger reports_before_insert
  before insert on public.reports
  for each row execute function public.reports_before_insert();

create function public.reports_auto_hide()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (
    select count(distinct r.reporter_id) from public.reports r
    where r.target_type = new.target_type and r.target_id = new.target_id and r.status = 'open'
  ) >= 3 then
    if new.target_type = 'recipe' then
      update public.recipes set hidden_at = coalesce(hidden_at, now()) where id = new.target_id;
    else
      update public.comments set hidden_at = coalesce(hidden_at, now()) where id = new.target_id;
    end if;
  end if;
  return null;
end;
$$;

create trigger reports_auto_hide
  after insert on public.reports
  for each row execute function public.reports_auto_hide();

-- ─────────────────────────────────────────────────────────────
-- Yönetici paneli
-- ─────────────────────────────────────────────────────────────
create function public.admin_open_reports()
returns table (
  target_type text,
  target_id uuid,
  target_user_id uuid,
  target_user_name text,
  preview text,
  report_count bigint,
  reasons text[],
  notes text[],
  is_hidden boolean,
  penalty_count bigint,
  profanity_attempts bigint,
  first_reported_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
#variable_conflict use_column
begin
  if not public.is_admin() then
    raise exception 'Sadece yönetici';
  end if;

  return query
  select
    rp.target_type,
    rp.target_id,
    max(rp.target_user_id::text)::uuid,
    max(p.display_name),
    max(coalesce(rc.title, cm.body)),
    count(distinct rp.reporter_id),
    array_agg(distinct rp.reason),
    array_remove(array_agg(distinct nullif(rp.note, '')), null),
    bool_or(coalesce(rc.hidden_at, cm.hidden_at) is not null),
    (select count(*) from public.user_penalties up where up.user_id = max(rp.target_user_id::text)::uuid),
    (select count(*) from public.moderation_events me
      where me.user_id = max(rp.target_user_id::text)::uuid and me.created_at > now() - interval '30 days'),
    min(rp.created_at)
  from public.reports rp
  left join public.recipes rc on rp.target_type = 'recipe' and rc.id = rp.target_id
  left join public.comments cm on rp.target_type = 'comment' and cm.id = rp.target_id
  left join public.profiles p on p.id = rp.target_user_id
  where rp.status = 'open'
  group by rp.target_type, rp.target_id
  order by count(distinct rp.reporter_id) desc, min(rp.created_at)
  limit 200;
end;
$$;

-- Son 30 günde küfür filtresine takılanlar
create function public.admin_profanity_users()
returns table (user_id uuid, user_name text, attempts bigint, last_at timestamptz, penalty_count bigint, is_muted boolean)
language plpgsql
stable
security definer
set search_path = ''
as $$
#variable_conflict use_column
begin
  if not public.is_admin() then
    raise exception 'Sadece yönetici';
  end if;

  return query
  select
    me.user_id,
    max(p.display_name),
    count(*),
    max(me.created_at),
    (select count(*) from public.user_penalties up where up.user_id = me.user_id),
    exists (
      select 1 from public.user_penalties up
      where up.user_id = me.user_id and up.lifted_at is null and (up.ends_at is null or up.ends_at > now())
    )
  from public.moderation_events me
  join public.profiles p on p.id = me.user_id
  where me.created_at > now() - interval '30 days'
  group by me.user_id
  order by count(*) desc
  limit 100;
end;
$$;

-- Bir sonraki ceza basamağını uygular; seviye ve bitiş tarihini döner
create function public.admin_penalize_user(p_user_id uuid, p_reason text)
returns table (level smallint, ends_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  v_level smallint;
  v_ends timestamptz;
begin
  if not public.is_admin() then
    raise exception 'Sadece yönetici';
  end if;
  if p_user_id = auth.uid() then
    raise exception 'Kendine ceza veremezsin';
  end if;

  select least(count(*) + 1, 6)::smallint into v_level from public.user_penalties up where up.user_id = p_user_id;
  v_ends := case v_level
    when 1 then now() + interval '1 hour'
    when 2 then now() + interval '1 day'
    when 3 then now() + interval '7 days'
    when 4 then now() + interval '1 month'
    when 5 then now() + interval '1 year'
    else null
  end;

  insert into public.user_penalties (user_id, level, reason, ends_at, created_by)
  values (p_user_id, v_level, left(coalesce(p_reason, ''), 300), v_ends, auth.uid());

  return query select v_level, v_ends;
end;
$$;

-- p_action: 'penalize' (gizle + ceza), 'hide' (sadece gizle), 'reject' (haksız şikayet: içeriği geri aç)
create function public.admin_resolve_reports(p_target_type text, p_target_id uuid, p_action text, p_reason text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid;
begin
  if not public.is_admin() then
    raise exception 'Sadece yönetici';
  end if;
  if p_target_type not in ('recipe', 'comment') or p_action not in ('penalize', 'hide', 'reject') then
    raise exception 'Geçersiz işlem';
  end if;

  select r.target_user_id into v_user from public.reports r
  where r.target_type = p_target_type and r.target_id = p_target_id limit 1;
  if v_user is null then
    raise exception 'Şikayet bulunamadı';
  end if;

  if p_action = 'reject' then
    if p_target_type = 'recipe' then
      update public.recipes set hidden_at = null where id = p_target_id;
    else
      update public.comments set hidden_at = null where id = p_target_id;
    end if;
  else
    if p_target_type = 'recipe' then
      update public.recipes set hidden_at = coalesce(hidden_at, now()) where id = p_target_id;
    else
      update public.comments set hidden_at = coalesce(hidden_at, now()) where id = p_target_id;
    end if;
    if p_action = 'penalize' then
      perform public.admin_penalize_user(v_user, p_reason);
    end if;
  end if;

  update public.reports
  set status = case when p_action = 'reject' then 'rejected' else 'actioned' end
  where target_type = p_target_type and target_id = p_target_id and status = 'open';
end;
$$;

create function public.admin_lift_penalty(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Sadece yönetici';
  end if;
  update public.user_penalties
  set lifted_at = now()
  where user_id = p_user_id and lifted_at is null and (ends_at is null or ends_at > now());
end;
$$;

revoke all on function public.is_admin() from public, anon;
revoke all on function public.is_muted() from public, anon;
revoke all on function public.log_profanity_attempt(text) from public, anon;
revoke all on function public.admin_open_reports() from public, anon;
revoke all on function public.admin_profanity_users() from public, anon;
revoke all on function public.admin_penalize_user(uuid, text) from public, anon;
revoke all on function public.admin_resolve_reports(text, uuid, text, text) from public, anon;
revoke all on function public.admin_lift_penalty(uuid) from public, anon;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_muted() to authenticated;
grant execute on function public.log_profanity_attempt(text) to authenticated;
grant execute on function public.admin_open_reports() to authenticated;
grant execute on function public.admin_profanity_users() to authenticated;
grant execute on function public.admin_penalize_user(uuid, text) to authenticated;
grant execute on function public.admin_resolve_reports(text, uuid, text, text) to authenticated;
grant execute on function public.admin_lift_penalty(uuid) to authenticated;

-- ─────────────────────────────────────────────────────────────
-- Keşfet: gizlenen tarifler akışta ve istatistikte görünmez
-- ─────────────────────────────────────────────────────────────
create or replace function public.discover_feed(
  p_sort text default 'trend',
  p_query text default '',
  p_limit int default 20,
  p_offset int default 0
)
returns table (
  id uuid,
  title text,
  emoji text,
  description text,
  minutes int,
  difficulty smallint,
  tags text[],
  created_at timestamptz,
  author_id uuid,
  author_name text,
  author_avatar text,
  author_level int,
  avg_rating numeric,
  rating_count bigint,
  save_count bigint,
  cook_count bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
#variable_conflict use_column
begin
  if auth.uid() is null then
    raise exception 'Giriş gerekli';
  end if;
  if p_sort not in ('trend', 'top', 'new') then
    raise exception 'Geçersiz sıralama';
  end if;
  -- Aşırı uzun arama metni tam tablo taramasını pahalılaştırmasın
  p_query := left(coalesce(p_query, ''), 100);

  -- ponytail: her tarif için alt sorgular; binlerce public tarifte istatistik tablosu/materialized view'a geçilecek
  return query
  with stats as (
    select
      r.id,
      coalesce((select avg(rt.stars) from public.ratings rt where rt.recipe_id = r.id), 0)::numeric(3, 2) as avg_rating,
      (select count(*) from public.ratings rt where rt.recipe_id = r.id) as rating_count,
      (select count(distinct cr.collection_id) from public.collection_recipes cr where cr.recipe_id = r.id) as save_count,
      (select count(*) from public.cook_logs cl where cl.recipe_id = r.id) as cook_count
    from public.recipes r
    where r.visibility = 'public'
      and r.hidden_at is null
      -- Harf joker karakterleri (%, _) etkisiz: düz metin araması
      and (coalesce(p_query, '') = '' or position(lower(p_query) in lower(r.title)) > 0)
  )
  select
    r.id, r.title, r.emoji, r.description, r.minutes, r.difficulty, r.tags, r.created_at,
    p.id, p.display_name, p.avatar_url, p.level,
    s.avg_rating, s.rating_count, s.save_count, s.cook_count
  from stats s
  join public.recipes r on r.id = s.id
  join public.profiles p on p.id = r.author_id
  order by
    case when p_sort = 'trend' then
      -- Etkileşim puanı zamanla söner (Hacker News benzeri)
      (s.avg_rating * s.rating_count + s.save_count * 2 + s.cook_count + 1)
        / power(extract(epoch from (now() - r.created_at)) / 3600 + 2, 1.3)
    end desc nulls last,
    case when p_sort = 'top' then
      -- Az oylu tarif 5 yıldızla zirveye çıkmasın: 3 yıldızlık 2 hayali oyla ağırlıklı ortalama
      (s.avg_rating * s.rating_count + 6) / (s.rating_count + 2)
    end desc nulls last,
    r.created_at desc
  limit least(greatest(p_limit, 1), 50)
  offset least(greatest(p_offset, 0), 10000);
end;
$$;

create or replace function public.recipe_public_stats(p_recipe_id uuid)
returns table (avg_rating numeric, rating_count bigint, save_count bigint, cook_count bigint, my_rating smallint)
language plpgsql
stable
security definer
set search_path = ''
as $$
#variable_conflict use_column
begin
  if auth.uid() is null then
    raise exception 'Giriş gerekli';
  end if;
  if not exists (
    select 1 from public.recipes r
    where r.id = p_recipe_id
      and ((r.visibility = 'public' and r.hidden_at is null) or r.author_id = auth.uid())
  ) then
    return;
  end if;

  return query select
    coalesce((select avg(rt.stars) from public.ratings rt where rt.recipe_id = p_recipe_id), 0)::numeric(3, 2),
    (select count(*) from public.ratings rt where rt.recipe_id = p_recipe_id),
    (select count(distinct cr.collection_id) from public.collection_recipes cr where cr.recipe_id = p_recipe_id),
    (select count(*) from public.cook_logs cl where cl.recipe_id = p_recipe_id),
    (select rt.stars from public.ratings rt where rt.recipe_id = p_recipe_id and rt.user_id = auth.uid());
end;
$$;
