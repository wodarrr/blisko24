import { supabase } from "../lib/supabase";

export default async function PortalStats() {
  const { count } = await supabase
    .from("advertisements")
    .select("*", {
      count: "exact",
      head: true,
    });

  return (
    <section className="mx-auto mt-8 max-w-7xl px-6">
      <div className="rounded-2xl bg-gradient-to-r from-blue-700 to-sky-600 p-6 text-white shadow-xl">

        <h2 className="text-2xl font-bold">
          🚀 BLISKO24 rozwija się każdego dnia
        </h2>

        <p className="mt-2 text-lg">
          Aktualnie opublikowano <strong>{count ?? 0}</strong> ogłoszeń z całej Polski.
        </p>

      </div>
    </section>
  );
}