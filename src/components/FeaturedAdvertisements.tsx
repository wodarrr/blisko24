import Link from "next/link";
import { supabase } from "../lib/supabase";
import AdvertisementCard from "./AdvertisementCard";

export default async function FeaturedAdvertisements() {
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
      )
    `)
    .eq("status", "approved")
    .eq("promoted", true)
    .order("promoted_until", {
      ascending: false,
      nullsFirst: false,
    })
    .order("created_at", {
      ascending: false,
    })
    .limit(6);

  if (error) {
    console.error(
      "Błąd pobierania promowanych ogłoszeń:",
      error
    );
    return null;
  }

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <section className="bg-gradient-to-b from-yellow-50/70 to-gray-100 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-yellow-700">
              Wyróżnione oferty
            </p>

            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              ⭐ Promowane ogłoszenia
            </h2>

            <p className="mt-3 max-w-2xl text-slate-600">
              Oferty wyróżnione przez użytkowników,
              widoczne w pierwszej kolejności.
            </p>
          </div>

          <Link
            href="/?sort=promoted"
            className="inline-flex w-full items-center justify-center rounded-xl border border-yellow-300 bg-white px-5 py-3 font-bold text-yellow-800 shadow-sm transition hover:bg-yellow-100 sm:w-auto"
          >
            Zobacz wszystkie
            <span className="ml-2">→</span>
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((advertisement) => (
            <AdvertisementCard
              key={advertisement.id}
              advertisement={advertisement}
            />
          ))}
        </div>
      </div>
    </section>
  );
}