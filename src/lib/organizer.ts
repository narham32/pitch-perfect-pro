import { supabase } from "@/integrations/supabase/client";
import type { CompetitionFormat, CompetitionStatus, Competition, Team } from "@/lib/football";

const BUCKET = "media";
const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

/** Uploads a file to the shared media bucket and returns a long-lived signed URL. */
export async function uploadMedia(folder: string, file: File) {
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const up = await supabase.storage.from(BUCKET).upload(path, file, { upsert: false });
  if (up.error) throw new Error(up.error.message);
  const signed = await supabase.storage.from(BUCKET).createSignedUrl(path, TEN_YEARS);
  if (signed.error) throw new Error(signed.error.message);
  return signed.data.signedUrl;
}

export type OrganizerProfile = {
  id: string;
  owner_id: string | null;
  name: string;
  contact_email: string | null;
  logo_url: string | null;
  status: string;
};

export function organizerProfileQuery(userId: string | undefined) {
  return {
    queryKey: ["organizer-profile", userId],
    enabled: !!userId,
    queryFn: async () => {
      const res = await supabase
        .from("event_organizers")
        .select("*")
        .eq("owner_id", userId!)
        .maybeSingle();
      if (res.error) throw new Error(res.error.message);
      return (res.data ?? null) as OrganizerProfile | null;
    },
  };
}

export async function createOrganizer(input: {
  ownerId: string;
  name: string;
  contactEmail: string;
}) {
  const res = await supabase
    .from("event_organizers")
    .insert({ owner_id: input.ownerId, name: input.name, contact_email: input.contactEmail })
    .select("*")
    .single();
  if (res.error) throw new Error(res.error.message);
  return res.data as OrganizerProfile;
}

export function organizerCompetitionsQuery(organizerId: string | undefined) {
  return {
    queryKey: ["organizer-competitions", organizerId],
    enabled: !!organizerId,
    queryFn: async () => {
      const res = await supabase
        .from("competitions")
        .select("*")
        .eq("organizer_id", organizerId!)
        .order("created_at", { ascending: false });
      if (res.error) throw new Error(res.error.message);
      return (res.data ?? []) as Competition[];
    },
  };
}

export type CompetitionInput = {
  organizer_id: string;
  name: string;
  format: CompetitionFormat;
  age_category: string | null;
  location: string | null;
  entry_fee: number;
  max_teams: number;
  start_date: string | null;
  description: string | null;
  logo_url: string | null;
  status: CompetitionStatus;
};

export async function createCompetition(input: CompetitionInput) {
  const res = await supabase.from("competitions").insert(input).select("*").single();
  if (res.error) throw new Error(res.error.message);
  return res.data as Competition;
}

export async function updateCompetition(id: string, patch: Partial<CompetitionInput>) {
  const res = await supabase.from("competitions").update(patch).eq("id", id);
  if (res.error) throw new Error(res.error.message);
}

export async function setRegistrationStatus(id: string, status: "approved" | "rejected") {
  const res = await supabase.from("competition_registrations").update({ status }).eq("id", id);
  if (res.error) throw new Error(res.error.message);
}

/** Teams managed by the signed-in user. */
export function myTeamsQuery(userId: string | undefined) {
  return {
    queryKey: ["my-teams", userId],
    enabled: !!userId,
    queryFn: async () => {
      const res = await supabase
        .from("teams")
        .select("*")
        .eq("manager_id", userId!)
        .order("name");
      if (res.error) throw new Error(res.error.message);
      return (res.data ?? []) as Team[];
    },
  };
}

export async function createTeam(input: {
  managerId: string;
  name: string;
  city: string;
  shortName: string;
  logoUrl: string | null;
}) {
  const res = await supabase
    .from("teams")
    .insert({
      manager_id: input.managerId,
      name: input.name,
      city: input.city || null,
      short_name: input.shortName || null,
      logo_url: input.logoUrl,
    })
    .select("*")
    .single();
  if (res.error) throw new Error(res.error.message);
  return res.data as Team;
}

/** Registers a team for a competition and records the entry-fee payment. */
export async function registerTeam(input: {
  competitionId: string;
  teamId: string;
  entryFee: number;
  proofUrl: string | null;
  notes: string;
}) {
  const reg = await supabase
    .from("competition_registrations")
    .insert({
      competition_id: input.competitionId,
      team_id: input.teamId,
      payment_proof_url: input.proofUrl,
      notes: input.notes || null,
    })
    .select("id")
    .single();
  if (reg.error) throw new Error(reg.error.message);

  const pay = await supabase.from("payments").insert({
    registration_id: reg.data.id,
    amount: input.entryFee,
    proof_url: input.proofUrl,
  });
  if (pay.error) throw new Error(pay.error.message);
  return reg.data.id as string;
}
