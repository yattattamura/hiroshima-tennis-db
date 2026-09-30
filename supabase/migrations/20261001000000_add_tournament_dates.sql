-- Tournament schedules are separate from the tournament itself.
-- One tournament can have multiple regular dates and multiple backup dates.

create table if not exists public.tournament_dates (
  id uuid primary key default gen_random_uuid(),
  tournament_id text not null references public.tournaments(id) on delete cascade,
  start_date date not null,
  end_date date,
  date_type text not null default '開催日'
    check (date_type in ('開催日', '予備日')),
  label text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint tournament_dates_valid_range
    check (end_date is null or end_date >= start_date)
);

create index if not exists tournament_dates_tournament_id_idx
  on public.tournament_dates(tournament_id, sort_order, start_date);

create index if not exists tournament_dates_start_date_idx
  on public.tournament_dates(start_date);

alter table public.tournament_dates enable row level security;

drop policy if exists "Anyone can view tournament dates"
  on public.tournament_dates;

create policy "Anyone can view tournament dates"
  on public.tournament_dates
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins can insert tournament dates"
  on public.tournament_dates;

create policy "Admins can insert tournament dates"
  on public.tournament_dates
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  );

drop policy if exists "Admins can update tournament dates"
  on public.tournament_dates;

create policy "Admins can update tournament dates"
  on public.tournament_dates
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  );

drop policy if exists "Admins can delete tournament dates"
  on public.tournament_dates;

create policy "Admins can delete tournament dates"
  on public.tournament_dates
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  );

-- Backfill the existing single-day/range schedule into structured rows.
insert into public.tournament_dates (
  tournament_id,
  start_date,
  end_date,
  date_type,
  sort_order
)
select
  t.id,
  t.start_date,
  case
    when t.end_date is not null and t.end_date <> t.start_date
      then t.end_date
    else null
  end,
  '開催日',
  0
from public.tournaments t
where t.start_date is not null
  and not exists (
    select 1
    from public.tournament_dates td
    where td.tournament_id = t.id
  );

-- "秋季シングルス大会（予備日）" was previously stored as a second
-- tournament. Merge it into the real tournament so one tournament is one item.
insert into public.tournament_dates (
  tournament_id,
  start_date,
  end_date,
  date_type,
  sort_order
)
select 't002', '2026-11-01', null, '予備日', 10
where not exists (
  select 1
  from public.tournament_dates
  where tournament_id = 't002'
    and start_date = '2026-11-01'
    and date_type = '予備日'
);

delete from public.deadline_candidates
where tournament_id = 't007';

update public.event_sources
set tournament_id = 't002'
where tournament_id = 't007';

delete from public.tournaments
where id = 't007';
