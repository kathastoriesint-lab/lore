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
  meters        jsonb not null default '{"fame":20}',
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
-- Fix ancient meter format (trust→heat, heat→image) for any pre-v1 rows.
update public.game_state
  set meters = jsonb_build_object(
    'fame',  coalesce((meters->>'fame')::int, 20),
    'heat',  coalesce((meters->>'trust')::int, 50),
    'image', coalesce((meters->>'heat')::int, 30)
  )
  where meters ? 'trust';

-- 2026-07 meters split: heat/image removed. Per-world reshape of existing rows.
-- Idempotent (guarded on `meters ? 'image'` — new-shape rows lack it). The app's
-- load-time migrateMeters() also handles this, so rows load correctly even if this
-- SQL hasn't run yet. Run in the Supabase SQL editor when ready.
-- Creator House: keep only fame.
update public.game_state
  set meters = jsonb_build_object('fame', coalesce((meters->>'fame')::int, 20))
  where world = 'creator-house' and meters ? 'image';
-- Cricket: old.fame→form, old.heat→fame, old.image→trust (single expression = atomic, no collision).
update public.game_state
  set meters = jsonb_build_object(
    'form',  coalesce((meters->>'fame')::int, 40),
    'fame',  coalesce((meters->>'heat')::int, 25),
    'trust', coalesce((meters->>'image')::int, 20)
  )
  where world = 'cricket' and meters ? 'image';

-- 2026-07 cricket v2: pooled Team Trust removed (Captain's Trust = dmTrust.hardik
-- in game_data). Strip the trust key from cricket meter blobs. Idempotent; runs
-- after the blocks above (converges from any starting shape). App-side
-- migrateMeters() already drops the key on load, so this is hygiene, not rescue.
update public.game_state
  set meters = jsonb_build_object(
    'form', coalesce((meters->>'form')::int, 40),
    'fame', coalesce((meters->>'fame')::int, 25)
  )
  where world = 'cricket' and meters ? 'trust';

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

-- Look up a Supabase user id by phone (used by the msg91-auth bridge edge fn to
-- find a returning user). auth.users stores phone WITHOUT the leading '+'.
create or replace function public.get_user_id_by_phone(phone_number text)
returns uuid language sql security definer set search_path = '' as $$
  select id from auth.users where phone = phone_number limit 1;
$$;

-- Durable per-user rate limit for the paid AI/TTS endpoints (lore-chat, narrate).
-- One row per (user, endpoint); a fixed window that resets once it expires.
create table if not exists public.ai_usage (
  user_id      uuid not null references auth.users on delete cascade,
  endpoint     text not null,
  window_start timestamptz not null default now(),
  count        int not null default 0,
  primary key (user_id, endpoint)
);
alter table public.ai_usage enable row level security;
-- No RLS policies → no direct client access. Only the SECURITY DEFINER function below touches it.

-- Atomically count this call against the caller's window. Returns true if allowed,
-- false if the window cap is exceeded. Uses auth.uid() so the user can't be spoofed.
create or replace function public.consume_ai_quota(
  p_endpoint text, p_max int, p_window_secs int
) returns boolean
language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_count int;
begin
  if v_user is null then return false; end if;
  insert into public.ai_usage (user_id, endpoint, window_start, count)
    values (v_user, p_endpoint, now(), 1)
  on conflict (user_id, endpoint) do update set
    window_start = case
      when public.ai_usage.window_start < now() - make_interval(secs => p_window_secs)
        then now() else public.ai_usage.window_start end,
    count = case
      when public.ai_usage.window_start < now() - make_interval(secs => p_window_secs)
        then 1 else public.ai_usage.count + 1 end
  returning count into v_count;
  return v_count <= p_max;
end; $$;

grant execute on function public.consume_ai_quota(text, int, int) to anon, authenticated;
