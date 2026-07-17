import { supabase } from "./supabase";

export async function getAdvertisements() {
  const { data, error } = await supabase
    .from("advertisements")
    .select("*")
    .order("created_at", { ascending: false });

  console.log("DATA:", data);
  console.log("ERROR:", error);

  if (error) {
    return [];
  }

  return data ?? [];
}