import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { SiteShell, Empty } from "@/components/SiteShell";
import {
  competitionQuery,
  matchesQuery,
  standingsQuery,
  scorersQuery,
  competitionTeamsQuery,
  formatKickoff,
  FORMAT_LABEL,
  STATUS_LABEL,
  type MatchRow,
} from "@/lib/football";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/competitions/$id")({
  head: () => ({
    meta: [
      { title: "Competition Hub — PitchForge" },
      {
        name: "description",
        content:
          "Standings, fixtures, results, squads and top scorers for this football competition.",
      },
      { property: "og:title", content: "Competition Hub — PitchForge" },
      {
        property: "og:description",
        content: "Live standings, fixtures, results and top scorers.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CompetitionDetail,
});

const TABS = ["Standings", "Fixtures", "Results", "Teams", "Top scorers"] as const;

function TeamLink({ team }: { team: MatchRow["home_team"] }) {
  if (!team) return <span className="text-muted-foreground">TBD</span>;
  return (
    <Link to="/teams/$id" params={{ id: team.id }} className="hover:text-primary">
      {team.name}
    </Link>
  );
}

function CompetitionDetail() {
  const { id } = Route.useParams();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Standings");
  const { data: comp, isLoading } = useQuery(competitionQuery(id));
  const { data: matches } = useQuery(matchesQuery(id));
  const { data: standings } = useQuery(standingsQuery(id));
  const { data: scorers } = useQuery(scorersQuery(id));
  const { data: teams } = useQuery(competitionTeamsQuery(id));

  if (isLoading) {
    return (
      <SiteShell>
        <Empty label="Loading competition…" />
      </SiteShell>
    );
  }
  if (!comp) {
    return (
      <SiteShell>
        <Empty label="This competition could not be found." />
      </SiteShell>
    );
  }

  const fixtures = (matches ?? []).filter((m) => m.status !== "finished");
  const results = (matches ?? []).filter((m) => m.status === "finished");

  return (
    <SiteShell>
      <Link to="/competitions" className="text-sm text-muted-foreground hover:text-foreground">
        ← All competitions
      </Link>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">{comp.name}</h1>
        <Badge variant="secondary">{STATUS_LABEL[comp.status]}</Badge>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        {FORMAT_LABEL[comp.format]} · {comp.location ?? "Location TBD"}
        {comp.age_category ? ` · ${comp.age_category}` : ""}
      </p>
      {comp.description && <p className="mt-3 max-w-2xl text-sm">{comp.description}</p>}

      <div className="mt-6 flex flex-wrap gap-1 border-b border-border/60 pb-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-3 py-1.5 text-sm transition ${
              tab === t ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "Standings" &&
          ((standings ?? []).length === 0 ? (
            <Empty label="No standings yet — they appear once matches are played." />
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-border/60">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-left">#</th>
                    <th className="px-3 py-2 text-left">Team</th>
                    <th className="px-3 py-2">P</th>
                    <th className="px-3 py-2">W</th>
                    <th className="px-3 py-2">D</th>
                    <th className="px-3 py-2">L</th>
                    <th className="px-3 py-2">GF</th>
                    <th className="px-3 py-2">GA</th>
                    <th className="px-3 py-2">GD</th>
                    <th className="px-3 py-2">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {(standings ?? []).map((row, i) => (
                    <tr key={row.team_id} className="border-t border-border/50">
                      <td className="px-3 py-2 text-muted-foreground">{i + 1}</td>
                      <td className="px-3 py-2 font-medium">
                        <Link
                          to="/teams/$id"
                          params={{ id: row.team_id }}
                          className="hover:text-primary"
                        >
                          {row.team_name}
                        </Link>
                      </td>
                      <td className="px-3 py-2 text-center">{row.played}</td>
                      <td className="px-3 py-2 text-center">{row.wins}</td>
                      <td className="px-3 py-2 text-center">{row.draws}</td>
                      <td className="px-3 py-2 text-center">{row.losses}</td>
                      <td className="px-3 py-2 text-center">{row.goals_for}</td>
                      <td className="px-3 py-2 text-center">{row.goals_against}</td>
                      <td className="px-3 py-2 text-center">{row.goal_diff}</td>
                      <td className="px-3 py-2 text-center font-semibold">{row.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

        {tab === "Fixtures" &&
          (fixtures.length === 0 ? (
            <Empty label="No upcoming fixtures scheduled." />
          ) : (
            <ul className="space-y-2">
              {fixtures.map((m) => (
                <li
                  key={m.id}
                  className="glass flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 p-4 text-sm"
                >
                  <div className="font-medium">
                    <TeamLink team={m.home_team} /> <span className="text-muted-foreground">vs</span>{" "}
                    <TeamLink team={m.away_team} />
                  </div>
                  <div className="text-muted-foreground">
                    {formatKickoff(m.kickoff_at)}
                    {m.venue ? ` · ${m.venue}` : ""}
                  </div>
                </li>
              ))}
            </ul>
          ))}

        {tab === "Results" &&
          (results.length === 0 ? (
            <Empty label="No matches played yet." />
          ) : (
            <ul className="space-y-2">
              {results.map((m) => (
                <li
                  key={m.id}
                  className="glass flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 p-4 text-sm"
                >
                  <div className="font-medium">
                    <TeamLink team={m.home_team} />{" "}
                    <span className="mx-2 rounded-md bg-muted px-2 py-0.5 font-mono">
                      {m.home_score} - {m.away_score}
                    </span>{" "}
                    <TeamLink team={m.away_team} />
                  </div>
                  <div className="text-muted-foreground">{formatKickoff(m.kickoff_at)}</div>
                </li>
              ))}
            </ul>
          ))}

        {tab === "Teams" &&
          ((teams ?? []).length === 0 ? (
            <Empty label="No approved teams yet." />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(teams ?? []).map((r) =>
                r.teams ? (
                  <Link
                    key={r.id}
                    to="/teams/$id"
                    params={{ id: r.teams.id }}
                    className="glass rounded-2xl border border-border/60 p-4 transition hover:border-primary/50"
                  >
                    <p className="font-semibold">{r.teams.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.teams.city ?? "—"}
                      {r.group_name ? ` · Group ${r.group_name}` : ""}
                    </p>
                  </Link>
                ) : null,
              )}
            </div>
          ))}

        {tab === "Top scorers" &&
          ((scorers ?? []).length === 0 ? (
            <Empty label="No goals recorded yet." />
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-border/60">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-left">Player</th>
                    <th className="px-3 py-2 text-left">Team</th>
                    <th className="px-3 py-2">Goals</th>
                    <th className="px-3 py-2">Assists</th>
                    <th className="px-3 py-2">Cards</th>
                  </tr>
                </thead>
                <tbody>
                  {(scorers ?? []).map((s) => (
                    <tr key={s.player_id} className="border-t border-border/50">
                      <td className="px-3 py-2 font-medium">
                        <Link
                          to="/players/$id"
                          params={{ id: s.player_id }}
                          className="hover:text-primary"
                        >
                          {s.player_name}
                        </Link>
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">{s.team_name ?? "—"}</td>
                      <td className="px-3 py-2 text-center font-semibold">{s.goals}</td>
                      <td className="px-3 py-2 text-center">{s.assists}</td>
                      <td className="px-3 py-2 text-center">
                        {s.yellow_cards}Y / {s.red_cards}R
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
      </div>
    </SiteShell>
  );
}
