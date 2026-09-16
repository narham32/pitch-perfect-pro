import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

const NAV = [
  { to: "/", label: "Home", exact: true },
  { to: "/competitions", label: "Competitions" },
  { to: "/teams", label: "Teams" },
] as const;

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-3">
          <Link to="/" className="text-base font-semibold tracking-tight text-primary">
            PitchForge
          </Link>
          <nav className="flex flex-1 flex-wrap gap-1">
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
          <Link
            to="/auth"
            className="rounded-xl bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground"
          >
            Sign in
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
        PitchForge — football competition management for organizers, teams and fans.
      </footer>
    </div>
  );
}

export function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="mt-10">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Empty({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border/70 p-8 text-center text-sm text-muted-foreground">
      {label}
    </div>
  );
}
