create table if not exists public.ai_interactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  feature text not null,
  crop text,
  city text,
  lang text not null default 'en',
  question text not null,
  answer text not null,
  created_at timestamptz not null default now()
);

grant select, insert, delete on public.ai_interactions to authenticated;
grant all on public.ai_interactions to service_role;

alter table public.ai_interactions enable row level security;

create policy "own ai interactions select" on public.ai_interactions
  for select to authenticated using (auth.uid() = user_id);
create policy "own ai interactions insert" on public.ai_interactions
  for insert to authenticated with check (auth.uid() = user_id);
create policy "own ai interactions delete" on public.ai_interactions
  for delete to authenticated using (auth.uid() = user_id);

create index if not exists ai_interactions_user_created_idx
  on public.ai_interactions (user_id, created_at desc);