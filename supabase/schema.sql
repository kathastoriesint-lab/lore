-- Run this in Supabase Dashboard → SQL Editor
-- Also enable: Authentication → Settings → Allow anonymous sign-ins

-- Game state: one row per user
create table if not exists public.game_state (
  user_id       uuid primary key references auth.users on delete cascade,
  char_id       text,
  player_name   text,
  player_gender text,
  situation     int not null default 0,
  choices       jsonb not null default '[]',
  meters        jsonb not null default '{"fame":20,"heat":50,"image":30}',
  narrator_done boolean not null default false,
  day_unlock_time jsonb not null default '{}',
  updated_at    timestamptz not null default now()
);

-- Migration for existing rows: add new columns and fix meter key names
alter table public.game_state add column if not exists player_name   text;
alter table public.game_state add column if not exists player_gender text;
alter table public.game_state add column if not exists day_unlock_time jsonb not null default '{}';
-- v2: game_data stores situationQueue, flags, runMemory (all new fields)
alter table public.game_state add column if not exists game_data jsonb not null default '{}';
alter table public.game_state add column if not exists world text not null default 'creator-house';
alter table public.game_state add column if not exists avatar_url text;
-- Fix old meter format (trust→heat, heat→image) for any existing rows
update public.game_state
  set meters = jsonb_build_object(
    'fame',  coalesce((meters->>'fame')::int, 20),
    'heat',  coalesce((meters->>'trust')::int, 50),
    'image', coalesce((meters->>'heat')::int, 30)
  )
  where meters ? 'trust';

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

drop policy if exists "own game state"  on public.game_state;
drop policy if exists "own dm messages" on public.dm_messages;
drop policy if exists "read stats"      on public.situation_stats;
drop policy if exists "write stats"     on public.situation_stats;

create policy "own game state"  on public.game_state      for all using (auth.uid() = user_id);
create policy "own dm messages" on public.dm_messages     for all using (auth.uid() = user_id);
create policy "read stats"      on public.situation_stats for select using (true);
create policy "write stats"     on public.situation_stats for update using (auth.role() = 'authenticated');

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists game_state_updated_at on public.game_state;
create trigger game_state_updated_at
  before update on public.game_state
  for each row execute function public.set_updated_at();
