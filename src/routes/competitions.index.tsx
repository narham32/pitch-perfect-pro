import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { SiteShell, Empty } from "@/components/SiteShell";
import {
  competitionsQuery,
  FORMAT_LABEL,
  STATUS_LABEL,
  type CompetitionStatus,
} from "@/lib/football";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/competitions")({
  head: () => ({
    meta: [
      { title: "Browse Football Competitions — PitchForge" },
      {
        name: "description",
        content:
          "Browse every football competition on PitchForge: leagues, group stages and knockout cups with live standings and fixtures.",
      },
      { property: "og:title", content: "Browse Football Competitions — PitchForge" },
      {
        property: "og:description",
        content: "Leagues, cups and knockout tournaments with standings, fixtures and results.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CompetitionsPage,
});

const FILTERS: (CompetitionStatus | "all")[] = [
  "all",
  "registration_open",
  "in_progress",
  "completed",
];

function CompetitionsPage() {
  const { data, isLoading } = useQuery(competitionsQuery);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<CompetitionStatus | "all">("all");

  const list = useMemo(() => {
    return (data ?? []).filter(
      (c) =>
        (status === "all" || c.status === status) &&
        (c.name.toLowerCase().includes(search.toLowerCase()) ||
          (c.location ?? "").toLowerCase().includes(search.toLowerCase())),
    );
  }, [data, search, status]);

  return (
    <SiteShell>
      <h1 className="text-3xl font-semibold tracking-tight">Competitions</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Every tournament running on the platform, from grassroots leagues to knockout cups.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or city"
          className="max-w-xs"
        />
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setStatus(f)}
            className={`rounded-lg px-3 py-1.5 text-sm transition ${
              status === f
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {f === "all" ? "All" : STATUS_LABEL[f]}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading && <Empty label="Loading competitions…" />}
        {!isLoading && list.length === 0 && <Empty label="No competitions match your filters." />}
        {list.map((c) => (
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
            <h2 className="mt-3 text-lg font-semibold">{c.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {c.location ?? "Location TBD"}
              {c.age_category ? ` · ${c.age_category}` : ""}
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              Max {c.max_teams} teams · Entry fee {c.entry_fee}
            </p>
          </Link>
        ))}
      </div>
    </SiteShell>
  );
}
