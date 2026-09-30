// Tüm migration'ları geçici bir Postgres'te (PGlite) sırayla çalıştırır ve güvenlik kurallarını sınar.
// Çalıştır: npm run test:db  (Supabase'e dokunmaz)
import { PGlite } from '@electric-sql/pglite';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const MIG = fileURLToPath(new URL('../migrations', import.meta.url));
const db = new PGlite();

// Supabase ortamının asgari taklidi: roller, auth.users, auth.uid(), storage
await db.exec(`
  create role anon; create role authenticated;
  grant usage on schema public to anon, authenticated;
  alter default privileges in schema public grant all on tables to anon, authenticated;
  alter default privileges in schema public grant all on functions to anon, authenticated;
  create schema auth; grant usage on schema auth to anon, authenticated;
  create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb default '{}');
  create function auth.uid() returns uuid language sql stable as $$
    select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  grant execute on function auth.uid() to anon, authenticated;
  create schema storage; grant usage on schema storage to authenticated;
  create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
  create table storage.objects (id uuid default gen_random_uuid(), bucket_id text, name text);
  alter table storage.objects enable row level security;
  create function storage.foldername(name text) returns text[] language sql as $$ select string_to_array(name, '/') $$;
`);

const files = readdirSync(MIG).filter((f) => f.endsWith('.sql')).sort();
for (const f of files) {
  try {
    await db.exec(readFileSync(join(MIG, f), 'utf8'));
    console.log('✅', f);
  } catch (e) {
    console.log('❌', f, '→', e.message);
    process.exit(1);
  }
}

// ── Davranış testleri ─────────────────────────────────────────
const A = '00000000-0000-0000-0000-00000000000a'; // tarif sahibi
const B = '00000000-0000-0000-0000-00000000000b'; // yorumcu
const C = '00000000-0000-0000-0000-00000000000c';
const D = '00000000-0000-0000-0000-00000000000d';
const ADMIN = '00000000-0000-0000-0000-0000000000ad';
for (const [id, name] of [[A, 'Ayşe'], [B, 'Bora'], [C, 'Can'], [D, 'Deniz'], [ADMIN, 'Yönetici']]) {
  await db.query(`insert into auth.users (id, email, raw_user_meta_data) values ($1, $2, $3)`, [id, `${name}@x.com`, { display_name: name }]);
}
await db.query(`update public.profiles set is_admin = true where id = $1`, [ADMIN]);

let failures = 0;
const as = async (uid, sql, params = []) => {
  await db.exec(`reset role; select set_config('request.jwt.claim.sub', '${uid}', false); set role authenticated;`);
  try {
    return { ok: true, res: await db.query(sql, params) };
  } catch (e) {
    return { ok: false, err: e.message };
  } finally {
    await db.exec('reset role;');
  }
};
const expect = (label, cond, detail = '') => {
  console.log(cond ? '  ✔' : '  ✘', label, cond ? '' : detail);
  if (!cond) failures++;
};

const pub = await as(A, `insert into public.recipes (title, minutes, visibility) values ('Mercimek', 20, 'public') returning id`);
expect('Sahip herkese açık tarif ekler', pub.ok, pub.err);
const R = pub.res.rows[0].id;
const priv = await as(A, `insert into public.recipes (title, minutes) values ('Gizli tarif', 10) returning id`);
const P = priv.res.rows[0].id;

expect('Kendini yönetici yapamaz', !(await as(B, `update public.profiles set is_admin = true where id = '${B}'`)).ok);
const adminSeesPrivate = await as(ADMIN, `select count(*)::int n from public.recipes where id = '${P}'`);
expect('Yönetici kişisel tarifi GÖREMEZ', adminSeesPrivate.res.rows[0].n === 0);

expect('Küfürlü yorum engellenir', !(await as(B, `insert into public.comments (recipe_id, body) values ('${R}', 'berbat amk')`)).ok);
const cm = await as(B, `insert into public.comments (recipe_id, body, is_suggestion) values ('${R}', 'Tuzu azalt', true) returning id, suggestion_status, hidden_at`);
expect('Öneri eklenir, durum open', cm.ok && cm.res.rows[0].suggestion_status === 'open', cm.err);
const CM = cm.res.rows[0].id;
expect('Yorumcu öneriyi kendi onaylayamaz', !(await as(B, `select public.resolve_suggestion('${CM}', 'applied')`)).ok);
expect('Tarif sahibi öneriyi yönetir', (await as(A, `select public.resolve_suggestion('${CM}', 'dismissed')`)).ok);
const v = await as(A, `select public.publish_recipe_version('${R}', 'ilk', array['${CM}']::uuid[]) v`);
expect('Sürüm yayınlanır', v.ok && v.res.rows[0].v === 1, v.err);

expect('Kendini şikayet edemez', !(await as(A, `insert into public.reports (target_type, target_id, reason) values ('recipe', '${R}', 'spam')`)).ok);
expect('Kişisel tarif şikayet edilemez', !(await as(B, `insert into public.reports (target_type, target_id, reason) values ('recipe', '${P}', 'spam')`)).ok);
for (const u of [B, C]) await as(u, `insert into public.reports (target_type, target_id, reason) values ('recipe', '${R}', 'spam')`);
expect('Aynı kişi ikinci kez şikayet edemez', !(await as(B, `insert into public.reports (target_type, target_id, reason) values ('recipe', '${R}', 'spam')`)).ok);
let seen = await as(D, `select count(*)::int n from public.recipes where id = '${R}'`);
expect('2 şikayette hâlâ görünür', seen.res.rows[0].n === 1);
await as(D, `insert into public.reports (target_type, target_id, reason) values ('recipe', '${R}', 'uygunsuz')`);
seen = await as(D, `select count(*)::int n from public.recipes where id = '${R}'`);
expect('3 şikayette gizlenir', seen.res.rows[0].n === 0);
const feed = await as(D, `select count(*)::int n from public.discover_feed('trend', '', 20, 0)`);
expect("Gizlenen Keşfet'te yok", feed.ok && feed.res.rows[0].n === 0, feed.err);
expect('Sahip gizlenmeyi kendi kaldıramaz', !(await as(A, `update public.recipes set hidden_at = null where id = '${R}'`)).ok);
expect('Sahip gizli tarifini görmeye devam eder', (await as(A, `select count(*)::int n from public.recipes where id = '${R}'`)).res.rows[0].n === 1);
expect('Sahip tarifini düzenleyebilir', (await as(A, `update public.recipes set title = 'Mercimek 2' where id = '${R}'`)).ok);

expect('Yönetici olmayan panel çağıramaz', !(await as(B, `select * from public.admin_open_reports()`)).ok);
const reports = await as(ADMIN, `select * from public.admin_open_reports()`);
expect('Yönetici açık şikayetleri görür', reports.ok && reports.res.rows.length === 1 && Number(reports.res.rows[0].report_count) === 3, reports.err);
expect('Yönetici gizli (şikayetli) tarifi görür', (await as(ADMIN, `select count(*)::int n from public.recipes where id = '${R}'`)).res.rows[0].n === 1);
expect('Ceza verilir', (await as(ADMIN, `select public.admin_resolve_reports('recipe', '${R}', 'penalize', 'test')`)).ok);
const pen = await as(A, `select level, ends_at > now() + interval '50 minutes' as ok from public.user_penalties`);
expect('İlk ceza 1 saat', pen.res.rows[0]?.level === 1 && pen.res.rows[0]?.ok === true);
expect('Başkası cezayı göremez', (await as(B, `select count(*)::int n from public.user_penalties`)).res.rows[0].n === 0);
expect('Cezalı yorum yazamaz', !(await as(A, `insert into public.comments (recipe_id, body) values ('${R}', 'merhaba')`)).ok);
expect('Cezalı tarif paylaşamaz', !(await as(A, `insert into public.recipes (title, minutes, visibility) values ('X', 5, 'public')`)).ok);
expect('Cezalı gizli tarif ekleyebilir', (await as(A, `insert into public.recipes (title, minutes) values ('Y', 5)`)).ok);
await as(ADMIN, `select public.admin_penalize_user('${A}', 'tekrar')`);
const lvl2 = await as(ADMIN, `select max(level)::int l from public.user_penalties where user_id = '${A}'`);
expect('İkinci ceza bir üst basamak', lvl2.res.rows[0].l === 2);
expect('Ceza kaldırılır', (await as(ADMIN, `select public.admin_lift_penalty('${A}')`)).ok);
expect('Ceza kalkınca yorum yazar', (await as(A, `insert into public.comments (recipe_id, body) values ('${P}', 'not')`)).ok);

await as(B, `select public.log_profanity_attempt('yorum')`);
const prof = await as(ADMIN, `select * from public.admin_profanity_users()`);
expect('Küfür denemesi yöneticiye düşer', prof.ok && prof.res.rows.length === 1, prof.err);
expect('Avatar sadece kendi klasöründen', !(await as(B, `update public.profiles set avatar_url = 'https://abc.supabase.co/storage/v1/object/public/avatars/${A}/a.jpg' where id = '${B}'`)).ok);
expect('Kendi avatarı kabul', (await as(B, `update public.profiles set avatar_url = 'https://abc.supabase.co/storage/v1/object/public/avatars/${B}/a.jpg' where id = '${B}'`)).ok);

// 0008: tarif fotoğrafı
const photoOk = await as(B, `insert into public.recipes (title, minutes, photo_url) values ('Fotolu', 10, 'https://abc.supabase.co/storage/v1/object/public/recipe-photos/${B}/p.jpg') returning id`);
expect('Kendi klasöründen tarif fotoğrafı kabul', photoOk.ok, photoOk.err);
expect('Başkasının klasöründen tarif fotoğrafı reddedilir', !(await as(B, `update public.recipes set photo_url = 'https://abc.supabase.co/storage/v1/object/public/recipe-photos/${A}/p.jpg' where id = '${photoOk.res?.rows[0]?.id}'`)).ok);
expect('Sahip tarif fotoğrafını güncelleyebilir', (await as(B, `update public.recipes set photo_url = null where id = '${photoOk.res?.rows[0]?.id}'`)).ok);
const feedCols = await as(D, `select photo_url from public.discover_feed('new', '', 5, 0)`);
expect('Keşfet akışı fotoğraf döndürür', feedCols.ok, feedCols.err);

console.log(failures === 0 ? '\nTÜM TESTLER GEÇTİ' : `\n${failures} TEST BAŞARISIZ`);
process.exit(failures === 0 ? 0 : 1);
