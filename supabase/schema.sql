-- NO SIGNAL · Supabase schema v1
-- Run this entire file in Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'reader' check (role in ('reader','editor','admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.albums (
  id text primary key,
  issue_number integer unique,
  artist text not null,
  title text not null,
  release_year integer,
  genre text,
  label_name text,
  cover_url text,
  spotify_url text,
  description text,
  editor_note text,
  context text,
  facts jsonb not null default '[]'::jsonb,
  sources jsonb not null default '[]'::jsonb,
  tracklist jsonb not null default '[]'::jsonb,
  route_stage integer check (route_stage between 1 and 5),
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.daily_issues (
  issue_date date primary key,
  album_id text not null references public.albums(id) on delete restrict,
  headline text,
  editor_note text,
  published boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.user_library (
  user_id uuid not null references auth.users(id) on delete cascade,
  album_id text not null references public.albums(id) on delete cascade,
  saved boolean not null default false,
  reaction text check (reaction in ('hooked','miss','later') or reaction is null),
  opened_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, album_id)
);

create index if not exists albums_published_idx on public.albums (published, issue_number);
create index if not exists daily_issues_published_date_idx on public.daily_issues (published, issue_date desc);
create index if not exists user_library_user_idx on public.user_library (user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.is_editor()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role in ('editor','admin')
  );
$$;

alter table public.profiles enable row level security;
alter table public.albums enable row level security;
alter table public.daily_issues enable row level security;
alter table public.user_library enable row level security;

drop policy if exists "Profiles: read own" on public.profiles;
create policy "Profiles: read own" on public.profiles
  for select to authenticated using (id = (select auth.uid()));
drop policy if exists "Profiles: editors read profiles" on public.profiles;
create policy "Profiles: editors read profiles" on public.profiles
  for select to authenticated using (public.is_editor());

drop policy if exists "Published albums are public" on public.albums;
create policy "Published albums are public" on public.albums
  for select to anon, authenticated using (published = true or public.is_editor());
drop policy if exists "Editors manage albums" on public.albums;
create policy "Editors manage albums" on public.albums
  for all to authenticated using (public.is_editor()) with check (public.is_editor());

drop policy if exists "Published daily issues are public" on public.daily_issues;
create policy "Published daily issues are public" on public.daily_issues
  for select to anon, authenticated using (published = true or public.is_editor());
drop policy if exists "Editors manage daily issues" on public.daily_issues;
create policy "Editors manage daily issues" on public.daily_issues
  for all to authenticated using (public.is_editor()) with check (public.is_editor());

drop policy if exists "Users read own library" on public.user_library;
create policy "Users read own library" on public.user_library
  for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists "Users manage own library" on public.user_library;
create policy "Users manage own library" on public.user_library
  for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
drop policy if exists "Editors read library for diagnostics" on public.user_library;
create policy "Editors read library for diagnostics" on public.user_library
  for select to authenticated using (public.is_editor());

grant usage on schema public to anon, authenticated;
grant select on public.albums, public.daily_issues to anon, authenticated;
grant select on public.profiles to authenticated;
grant select, insert, update, delete on public.user_library to authenticated;
grant insert, update, delete on public.albums, public.daily_issues to authenticated;
grant execute on function public.is_editor() to anon, authenticated;

-- After creating your first account, promote it manually in SQL Editor:
-- update public.profiles set role = 'admin' where email = 'YOUR_EMAIL';
