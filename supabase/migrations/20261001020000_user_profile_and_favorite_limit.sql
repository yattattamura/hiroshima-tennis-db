-- User profile defaults and favorite limit.
-- Only prefecture + municipality are stored; no street-level address.

create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  prefecture text,
  city text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists user_profiles_prefecture_city_idx
  on public.user_profiles(prefecture, city);

alter table public.user_profiles enable row level security;

drop policy if exists "Users can view their profile" on public.user_profiles;
create policy "Users can view their profile"
  on public.user_profiles
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "Users can create their profile" on public.user_profiles;
create policy "Users can create their profile"
  on public.user_profiles
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Users can update their profile" on public.user_profiles;
create policy "Users can update their profile"
  on public.user_profiles
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Users can delete their profile" on public.user_profiles;
create policy "Users can delete their profile"
  on public.user_profiles
  for delete
  to authenticated
  using (user_id = auth.uid());

create or replace function public.enforce_user_favorites_limit()
returns trigger
language plpgsql
set search_path = public, pg_catalog
as $$
declare
  favorite_count integer;
begin
  perform pg_advisory_xact_lock(
    hashtextextended(new.user_id::text, 0)
  );

  select count(*)::integer
    into favorite_count
  from public.user_favorites
  where user_id = new.user_id;

  if favorite_count >= 50
     and not exists (
       select 1
       from public.user_favorites
       where user_id = new.user_id
         and tournament_id = new.tournament_id
     ) then
    raise exception 'お気に入りは50件まで登録できます。'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists user_favorites_limit_trigger
  on public.user_favorites;

create trigger user_favorites_limit_trigger
before insert on public.user_favorites
for each row
execute function public.enforce_user_favorites_limit();
