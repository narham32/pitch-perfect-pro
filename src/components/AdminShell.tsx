import { Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { myRolesQuery } from "@/lib/admin";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/admin", label: "Overview", exact: true },
  { to: "/admin/organizers", label: "Organizers" },
  { to: "/admin/competitions", label: "Competitions" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/payments", label: "Payments" },
  { to: "/admin/settings", label: "Settings" },
] as const;

function Centered({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 text-center">
      <div className="glass max-w-md rounded-2xl p-8">{children}</div>
    </div>
  );
}

export function AdminShell() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { data: roles, isLoading: rolesLoading } = useQuery(myRolesQuery(user?.id));

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  if (loading || (user && rolesLoading)) {
    return <Centered>Loading control room…</Centered>;
  }

  if (!user) {
    return <Centered>Redirecting to sign in…</Centered>;
  }

  if (!roles?.includes("super_admin")) {
    return (
      <Centered>
        <h1 className="text-xl font-semibold">Super Admin only</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This area is restricted to platform administrators.
        </p>
        <Button className="mt-5" onClick={() => navigate({ to: "/" })}>
          Back to home
        </Button>
      </Centered>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3">
          <Link to="/" className="eyebrow text-primary">
            PitchForge
          </Link>
          <span className="text-sm font-semibold">Super Admin</span>
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
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/auth" });
            }}
          >
            Sign out
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}

export function PageHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
    </div>
  );
}
