import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteShell, Empty, Section } from "@/components/SiteShell";
import {
  teamQuery,
  teamPlayersQuery,
  teamMatchesQuery,
  teamRegistrationsQuery,
  formatKickoff,
  STATUS_LABEL,
  type CompetitionStatus,
} from "@/lib/football";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/teams/$id")({
  head: () => ({
    meta: [
      { title: "Team Profile — PitchForge" },
      {
        name: "description",
        content: "Squad list, fixtures, results and competition entries for this football club.",
      },
      { property: "og:title", content: "Team Profile — PitchForge" },
      {
        property: "og:description",
        content: "Squad, fixtures, results and competitions for this club.",
      },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TeamDetail,
});

function TeamDetail() {
  const { id } = Route.useParams();
  const { data: team, isLoading } = useQuery(teamQuery(id));
  const { data: players } = useQuery(teamPlayersQuery(id));
  const { data: matches } = useQuery(teamMatchesQuery(id));
  const { data: entries } = useQuery(teamRegistrationsQuery(id));

  if (isLoading) {
    return (
      <SiteShell>
        <Empty label="Loading team…" />
      </SiteShell>
    );
  }
  if (!team) {
    return (
      <SiteShell>
        <Empty label="This team could not be found." />
      </SiteShell>
    );
  }

  const upcoming = (matches ?? []).filter((m) => m.status !== "finished");
  const played = (matches ?? []).filter((m) => m.status === "finished");

  return (
    <SiteShell>
      <Link to="/teams" className="text-sm text-muted-foreground hover:text-foreground">
        ← All teams
      </Link>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">{team.name}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {team.city ?? "City unknown"}
        {team.short_name ? ` · ${team.short_name}` : ""}
      </p>

      <Section title="Squad">
        {(players ?? []).length === 0 ? (
          <Empty label="No players registered yet." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(players ?? []).map((p) => (
              <Link
                key={p.id}
                to="/players/$id"
                params={{ id: p.id }}
                className="glass flex items-center justify-between gap-3 rounded-2xl border border-border/60 p-4 transition hover:border-primary/50"
              >
                <div>
                  <p className="font-medium">{p.full_name}</p>
                  <p className="text-xs text-muted-foreground">{p.position ?? "Position TBD"}</p>
                </div>
                <span className="font-mono text-sm text-muted-foreground">
                  {p.jersey_number ?? "—"}
                </span>
              </Link>
            ))}
          </div>
        )}
      </Section>

      <Section title="Competitions">
        {(entries ?? []).length === 0 ? (
          <Empty label="This team has not entered a competition yet." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {(entries ?? []).map((e) =>
              e.competitions ? (
                <Link
                  key={e.id}
                  to="/competitions/$id"
                  params={{ id: e.competitions.id }}
                  className="glass flex items-center justify-between gap-3 rounded-2xl border border-border/60 p-4 transition hover:border-primary/50"
                >
                  <div>
                    <p className="font-medium">{e.competitions.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {STATUS_LABEL[e.competitions.status as CompetitionStatus]}
                    </p>
                  </div>
                  <Badge variant="secondary">{e.status}</Badge>
                </Link>
              ) : null,
            )}
          </div>
        )}
      </Section>

      <Section title="Upcoming fixtures">
        {upcoming.length === 0 ? (
          <Empty label="No fixtures scheduled." />
        ) : (
          <ul className="space-y-2">
            {upcoming.map((m) => (
              <li
                key={m.id}
                className="glass flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 p-4 text-sm"
              >
                <span className="font-medium">
                  {m.home_team?.name ?? "TBD"} vs {m.away_team?.name ?? "TBD"}
                </span>
                <span className="text-muted-foreground">
                  {formatKickoff(m.kickoff_at)}
                  {m.venue ? ` · ${m.venue}` : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Results">
        {played.length === 0 ? (
          <Empty label="No matches played yet." />
        ) : (
          <ul className="space-y-2">
            {played.map((m) => (
              <li
                key={m.id}
                className="glass flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 p-4 text-sm"
              >
                <span className="font-medium">
                  {m.home_team?.name ?? "TBD"}
                  <span className="mx-2 rounded-md bg-muted px-2 py-0.5 font-mono">
                    {m.home_score} - {m.away_score}
                  </span>
                  {m.away_team?.name ?? "TBD"}
                </span>
                <span className="text-muted-foreground">{formatKickoff(m.kickoff_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </SiteShell>
  );
}
