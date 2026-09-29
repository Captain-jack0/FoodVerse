-- Kukki Kitchen — tarif koleksiyonları ("Kahvaltılıklar", "Anne Defteri"...)
-- Supabase Dashboard → SQL Editor'e yapıştırıp "Run" ile çalıştırın (0003'ten sonra, bir kez).

create table public.collections (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 40),
  emoji text not null default '📚' check (char_length(emoji) <= 16),
  -- Keşfet için hazır: şimdilik uygulama hep 'private' yazar
  visibility text not null default 'private' check (visibility in ('private', 'public')),
  created_at timestamptz not null default now(),
  unique (owner_id, name)
);

create index collections_owner_idx on public.collections (owner_id, created_at);

alter table public.collections enable row level security;

create policy "Kendi ve herkese açık koleksiyonları okur"
  on public.collections for select to authenticated
  using (visibility = 'public' or (select auth.uid()) = owner_id);

create policy "Kendi koleksiyonunu ekler"
  on public.collections for insert to authenticated
  with check ((select auth.uid()) = owner_id);

create policy "Kendi koleksiyonunu günceller"
  on public.collections for update to authenticated
  using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);

create policy "Kendi koleksiyonunu siler"
  on public.collections for delete to authenticated
  using ((select auth.uid()) = owner_id);

-- Bir tarif birden çok koleksiyonda olabilir; koleksiyon silinince tarif silinmez
create table public.collection_recipes (
  collection_id uuid not null references public.collections (id) on delete cascade,
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (collection_id, recipe_id)
);

create index collection_recipes_recipe_idx on public.collection_recipes (recipe_id);

alter table public.collection_recipes enable row level security;

create function public.owns_collection(target uuid)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (
    select 1 from public.collections c
    where c.id = target and c.owner_id = (select auth.uid())
  );
$$;

create policy "Görebildiği koleksiyonun içeriğini okur"
  on public.collection_recipes for select to authenticated
  using (
    exists (select 1 from public.collections c where c.id = collection_id)
    and public.can_view_recipe(recipe_id)
  );

-- Başkasının herkese açık tarifini de kendi koleksiyonuna kaydedebilir (Keşfet)
create policy "Kendi koleksiyonuna görebildiği tarifi ekler"
  on public.collection_recipes for insert to authenticated
  with check (public.owns_collection(collection_id) and public.can_view_recipe(recipe_id));

create policy "Kendi koleksiyonundan tarif çıkarır"
  on public.collection_recipes for delete to authenticated
  using (public.owns_collection(collection_id));

revoke all on public.collections, public.collection_recipes from anon;
