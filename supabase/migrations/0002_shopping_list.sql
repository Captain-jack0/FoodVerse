-- Kukki Kitchen — alışveriş listesi
-- Supabase Dashboard → SQL Editor'e yapıştırıp "Run" ile çalıştırın (0001'den sonra, bir kez).

create table public.shopping_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 60),
  amount text not null default '' check (char_length(amount) <= 40),
  -- Hangi tariften eklendi (tarif silinirse bağ kopar, madde listede kalır)
  recipe_id uuid references public.recipes (id) on delete set null,
  checked boolean not null default false,
  created_at timestamptz not null default now()
);

create index shopping_items_user_id_idx on public.shopping_items (user_id, checked, created_at);
create index shopping_items_recipe_id_idx on public.shopping_items (recipe_id);

alter table public.shopping_items enable row level security;

create policy "Kullanıcı kendi alışveriş listesini yönetir"
  on public.shopping_items for all to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and (recipe_id is null or public.can_view_recipe(recipe_id))
  );

revoke all on public.shopping_items from anon;
