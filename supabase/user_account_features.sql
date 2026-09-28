-- User account features: synced favorites, saved searches, organizer follows,
-- deadline notification preferences, and correction proposal ownership.

create table if not exists public.user_favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  tournament_id text not null references public.tournaments(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, tournament_id)
);

create index if not exists user_favorites_user_id_idx
  on public.user_favorites(user_id);

create table if not exists public.saved_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  filters jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists saved_searches_user_id_idx
  on public.saved_searches(user_id);

create table if not exists public.organizer_follows (
  user_id uuid not null references auth.users(id) on delete cascade,
  organizer_id uuid not null references public.organizers(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, organizer_id)
);

create index if not exists organizer_follows_user_id_idx
  on public.organizer_follows(user_id);

create table if not exists public.notification_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  deadline_enabled boolean not null default true,
  deadline_days integer not null default 7,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint notification_settings_deadline_days_check
    check (deadline_days between 1 and 30)
);

alter table public.correction_proposals
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create index if not exists correction_proposals_user_id_idx
  on public.correction_proposals(user_id);

alter table public.user_favorites enable row level security;
alter table public.saved_searches enable row level security;
alter table public.organizer_follows enable row level security;
alter table public.notification_settings enable row level security;

drop policy if exists "Users can view their favorites" on public.user_favorites;
create policy "Users can view their favorites"
  on public.user_favorites for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "Users can add their favorites" on public.user_favorites;
create policy "Users can add their favorites"
  on public.user_favorites for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Users can remove their favorites" on public.user_favorites;
create policy "Users can remove their favorites"
  on public.user_favorites for delete to authenticated
  using (user_id = auth.uid());

drop policy if exists "Users can view their saved searches" on public.saved_searches;
create policy "Users can view their saved searches"
  on public.saved_searches for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "Users can create their saved searches" on public.saved_searches;
create policy "Users can create their saved searches"
  on public.saved_searches for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Users can update their saved searches" on public.saved_searches;
create policy "Users can update their saved searches"
  on public.saved_searches for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Users can delete their saved searches" on public.saved_searches;
create policy "Users can delete their saved searches"
  on public.saved_searches for delete to authenticated
  using (user_id = auth.uid());

drop policy if exists "Users can view their organizer follows" on public.organizer_follows;
create policy "Users can view their organizer follows"
  on public.organizer_follows for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "Users can add organizer follows" on public.organizer_follows;
create policy "Users can add organizer follows"
  on public.organizer_follows for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Users can remove organizer follows" on public.organizer_follows;
create policy "Users can remove organizer follows"
  on public.organizer_follows for delete to authenticated
  using (user_id = auth.uid());

drop policy if exists "Users can view their notification settings" on public.notification_settings;
create policy "Users can view their notification settings"
  on public.notification_settings for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "Users can create their notification settings" on public.notification_settings;
create policy "Users can create their notification settings"
  on public.notification_settings for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Users can update their notification settings" on public.notification_settings;
create policy "Users can update their notification settings"
  on public.notification_settings for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Authenticated users can submit correction proposals" on public.correction_proposals;
create policy "Authenticated users can submit correction proposals"
  on public.correction_proposals for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Admins can view correction proposals" on public.correction_proposals;
create policy "Admins can view correction proposals"
  on public.correction_proposals
  for select to authenticated
  using (
    exists (
      select 1
      from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  );

drop policy if exists "Users can view their correction proposals" on public.correction_proposals;
create policy "Users can view their correction proposals"
  on public.correction_proposals
  for select to authenticated
  using (user_id = auth.uid());
