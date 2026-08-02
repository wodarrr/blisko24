import Link from "next/link";

import { getAdvertisements } from "../lib/getAdvertisements";
import AdvertisementCard from "./AdvertisementCard";
import type { Advertisement } from "../types/advertisement";

type Props = {
  search?: string;
  category?: string;
  province?: string;
  city?: string;
  sort?: string;
  minPrice?: string;
  maxPrice?: string;
  promotedOnly?: boolean;
  urgentOnly?: boolean;
  featuredOnly?: boolean;
};

export default async function LatestAds({
  search,
  category,
  province,
  city,
  sort,
  minPrice,
  maxPrice,
  promotedOnly,
  urgentOnly,
  featuredOnly,
}: Props) {
  const advertisements =
    await getAdvertisements(
      search,
      category,
      province,
      city,
      sort,
      minPrice,
      maxPrice,
      promotedOnly,
      urgentOnly,
      featuredOnly
    );

  const filtersActive = Boolean(
    search?.trim() ||
      category?.trim() ||
      province?.trim() ||
      city?.trim() ||
      minPrice?.trim() ||
      maxPrice?.trim() ||
      promotedOnly ||
      urgentOnly ||
      featuredOnly
  );

  return (
    <section
      id="ogloszenia"
      className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16"
    >
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-700">
            Ogłoszenia BLISKO24
          </p>

          <h2 className="mt-2 text-3xl font-extrabold text-slate-900">
            {filtersActive
              ? "Wyniki wyszukiwania"
              : "Najnowsze ogłoszenia"}
          </h2>

          <p className="mt-2 text-slate-500">
            Znaleziono:{" "}
            <strong className="text-slate-800">
              {advertisements.length}
            </strong>
          </p>
        </div>

        {filtersActive && (
          <Link
            href="/#ogloszenia"
            className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Wyczyść filtry
          </Link>
        )}
      </div>

      {advertisements.length === 0 ? (
        <div className="rounded-3xl bg-white p-8 text-center shadow sm:p-12">
          <div className="text-6xl">🔎</div>

          <h3 className="mt-5 text-2xl font-bold text-slate-900">
            Nie znaleziono ogłoszeń
          </h3>

          <p className="mx-auto mt-3 max-w-lg text-slate-500">
            Zmień wyszukiwaną frazę, lokalizację,
            zakres ceny albo usuń część filtrów.
          </p>

          <Link
            href="/#ogloszenia"
            className="mt-7 inline-flex rounded-xl bg-blue-700 px-6 py-3 font-bold text-white hover:bg-blue-800"
          >
            Pokaż wszystkie ogłoszenia
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {advertisements.map(
            (advertisement) => (
              <AdvertisementCard
                key={advertisement.id}
                advertisement={
                  advertisement as Advertisement
                }
              />
            )
          )}
        </div>
      )}
    </section>
  );
}