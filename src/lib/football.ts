import { supabase } from "@/integrations/supabase/client";

export type CompetitionFormat = "league" | "group_knockout" | "knockout";
export type CompetitionStatus = "draft" | "registration_open" | "in_progress" | "completed";
export type MatchStatus = "scheduled" | "lineup_submitted" | "live" | "finished";
export type MatchEventType =
  | "goal"
  | "assist"
  | "yellow_card"
  | "red_card"
  | "substitution"
  | "penalty";

export const FORMAT_LABEL: Record<CompetitionFormat, string> = {
  league: "League",
  group_knockout: "Group Stage + Knockout",
  knockout: "Full Knockout",
};

export const STATUS_LABEL: Record<CompetitionStatus, string> = {
  draft: "Draft",
  registration_open: "Registration Open",
  in_progress: "In Progress",
  completed: "Completed",
};

export const EVENT_LABEL: Record<MatchEventType, string> = {
  goal: "Goal",
  assist: "Assist",
  yellow_card: "Yellow Card",
  red_card: "Red Card",
  substitution: "Substitution",
  penalty: "Penalty",
};

export type Competition = {
  id: string;
  organizer_id: string;
  name: string;
  slug: string | null;
  logo_url: string | null;
  format: CompetitionFormat;
  age_category: string | null;
  location: string | null;
  entry_fee: number;
  max_teams: number;
  status: CompetitionStatus;
  start_date: string | null;
  description: string | null;
};

export type Team = {
  id: string;
  name: string;
  short_name: string | null;
  city: string | null;
  logo_url: string | null;
};

export type MatchRow = {
  id: string;
  competition_id: string;
  home_team_id: string | null;
  away_team_id: string | null;
  venue: string | null;
  kickoff_at: string | null;
  referee: string | null;
  home_score: number;
  away_score: number;
  status: MatchStatus;
  stage: string | null;
  matchday: number | null;
  home_team: Team | null;
  away_team: Team | null;
};

export type StandingRow = {
  competition_id: string;
  team_id: string;
  team_name: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_diff: number;
  points: number;
};

export type ScorerRow = {
  competition_id: string;
  player_id: string;
  player_name: string;
  position: string | null;
  team_name: string | null;
  goals: number;
  assists: number;
  yellow_cards: number;
  red_cards: number;
};

const MATCH_SELECT =
  "*, home_team:teams!matches_home_team_id_fkey(id,name,short_name,city,logo_url), away_team:teams!matches_away_team_id_fkey(id,name,short_name,city,logo_url)";

function unwrap<T>(res: { data: unknown; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return (res.data ?? []) as T;
}

export const competitionsQuery = {
  queryKey: ["competitions"],
  queryFn: async () =>
    unwrap<Competition[]>(
      await supabase.from("competitions").select("*").order("start_date", { ascending: true }),
    ),
};

export const teamsQuery = {
  queryKey: ["teams"],
  queryFn: async () => unwrap<Team[]>(await supabase.from("teams").select("*").order("name")),
};

export const allMatchesQuery = {
  queryKey: ["matches", "all"],
  queryFn: async () =>
    unwrap<MatchRow[]>(
      await supabase
        .from("matches")
        .select(MATCH_SELECT)
        .order("kickoff_at", { ascending: true })
        .limit(100),
    ),
};

export function competitionQuery(id: string) {
  return {
    queryKey: ["competition", id],
    queryFn: async () => {
      const res = await supabase.from("competitions").select("*").eq("id", id).maybeSingle();
      if (res.error) throw new Error(res.error.message);
      return res.data as Competition | null;
    },
  };
}

export function matchesQuery(competitionId: string) {
  return {
    queryKey: ["matches", competitionId],
    queryFn: async () =>
      unwrap<MatchRow[]>(
        await supabase
          .from("matches")
          .select(MATCH_SELECT)
          .eq("competition_id", competitionId)
          .order("kickoff_at", { ascending: true }),
      ),
  };
}

export function standingsQuery(competitionId: string) {
  return {
    queryKey: ["standings", competitionId],
    queryFn: async () =>
      unwrap<StandingRow[]>(
        await supabase
          .from("standings_view")
          .select("*")
          .eq("competition_id", competitionId)
          .order("points", { ascending: false })
          .order("goal_diff", { ascending: false }),
      ),
  };
}

export function scorersQuery(competitionId: string) {
  return {
    queryKey: ["scorers", competitionId],
    queryFn: async () =>
      unwrap<ScorerRow[]>(
        await supabase
          .from("top_scorers_view")
          .select("*")
          .eq("competition_id", competitionId)
          .order("goals", { ascending: false })
          .limit(10),
      ),
  };
}

export type RegistrationRow = {
  id: string;
  competition_id: string;
  team_id: string;
  status: "pending" | "approved" | "rejected";
  group_name: string | null;
  payment_proof_url: string | null;
  teams: Team | null;
};

export function registrationsQuery(competitionId: string) {
  return {
    queryKey: ["registrations", competitionId],
    queryFn: async () =>
      unwrap<RegistrationRow[]>(
        await supabase
          .from("competition_registrations")
          .select("*, teams(id,name,short_name,city,logo_url)")
          .eq("competition_id", competitionId)
          .order("created_at"),
      ),
  };
}

export function playersQuery(teamIds: string[]) {
  return {
    queryKey: ["players", teamIds.join(",")],
    queryFn: async () => {
      if (teamIds.length === 0) return [];
      return unwrap<
        {
          id: string;
          team_id: string;
          full_name: string;
          position: string | null;
          jersey_number: number | null;
          birth_date: string | null;
          verified: boolean;
        }[]
      >(await supabase.from("team_players").select("*").in("team_id", teamIds).order("full_name"));
    },
  };
}

export function matchEventsQuery(matchId: string) {
  return {
    queryKey: ["match-events", matchId],
    queryFn: async () =>
      unwrap<
        {
          id: string;
          match_id: string;
          team_id: string | null;
          player_id: string | null;
          minute: number | null;
          event_type: MatchEventType;
          team_players: { full_name: string } | null;
          teams: { name: string } | null;
        }[]
      >(
        await supabase
          .from("match_events")
          .select("*, team_players(full_name), teams(name)")
          .eq("match_id", matchId)
          .order("minute", { ascending: false }),
      ),
  };
}

export function myOrganizerQuery(userId: string | undefined) {
  return {
    queryKey: ["my-organizer", userId],
    enabled: !!userId,
    queryFn: async () => {
      const res = await supabase
        .from("event_organizers")
        .select("*")
        .eq("owner_id", userId!)
        .maybeSingle();
      if (res.error) throw new Error(res.error.message);
      return res.data as {
        id: string;
        name: string;
        contact_email: string | null;
        status: string;
      } | null;
    },
  };
}

/** Round-robin fixture generator (circle method). */
export function generateRoundRobin(teamIds: string[]) {
  const ids = [...teamIds];
  if (ids.length % 2 === 1) ids.push("__bye__");
  const rounds: { home: string; away: string; matchday: number }[] = [];
  const n = ids.length;
  for (let round = 0; round < n - 1; round++) {
    for (let i = 0; i < n / 2; i++) {
      const home = ids[i]!;
      const away = ids[n - 1 - i]!;
      if (home !== "__bye__" && away !== "__bye__") {
        rounds.push(
          round % 2 === 0
            ? { home, away, matchday: round + 1 }
            : { home: away, away: home, matchday: round + 1 },
        );
      }
    }
    ids.splice(1, 0, ids.pop()!);
  }
  return rounds;
}

export function formatKickoff(value: string | null) {
  if (!value) return "TBD";
  return new Date(value).toLocaleString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export type PlayerRow = {
  id: string;
  team_id: string;
  full_name: string;
  position: string | null;
  jersey_number: number | null;
  birth_date: string | null;
  photo_url: string | null;
  verified: boolean;
};

export function teamQuery(id: string) {
  return {
    queryKey: ["team", id],
    queryFn: async () => {
      const res = await supabase.from("teams").select("*").eq("id", id).maybeSingle();
      if (res.error) throw new Error(res.error.message);
      return res.data as (Team & { manager_id: string | null }) | null;
    },
  };
}

export function teamPlayersQuery(teamId: string) {
  return {
    queryKey: ["team-players", teamId],
    queryFn: async () =>
      unwrap<PlayerRow[]>(
        await supabase
          .from("team_players")
          .select("*")
          .eq("team_id", teamId)
          .order("jersey_number", { ascending: true }),
      ),
  };
}

export function teamMatchesQuery(teamId: string) {
  return {
    queryKey: ["team-matches", teamId],
    queryFn: async () =>
      unwrap<MatchRow[]>(
        await supabase
          .from("matches")
          .select(MATCH_SELECT)
          .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
          .order("kickoff_at", { ascending: true }),
      ),
  };
}

export function teamRegistrationsQuery(teamId: string) {
  return {
    queryKey: ["team-registrations", teamId],
    queryFn: async () =>
      unwrap<{ id: string; status: string; competitions: Competition | null }[]>(
        await supabase
          .from("competition_registrations")
          .select("id,status,competitions(*)")
          .eq("team_id", teamId),
      ),
  };
}

export function playerQuery(id: string) {
  return {
    queryKey: ["player", id],
    queryFn: async () => {
      const res = await supabase
        .from("team_players")
        .select("*, teams(id,name,short_name,city,logo_url)")
        .eq("id", id)
        .maybeSingle();
      if (res.error) throw new Error(res.error.message);
      return res.data as (PlayerRow & { teams: Team | null }) | null;
    },
  };
}

export function playerEventsQuery(playerId: string) {
  return {
    queryKey: ["player-events", playerId],
    queryFn: async () =>
      unwrap<{ id: string; event_type: MatchEventType; minute: number | null }[]>(
        await supabase.from("match_events").select("id,event_type,minute").eq("player_id", playerId),
      ),
  };
}

export function competitionTeamsQuery(competitionId: string) {
  return {
    queryKey: ["competition-teams", competitionId],
    queryFn: async () =>
      unwrap<{ id: string; status: string; group_name: string | null; teams: Team | null }[]>(
        await supabase
          .from("competition_registrations")
          .select("id,status,group_name,teams(id,name,short_name,city,logo_url)")
          .eq("competition_id", competitionId)
          .eq("status", "approved"),
      ),
  };
}

export const organizersQuery = {
  queryKey: ["organizers", "public"],
  queryFn: async () =>
    unwrap<{ id: string; name: string; status: string }[]>(
      await supabase.from("event_organizers").select("id,name,status").order("name"),
    ),
};
