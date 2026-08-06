import { supabase } from "../lib/supabase";

const PUBLIC_STATS_THRESHOLD = 100;
const APPROVED_STATUS = "approved";

export default async function PortalStats() {
  const { count, error } = await supabase
    .from("advertisements")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("status", APPROVED_STATUS);

  if (error) {
    console.error(
      "Błąd pobierania liczby zatwierdzonych ogłoszeń:",
      error
    );

    return null;
  }

  const approvedAdvertisementsCount = count ?? 0;

  if (approvedAdvertisementsCount < PUBLIC_STATS_THRESHOLD) {
    return null;
  }

  return (
    <section className="mx-auto mt-8 max-w-7xl px-6">
      <div className="rounded-2xl bg-gradient-to-r from-blue-700 to-sky-600 p-6 text-white shadow-xl">
        <h2 className="text-2xl font-bold">
          🚀 BLISKO24 rozwija się każdego dnia
        </h2>

        <p className="mt-2 text-lg">
          Aktualnie opublikowano{" "}
          <strong>
            {approvedAdvertisementsCount.toLocaleString("pl-PL")}
          </strong>{" "}
          zatwierdzonych ogłoszeń z całej Polski.
        </p>
      </div>
    </section>
  );
}