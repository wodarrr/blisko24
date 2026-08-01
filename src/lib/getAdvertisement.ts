import { supabase } from "./supabase";

export async function getAdvertisement(id: string) {
  const advertisementId = Number(id);

  if (
    !Number.isInteger(advertisementId) ||
    advertisementId <= 0
  ) {
    return null;
  }

  const { error: viewsError } = await supabase.rpc(
    "increment_views",
    {
      advertisement_id: advertisementId,
    }
  );

  if (viewsError) {
    console.error(
      "Błąd zwiększania liczby wyświetleń:",
      viewsError
    );
  }

  const { data, error } = await supabase
    .from("advertisements")
    .select(`
      *,
      profiles (
        name,
        city,
        avatar_url,
        verified,
        reviews!reviews_user_id_fkey (
          rating
        )
      ),
      favorites (
        id
      )
    `)
    .eq("id", advertisementId)
    .single();

  if (error) {
    console.error(
      "Błąd pobierania ogłoszenia:",
      error
    );

    return null;
  }

  return data;
}