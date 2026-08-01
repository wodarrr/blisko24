import { supabase } from "../lib/supabase";

export default async function AdminDashboard() {
  const [
    { count: users },
    { count: ads },
    { count: promoted },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("*", { head: true, count: "exact" }),

    supabase
      .from("advertisements")
      .select("*", { head: true, count: "exact" }),

    supabase
      .from("advertisements")
      .select("*", { head: true, count: "exact" })
      .eq("promoted", true),
  ]);

  return (
    <section className="grid gap-6 md:grid-cols-3">

      <div className="rounded-2xl bg-white p-8 shadow">
        <p className="text-gray-500">
          Użytkownicy
        </p>

        <h2 className="mt-2 text-4xl font-bold">
          {users ?? 0}
        </h2>
      </div>

      <div className="rounded-2xl bg-white p-8 shadow">
        <p className="text-gray-500">
          Ogłoszenia
        </p>

        <h2 className="mt-2 text-4xl font-bold">
          {ads ?? 0}
        </h2>
      </div>

      <div className="rounded-2xl bg-white p-8 shadow">
        <p className="text-gray-500">
          Promowane
        </p>

        <h2 className="mt-2 text-4xl font-bold text-yellow-500">
          {promoted ?? 0}
        </h2>
      </div>

    </section>
  );
}