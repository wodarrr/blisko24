import { supabase } from "./supabase";

export async function getAdvertisement(id: string) {
  await supabase.rpc("increment_views", {
    advertisement_id: Number(id),
  });

  const { data, error } = await supabase
    .from("advertisements")
    .select(`
      *,
      profiles (
        name,
        city,
        avatar_url,
        verified
      ),
      favorites (
        id
      )
    `)
    .eq("id", Number(id))
    .single();

  if (error) {
    console.error("Błąd pobierania ogłoszenia:", error);
    return null;
  }

  return data;
}