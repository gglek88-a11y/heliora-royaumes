create table if not exists public.heliora_server_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null default '',
  name text not null default 'Commandant',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.heliora_server_guilds (
  id text primary key,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  tag text not null unique,
  description text not null default '',
  power integer not null default 0,
  score integer not null default 0,
  member_count integer not null default 1,
  is_open boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.heliora_server_kingdoms (
  id text primary key,
  owner_user_id uuid not null unique references auth.users(id) on delete cascade,
  name text not null,
  capital_name text not null,
  region text not null default 'foret_mystique',
  hero_id text not null default 'maelis',
  level integer not null default 1,
  power integer not null default 80,
  resources jsonb not null default '{}'::jsonb,
  buildings jsonb not null default '{"castle": 1}'::jsonb,
  units jsonb not null default '{}'::jsonb,
  training jsonb not null default '[]'::jsonb,
  event_progress jsonb not null default '{}'::jsonb,
  claimed_rewards jsonb not null default '[]'::jsonb,
  guild_id text references public.heliora_server_guilds(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.heliora_server_guild_members (
  guild_id text not null references public.heliora_server_guilds(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  player_id text not null,
  name text not null default 'Commandant',
  role text not null default 'member' check (role in ('leader', 'officer', 'member', 'recruit')),
  kingdom_power integer not null default 0,
  contribution integer not null default 0,
  joined_at timestamptz not null default now(),
  primary key (guild_id, user_id)
);

create table if not exists public.heliora_server_guild_invites (
  id text primary key,
  guild_id text not null references public.heliora_server_guilds(id) on delete cascade,
  invited_email text not null,
  invited_user_id uuid references auth.users(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists public.heliora_server_actions (
  user_id uuid not null references auth.users(id) on delete cascade,
  idempotency_key text not null,
  result jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  primary key (user_id, idempotency_key)
);

create table if not exists public.heliora_server_audit_logs (
  id text primary key,
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.heliora_server_live_events (
  id text primary key,
  name text not null,
  tag text not null default 'LIVE',
  goal integer not null default 1000,
  reward jsonb not null default '{}'::jsonb,
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null default now() + interval '24 hours',
  active boolean not null default true
);

create index if not exists heliora_server_kingdoms_power_idx
on public.heliora_server_kingdoms (power desc);

create index if not exists heliora_server_guilds_power_idx
on public.heliora_server_guilds (power desc);

create index if not exists heliora_server_guild_members_user_idx
on public.heliora_server_guild_members (user_id);

create index if not exists heliora_server_guild_invites_email_idx
on public.heliora_server_guild_invites (invited_email, status);

alter table public.heliora_server_profiles enable row level security;
alter table public.heliora_server_kingdoms enable row level security;
alter table public.heliora_server_guilds enable row level security;
alter table public.heliora_server_guild_members enable row level security;
alter table public.heliora_server_guild_invites enable row level security;
alter table public.heliora_server_actions enable row level security;
alter table public.heliora_server_audit_logs enable row level security;
alter table public.heliora_server_live_events enable row level security;

drop policy if exists "server profiles own read" on public.heliora_server_profiles;
drop policy if exists "server kingdoms own read" on public.heliora_server_kingdoms;
drop policy if exists "server guilds authenticated read" on public.heliora_server_guilds;
drop policy if exists "server guild members authenticated read" on public.heliora_server_guild_members;
drop policy if exists "server guild invites related read" on public.heliora_server_guild_invites;
drop policy if exists "server live events public read" on public.heliora_server_live_events;

create policy "server profiles own read"
on public.heliora_server_profiles
for select
to authenticated
using (user_id = auth.uid());

create policy "server kingdoms own read"
on public.heliora_server_kingdoms
for select
to authenticated
using (owner_user_id = auth.uid());

create policy "server guilds authenticated read"
on public.heliora_server_guilds
for select
to authenticated
using (true);

create policy "server guild members authenticated read"
on public.heliora_server_guild_members
for select
to authenticated
using (true);

create policy "server guild invites related read"
on public.heliora_server_guild_invites
for select
to authenticated
using (
  invited_user_id = auth.uid()
  or lower(invited_email) = lower(auth.jwt() ->> 'email')
  or created_by = auth.uid()
);

create policy "server live events public read"
on public.heliora_server_live_events
for select
to authenticated
using (active = true);

insert into public.heliora_server_live_events (id, name, tag, goal, reward, starts_at, ends_at, active)
values
  ('ball_carnival', 'Carnaval solaire', 'LIVE', 900, '{"gold":900,"food":600,"gems":80}'::jsonb, now(), now() + interval '24 hours', true),
  ('guild_expedition', 'Expedition de guilde', 'GUILDE', 700, '{"stone":700,"wood":700,"guildCoins":120}'::jsonb, now(), now() + interval '24 hours', true)
on conflict (id) do update
set
  name = excluded.name,
  tag = excluded.tag,
  goal = excluded.goal,
  reward = excluded.reward,
  ends_at = excluded.ends_at,
  active = excluded.active;
