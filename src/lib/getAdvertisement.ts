import { supabase } from "./supabase";

export async function getAdvertisement(id: string) {
  const advertisementId = Number(id);

  if (
    !Number.isInteger(advertisementId) ||
    advertisementId <= 0
  ) {
    return null;
  }

  const { data, error } = await supabase
    .from("advertisements")
    .select(`
      *,
      profiles!advertisements_user_id_fkey (
        name,
        city,
        avatar_url,
        verified,
        last_seen,
        reviews!reviews_user_id_fkey (
          rating
        )
      ),
      favorites (
        id
      ),
      advertisement_images (
        id,
        image_url,
        position
      )
    `)
    .eq("id", advertisementId)
    .order("position", {
      referencedTable: "advertisement_images",
      ascending: true,
    })
    .maybeSingle();

  if (error) {
    console.error(
      "Błąd pobierania ogłoszenia:",
      error
    );
    return null;
  }

  if (!data) {
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

  return data;
}