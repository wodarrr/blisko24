import { supabase } from "../lib/supabase";

const provinces = [
  "Dolnośląskie",
  "Kujawsko-Pomorskie",
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
  "Warmińsko-Mazurskie",
  "Wielkopolskie",
  "Zachodniopomorskie",
];

export default async function ProvinceStatistics() {

  const statistics = await Promise.all(
    provinces.map(async (province) => {

      const { count } = await supabase
        .from("advertisements")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("province", province);

      return {
        province,
        count: count ?? 0,
      };
    })
  );

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">

      <h2 className="mb-8 text-3xl font-bold">
        🇵🇱 Ogłoszenia według województw
      </h2>

      <div className="grid gap-4 md:grid-cols-2">

        {statistics.map((item) => (

          <div
            key={item.province}
            className="flex items-center justify-between rounded-2xl bg-white p-5 shadow hover:shadow-lg transition"
          >

            <span className="font-semibold">
              {item.province}
            </span>

            <span className="rounded-full bg-blue-100 px-4 py-2 font-bold text-blue-700">
              {item.count}
            </span>

          </div>

        ))}

      </div>

    </section>
  );
}