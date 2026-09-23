-- Hiroshima Tennis DB: Supabase schema draft
create table if not exists organizers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  official_url text,
  created_at timestamptz not null default now()
);

create table if not exists tournaments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  organizer_id uuid references organizers(id),
  start_date date,
  end_date date,
  backup_date date,
  city text,
  venue text,
  event_type text,
  gender text,
  skill_class text,
  eligibility_raw text,
  eligibility_category text,
  membership_required boolean,
  external_participant_allowed boolean,
  other_city_member_allowed boolean,
  club_membership_required boolean,
  min_age integer,
  max_age integer,
  fee text,
  deadline date,
  application_method text,
  official_url text,
  source_url text,
  status text,
  last_checked_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists change_proposals (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references tournaments(id),
  field_name text not null,
  old_value text,
  new_value text,
  reason text,
  source_url text,
  contact text,
  status text not null default 'pending',
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists change_history (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references tournaments(id),
  field_name text not null,
  old_value text,
  new_value text,
  changed_by uuid,
  reason text,
  source_url text,
  created_at timestamptz not null default now()
);
