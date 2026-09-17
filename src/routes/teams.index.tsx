import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { SiteShell, Empty } from "@/components/SiteShell";
import { teamsQuery } from "@/lib/football";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/teams/")({
  head: () => ({
    meta: [
      { title: "Football Teams Directory — PitchForge" },
      {
        name: "description",
        content:
          "Browse every club competing on PitchForge, with squads, fixtures and results for each team.",
      },
      { property: "og:title", content: "Football Teams Directory — PitchForge" },
      {
        property: "og:description",
        content: "Every club on PitchForge with squads, fixtures and results.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TeamsPage,
});

function TeamsPage() {
  const { data, isLoading } = useQuery(teamsQuery);
  const [search, setSearch] = useState("");

  const list = useMemo(
    () =>
      (data ?? []).filter(
        (t) =>
          t.name.toLowerCase().includes(search.toLowerCase()) ||
          (t.city ?? "").toLowerCase().includes(search.toLowerCase()),
      ),
    [data, search],
  );

  return (
    <SiteShell>
      <h1 className="text-3xl font-semibold tracking-tight">Teams</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Clubs registered on the platform across all competitions.
      </p>

      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by club or city"
        className="mt-6 max-w-xs"
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading && <Empty label="Loading teams…" />}
        {!isLoading && list.length === 0 && <Empty label="No teams match your search." />}
        {list.map((t) => (
          <Link
            key={t.id}
            to="/teams/$id"
            params={{ id: t.id }}
            className="glass rounded-2xl border border-border/60 p-5 transition hover:border-primary/50"
          >
            <h2 className="text-lg font-semibold">{t.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t.city ?? "City unknown"}
              {t.short_name ? ` · ${t.short_name}` : ""}
            </p>
          </Link>
        ))}
      </div>
    </SiteShell>
  );
}
