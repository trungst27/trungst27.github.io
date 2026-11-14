-- Run in a NEW Supabase project's SQL Editor. No secret belongs in the website.
-- This creates only Teung's music tables, policies, RPCs and storage buckets.
begin;

create table if not exists public.music_admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.music_admins enable row level security;
revoke all on public.music_admins from anon, authenticated;
grant select on public.music_admins to authenticated;
drop policy if exists "music_admin_reads_self" on public.music_admins;
create policy "music_admin_reads_self" on public.music_admins
  for select to authenticated using (user_id = auth.uid());

create or replace function public.is_music_admin()
returns boolean language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.music_admins where user_id = auth.uid()); $$;
revoke all on function public.is_music_admin() from public;
grant execute on function public.is_music_admin() to anon, authenticated;

create table if not exists public.music_tracks (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(btrim(title)) between 1 and 200),
  artist text not null default '' check (length(artist) <= 120),
  source text not null check (source in ('file', 'soundcloud')),
  audio_url text,
  audio_path text,
  soundcloud_url text,
  cover_url text not null default '',
  duration numeric check (duration is null or duration >= 0),
  moods text[] not null default '{}' check (moods <@ array['chill','study','late-night']::text[]),
  position bigint not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  constraint valid_music_source check (
    (source = 'file' and soundcloud_url is null and
      ((audio_path is not null and audio_url is null) or
       (audio_path is null and audio_url ~ '^(\./assets/music/|https://)')))
    or
    (source = 'soundcloud' and audio_url is null and audio_path is null
      and soundcloud_url ~ '^https://(www\.)?soundcloud\.com/[^[:space:]]+')
  ),
  constraint valid_music_cover check (cover_url = '' or cover_url ~ '^https://')
);
create index if not exists music_tracks_public_order on public.music_tracks (published, position, created_at);
alter table public.music_tracks enable row level security;
revoke all on public.music_tracks from anon, authenticated;
grant select on public.music_tracks to anon, authenticated;
grant insert, update, delete on public.music_tracks to authenticated;

drop policy if exists "music_read_published_or_admin" on public.music_tracks;
create policy "music_read_published_or_admin" on public.music_tracks
  for select to anon, authenticated using (published or public.is_music_admin());
drop policy if exists "music_admin_insert" on public.music_tracks;
create policy "music_admin_insert" on public.music_tracks
  for insert to authenticated with check (public.is_music_admin());
drop policy if exists "music_admin_update" on public.music_tracks;
create policy "music_admin_update" on public.music_tracks
  for update to authenticated using (public.is_music_admin()) with check (public.is_music_admin());
drop policy if exists "music_admin_delete" on public.music_tracks;
create policy "music_admin_delete" on public.music_tracks
  for delete to authenticated using (public.is_music_admin());

create or replace function public.set_music_order(track_ids uuid[])
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_music_admin() then raise exception 'Administrator access required'; end if;
  perform pg_advisory_xact_lock(824882713);
  if cardinality(track_ids) <> (select count(*) from public.music_tracks)
    or (select count(distinct requested.id) from unnest(track_ids) as requested(id)) <> cardinality(track_ids)
    or exists (select 1 from unnest(track_ids) as requested(id) where not exists (select 1 from public.music_tracks t where t.id = requested.id))
  then raise exception 'The collection changed. Refresh before reordering.'; end if;
  update public.music_tracks as track set position = ordered.ordinality - 1
    from unnest(track_ids) with ordinality as ordered(id, ordinality)
    where track.id = ordered.id;
end;
$$;
revoke all on function public.set_music_order(uuid[]) from public;
grant execute on function public.set_music_order(uuid[]) to authenticated;

-- Audio is PRIVATE. Signed playback URLs are available only for published
-- tracks (or to the admin preview). Draft audio is not publicly downloadable.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('music-audio','music-audio',false,52428800,
  array['audio/mpeg','audio/mp3','audio/wav','audio/x-wav','audio/wave','audio/ogg','application/ogg','audio/mp4','audio/x-m4a','audio/flac','audio/x-flac'])
on conflict (id) do nothing;
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('music-covers','music-covers',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

drop policy if exists "music_audio_read" on storage.objects;
create policy "music_audio_read" on storage.objects for select to anon, authenticated
using (bucket_id = 'music-audio' and (public.is_music_admin() or exists (
  select 1 from public.music_tracks track where track.published and track.source = 'file' and track.audio_path = name
)));
drop policy if exists "music_covers_read" on storage.objects;
create policy "music_covers_read" on storage.objects for select to anon, authenticated using (bucket_id = 'music-covers');
drop policy if exists "music_storage_admin_insert" on storage.objects;
create policy "music_storage_admin_insert" on storage.objects for insert to authenticated
with check (bucket_id in ('music-audio','music-covers') and public.is_music_admin());
drop policy if exists "music_storage_admin_update" on storage.objects;
create policy "music_storage_admin_update" on storage.objects for update to authenticated
using (bucket_id in ('music-audio','music-covers') and public.is_music_admin())
with check (bucket_id in ('music-audio','music-covers') and public.is_music_admin());
drop policy if exists "music_storage_admin_delete" on storage.objects;
create policy "music_storage_admin_delete" on storage.objects for delete to authenticated
using (bucket_id in ('music-audio','music-covers') and public.is_music_admin());

-- Initial collection: only supplied files and URLs. No invented mood tags.
insert into public.music_tracks (id,title,artist,source,audio_url,soundcloud_url,cover_url,duration,moods,position,published) values
('d105ce65-5811-42d9-920a-489b1d4e1001','Khong Buong ft Nang Co Mang Em Ve - Halee','','file','./assets/music/Khong Buong ft Nang Co Mang Em Ve - Halee.mp3',null,'',289,'{}',0,true),
('d105ce65-5811-42d9-920a-489b1d4e1002','Khó Vẽ Nụ Cười - VAVH','','file','./assets/music/Khó Vẽ Nụ Cười - VAVH.mp3',null,'',346,'{}',1,true),
('d105ce65-5811-42d9-920a-489b1d4e1003','3in1-Không Buông x Sài Gòn Tôi Mưa x Nắng Có Mang Em Về','LongChunn','soundcloud',null,'https://soundcloud.com/long-nguyxn/3in1-kh-ng-bu-ng-x-s-i-g-n-t-i','https://i1.sndcdn.com/artworks-tqX9XQqkFZ8cM5uC-ELmilw-large.jpg',229,'{}',2,true),
('d105ce65-5811-42d9-920a-489b1d4e1004','SENA Remix #7: Live nhạc+TFT 04/05/2025.','Khánh Văn','soundcloud',null,'https://soundcloud.com/vkkhanhvan/sena-remix-7-live-nh-c-tft-04','https://i1.sndcdn.com/artworks-rgccxasjAeJRkZyZ-OZ3FHg-t500x500.jpg',6754,'{}',3,true)
on conflict (id) do nothing;

commit;

-- NEXT: create your admin user in Authentication > Users, then run separately:
-- insert into public.music_admins (user_id)
-- select id from auth.users where email = 'YOUR_ADMIN_EMAIL'
-- on conflict do nothing;

