-- Kukki Kitchen — hesabımı sil (KVKK silme hakkı + App Store zorunluluğu)
-- Supabase Dashboard → SQL Editor'e yapıştırıp "Run" ile çalıştırın (0008'den sonra, bir kez).
--
-- auth.users satırı silinince profiles ve ona bağlı tüm tablolar (kiler, tarifler, yorumlar,
-- oylar, favoriler, planlar, listeler, koleksiyonlar, şikayetler, cezalar...) ON DELETE CASCADE
-- ile silinir. Depodaki fotoğraflar uygulama tarafından önce silinir.

create function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Giriş gerekli';
  end if;
  delete from auth.users where id = v_uid;
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
