-- Kukki Kitchen — haftalık yemek planı
-- Supabase Dashboard → SQL Editor'e yapıştırıp "Run" ile çalıştırın (0002'den sonra, bir kez).

create table public.meal_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  plan_date date not null,
  slot text not null check (slot in ('kahvalti', 'ogle', 'aksam')),
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  created_at timestamptz not null default now(),
  -- Her öğüne tek tarif; aynı öğüne yeni tarif atanınca eskisinin yerine geçer (upsert)
  unique (user_id, plan_date, slot)
);

create index meal_plans_user_date_idx on public.meal_plans (user_id, plan_date);
create index meal_plans_recipe_id_idx on public.meal_plans (recipe_id);

alter table public.meal_plans enable row level security;

create policy "Kullanıcı kendi planını yönetir"
  on public.meal_plans for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id and public.can_view_recipe(recipe_id));

revoke all on public.meal_plans from anon;
