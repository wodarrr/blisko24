import { supabase } from "./supabase";

export async function getAdvertisements(
  search?: string,
  category?: string,
  province?: string,
  city?: string,
  sort?: string
) {
  let query = supabase
    .from("advertisements")
    .select(
      `
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
    `,
      {
        count: "exact",
      }
    );

  if (search?.trim()) {
    const phrase = search.trim();

    query = query.or(
      `title.ilike.%${phrase}%,description.ilike.%${phrase}%,city.ilike.%${phrase}%,category.ilike.%${phrase}%`
    );
  }

  if (category?.trim()) {
    query = query.eq("category", category);
  }

  if (province?.trim()) {
    query = query.eq("province", province);
  }

  if (city?.trim()) {
    query = query.ilike("city", `%${city}%`);
  }

  switch (sort) {
    case "cheap":
      query = query
        .order("price", { ascending: true })
        .order("created_at", { ascending: false });
      break;

    case "expensive":
      query = query
        .order("price", { ascending: false })
        .order("created_at", { ascending: false });
      break;

    case "promoted":
      query = query
        .order("promoted", { ascending: false })
        .order("promoted_until", {
          ascending: false,
          nullsFirst: false,
        })
        .order("created_at", {
          ascending: false,
        });
      break;

    case "popular":
      query = query
        .order("views", { ascending: false })
        .order("created_at", {
          ascending: false,
        });
      break;

    default:
      query = query.order("created_at", {
        ascending: false,
      });
      break;
  }

  const { data, error } = await query;

  if (error) {
    console.error(
      "Błąd pobierania ogłoszeń:",
      error
    );
    return [];
  }

  return data ?? [];
}