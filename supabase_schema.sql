-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Presentations Table
create table presentations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  title text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table presentations enable row level security;

-- Policies

-- 1. View: Allow everyone to view presentations (needed for participants to join)
create policy "Anyone can view presentations"
  on presentations for select
  using (true);

-- 2. Insert: Only authenticated users can create
create policy "Users can insert their own presentations"
  on presentations for insert
  with check (auth.uid() = user_id);

-- 3. Update: Only owner can update
create policy "Users can update their own presentations"
  on presentations for update
  using (auth.uid() = user_id);

-- 4. Delete: Only owner can delete
create policy "Users can delete their own presentations"
  on presentations for delete
  using (auth.uid() = user_id);


-- Slides Table
create table slides (
  id uuid default uuid_generate_v4() primary key,
  presentation_id uuid references presentations(id) on delete cascade not null,
  type text not null,
  title text,
  question text not null,
  duration integer default 15,
  enable_reading_timer boolean default false,
  reading_duration integer default 5,
  max_points integer default 1000,
  options jsonb default '[]'::jsonb,
  text_align text default 'center',
  text_color text default '#000000',
  background_color text default '#ffffff',
  "order" integer not null
);

-- Active Sessions Table
create table active_sessions (
  presentation_id uuid references presentations(id) on delete cascade primary key,
  slide_id uuid references slides(id) on delete cascade not null,
  start_time bigint not null,
  phase text default 'ready'
);

-- Votes Table
create table votes (
  id uuid default uuid_generate_v4() primary key,
  presentation_id uuid references presentations(id) on delete cascade not null,
  slide_id uuid references slides(id) on delete cascade not null,
  option_id text not null,
  voter_name text not null,
  timestamp bigint not null,
  time_taken integer
);

-- Enable Realtime
alter publication supabase_realtime add table active_sessions;
alter publication supabase_realtime add table votes;
