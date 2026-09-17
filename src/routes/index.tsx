import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteShell, Empty, Section } from "@/components/SiteShell";
import {
  competitionsQuery,
  allMatchesQuery,
  teamsQuery,
  formatKickoff,
  FORMAT_LABEL,
  STATUS_LABEL,
} from "@/lib/football";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PitchForge — Football Competition Management" },
      {
        name: "description",
        content:
          "Run football competitions end to end: organizer tools, team registration, fixtures, live standings and public results.",
      },
      { property: "og:title", content: "PitchForge — Football Competition Management" },
      {
        property: "og:description",
        content: "Competitions, teams, fixtures, standings and results in one place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { data: comps } = useQuery(competitionsQuery);
  const { data: matches } = useQuery(allMatchesQuery);
  const { data: teams } = useQuery(teamsQuery);

  const featured = (comps ?? []).slice(0, 3);
  const upcoming = (matches ?? []).filter((m) => m.status !== "finished").slice(0, 5);
  const results = (matches ?? []).filter((m) => m.status === "finished").slice(0, 5);

  return (
    <SiteShell>
      <section className="glass rounded-3xl border border-border/60 p-8 sm:p-12">
        <p className="text-xs uppercase tracking-[0.2em] text-primary">Football, organised</p>
        <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Every competition, team and result in one place.
        </h1>
        <p className="mt-4 max-w-xl text-sm text-muted-foreground">
          PitchForge gives organizers the tools to run leagues and cups, teams a home for their
          squad, and fans live standings, fixtures and scorers.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/competitions"
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Browse competitions
          </Link>
          <Link
            to="/teams"
            className="rounded-xl border border-border/60 px-4 py-2 text-sm font-semibold"
          >
            Explore teams
          </Link>
        </div>
        <div className="mt-8 flex flex-wrap gap-8 text-sm">
          <div>
            <p className="text-2xl font-semibold">{(comps ?? []).length}</p>
            <p className="text-muted-foreground">Competitions</p>
          </div>
          <div>
            <p className="text-2xl font-semibold">{(teams ?? []).length}</p>
            <p className="text-muted-foreground">Teams</p>
          </div>
          <div>
            <p className="text-2xl font-semibold">{(matches ?? []).length}</p>
            <p className="text-muted-foreground">Matches</p>
          </div>
        </div>
      </section>

      <Section
        title="Featured competitions"
        action={
          <Link to="/competitions" className="text-sm text-muted-foreground hover:text-foreground">
            View all
          </Link>
        }
      >
        {featured.length === 0 ? (
          <Empty label="No competitions published yet." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((c) => (
              <Link
                key={c.id}
                to="/competitions/$id"
                params={{ id: c.id }}
                className="glass rounded-2xl border border-border/60 p-5 transition hover:border-primary/50"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">
                    {FORMAT_LABEL[c.format]}
                  </span>
                  <Badge variant="secondary">{STATUS_LABEL[c.status]}</Badge>
                </div>
                <h3 className="mt-3 text-lg font-semibold">{c.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {c.location ?? "Location TBD"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </Section>

      <div className="grid gap-6 lg:grid-cols-2">
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
                  <span className="text-muted-foreground">{formatKickoff(m.kickoff_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Latest results">
          {results.length === 0 ? (
            <Empty label="No matches played yet." />
          ) : (
            <ul className="space-y-2">
              {results.map((m) => (
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
      </div>
    </SiteShell>
  );
}
