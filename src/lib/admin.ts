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
      profiles (
        name
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return data ?? [];
}
export async function deleteAdvertisement(id: number) {
  const { error } = await supabase
    .from("advertisements")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
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
  console.log("REPORTS ERROR:");
  console.log(error);
  console.log(JSON.stringify(error, null, 2));
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
    console.log(error);
    return [];
  }

  return data ?? [];
}