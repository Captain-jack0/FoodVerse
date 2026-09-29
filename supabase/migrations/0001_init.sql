-- Kukki Kitchen — ilk şema
-- Supabase Dashboard → SQL Editor'e yapıştırıp "Run" ile çalıştırın.
-- Her tabloda RLS açıktır: kullanıcı yalnızca kendi verisini yazabilir,
-- herkese açık (public) tarifleri ise tüm giriş yapmış kullanıcılar okuyabilir.

-- ─────────────────────────────────────────────────────────────
-- Profiller (seviye, XP, seri, tercih)
-- ─────────────────────────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'Şef' check (char_length(display_name) between 1 and 40),
  avatar_url text,
  level int not null default 1 check (level >= 1),
  xp int not null default 0 check (xp >= 0),
  streak_days int not null default 0 check (streak_days >= 0),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiller giriş yapanlarca okunabilir"
  on public.profiles for select to authenticated using (true);

create policy "Kullanıcı kendi profilini günceller"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- XP / seviye / seri istemciden değiştirilemesin (oyunlaştırma hilesini önler);
-- bunlar ileride sunucu fonksiyonlarıyla güncellenecek.
revoke update on public.profiles from authenticated;
grant update (display_name, avatar_url) on public.profiles to authenticated;

-- ─────────────────────────────────────────────────────────────
-- Özel ayarlar (yalnızca sahibi görür): tema, diyet/alerji tercihleri
-- ─────────────────────────────────────────────────────────────
create table public.profile_settings (
  id uuid primary key references public.profiles (id) on delete cascade,
  theme_id text not null default 'cozy' check (theme_id in ('cozy', 'akdeniz', 'geceSefi')),
  -- diyet, alerji, sevilen mutfaklar vb. (onboarding)
  preferences jsonb not null default '{}'::jsonb check (jsonb_typeof(preferences) = 'object'),
  -- seri hesabı için; sunucu tarafından güncellenir
  last_active_on date
);

alter table public.profile_settings enable row level security;

create policy "Kullanıcı kendi ayarlarını okur"
  on public.profile_settings for select to authenticated
  using ((select auth.uid()) = id);

create policy "Kullanıcı kendi ayarlarını günceller"
  on public.profile_settings for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

revoke update on public.profile_settings from authenticated;
grant update (theme_id, preferences) on public.profile_settings to authenticated;

-- Yeni kayıt olan her kullanıcı için otomatik profil
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(nullif(left(new.raw_user_meta_data ->> 'display_name', 40), ''), 'Şef')
  );
  insert into public.profile_settings (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- Kiler
-- ─────────────────────────────────────────────────────────────
create table public.pantry_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  emoji text not null default '🥫' check (char_length(emoji) <= 16),
  category text not null default 'diger'
    check (category in ('sebze', 'sut', 'et', 'bakliyat', 'baharat', 'diger')),
  quantity text not null default '1 adet' check (char_length(quantity) <= 40),
  expires_on date not null,
  created_at timestamptz not null default now()
);

create index pantry_items_user_id_idx on public.pantry_items (user_id);

alter table public.pantry_items enable row level security;

create policy "Kullanıcı kendi kilerini yönetir"
  on public.pantry_items for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- ─────────────────────────────────────────────────────────────
-- Tarifler (malzemeler ve adımlar jsonb dizisi olarak)
-- ─────────────────────────────────────────────────────────────
create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 80),
  emoji text not null default '🍽️' check (char_length(emoji) <= 16),
  description text not null default '' check (char_length(description) <= 500),
  minutes int not null check (minutes between 1 and 1440),
  difficulty smallint not null default 1 check (difficulty between 1 and 3),
  tags text[] not null default '{}'
    check (tags <@ array['hizli', 'firin', 'hafif', 'tatli', 'anne']::text[]),
  source_type text not null default 'manual'
    check (source_type in ('instagram', 'tiktok', 'manual', 'family')),
  source_url text check (
    source_url is null
    or (
      char_length(source_url) <= 500
      and source_url ~* '^https://((www|m|vm|vt)\.)?(instagram|tiktok)\.com/[^\s]+$'
    )
  ),
  tip text check (char_length(tip) <= 500),
  -- [{ "name": "mantar", "amount": "250 gr" }, ...]
  ingredients jsonb not null default '[]'::jsonb check (jsonb_typeof(ingredients) = 'array'),
  -- ["Makarnayı haşla.", ...]
  steps jsonb not null default '[]'::jsonb check (jsonb_typeof(steps) = 'array'),
  visibility text not null default 'private' check (visibility in ('private', 'public')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index recipes_author_id_idx on public.recipes (author_id);
create index recipes_public_idx on public.recipes (created_at desc) where visibility = 'public';

alter table public.recipes enable row level security;

create policy "Herkese açık ve kendi tariflerini okur"
  on public.recipes for select to authenticated
  using (visibility = 'public' or (select auth.uid()) = author_id);

create policy "Kendi tarifini ekler"
  on public.recipes for insert to authenticated
  with check ((select auth.uid()) = author_id);

create policy "Kendi tarifini günceller"
  on public.recipes for update to authenticated
  using ((select auth.uid()) = author_id) with check ((select auth.uid()) = author_id);

create policy "Kendi tarifini siler"
  on public.recipes for delete to authenticated
  using ((select auth.uid()) = author_id);

create function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger recipes_touch_updated_at
  before update on public.recipes
  for each row execute function public.touch_updated_at();

-- Bir tarifi görebiliyor muyum? (yorum/oy/favori politikalarında ortak kullanılır)
create function public.can_view_recipe(target uuid)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (
    select 1 from public.recipes r
    where r.id = target
      and (r.visibility = 'public' or r.author_id = (select auth.uid()))
  );
$$;

-- ─────────────────────────────────────────────────────────────
-- Favoriler
-- ─────────────────────────────────────────────────────────────
create table public.favorites (
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, recipe_id)
);

create index favorites_recipe_id_idx on public.favorites (recipe_id);

alter table public.favorites enable row level security;

create policy "Kendi favorilerini okur"
  on public.favorites for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Görebildiği tarifi favoriler"
  on public.favorites for insert to authenticated
  with check ((select auth.uid()) = user_id and public.can_view_recipe(recipe_id));

create policy "Kendi favorisini kaldırır"
  on public.favorites for delete to authenticated
  using ((select auth.uid()) = user_id);

-- ─────────────────────────────────────────────────────────────
-- Pişirme kayıtları ("X kez pişirildi", ileride XP kaynağı)
-- ─────────────────────────────────────────────────────────────
create table public.cook_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  cooked_at timestamptz not null default now()
);

create index cook_logs_user_recipe_idx on public.cook_logs (user_id, recipe_id);
create index cook_logs_recipe_id_idx on public.cook_logs (recipe_id);

alter table public.cook_logs enable row level security;

create policy "Kendi pişirme kayıtlarını okur"
  on public.cook_logs for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Görebildiği tarifi pişirdiğini kaydeder"
  on public.cook_logs for insert to authenticated
  with check ((select auth.uid()) = user_id and public.can_view_recipe(recipe_id));

-- ─────────────────────────────────────────────────────────────
-- Yorumlar
-- ─────────────────────────────────────────────────────────────
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 1000),
  created_at timestamptz not null default now()
);

create index comments_recipe_id_idx on public.comments (recipe_id, created_at desc);
create index comments_user_id_idx on public.comments (user_id);

alter table public.comments enable row level security;

create policy "Görebildiği tarifin yorumlarını okur"
  on public.comments for select to authenticated
  using (public.can_view_recipe(recipe_id));

create policy "Görebildiği tarife yorum yazar"
  on public.comments for insert to authenticated
  with check ((select auth.uid()) = user_id and public.can_view_recipe(recipe_id));

create policy "Kendi yorumunu siler"
  on public.comments for delete to authenticated
  using ((select auth.uid()) = user_id);

-- ─────────────────────────────────────────────────────────────
-- Oylar (1–5 yıldız, kişi başı tek oy, kendi tarifine oy yok)
-- ─────────────────────────────────────────────────────────────
create table public.ratings (
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  stars smallint not null check (stars between 1 and 5),
  created_at timestamptz not null default now(),
  primary key (user_id, recipe_id)
);

create index ratings_recipe_id_idx on public.ratings (recipe_id);

alter table public.ratings enable row level security;

create policy "Görebildiği tarifin oylarını okur"
  on public.ratings for select to authenticated
  using (public.can_view_recipe(recipe_id));

create policy "Başkasının tarifine oy verir"
  on public.ratings for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and public.can_view_recipe(recipe_id)
    and not exists (
      select 1 from public.recipes r where r.id = recipe_id and r.author_id = (select auth.uid())
    )
  );

create policy "Kendi oyunu değiştirir"
  on public.ratings for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "Kendi oyunu geri alır"
  on public.ratings for delete to authenticated
  using ((select auth.uid()) = user_id);

-- ─────────────────────────────────────────────────────────────
-- Tarif istatistikleri (ortalama puan, oy/yorum sayısı)
-- security_invoker: görünüm, sorgulayan kullanıcının RLS kurallarıyla çalışır
-- ─────────────────────────────────────────────────────────────
create view public.recipe_stats
with (security_invoker = true) as
select
  r.id as recipe_id,
  coalesce(round(avg(rt.stars)::numeric, 1), 0) as avg_rating,
  count(distinct rt.user_id) as rating_count,
  (select count(*) from public.comments c where c.recipe_id = r.id) as comment_count
from public.recipes r
left join public.ratings rt on rt.recipe_id = r.id
group by r.id;

grant select on public.recipe_stats to authenticated;

-- ─────────────────────────────────────────────────────────────
-- Ek önlem: giriş yapmamış (anon) kullanıcı hiçbir tabloya erişemez
-- ─────────────────────────────────────────────────────────────
revoke all on public.profiles, public.profile_settings, public.pantry_items, public.recipes,
  public.favorites, public.cook_logs, public.comments, public.ratings, public.recipe_stats
  from anon;
