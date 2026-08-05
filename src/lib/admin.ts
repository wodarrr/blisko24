import { supabase } from "./supabase";

export type AdminBetaMetrics = {
  totalUsers: number;
  candidateAccounts: number;
  employerAccounts: number;
  bothAccounts: number;
  openCandidates: number;
  newUsers7d: number;
  totalMatches: number;
  newMatches: number;
  activeAlerts: number;
  unlockedContacts: number;
  freeUnlocks: number;
  paidUnlocks: number;
  pendingUnlocks: number;
};

type AdminBetaMetricsRow = {
  total_users: number | string | null;
  candidate_accounts: number | string | null;
  employer_accounts: number | string | null;
  both_accounts: number | string | null;
  open_candidates: number | string | null;
  new_users_7d: number | string | null;
  total_matches: number | string | null;
  new_matches: number | string | null;
  active_alerts: number | string | null;
  unlocked_contacts: number | string | null;
  free_unlocks: number | string | null;
  paid_unlocks: number | string | null;
  pending_unlocks: number | string | null;
};

function toCount(value: number | string | null) {
  const parsedValue = Number(value ?? 0);

  return Number.isFinite(parsedValue)
    ? parsedValue
    : 0;
}

export async function getAdminBetaMetrics(): Promise<AdminBetaMetrics> {
  const { data, error } = await supabase
    .rpc("get_admin_beta_metrics")
    .single();

  if (error) {
    console.error(
      "Błąd pobierania wskaźników wersji beta:",
      error
    );

    throw error;
  }

  const row = data as AdminBetaMetricsRow;

  return {
    totalUsers: toCount(row.total_users),
    candidateAccounts: toCount(
      row.candidate_accounts
    ),
    employerAccounts: toCount(
      row.employer_accounts
    ),
    bothAccounts: toCount(row.both_accounts),
    openCandidates: toCount(row.open_candidates),
    newUsers7d: toCount(row.new_users_7d),
    totalMatches: toCount(row.total_matches),
    newMatches: toCount(row.new_matches),
    activeAlerts: toCount(row.active_alerts),
    unlockedContacts: toCount(
      row.unlocked_contacts
    ),
    freeUnlocks: toCount(row.free_unlocks),
    paidUnlocks: toCount(row.paid_unlocks),
    pendingUnlocks: toCount(row.pending_unlocks),
  };
}

export async function getAdminStats() {
  const { count: users } = await supabase
    .from("profiles")
    .select("*", {
      count: "exact",
      head: true,
    });

  const { count: ads } = await supabase
    .from("advertisements")
    .select("*", {
      count: "exact",
      head: true,
    });

  const { count: favorites } = await supabase
    .from("favorites")
    .select("*", {
      count: "exact",
      head: true,
    });

  return {
    users: users ?? 0,
    ads: ads ?? 0,
    favorites: favorites ?? 0,
  };
}

export async function getAllAdvertisements() {
  const { data, error } = await supabase
    .from("advertisements")
    .select(`
      *,
      profiles!advertisements_user_id_fkey (
        name
      )
    `)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "Błąd pobierania ogłoszeń administratora:",
      error
    );

    return [];
  }

  return data ?? [];
}

export async function deleteAdvertisement(
  id: number
) {
  const { error } = await supabase
    .from("advertisements")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(
      "Błąd usuwania ogłoszenia:",
      error
    );

    throw error;
  }
}

export async function getAllUsers() {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "Błąd pobierania użytkowników:",
      error
    );

    return [];
  }

  return data ?? [];
}

export async function getReports() {
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "Błąd pobierania zgłoszeń:",
      error
    );

    return [];
  }

  return data ?? [];
}