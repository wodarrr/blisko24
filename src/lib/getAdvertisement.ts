import { supabase } from "./supabase";

export async function getAdvertisement(id: string) {
  console.log("Szukam ID:", id);

  const { data, error } = await supabase
    .from("advertisements")
    .select("*")
    .eq("id", Number(id));

  console.log("DATA:", data);
  console.log("ERROR:", error);

  if (error) return null;

  return data?.[0] ?? null;
}