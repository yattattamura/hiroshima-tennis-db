alter table public.tournaments
  add column if not exists prefecture text;

update public.tournaments
set prefecture = '広島県'
where prefecture is null;

alter table public.tournaments
  alter column prefecture set not null;

create index if not exists tournaments_prefecture_idx
  on public.tournaments (prefecture);

create index if not exists tournaments_prefecture_city_idx
  on public.tournaments (prefecture, city);
