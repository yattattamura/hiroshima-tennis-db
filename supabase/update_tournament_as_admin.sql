-- 管理者が大会情報を直接編集するためのRPC
-- Supabase SQL Editorで1回だけ実行してください。

create or replace function public.update_tournament_as_admin(
  p_tournament_id text,
  p_data jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if not exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  ) then
    raise exception 'ADMIN_REQUIRED';
  end if;

  update public.tournaments
  set
    name = coalesce(
      nullif(p_data->>'name', ''),
      name
    ),
    city = nullif(
      p_data->>'city',
      ''
    ),
    venue_name_raw = nullif(
      p_data->>'venue_name_raw',
      ''
    ),
    date_text = nullif(
      p_data->>'date_text',
      ''
    ),
    start_date = nullif(
      p_data->>'start_date',
      ''
    )::date,
    event_type = nullif(
      p_data->>'event_type',
      ''
    ),
    gender = nullif(
      p_data->>'gender',
      ''
    ),
    level = nullif(
      p_data->>'level',
      ''
    ),
    eligibility = nullif(
      p_data->>'eligibility',
      ''
    ),
    fee_text = nullif(
      p_data->>'fee_text',
      ''
    ),
    deadline_text = nullif(
      p_data->>'deadline_text',
      ''
    ),
    deadline_date = nullif(
      p_data->>'deadline_date',
      ''
    )::date,
    application_method = nullif(
      p_data->>'application_method',
      ''
    ),
    official_url = nullif(
      p_data->>'official_url',
      ''
    ),
    status = nullif(
      p_data->>'status',
      ''
    ),
    notes = nullif(
      p_data->>'notes',
      ''
    ),
    last_checked_at = nullif(
      p_data->>'last_checked_at',
      ''
    )::timestamptz,
    data_quality_note = nullif(
      p_data->>'data_quality_note',
      ''
    ),
    updated_at = now()
  where id = p_tournament_id;

  if not found then
    raise exception 'TOURNAMENT_NOT_FOUND';
  end if;
end;
$$;

revoke all on function public.update_tournament_as_admin(
  text,
  jsonb
) from public;

grant execute on function public.update_tournament_as_admin(
  text,
  jsonb
) to authenticated;
