import { supabase } from "@/integrations/supabase/client";

export type AppRole = "super_admin" | "organizer" | "team_manager";

export const ROLE_LABEL: Record<AppRole, string> = {
  super_admin: "Super Admin",
  organizer: "Event Organizer",
  team_manager: "Team Manager",
};

function fail(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

export function myRolesQuery(userId: string | undefined) {
  return {
    queryKey: ["my-roles", userId],
    enabled: !!userId,
    queryFn: async (): Promise<AppRole[]> => {
      const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId!);
      fail(error);
      return (data ?? []).map((r) => r.role as AppRole);
    },
  };
}

export type OrganizerRow = {
  id: string;
  name: string;
  contact_email: string | null;
  logo_url: string | null;
  status: string;
  owner_id: string | null;
  created_at: string;
};

export const adminOrganizersQuery = {
  queryKey: ["admin", "organizers"],
  queryFn: async (): Promise<OrganizerRow[]> => {
    const { data, error } = await supabase
      .from("event_organizers")
      .select("*")
      .order("created_at", { ascending: false });
    fail(error);
    return (data ?? []) as OrganizerRow[];
  },
};

export async function setOrganizerStatus(id: string, status: string) {
  const { error } = await supabase.from("event_organizers").update({ status }).eq("id", id);
  fail(error);
}

export type AdminCompetitionRow = {
  id: string;
  name: string;
  status: string;
  format: string;
  entry_fee: number;
  max_teams: number;
  location: string | null;
  start_date: string | null;
  organizer_id: string;
  event_organizers: { name: string; status: string } | null;
  competition_registrations: { count: number }[];
};

export const adminCompetitionsQuery = {
  queryKey: ["admin", "competitions"],
  queryFn: async (): Promise<AdminCompetitionRow[]> => {
    const { data, error } = await supabase
      .from("competitions")
      .select(
        "*, event_organizers(name,status), competition_registrations(count)",
      )
      .order("start_date", { ascending: false });
    fail(error);
    return (data ?? []) as unknown as AdminCompetitionRow[];
  },
};

export async function setCompetitionStatus(id: string, status: string) {
  const { error } = await supabase
    .from("competitions")
    .update({ status: status as never })
    .eq("id", id);
  fail(error);
}

export type PlatformUser = {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
  roles: AppRole[];
};

export const adminUsersQuery = {
  queryKey: ["admin", "users"],
  queryFn: async (): Promise<PlatformUser[]> => {
    const [profiles, roles] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role"),
    ]);
    fail(profiles.error);
    fail(roles.error);
    const map = new Map<string, AppRole[]>();
    for (const r of roles.data ?? []) {
      const list = map.get(r.user_id) ?? [];
      list.push(r.role as AppRole);
      map.set(r.user_id, list);
    }
    return (profiles.data ?? []).map((p) => ({
      id: p.id,
      email: p.email,
      full_name: p.full_name,
      created_at: p.created_at,
      roles: map.get(p.id) ?? [],
    }));
  },
};

export async function grantRole(userId: string, role: AppRole) {
  const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
  fail(error);
}

export async function revokeRole(userId: string, role: AppRole) {
  const { error } = await supabase
    .from("user_roles")
    .delete()
    .eq("user_id", userId)
    .eq("role", role);
  fail(error);
}

export type AdminPaymentRow = {
  id: string;
  amount: number;
  status: string;
  proof_url: string | null;
  created_at: string;
  registration_id: string;
  competition_registrations: {
    id: string;
    status: string;
    teams: { name: string } | null;
    competitions: { name: string; event_organizers: { name: string } | null } | null;
  } | null;
};

export const adminPaymentsQuery = {
  queryKey: ["admin", "payments"],
  queryFn: async (): Promise<AdminPaymentRow[]> => {
    const { data, error } = await supabase
      .from("payments")
      .select(
        "*, competition_registrations(id,status,teams(name),competitions(name,event_organizers(name)))",
      )
      .order("created_at", { ascending: false });
    fail(error);
    return (data ?? []) as unknown as AdminPaymentRow[];
  },
};

export async function setPaymentStatus(id: string, status: string) {
  const { error } = await supabase.from("payments").update({ status }).eq("id", id);
  fail(error);
}

export type SettingRow = { key: string; value: string | null; updated_at: string };

export const platformSettingsQuery = {
  queryKey: ["admin", "settings"],
  queryFn: async (): Promise<SettingRow[]> => {
    const { data, error } = await supabase.from("platform_settings").select("*").order("key");
    fail(error);
    return (data ?? []) as SettingRow[];
  },
};

export async function saveSettings(entries: { key: string; value: string }[]) {
  const { error } = await supabase
    .from("platform_settings")
    .upsert(entries.map((e) => ({ ...e, updated_at: new Date().toISOString() })), {
      onConflict: "key",
    });
  fail(error);
}

export const adminStatsQuery = {
  queryKey: ["admin", "stats"],
  queryFn: async () => {
    const count = async (table: string) => {
      const { count: c, error } = await supabase
        .from(table as never)
        .select("*", { count: "exact", head: true });
      fail(error);
      return c ?? 0;
    };
    const [organizers, competitions, teams, players, matches] = await Promise.all([
      count("event_organizers"),
      count("competitions"),
      count("teams"),
      count("team_players"),
      count("matches"),
    ]);
    const { data: pay, error } = await supabase.from("payments").select("amount,status");
    fail(error);
    const revenue = (pay ?? [])
      .filter((p) => p.status === "verified" || p.status === "paid" || p.status === "approved")
      .reduce((sum, p) => sum + Number(p.amount ?? 0), 0);
    const pending = (pay ?? []).filter((p) => p.status === "pending").length;
    return { organizers, competitions, teams, players, matches, revenue, pending };
  },
};

export function money(value: number, currency = "IDR") {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${currency} ${value.toLocaleString()}`;
  }
}
