import Link from "next/link";
import { supabase } from "../lib/supabase";
import AdvertisementCard from "./AdvertisementCard";

export default async function PopularAdvertisements() {
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
    .order("views", {
      ascending: false,
    })
    .order("created_at", {
      ascending: false,
    })
    .limit(6);

  if (error) {
    console.error(
      "Błąd pobierania popularnych ogłoszeń:",
      error
    );

    return null;
  }

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <section className="bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-600">
              Najczęściej oglądane
            </p>

            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              🔥 Popularne ogłoszenia
            </h2>

            <p className="mt-3 max-w-2xl text-slate-600">
              Oferty, które wzbudzają największe
              zainteresowanie użytkowników.
            </p>
          </div>

          <Link
            href="/?sort=popular"
            className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 font-bold text-slate-800 shadow-sm transition hover:bg-slate-100 sm:w-auto"
          >
            Przeglądaj ogłoszenia
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