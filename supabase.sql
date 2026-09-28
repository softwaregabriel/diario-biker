-- Diario Casal na Rota — V1.2
-- Cole este SQL no SQL Editor do seu projeto Supabase e execute.
-- Depois, configure a Project URL e a Publishable key no arquivo supabase-config.js.

create table if not exists public.trips (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default '',
  date date,
  km numeric not null default 0,
  origin text not null default '',
  destination text not null default '',
  notes text not null default '',
  expenses jsonb not null default '[]'::jsonb,
  status text not null default 'realizada',
  bike_id text,
  updated_at timestamptz not null default now()
);

create table if not exists public.bikes (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default '',
  year text not null default '',
  consumption numeric not null default 0,
  status text not null default 'comigo',
  acquired date,
  sold date,
  purchase numeric not null default 0,
  sale numeric not null default 0,
  notes text not null default '',
  photo text,
  updated_at timestamptz not null default now()
);

alter table public.trips enable row level security;
alter table public.bikes enable row level security;

revoke all on table public.trips from anon;
revoke all on table public.bikes from anon;
grant select, insert, update, delete on table public.trips to authenticated;
grant select, insert, update, delete on table public.bikes to authenticated;

drop policy if exists "casal trips select" on public.trips;
drop policy if exists "casal trips insert" on public.trips;
drop policy if exists "casal trips update" on public.trips;
drop policy if exists "casal trips delete" on public.trips;
create policy "casal trips select" on public.trips for select to authenticated using ((select auth.uid()) = user_id);
create policy "casal trips insert" on public.trips for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "casal trips update" on public.trips for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "casal trips delete" on public.trips for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "casal bikes select" on public.bikes;
drop policy if exists "casal bikes insert" on public.bikes;
drop policy if exists "casal bikes update" on public.bikes;
drop policy if exists "casal bikes delete" on public.bikes;
create policy "casal bikes select" on public.bikes for select to authenticated using ((select auth.uid()) = user_id);
create policy "casal bikes insert" on public.bikes for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "casal bikes update" on public.bikes for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "casal bikes delete" on public.bikes for delete to authenticated using ((select auth.uid()) = user_id);

create index if not exists trips_user_id_idx on public.trips(user_id);
create index if not exists bikes_user_id_idx on public.bikes(user_id);


-- Rota Biker: carimbos pessoais por monumento
create table if not exists public.route_stamps (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  monument_number integer not null,
  stamped boolean not null default false,
  stamped_at timestamptz,
  updated_at timestamptz not null default now(),
  unique(user_id, monument_number)
);

alter table public.route_stamps enable row level security;
revoke all on table public.route_stamps from anon;
grant select, insert, update, delete on table public.route_stamps to authenticated;
drop policy if exists "casal route stamps select" on public.route_stamps;
drop policy if exists "casal route stamps insert" on public.route_stamps;
drop policy if exists "casal route stamps update" on public.route_stamps;
drop policy if exists "casal route stamps delete" on public.route_stamps;
create policy "casal route stamps select" on public.route_stamps for select to authenticated using ((select auth.uid()) = user_id);
create policy "casal route stamps insert" on public.route_stamps for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "casal route stamps update" on public.route_stamps for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "casal route stamps delete" on public.route_stamps for delete to authenticated using ((select auth.uid()) = user_id);
create index if not exists route_stamps_user_id_idx on public.route_stamps(user_id);
