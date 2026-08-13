import Link from "next/link";

import { supabase } from "../lib/supabase";

const PUBLIC_STATS_THRESHOLD = 100;
const APPROVED_STATUS = "approved";

const provinces = [
  "Dolnośląskie",
  "Kujawsko-pomorskie",
  "Lubelskie",
  "Lubuskie",
  "Łódzkie",
  "Małopolskie",
  "Mazowieckie",
  "Opolskie",
  "Podkarpackie",
  "Podlaskie",
  "Pomorskie",
  "Śląskie",
  "Świętokrzyskie",
  "Warmińsko-mazurskie",
  "Wielkopolskie",
  "Zachodniopomorskie",
];

type ProvinceStatistic = {
  province: string;
  count: number | null;
};

export default async function ProvinceStatistics() {
  const advertisementsResult = await supabase
    .from("advertisements")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("status", APPROVED_STATUS);

  if (advertisementsResult.error) {
    console.error(
      "Błąd pobierania liczby zatwierdzonych ogłoszeń dla województw:",
      advertisementsResult.error
    );
  }

  const advertisementsCount = advertisementsResult.count ?? 0;

  const showStatistics =
    !advertisementsResult.error &&
    advertisementsCount >= PUBLIC_STATS_THRESHOLD;

  let statistics: ProvinceStatistic[] = provinces.map((province) => ({
    province,
    count: null,
  }));

  if (showStatistics) {
    statistics = await Promise.all(
      provinces.map(async (province) => {
        const { count, error } = await supabase
          .from("advertisements")
          .select("*", {
            count: "exact",
            head: true,
          })
          .eq("status", APPROVED_STATUS)
          .eq("province", province);

        if (error) {
          console.error(
            `Błąd pobierania zatwierdzonych ogłoszeń dla województwa ${province}:`,
            error
          );

          return {
            province,
            count: null,
          };
        }

        return {
          province,
          count: count ?? 0,
        };
      })
    );
  }

  return (
    <section className="bg-white text-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-slate-950">
            🇵🇱 Ogłoszenia według województw
          </h2>

          <p className="mt-3 text-slate-600">
            Wybierz województwo, aby zobaczyć kandydatów do pracy i firmy
            działające w danym regionie.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {statistics.map((item) => (
            <Link
              key={item.province}
              href={`/wojewodztwo/${encodeURIComponent(item.province)}`}
              className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:shadow-lg"
            >
              <div>
                <span className="font-semibold text-slate-900 group-hover:text-blue-800">
                  {item.province}
                </span>

                <p className="mt-1 text-sm text-slate-500">
                  Kandydaci i firmy →
                </p>
              </div>

              {showStatistics &&
                item.count !== null &&
                item.count > 0 && (
                  <span className="rounded-full bg-blue-100 px-4 py-2 font-bold text-blue-700">
                    {item.count.toLocaleString("pl-PL")}
                  </span>
                )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}