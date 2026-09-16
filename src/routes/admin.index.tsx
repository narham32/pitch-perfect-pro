import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { adminStatsQuery, adminCompetitionsQuery, money } from "@/lib/admin";
import { PageHeading } from "@/components/AdminShell";

export const Route = createFileRoute("/admin/")({
  component: AdminOverview,
});

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="glass rounded-2xl p-5">
      <p className="eyebrow text-muted-foreground">{label}</p>
      <p className="text-stat mt-2">{value}</p>
    </div>
  );
}

function AdminOverview() {
  const { data: stats, isLoading } = useQuery(adminStatsQuery);
  const { data: comps } = useQuery(adminCompetitionsQuery);

  return (
    <div>
      <PageHeading title="Platform overview" subtitle="Everything happening across PitchForge." />
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading metrics…</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Event organizers" value={stats?.organizers ?? 0} />
          <Stat label="Competitions" value={stats?.competitions ?? 0} />
          <Stat label="Teams" value={stats?.teams ?? 0} />
          <Stat label="Players" value={stats?.players ?? 0} />
          <Stat label="Matches" value={stats?.matches ?? 0} />
          <Stat label="Platform revenue" value={money(stats?.revenue ?? 0)} />
          <Stat label="Pending payments" value={stats?.pending ?? 0} />
          <Stat
            label="Live / in progress"
            value={(comps ?? []).filter((c) => c.status === "in_progress").length}
          />
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { to: "/admin/organizers", title: "Organizer management", desc: "Approve or suspend EO accounts." },
          { to: "/admin/competitions", title: "Competition monitoring", desc: "Every competition, every organizer." },
          { to: "/admin/users", title: "User management", desc: "Grant or revoke platform roles." },
          { to: "/admin/payments", title: "Payment monitoring", desc: "Track registration payments." },
          { to: "/admin/settings", title: "Platform settings", desc: "Global configuration." },
        ].map((card) => (
          <Link
            key={card.to}
            to={card.to}
            className="glass-soft rounded-2xl p-5 transition hover:border-primary/40"
          >
            <p className="font-semibold">{card.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{card.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
