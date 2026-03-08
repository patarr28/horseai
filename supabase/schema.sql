-- Supabase Schema for Festival Whisperer 3.0

-- 1. Extend auth.users with a public profiles table
create table public.user_profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text unique,
  avatar_url text,
  total_roi numeric(10, 2) default 0.00,
  win_rate numeric(5, 2) default 0.00,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.user_profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on user_profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on user_profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on user_profiles for update
  using ( auth.uid() = id );

-- Function to automatically create a profile when sign up
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.user_profiles (id, username)
  values (new.id, new.raw_user_meta_data->>'username');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Bets Table
create table public.bets (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.user_profiles(id) on delete cascade not null,
  stake numeric(10, 2) not null,
  potential_return numeric(10, 2) not null,
  combined_odds numeric(10, 2) not null,
  status text check (status in ('pending', 'won', 'lost', 'cashed_out')) default 'pending',
  legs jsonb not null, -- Stores array of horses and odds
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.bets enable row level security;

create policy "Users can view their own bets."
  on bets for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own bets."
  on bets for insert
  with check ( auth.uid() = user_id );

-- 3. Leaderboard View / Table
-- We can create a materialized view or a standard view for the leaderboard based on user_profiles
create view public.leaderboard as
select 
  id as user_id,
  username,
  avatar_url,
  total_roi,
  win_rate
from public.user_profiles
order by total_roi desc;

-- Setup complete.
