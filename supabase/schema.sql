-- FitQuest Database Schema
-- Run this in the Supabase SQL Editor to set up your database

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────
-- TABLES
-- ─────────────────────────────────────────────

create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  goal text check (goal in ('lose_weight', 'build_strength', 'move_more')),
  current_weight numeric,
  goal_weight numeric,
  age int,
  activity_level text check (activity_level in ('not_at_all', 'a_little', 'somewhat_active')),
  total_xp int default 0 not null,
  onboarding_complete boolean default false not null,
  created_at timestamptz default now() not null
);

create table if not exists daily_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  log_date date not null,
  steps int,
  miles numeric,
  strength_sets int,
  water_cups int,
  sleep_hours numeric,
  calories_burned int,
  weight_today numeric,
  xp_earned int default 0 not null,
  created_at timestamptz default now() not null,
  unique(user_id, log_date)
);

create table if not exists achievements (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  achievement_key text not null,
  unlocked_at timestamptz default now() not null,
  unique(user_id, achievement_key)
);

create table if not exists quest_completions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  quest_id text not null,
  week_start date not null,
  completed_at timestamptz default now() not null,
  xp_earned int default 0 not null,
  unique(user_id, quest_id, week_start)
);

-- ─────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────

alter table profiles enable row level security;
alter table daily_logs enable row level security;
alter table achievements enable row level security;
alter table quest_completions enable row level security;

-- Profiles policies
create policy "profiles: select own" on profiles
  for select using (auth.uid() = id);

create policy "profiles: insert own" on profiles
  for insert with check (auth.uid() = id);

create policy "profiles: update own" on profiles
  for update using (auth.uid() = id);

-- Daily logs policies
create policy "daily_logs: select own" on daily_logs
  for select using (auth.uid() = user_id);

create policy "daily_logs: insert own" on daily_logs
  for insert with check (auth.uid() = user_id);

create policy "daily_logs: update own" on daily_logs
  for update using (auth.uid() = user_id);

-- Achievements policies
create policy "achievements: select own" on achievements
  for select using (auth.uid() = user_id);

create policy "achievements: insert own" on achievements
  for insert with check (auth.uid() = user_id);

-- Quest completions policies
create policy "quest_completions: select own" on quest_completions
  for select using (auth.uid() = user_id);

create policy "quest_completions: insert own" on quest_completions
  for insert with check (auth.uid() = user_id);
