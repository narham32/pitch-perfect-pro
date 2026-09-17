import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { SiteShell, Empty } from "@/components/SiteShell";
import { useAuth } from "@/hooks/useAuth";

const NAV = [
  { to: "/organizer", label: "Dashboard", exact: true },
  { to: "/organizer/competitions", label: "Competitions" },
] as const;

export function OrganizerShell({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <SiteShell>
        <Empty label="Loading your console…" />
      </SiteShell>
    );
  }

  if (!user) {
    return (
      <SiteShell>
        <div className="glass rounded-2xl border border-border/60 p-8 text-center">
          <h1 className="text-xl font-semibold">Sign in to open the organizer console</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You need an account to create competitions and manage team entries.
          </p>
          <Link
            to="/auth"
            className="mt-5 inline-block rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Sign in
          </Link>
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <nav className="mb-6 flex flex-wrap gap-1 border-b border-border/60 pb-2">
        {NAV.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            activeOptions={{ exact: "exact" in item }}
            activeProps={{ className: "bg-primary/15 text-primary" }}
            className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition hover:text-foreground"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      {children}
    </SiteShell>
  );
}
