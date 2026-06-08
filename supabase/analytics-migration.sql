-- Analytics tables for Lore
-- Run in: Supabase Dashboard → SQL Editor

-- ── Sessions ─────────────────────────────────────────────────────────────────
create table if not exists public.analytics_sessions (
  id           uuid primary key default gen_random_uuid(),
  device_id    text not null,
  user_id      uuid references auth.users on delete set null,
  started_at   timestamptz not null default now(),
  ended_at     timestamptz,
  duration_seconds int,
  app_version  text,
  platform     text  -- 'web'
);

-- ── Screen views ─────────────────────────────────────────────────────────────
create table if not exists public.analytics_screen_views (
  id               uuid primary key default gen_random_uuid(),
  device_id        text not null,
  session_id       uuid references public.analytics_sessions on delete set null,
  screen           text not null,
  world_id         text,
  entered_at       timestamptz not null,
  exited_at        timestamptz,
  duration_seconds int,
  referrer_screen  text
);

-- ── Events ───────────────────────────────────────────────────────────────────
-- event_type taxonomy:
--   onboarding_started | onboarding_completed
--   world_entered
--   situation_viewed | choice_made
--   dm_opened | dm_sent
--   feed_scrolled | post_liked
--   day_gate_seen | narration_played
--   session_ended
create table if not exists public.analytics_events (
  id           uuid primary key default gen_random_uuid(),
  device_id    text not null,
  session_id   uuid references public.analytics_sessions on delete set null,
  user_id      uuid references auth.users on delete set null,
  occurred_at  timestamptz not null default now(),
  event_type   text not null,
  world_id     text,
  properties   jsonb not null default '{}'
);

-- ── device_id on game_state ───────────────────────────────────────────────────
alter table public.game_state add column if not exists device_id text;

-- ── Indexes ───────────────────────────────────────────────────────────────────
create index if not exists idx_sessions_device     on public.analytics_sessions(device_id);
create index if not exists idx_sessions_user       on public.analytics_sessions(user_id);
create index if not exists idx_screen_views_device on public.analytics_screen_views(device_id);
create index if not exists idx_events_device       on public.analytics_events(device_id);
create index if not exists idx_events_type         on public.analytics_events(event_type);
create index if not exists idx_events_occurred     on public.analytics_events(occurred_at);
create index if not exists idx_game_state_device   on public.game_state(device_id);

-- ── RLS ──────────────────────────────────────────────────────────────────────
alter table public.analytics_sessions    enable row level security;
alter table public.analytics_screen_views enable row level security;
alter table public.analytics_events      enable row level security;

-- Any authenticated user (including anonymous) can insert their own rows.
-- Reads are service-role only (for your analytics dashboard).
drop policy if exists "insert analytics sessions"     on public.analytics_sessions;
drop policy if exists "insert analytics screen views" on public.analytics_screen_views;
drop policy if exists "insert analytics events"       on public.analytics_events;
drop policy if exists "update own session"            on public.analytics_sessions;

create policy "insert analytics sessions"
  on public.analytics_sessions for insert
  to authenticated with check (true);

create policy "update own session"
  on public.analytics_sessions for update
  to authenticated using (auth.uid() = user_id);

create policy "insert analytics screen views"
  on public.analytics_screen_views for insert
  to authenticated with check (true);

create policy "insert analytics events"
  on public.analytics_events for insert
  to authenticated with check (true);
