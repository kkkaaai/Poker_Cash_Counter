-- Run this in the Supabase SQL Editor to set up your tables

-- Players table
create table if not exists players (
  id uuid default gen_random_uuid() primary key,
  name text unique not null,
  cashout integer,
  created_at timestamptz default now()
);

-- Transactions (buy-ins)
create table if not exists transactions (
  id uuid default gen_random_uuid() primary key,
  player_id uuid references players(id) on delete cascade not null,
  amount integer not null,
  status text default 'pending' check (status in ('pending', 'confirmed')),
  created_at timestamptz default now()
);

-- Game session
create table if not exists game_session (
  id uuid default gen_random_uuid() primary key,
  status text default 'active' check (status in ('active', 'settled')),
  created_at timestamptz default now()
);

-- Enable Row Level Security (permissive for no-auth setup)
alter table players enable row level security;
alter table transactions enable row level security;
alter table game_session enable row level security;

create policy "Allow all on players" on players for all using (true) with check (true);
create policy "Allow all on transactions" on transactions for all using (true) with check (true);
create policy "Allow all on game_session" on game_session for all using (true) with check (true);

-- Enable real-time
alter publication supabase_realtime add table players;
alter publication supabase_realtime add table transactions;

-- Insert initial active session
insert into game_session (status) values ('active');
