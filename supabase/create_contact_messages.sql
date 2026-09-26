-- お問い合わせフォームの保存先
-- Supabase SQL Editorで1回だけ実行してください。

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  name text,
  email text,
  message text not null,
  status text not null default '未対応',
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

drop policy if exists "contact_messages_insert_public"
on public.contact_messages;

create policy "contact_messages_insert_public"
on public.contact_messages
for insert
to anon, authenticated
with check (true);

drop policy if exists "contact_messages_select_admin"
on public.contact_messages;

create policy "contact_messages_select_admin"
on public.contact_messages
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  )
);

revoke all on public.contact_messages from public;
revoke all on public.contact_messages from anon;
revoke all on public.contact_messages from authenticated;

grant insert on public.contact_messages to anon, authenticated;
grant select on public.contact_messages to authenticated;
