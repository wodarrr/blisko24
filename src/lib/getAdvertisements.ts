import { supabase } from "./supabase";

function parsePrice(
  value: number | string | null | undefined
) {
  if (
    value === null ||
    value === undefined ||
    String(value).trim() === ""
  ) {
    return null;
  }

  const normalized = String(value)
    .replace(/\s/g, "")
    .replace(/zł/gi, "")
    .replace(",", ".")
    .replace(/[^\d.-]/g, "");

  const numericPrice = Number(normalized);

  return Number.isFinite(numericPrice)
    ? numericPrice
    : null;
}

function isPromotionActive(
  enabled?: boolean | null,
  until?: string | null
) {
  if (!enabled) return false;

  if (!until) return true;

  const endDate = new Date(until);

  if (Number.isNaN(endDate.getTime())) {
    return false;
  }

  return endDate.getTime() > Date.now();
}

export async function getAdvertisements(
  search?: string,
  category?: string,
  province?: string,
  city?: string,
  sort?: string,
  minPrice?: string,
  maxPrice?: string,
  promotedOnly?: boolean,
  urgentOnly?: boolean,
  featuredOnly?: boolean
) {
  let query = supabase
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
    .eq("status", "approved");

  if (search?.trim()) {
    const phrase = search
      .trim()
      .replace(/[%(),]/g, " ");

    query = query.or(
      `title.ilike.%${phrase}%,description.ilike.%${phrase}%,city.ilike.%${phrase}%,category.ilike.%${phrase}%`
    );
  }

  if (category?.trim()) {
    query = query.eq(
      "category",
      category.trim()
    );
  }

  if (province?.trim()) {
    query = query.eq(
      "province",
      province.trim()
    );
  }

  if (city?.trim()) {
    query = query.ilike(
      "city",
      `%${city.trim()}%`
    );
  }

  /*
   * Cena może być zapisana również jako tekst,
   * dlatego filtrowanie i sortowanie cen wykonujemy
   * bezpiecznie po pobraniu danych.
   */
  if (
    sort !== "cheap" &&
    sort !== "expensive"
  ) {
    switch (sort) {
      case "oldest":
        query = query.order("created_at", {
          ascending: true,
        });
        break;

      case "popular":
        query = query
          .order("views", {
            ascending: false,
          })
          .order("created_at", {
            ascending: false,
          });
        break;

      case "promoted":
        query = query
          .order("promoted", {
            ascending: false,
          })
          .order("promoted_until", {
            ascending: false,
            nullsFirst: false,
          })
          .order("created_at", {
            ascending: false,
          });
        break;

      default:
        query = query
          .order("promoted", {
            ascending: false,
          })
          .order("featured", {
            ascending: false,
          })
          .order("urgent", {
            ascending: false,
          })
          .order("created_at", {
            ascending: false,
          });
        break;
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error(
      "Błąd pobierania ogłoszeń:",
      error
    );

    return [];
  }

  let advertisements = [...(data ?? [])];

  const numericMinPrice = parsePrice(
    minPrice
  );

  const numericMaxPrice = parsePrice(
    maxPrice
  );

  if (numericMinPrice !== null) {
    advertisements =
      advertisements.filter(
        (advertisement) => {
          const price = parsePrice(
            advertisement.price
          );

          return (
            price !== null &&
            price >= numericMinPrice
          );
        }
      );
  }

  if (numericMaxPrice !== null) {
    advertisements =
      advertisements.filter(
        (advertisement) => {
          const price = parsePrice(
            advertisement.price
          );

          return (
            price !== null &&
            price <= numericMaxPrice
          );
        }
      );
  }

  if (promotedOnly) {
    advertisements =
      advertisements.filter(
        (advertisement) =>
          isPromotionActive(
            advertisement.promoted,
            advertisement.promoted_until
          )
      );
  }

  if (urgentOnly) {
    advertisements =
      advertisements.filter(
        (advertisement) =>
          isPromotionActive(
            advertisement.urgent,
            advertisement.urgent_until
          )
      );
  }

  if (featuredOnly) {
    advertisements =
      advertisements.filter(
        (advertisement) =>
          isPromotionActive(
            advertisement.featured,
            advertisement.featured_until
          )
      );
  }

  if (sort === "cheap") {
    advertisements.sort(
      (first, second) => {
        const firstPrice =
          parsePrice(first.price) ??
          Number.POSITIVE_INFINITY;

        const secondPrice =
          parsePrice(second.price) ??
          Number.POSITIVE_INFINITY;

        if (firstPrice === secondPrice) {
          return (
            new Date(
              second.created_at
            ).getTime() -
            new Date(
              first.created_at
            ).getTime()
          );
        }

        return firstPrice - secondPrice;
      }
    );
  }

  if (sort === "expensive") {
    advertisements.sort(
      (first, second) => {
        const firstPrice =
          parsePrice(first.price) ?? -1;

        const secondPrice =
          parsePrice(second.price) ?? -1;

        if (firstPrice === secondPrice) {
          return (
            new Date(
              second.created_at
            ).getTime() -
            new Date(
              first.created_at
            ).getTime()
          );
        }

        return secondPrice - firstPrice;
      }
    );
  }

  return advertisements;
}