import { supabase } from "./supabase";

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