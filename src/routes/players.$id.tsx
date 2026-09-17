import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteShell, Empty, Section } from "@/components/SiteShell";
import { playerQuery, playerEventsQuery, EVENT_LABEL } from "@/lib/football";

export const Route = createFileRoute("/players/$id")({
  head: () => ({
    meta: [
      { title: "Player Profile — PitchForge" },
      {
        name: "description",
        content: "Position, squad number, club and match statistics for this football player.",
      },
      { property: "og:title", content: "Player Profile — PitchForge" },
      {
        property: "og:description",
        content: "Club, position and match statistics for this player.",
      },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PlayerDetail,
});

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass rounded-2xl border border-border/60 p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function PlayerDetail() {
  const { id } = Route.useParams();
  const { data: player, isLoading } = useQuery(playerQuery(id));
  const { data: events } = useQuery(playerEventsQuery(id));

  if (isLoading) {
    return (
      <SiteShell>
        <Empty label="Loading player…" />
      </SiteShell>
    );
  }
  if (!player) {
    return (
      <SiteShell>
        <Empty label="This player could not be found." />
      </SiteShell>
    );
  }

  const list = events ?? [];
  const count = (type: string) => list.filter((e) => e.event_type === type).length;

  return (
    <SiteShell>
      {player.teams ? (
        <Link
          to="/teams/$id"
          params={{ id: player.teams.id }}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← {player.teams.name}
        </Link>
      ) : (
        <Link to="/teams" className="text-sm text-muted-foreground hover:text-foreground">
          ← All teams
        </Link>
      )}

      <h1 className="mt-3 text-3xl font-semibold tracking-tight">{player.full_name}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {player.position ?? "Position TBD"}
        {player.jersey_number ? ` · #${player.jersey_number}` : ""}
        {player.teams ? ` · ${player.teams.name}` : ""}
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Goals" value={count("goal")} />
        <Stat label="Assists" value={count("assist")} />
        <Stat label="Yellow cards" value={count("yellow_card")} />
        <Stat label="Red cards" value={count("red_card")} />
      </div>

      <Section title="Match events">
        {list.length === 0 ? (
          <Empty label="No recorded events for this player yet." />
        ) : (
          <ul className="space-y-2">
            {list.map((e) => (
              <li
                key={e.id}
                className="glass flex items-center justify-between gap-3 rounded-2xl border border-border/60 p-4 text-sm"
              >
                <span>{EVENT_LABEL[e.event_type]}</span>
                <span className="font-mono text-muted-foreground">
                  {e.minute ? `${e.minute}'` : "—"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </SiteShell>
  );
}
