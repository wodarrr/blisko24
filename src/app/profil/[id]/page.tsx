import Link from "next/link";
import { supabase } from "../../../lib/supabase";
import AdvertisementCard from "../../../components/AdvertisementCard";
import ProfileReviews from "../../../components/ProfileReviews";
import ProfileContact from "../../../components/ProfileContact";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProfilePage({
  params,
}: Props) {
  const { id } = await params;

  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

  if (profileError || !profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 px-6">
        <div className="w-full max-w-lg rounded-2xl bg-white p-10 text-center shadow">
          <div className="text-6xl">👤</div>

          <h1 className="mt-5 text-3xl font-bold">
            Profil nie istnieje
          </h1>

          <p className="mt-3 text-gray-500">
            Nie znaleziono tego użytkownika.
          </p>

          <Link
            href="/"
            className="mt-7 inline-flex rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800"
          >
            Wróć na stronę główną
          </Link>
        </div>
      </main>
    );
  }

  const { data: advertisements, error: advertisementsError } =
    await supabase
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
      .eq("user_id", id)
      .order("created_at", {
        ascending: false,
      });

  if (advertisementsError) {
    console.error(
      "Błąd pobierania ogłoszeń użytkownika:",
      advertisementsError
    );
  }

  const userAdvertisements = advertisements ?? [];

  const totalViews = userAdvertisements.reduce(
    (sum: number, advertisement: any) =>
      sum + (advertisement.views ?? 0),
    0
  );

  const totalFavorites = userAdvertisements.reduce(
    (sum: number, advertisement: any) =>
      sum + (advertisement.favorites?.length ?? 0),
    0
  );

  const displayName =
    profile.name?.trim() ||
    profile.company_name?.trim() ||
    "Użytkownik BLISKO24";

  const accountDate = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString(
        "pl-PL",
        {
          month: "long",
          year: "numeric",
        }
      )
    : null;

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">

        {/* Główna karta profilu */}
        <section className="overflow-hidden rounded-3xl bg-white shadow">
          <div className="h-32 bg-gradient-to-r from-blue-800 via-blue-700 to-cyan-500 sm:h-44" />

          <div className="px-5 pb-8 sm:px-8 lg:px-10">

            <div className="-mt-16 flex flex-col items-center gap-6 sm:-mt-20 lg:flex-row lg:items-end">

              {/* Avatar */}
              <div className="shrink-0 rounded-full bg-white p-2 shadow-xl">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={displayName}
                    className="h-32 w-32 rounded-full object-cover sm:h-40 sm:w-40"
                  />
                ) : (
                  <div className="flex h-32 w-32 items-center justify-center rounded-full bg-slate-200 text-6xl sm:h-40 sm:w-40">
                    👤
                  </div>
                )}
              </div>

              {/* Nazwa i podstawowe informacje */}
              <div className="min-w-0 flex-1 text-center lg:pb-3 lg:text-left">

                <div className="flex flex-col items-center gap-3 lg:flex-row lg:flex-wrap lg:justify-start">

                  <h1 className="break-words text-3xl font-extrabold text-slate-900 sm:text-4xl">
                    {displayName}
                  </h1>

                  {profile.verified && (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-700">
                      ✔ Zweryfikowany
                    </span>
                  )}

                </div>

                {profile.company_name &&
                  profile.company_name !== displayName && (
                    <p className="mt-2 text-lg font-semibold text-slate-600">
                      🏢 {profile.company_name}
                    </p>
                  )}

                <div className="mt-3 flex flex-col items-center gap-2 text-gray-500 sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start">

                  {profile.city && (
                    <span>
                      📍 {profile.city}
                    </span>
                  )}

                  {accountDate && (
                    <span>
                      📅 Na BLISKO24 od {accountDate}
                    </span>
                  )}

                </div>
              </div>
            </div>

            {/* Opis */}
            <div className="mx-auto mt-8 max-w-3xl text-center lg:mx-0 lg:text-left">
              <p className="whitespace-pre-line break-words leading-7 text-slate-700">
                {profile.description?.trim() ||
                  "Użytkownik nie dodał jeszcze opisu profilu."}
              </p>
            </div>

            {/* Statystyki */}
            <div className="mt-9 grid gap-4 sm:grid-cols-3">

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-center">
                <p className="text-sm font-semibold text-gray-500">
                  Aktywne ogłoszenia
                </p>

                <p className="mt-2 text-3xl font-extrabold text-blue-700">
                  {userAdvertisements.length}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-center">
                <p className="text-sm font-semibold text-gray-500">
                  Łączne wyświetlenia
                </p>

                <p className="mt-2 text-3xl font-extrabold text-green-600">
                  {totalViews}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-center">
                <p className="text-sm font-semibold text-gray-500">
                  Dodania do ulubionych
                </p>

                <p className="mt-2 text-3xl font-extrabold text-red-500">
                  ❤️ {totalFavorites}
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* Kontakt */}
        <ProfileContact profile={profile} />

        {/* Opinie */}
        <ProfileReviews userId={id} />

        {/* Ogłoszenia */}
        <section className="mt-12">

          <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-blue-700">
                Oferta użytkownika
              </p>

              <h2 className="mt-1 text-3xl font-extrabold text-slate-900">
                Ogłoszenia
              </h2>
            </div>

            <p className="text-gray-500">
              {userAdvertisements.length} aktywnych
            </p>

          </div>

          {userAdvertisements.length === 0 ? (
            <div className="rounded-3xl bg-white p-10 text-center shadow">

              <div className="text-5xl">
                📋
              </div>

              <h3 className="mt-4 text-2xl font-bold">
                Brak aktywnych ogłoszeń
              </h3>

              <p className="mt-2 text-gray-500">
                Ten użytkownik nie opublikował jeszcze żadnego ogłoszenia.
              </p>

            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {userAdvertisements.map(
                (advertisement: any) => (
                  <AdvertisementCard
                    key={advertisement.id}
                    advertisement={advertisement}
                  />
                )
              )}
            </div>
          )}

        </section>

      </div>
    </main>
  );
}