-- Run this in Supabase Dashboard → SQL Editor
-- Also enable: Authentication → Settings → Allow anonymous sign-ins

-- Game state: one row per user
create table if not exists public.game_state (
  user_id    uuid primary key references auth.users on delete cascade,
  char_id    text,
  situation  int not null default 0,
  choices    jsonb not null default '[]',
  meters     jsonb not null default '{"fame":15,"trust":60,"heat":5}',
  narrator_done boolean not null default false,
  updated_at timestamptz not null default now()
);

-- DM conversation history
create table if not exists public.dm_messages (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users on delete cascade,
  char_id    text not null,
  role       text not null check (role in ('me','char')),
  content    text not null,
  created_at timestamptz not null default now()
);

-- Aggregated choice stats ("4,218 played · 62% chose A")
create table if not exists public.situation_stats (
  situation_id int  not null,
  choice       text not null check (choice in ('A','B')),
  count        int  not null default 0,
  primary key (situation_id, choice)
);

-- Seed with realistic baseline numbers
insert into public.situation_stats values
  (0,'A',2847),(0,'B',1371),
  (1,'A',2193),(1,'B',2025),
  (2,'A',1876),(2,'B',2342),
  (3,'A',2654),(3,'B',1564),
  (4,'A',2187),(4,'B',2031)
on conflict do nothing;

-- RLS
alter table public.game_state      enable row level security;
alter table public.dm_messages     enable row level security;
alter table public.situation_stats enable row level security;

create policy "own game state"  on public.game_state      for all using (auth.uid() = user_id);
create policy "own dm messages" on public.dm_messages     for all using (auth.uid() = user_id);
create policy "read stats"      on public.situation_stats for select using (true);
create policy "write stats"     on public.situation_stats for update using (auth.role() = 'authenticated');

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger game_state_updated_at
  before update on public.game_state
  for each row execute function public.set_updated_at();
