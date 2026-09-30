-- Kukki Kitchen — Keşfet akışı ve profil fotoğrafı
-- Supabase Dashboard → SQL Editor'e yapıştırıp "Run" ile çalıştırın (0004'ten sonra, bir kez).

-- ─────────────────────────────────────────────────────────────
-- Profil fotoğrafı: herkese açık "avatars" deposu, herkes sadece kendi klasörüne yazar
-- ─────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "Avatar: kendi klasörünü görür"
  on storage.objects for select to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Avatar: kendi klasörüne yükler"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Avatar: kendi dosyasını siler"
  on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- avatar_url sadece bu projenin avatars deposunu gösterebilir (başka sitelere izleme linki konamaz)
alter table public.profiles
  add constraint profiles_avatar_url_check check (
    avatar_url is null
    or avatar_url ~ '^https://[a-z0-9]+\.supabase\.co/storage/v1/object/public/avatars/[0-9a-f-]{36}/[A-Za-z0-9._-]+$'
  );

-- ─────────────────────────────────────────────────────────────
-- Keşfet akışı: herkese açık tarifler + yazar + toplam istatistikler
-- cook_logs / collection_recipes RLS'i sadece kendi satırlarını gösterdiği için
-- toplam sayılar security definer fonksiyonla hesaplanır; fonksiyon SADECE public tarif döner.
-- ─────────────────────────────────────────────────────────────
create function public.discover_feed(
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
  offset greatest(p_offset, 0);
end;
$$;

revoke all on function public.discover_feed(text, text, int, int) from public, anon;
grant execute on function public.discover_feed(text, text, int, int) to authenticated;

-- Tek tarifin toplam istatistikleri (tarif detayı için); sadece görebildiği tarif
create function public.recipe_public_stats(p_recipe_id uuid)
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
    where r.id = p_recipe_id and (r.visibility = 'public' or r.author_id = auth.uid())
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

revoke all on function public.recipe_public_stats(uuid) from public, anon;
grant execute on function public.recipe_public_stats(uuid) to authenticated;
