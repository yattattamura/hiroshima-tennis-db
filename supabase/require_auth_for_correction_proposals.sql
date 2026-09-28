-- Require a registered Supabase Auth user to submit correction proposals.
alter table public.correction_proposals
  add column if not exists user_id uuid references auth.users(id);

create index if not exists correction_proposals_user_id_idx
  on public.correction_proposals(user_id);

drop policy if exists "Public can submit correction proposals"
  on public.correction_proposals;

create policy "Authenticated users can submit correction proposals"
  on public.correction_proposals
  for insert
  to authenticated
  with check (user_id = auth.uid());
