-- ENUMS
create type public.app_role as enum ('super_admin','organizer','team_manager');
create type public.competition_format as enum ('league','group_knockout','knockout');
create type public.competition_status as enum ('draft','registration_open','in_progress','completed');
create type public.registration_status as enum ('pending','approved','rejected');
create type public.match_status as enum ('scheduled','lineup_submitted','live','finished');
create type public.match_event_type as enum ('goal','assist','yellow_card','red_card','substitution','penalty');

-- PROFILES
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant select on public.profiles to anon;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "profiles public read" on public.profiles for select using (true);
create policy "profiles self write" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "profiles self update" on public.profiles for update to authenticated using (auth.uid() = id);

-- ROLES
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "roles self read" on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(),'super_admin'));

-- signup trigger
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)), new.email)
  on conflict (id) do nothing;
  insert into public.user_roles (user_id, role)
  values (new.id, coalesce((new.raw_user_meta_data->>'role')::public.app_role, 'team_manager'))
  on conflict do nothing;
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ORGANIZERS
create table public.event_organizers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete set null,
  name text not null,
  contact_email text,
  logo_url text,
  status text not null default 'approved',
  created_at timestamptz not null default now()
);
grant select on public.event_organizers to anon;
grant select, insert, update, delete on public.event_organizers to authenticated;
grant all on public.event_organizers to service_role;
alter table public.event_organizers enable row level security;
create policy "organizers public read" on public.event_organizers for select using (true);
create policy "organizers owner insert" on public.event_organizers for insert to authenticated with check (owner_id = auth.uid());
create policy "organizers owner update" on public.event_organizers for update to authenticated
  using (owner_id = auth.uid() or public.has_role(auth.uid(),'super_admin'));
create policy "organizers admin delete" on public.event_organizers for delete to authenticated
  using (public.has_role(auth.uid(),'super_admin'));

-- COMPETITIONS
create table public.competitions (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid not null references public.event_organizers(id) on delete cascade,
  name text not null,
  slug text unique,
  logo_url text,
  format public.competition_format not null default 'league',
  age_category text,
  location text,
  entry_fee numeric(10,2) not null default 0,
  max_teams integer not null default 16,
  status public.competition_status not null default 'draft',
  start_date date,
  end_date date,
  description text,
  created_at timestamptz not null default now()
);
grant select on public.competitions to anon;
grant select, insert, update, delete on public.competitions to authenticated;
grant all on public.competitions to service_role;
alter table public.competitions enable row level security;

create or replace function public.owns_competition(_competition_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.competitions c
    join public.event_organizers o on o.id = c.organizer_id
    where c.id = _competition_id and (o.owner_id = auth.uid() or public.has_role(auth.uid(),'super_admin'))
  )
$$;
create or replace function public.owns_organizer(_organizer_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.event_organizers o
    where o.id = _organizer_id and (o.owner_id = auth.uid() or public.has_role(auth.uid(),'super_admin'))
  )
$$;

create policy "competitions public read" on public.competitions for select using (true);
create policy "competitions owner insert" on public.competitions for insert to authenticated with check (public.owns_organizer(organizer_id));
create policy "competitions owner update" on public.competitions for update to authenticated using (public.owns_organizer(organizer_id));
create policy "competitions owner delete" on public.competitions for delete to authenticated using (public.owns_organizer(organizer_id));

-- TEAMS
create table public.teams (
  id uuid primary key default gen_random_uuid(),
  manager_id uuid references auth.users(id) on delete set null,
  name text not null,
  short_name text,
  city text,
  logo_url text,
  created_at timestamptz not null default now()
);
grant select on public.teams to anon;
grant select, insert, update, delete on public.teams to authenticated;
grant all on public.teams to service_role;
alter table public.teams enable row level security;
create policy "teams public read" on public.teams for select using (true);
create policy "teams manager insert" on public.teams for insert to authenticated with check (manager_id = auth.uid());
create policy "teams manager update" on public.teams for update to authenticated
  using (manager_id = auth.uid() or public.has_role(auth.uid(),'super_admin'));
create policy "teams manager delete" on public.teams for delete to authenticated
  using (manager_id = auth.uid() or public.has_role(auth.uid(),'super_admin'));

-- PLAYERS
create table public.team_players (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  full_name text not null,
  birth_date date,
  position text,
  jersey_number integer,
  photo_url text,
  id_document_url text,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);
grant select on public.team_players to anon;
grant select, insert, update, delete on public.team_players to authenticated;
grant all on public.team_players to service_role;
alter table public.team_players enable row level security;

create or replace function public.manages_team(_team_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.teams t
    where t.id = _team_id and (t.manager_id = auth.uid() or public.has_role(auth.uid(),'super_admin'))
  )
$$;

create policy "players public read" on public.team_players for select using (true);
create policy "players manager insert" on public.team_players for insert to authenticated with check (public.manages_team(team_id));
create policy "players manager update" on public.team_players for update to authenticated using (public.manages_team(team_id));
create policy "players manager delete" on public.team_players for delete to authenticated using (public.manages_team(team_id));

-- REGISTRATIONS
create table public.competition_registrations (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  status public.registration_status not null default 'pending',
  group_name text,
  payment_proof_url text,
  notes text,
  created_at timestamptz not null default now(),
  unique (competition_id, team_id)
);
grant select on public.competition_registrations to anon;
grant select, insert, update, delete on public.competition_registrations to authenticated;
grant all on public.competition_registrations to service_role;
alter table public.competition_registrations enable row level security;
create policy "registrations public read" on public.competition_registrations for select using (true);
create policy "registrations team insert" on public.competition_registrations for insert to authenticated with check (public.manages_team(team_id));
create policy "registrations update" on public.competition_registrations for update to authenticated
  using (public.owns_competition(competition_id) or public.manages_team(team_id));
create policy "registrations delete" on public.competition_registrations for delete to authenticated
  using (public.owns_competition(competition_id) or public.manages_team(team_id));

-- PAYMENTS
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.competition_registrations(id) on delete cascade,
  amount numeric(10,2) not null default 0,
  status text not null default 'pending',
  proof_url text,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.payments to authenticated;
grant all on public.payments to service_role;
alter table public.payments enable row level security;
create policy "payments participant read" on public.payments for select to authenticated using (
  exists (select 1 from public.competition_registrations r where r.id = registration_id
    and (public.owns_competition(r.competition_id) or public.manages_team(r.team_id)))
);
create policy "payments team insert" on public.payments for insert to authenticated with check (
  exists (select 1 from public.competition_registrations r where r.id = registration_id and public.manages_team(r.team_id))
);
create policy "payments organizer update" on public.payments for update to authenticated using (
  exists (select 1 from public.competition_registrations r where r.id = registration_id and public.owns_competition(r.competition_id))
);

-- MATCHES
create table public.matches (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions(id) on delete cascade,
  home_team_id uuid references public.teams(id) on delete set null,
  away_team_id uuid references public.teams(id) on delete set null,
  venue text,
  kickoff_at timestamptz,
  referee text,
  home_score integer not null default 0,
  away_score integer not null default 0,
  status public.match_status not null default 'scheduled',
  stage text default 'Group Stage',
  matchday integer,
  created_at timestamptz not null default now()
);
grant select on public.matches to anon;
grant select, insert, update, delete on public.matches to authenticated;
grant all on public.matches to service_role;
alter table public.matches enable row level security;
create policy "matches public read" on public.matches for select using (true);
create policy "matches owner insert" on public.matches for insert to authenticated with check (public.owns_competition(competition_id));
create policy "matches owner update" on public.matches for update to authenticated using (public.owns_competition(competition_id));
create policy "matches owner delete" on public.matches for delete to authenticated using (public.owns_competition(competition_id));

-- MATCH EVENTS
create table public.match_events (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  team_id uuid references public.teams(id) on delete set null,
  player_id uuid references public.team_players(id) on delete set null,
  minute integer,
  event_type public.match_event_type not null,
  note text,
  created_at timestamptz not null default now()
);
grant select on public.match_events to anon;
grant select, insert, update, delete on public.match_events to authenticated;
grant all on public.match_events to service_role;
alter table public.match_events enable row level security;

create or replace function public.owns_match(_match_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.matches m where m.id = _match_id and public.owns_competition(m.competition_id))
$$;

create policy "events public read" on public.match_events for select using (true);
create policy "events owner insert" on public.match_events for insert to authenticated with check (public.owns_match(match_id));
create policy "events owner update" on public.match_events for update to authenticated using (public.owns_match(match_id));
create policy "events owner delete" on public.match_events for delete to authenticated using (public.owns_match(match_id));

-- MATCH LINEUPS
create table public.match_lineups (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  player_id uuid not null references public.team_players(id) on delete cascade,
  is_starter boolean not null default true,
  shirt_position text,
  created_at timestamptz not null default now(),
  unique (match_id, player_id)
);
grant select on public.match_lineups to anon;
grant select, insert, update, delete on public.match_lineups to authenticated;
grant all on public.match_lineups to service_role;
alter table public.match_lineups enable row level security;
create policy "lineups public read" on public.match_lineups for select using (true);
create policy "lineups write" on public.match_lineups for insert to authenticated
  with check (public.manages_team(team_id) or public.owns_match(match_id));
create policy "lineups update" on public.match_lineups for update to authenticated
  using (public.manages_team(team_id) or public.owns_match(match_id));
create policy "lineups delete" on public.match_lineups for delete to authenticated
  using (public.manages_team(team_id) or public.owns_match(match_id));

-- STANDINGS VIEW
create view public.standings_view as
with played as (
  select competition_id, home_team_id as team_id, home_score as gf, away_score as ga from public.matches where status = 'finished' and home_team_id is not null
  union all
  select competition_id, away_team_id as team_id, away_score as gf, home_score as ga from public.matches where status = 'finished' and away_team_id is not null
)
select
  p.competition_id,
  p.team_id,
  t.name as team_name,
  t.logo_url,
  count(*)::int as played,
  count(*) filter (where gf > ga)::int as wins,
  count(*) filter (where gf = ga)::int as draws,
  count(*) filter (where gf < ga)::int as losses,
  coalesce(sum(gf),0)::int as goals_for,
  coalesce(sum(ga),0)::int as goals_against,
  (coalesce(sum(gf),0) - coalesce(sum(ga),0))::int as goal_diff,
  (count(*) filter (where gf > ga) * 3 + count(*) filter (where gf = ga))::int as points
from played p join public.teams t on t.id = p.team_id
group by p.competition_id, p.team_id, t.name, t.logo_url;
grant select on public.standings_view to anon, authenticated, service_role;

-- TOP SCORERS VIEW
create view public.top_scorers_view as
select
  m.competition_id,
  e.player_id,
  pl.full_name as player_name,
  pl.photo_url,
  pl.position,
  t.name as team_name,
  count(*) filter (where e.event_type in ('goal','penalty'))::int as goals,
  count(*) filter (where e.event_type = 'assist')::int as assists,
  count(*) filter (where e.event_type = 'yellow_card')::int as yellow_cards,
  count(*) filter (where e.event_type = 'red_card')::int as red_cards
from public.match_events e
join public.matches m on m.id = e.match_id
join public.team_players pl on pl.id = e.player_id
left join public.teams t on t.id = e.team_id
group by m.competition_id, e.player_id, pl.full_name, pl.photo_url, pl.position, t.name;
grant select on public.top_scorers_view to anon, authenticated, service_role;

-- SEED
insert into public.event_organizers (id, name, contact_email, status) values
  ('11111111-1111-1111-1111-111111111111','Verde Sports Events','hello@verdesports.example','approved');

insert into public.competitions (id, organizer_id, name, slug, format, age_category, location, entry_fee, max_teams, status, start_date, description) values
  ('22222222-2222-2222-2222-222222222222','11111111-1111-1111-1111-111111111111','Summer Break Cup 2026','summer-break-cup-2026','group_knockout','U-19','Stadium Verde',120,24,'in_progress','2026-06-01','Regional youth cup with group stage and knockout finals.'),
  ('22222222-2222-2222-2222-222222222223','11111111-1111-1111-1111-111111111111','City Winter League','city-winter-league','league','Open','Northgate Arena',90,12,'registration_open','2026-11-10','Open-age winter league played over 11 matchdays.');

insert into public.teams (id, name, short_name, city) values
  ('33333333-3333-3333-3333-333333333331','Northgate FC','NOR','Northgate'),
  ('33333333-3333-3333-3333-333333333332','Riverside United','RIV','Riverside'),
  ('33333333-3333-3333-3333-333333333333','Cedar Park SC','CED','Cedar Park'),
  ('33333333-3333-3333-3333-333333333334','Halcyon Athletic','HAL','Halcyon'),
  ('33333333-3333-3333-3333-333333333335','Marlowe Rovers','MAR','Marlowe');

insert into public.competition_registrations (competition_id, team_id, status, group_name) values
  ('22222222-2222-2222-2222-222222222222','33333333-3333-3333-3333-333333333331','approved','Group A'),
  ('22222222-2222-2222-2222-222222222222','33333333-3333-3333-3333-333333333332','approved','Group A'),
  ('22222222-2222-2222-2222-222222222222','33333333-3333-3333-3333-333333333333','approved','Group A'),
  ('22222222-2222-2222-2222-222222222222','33333333-3333-3333-3333-333333333334','approved','Group A'),
  ('22222222-2222-2222-2222-222222222222','33333333-3333-3333-3333-333333333335','pending','Group A');

insert into public.team_players (id, team_id, full_name, birth_date, position, jersey_number, verified) values
  ('44444444-4444-4444-4444-444444444441','33333333-3333-3333-3333-333333333331','L. Okonkwo','2008-03-12','Forward',9,true),
  ('44444444-4444-4444-4444-444444444442','33333333-3333-3333-3333-333333333331','S. Petrov','2008-07-02','Midfielder',8,true),
  ('44444444-4444-4444-4444-444444444443','33333333-3333-3333-3333-333333333332','D. Ferreira','2008-01-25','Midfielder',10,true),
  ('44444444-4444-4444-4444-444444444444','33333333-3333-3333-3333-333333333332','K. Bauer','2009-05-19','Defender',4,true),
  ('44444444-4444-4444-4444-444444444445','33333333-3333-3333-3333-333333333333','A. Novak','2008-09-30','Forward',7,true),
  ('44444444-4444-4444-4444-444444444446','33333333-3333-3333-3333-333333333334','M. Haddad','2008-11-08','Goalkeeper',1,true);

insert into public.matches (id, competition_id, home_team_id, away_team_id, venue, kickoff_at, referee, home_score, away_score, status, stage, matchday) values
  ('55555555-5555-5555-5555-555555555551','22222222-2222-2222-2222-222222222222','33333333-3333-3333-3333-333333333331','33333333-3333-3333-3333-333333333332','Stadium Verde','2026-06-02 14:00+00','A. Okafor',3,1,'finished','Group Stage',1),
  ('55555555-5555-5555-5555-555555555552','22222222-2222-2222-2222-222222222222','33333333-3333-3333-3333-333333333333','33333333-3333-3333-3333-333333333334','Stadium Verde','2026-06-02 16:30+00','J. Mendez',2,2,'finished','Group Stage',1),
  ('55555555-5555-5555-5555-555555555553','22222222-2222-2222-2222-222222222222','33333333-3333-3333-3333-333333333332','33333333-3333-3333-3333-333333333333','Northgate Arena','2026-06-09 14:00+00','A. Okafor',2,0,'finished','Group Stage',2),
  ('55555555-5555-5555-5555-555555555554','22222222-2222-2222-2222-222222222222','33333333-3333-3333-3333-333333333334','33333333-3333-3333-3333-333333333331','Stadium Verde','2026-06-09 16:30+00','P. Larsen',0,4,'finished','Group Stage',2),
  ('55555555-5555-5555-5555-555555555555','22222222-2222-2222-2222-222222222222','33333333-3333-3333-3333-333333333331','33333333-3333-3333-3333-333333333333','Stadium Verde','2026-06-16 14:00+00','J. Mendez',0,0,'scheduled','Group Stage',3),
  ('55555555-5555-5555-5555-555555555556','22222222-2222-2222-2222-222222222222','33333333-3333-3333-3333-333333333332','33333333-3333-3333-3333-333333333334','Northgate Arena','2026-06-16 16:30+00','P. Larsen',0,0,'scheduled','Group Stage',3);

insert into public.match_events (match_id, team_id, player_id, minute, event_type) values
  ('55555555-5555-5555-5555-555555555551','33333333-3333-3333-3333-333333333331','44444444-4444-4444-4444-444444444441',12,'goal'),
  ('55555555-5555-5555-5555-555555555551','33333333-3333-3333-3333-333333333331','44444444-4444-4444-4444-444444444441',38,'goal'),
  ('55555555-5555-5555-5555-555555555551','33333333-3333-3333-3333-333333333331','44444444-4444-4444-4444-444444444442',55,'assist'),
  ('55555555-5555-5555-5555-555555555551','33333333-3333-3333-3333-333333333331','44444444-4444-4444-4444-444444444442',67,'goal'),
  ('55555555-5555-5555-5555-555555555551','33333333-3333-3333-3333-333333333332','44444444-4444-4444-4444-444444444443',72,'goal'),
  ('55555555-5555-5555-5555-555555555551','33333333-3333-3333-3333-333333333332','44444444-4444-4444-4444-444444444444',80,'yellow_card'),
  ('55555555-5555-5555-5555-555555555552','33333333-3333-3333-3333-333333333333','44444444-4444-4444-4444-444444444445',20,'goal'),
  ('55555555-5555-5555-5555-555555555552','33333333-3333-3333-3333-333333333333','44444444-4444-4444-4444-444444444445',61,'goal'),
  ('55555555-5555-5555-5555-555555555552','33333333-3333-3333-3333-333333333334','44444444-4444-4444-4444-444444444446',85,'yellow_card'),
  ('55555555-5555-5555-5555-555555555553','33333333-3333-3333-3333-333333333332','44444444-4444-4444-4444-444444444443',30,'goal'),
  ('55555555-5555-5555-5555-555555555553','33333333-3333-3333-3333-333333333332','44444444-4444-4444-4444-444444444443',77,'goal'),
  ('55555555-5555-5555-5555-555555555554','33333333-3333-3333-3333-333333333331','44444444-4444-4444-4444-444444444441',5,'goal'),
  ('55555555-5555-5555-5555-555555555554','33333333-3333-3333-3333-333333333331','44444444-4444-4444-4444-444444444441',44,'goal'),
  ('55555555-5555-5555-5555-555555555554','33333333-3333-3333-3333-333333333331','44444444-4444-4444-4444-444444444442',58,'goal'),
  ('55555555-5555-5555-5555-555555555554','33333333-3333-3333-3333-333333333331','44444444-4444-4444-4444-444444444442',90,'goal');