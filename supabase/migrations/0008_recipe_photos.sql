-- Kukki Kitchen — tarif fotoğrafı
-- Supabase Dashboard → SQL Editor'e yapıştırıp "Run" ile çalıştırın (0007'den sonra, bir kez).

-- Herkese açık "recipe-photos" deposu; herkes sadece kendi klasörüne ({uid}/...) yazar
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('recipe-photos', 'recipe-photos', true, 3145728, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "Tarif fotoğrafı: kendi klasörünü görür"
  on storage.objects for select to authenticated
  using (bucket_id = 'recipe-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Tarif fotoğrafı: kendi klasörüne yükler"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'recipe-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Tarif fotoğrafı: kendi dosyasını günceller"
  on storage.objects for update to authenticated
  using (bucket_id = 'recipe-photos' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'recipe-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Tarif fotoğrafı: kendi dosyasını siler"
  on storage.objects for delete to authenticated
  using (bucket_id = 'recipe-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

alter table public.recipes add column photo_url text;

-- 0007 güncellenebilir sütunları sınırlamıştı; fotoğraf da güncellenebilsin
grant update (photo_url) on public.recipes to authenticated;

-- photo_url sadece tarif sahibinin kendi klasörünü gösterebilir
create function public.enforce_own_recipe_photo()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.photo_url is not null and new.photo_url !~ (
    '^https://[a-z0-9]+\.supabase\.co/storage/v1/object/public/recipe-photos/'
    || new.author_id::text || '/[A-Za-z0-9._-]+$'
  ) then
    raise exception 'Tarif fotoğrafı sadece kendi klasöründen olabilir';
  end if;
  return new;
end;
$$;

create trigger recipes_photo_owner
  before insert or update of photo_url on public.recipes
  for each row execute function public.enforce_own_recipe_photo();

-- Keşfet akışı fotoğrafı da döndürsün (dönüş tipi değiştiği için sil-oluştur + izinleri yeniden ver)
drop function public.discover_feed(text, text, int, int);

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
  photo_url text,
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
    r.id, r.title, r.emoji, r.description, r.minutes, r.difficulty, r.tags, r.photo_url, r.created_at,
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

revoke all on function public.discover_feed(text, text, int, int) from public, anon;
grant execute on function public.discover_feed(text, text, int, int) to authenticated;
