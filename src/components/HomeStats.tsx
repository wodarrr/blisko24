import { supabase } from "../lib/supabase";

type StatCardProps = {
  icon: string;
  label: string;
  value: number;
  description: string;
  accent: "blue" | "green" | "purple" | "red" | "yellow";
};

const accentStyles = {
  blue: {
    icon: "bg-blue-100 text-blue-700",
    value: "text-blue-700",
  },
  green: {
    icon: "bg-green-100 text-green-700",
    value: "text-green-700",
  },
  purple: {
    icon: "bg-purple-100 text-purple-700",
    value: "text-purple-700",
  },
  red: {
    icon: "bg-red-100 text-red-700",
    value: "text-red-600",
  },
  yellow: {
    icon: "bg-yellow-100 text-yellow-700",
    value: "text-yellow-700",
  },
};

function StatCard({
  icon,
  label,
  value,
  description,
  accent,
}: StatCardProps) {
  const styles = accentStyles[accent];

  return (
    <div className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-7">
      <div
        className={`flex h-14 w-14 items-center justify-center rounded-2xl text-3xl ${styles.icon}`}
      >
        {icon}
      </div>

      <p className="mt-5 text-sm font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className={`mt-2 text-4xl font-extrabold ${styles.value}`}>
        {value.toLocaleString("pl-PL")}
      </p>

      <p className="mt-3 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

export default async function HomeStats() {
  const [
    advertisementsResult,
    usersResult,
    conversationsResult,
    favoritesResult,
    companiesResult,
    viewsResult,
  ] = await Promise.all([
    supabase
      .from("advertisements")
      .select("*", {
        count: "exact",
        head: true,
      }),

    supabase
      .from("profiles")
      .select("*", {
        count: "exact",
        head: true,
      }),

    supabase
      .from("conversations")
      .select("*", {
        count: "exact",
        head: true,
      }),

    supabase
      .from("favorites")
      .select("*", {
        count: "exact",
        head: true,
      }),

    supabase
      .from("profiles")
      .select("*", {
        count: "exact",
        head: true,
      })
      .not("company_name", "is", null)
      .neq("company_name", ""),

    supabase
      .from("advertisements")
      .select("views"),
  ]);

  if (advertisementsResult.error) {
    console.error(
      "Błąd pobierania liczby ogłoszeń:",
      advertisementsResult.error
    );
  }

  if (usersResult.error) {
    console.error(
      "Błąd pobierania liczby użytkowników:",
      usersResult.error
    );
  }

  if (conversationsResult.error) {
    console.error(
      "Błąd pobierania liczby rozmów:",
      conversationsResult.error
    );
  }

  if (favoritesResult.error) {
    console.error(
      "Błąd pobierania liczby ulubionych:",
      favoritesResult.error
    );
  }

  if (companiesResult.error) {
    console.error(
      "Błąd pobierania liczby firm:",
      companiesResult.error
    );
  }

  if (viewsResult.error) {
    console.error(
      "Błąd pobierania wyświetleń:",
      viewsResult.error
    );
  }

  const totalViews =
    viewsResult.data?.reduce(
      (sum, advertisement) =>
        sum + (advertisement.views ?? 0),
      0
    ) ?? 0;

  return (
    <section className="bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">

        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-700">
            BLISKO24 w liczbach
          </p>

          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Portal, który rośnie razem z lokalną społecznością
          </h2>

          <p className="mt-4 text-lg leading-8 text-slate-600">
            Ogłoszenia, rozmowy, firmy i codzienna aktywność
            użytkowników w jednym miejscu.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">

          <StatCard
            icon="📄"
            label="Ogłoszenia"
            value={advertisementsResult.count ?? 0}
            description="Aktywne oferty użytkowników."
            accent="blue"
          />

          <StatCard
            icon="👥"
            label="Użytkownicy"
            value={usersResult.count ?? 0}
            description="Profile utworzone w portalu."
            accent="green"
          />

          <StatCard
            icon="💬"
            label="Rozmowy"
            value={conversationsResult.count ?? 0}
            description="Kontakty rozpoczęte przy ogłoszeniach."
            accent="purple"
          />

          <StatCard
            icon="❤️"
            label="Ulubione"
            value={favoritesResult.count ?? 0}
            description="Oferty zapisane przez użytkowników."
            accent="red"
          />

          <StatCard
            icon="🏢"
            label="Firmy"
            value={companiesResult.count ?? 0}
            description="Profile z uzupełnioną nazwą firmy."
            accent="yellow"
          />

        </div>

        <div className="mt-6 rounded-3xl bg-slate-900 px-6 py-6 text-white shadow-xl sm:flex sm:items-center sm:justify-between sm:px-8">

          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-slate-300">
              Łączna aktywność
            </p>

            <p className="mt-2 text-2xl font-extrabold sm:text-3xl">
              👁️ {totalViews.toLocaleString("pl-PL")} wyświetleń ogłoszeń
            </p>
          </div>

          <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300 sm:mt-0 sm:text-right">
            Licznik rośnie za każdym razem, gdy ktoś otwiera szczegóły
            ogłoszenia.
          </p>

        </div>

      </div>
    </section>
  );
}