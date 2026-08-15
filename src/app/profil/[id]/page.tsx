import Link from "next/link";

import Header from "../../../components/Header";
import AdvertisementCard from "../../../components/AdvertisementCard";
import ProfileContact from "../../../components/ProfileContact";
import ProfileReviews from "../../../components/ProfileReviews";
import TrustCard from "../../../components/TrustCard";
import CandidateProfileCard from "../../../components/CandidateProfileCard";
import BliskoScore from "../../../components/BliskoScore";
import AdminProfileActions from "../../../components/AdminProfileActions";
import { supabase } from "../../../lib/supabase";
import type { Advertisement } from "../../../types/advertisement";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

type Profile = {
  id: string;
  name: string | null;
  company_name: string | null;
  city: string | null;
  avatar_url: string | null;
  description: string | null;
  verified: boolean | null;
  created_at: string | null;
  last_seen?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  company_logo?: string | null;
  company_description?: string | null;
  opening_hours?: string | null;

  candidate_role?: string | null;
  candidate_skills?: string[] | null;
  preferred_province?: string | null;
  preferred_city?: string | null;
  work_modes?: string[] | null;
  available_from?: string | null;
  open_to_job_offers?: boolean | null;
  contact_sharing_consent?: boolean | null;
  years_of_experience?: number | null;
};

function getActivityStatus(
  value?: string | null
) {
  if (!value) {
    return {
      label: "Brak informacji o aktywności",
      className: "text-slate-500",
      dotClassName: "bg-slate-400",
    };
  }

  const lastSeen = new Date(value);

  if (Number.isNaN(lastSeen.getTime())) {
    return {
      label: "Brak informacji o aktywności",
      className: "text-slate-500",
      dotClassName: "bg-slate-400",
    };
  }

  const differenceInMinutes = Math.floor(
    (Date.now() - lastSeen.getTime()) /
      (1000 * 60)
  );

  if (differenceInMinutes <= 3) {
    return {
      label: "Online teraz",
      className: "text-green-700",
      dotClassName: "bg-green-500",
    };
  }

  if (differenceInMinutes < 60) {
    return {
      label: `Aktywny ${differenceInMinutes} min temu`,
      className: "text-green-700",
      dotClassName: "bg-green-400",
    };
  }

  const hours = Math.floor(
    differenceInMinutes / 60
  );

  if (hours < 24) {
    return {
      label:
        hours === 1
          ? "Aktywny godzinę temu"
          : `Aktywny ${hours} godz. temu`,
      className: "text-yellow-700",
      dotClassName: "bg-yellow-500",
    };
  }

  const days = Math.floor(hours / 24);

  return {
    label:
      days === 1
        ? "Aktywny wczoraj"
        : `Aktywny ${days} dni temu`,
    className: "text-slate-500",
    dotClassName: "bg-slate-400",
  };
}

export default async function ProfilePage({
  params,
}: Props) {
  const { id } = await params;

  const {
    data: profileData,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  const profile = profileData as Profile | null;

  if (profileError || !profile) {
    if (profileError) {
      console.error(
        "Błąd pobierania profilu:",
        profileError
      );
    }

    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 px-6">
        <div className="w-full max-w-lg rounded-3xl bg-white p-10 text-center shadow">
          <div className="text-6xl">
            👤
          </div>

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

  const {
    data: advertisementsData,
    error: advertisementsError,
  } = await supabase
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
    .eq("user_id", id)
    .eq("status", "approved")
    .order("created_at", {
      ascending: false,
    });

  if (advertisementsError) {
    console.error(
      "Błąd pobierania ogłoszeń użytkownika:",
      advertisementsError
    );
  }

  const userAdvertisements =
    (advertisementsData ?? []) as Advertisement[];

  const {
    data: reviewsData,
    error: reviewsError,
  } = await supabase
    .from("reviews")
    .select("rating")
    .eq("user_id", id);

  if (reviewsError) {
    console.error(
      "Błąd pobierania opinii do BLISKO SCORE:",
      reviewsError
    );
  }

  const reviewsCount =
    reviewsData?.length ?? 0;

  const totalViews = userAdvertisements.reduce(
    (sum, advertisement) =>
      sum + (advertisement.views ?? 0),
    0
  );

  const totalFavorites =
    userAdvertisements.reduce(
      (sum, advertisement) =>
        sum +
        (advertisement.favorites?.length ?? 0),
      0
    );

  const displayName =
    profile.name?.trim() ||
    profile.company_name?.trim() ||
    "Użytkownik BLISKO24";

  const accountDate = profile.created_at
    ? new Date(
        profile.created_at
      ).toLocaleDateString("pl-PL", {
        month: "long",
        year: "numeric",
      })
    : null;

  const activityStatus =
    getActivityStatus(profile.last_seen);

  return (
    <>
      <Header />

      <main className="min-h-screen bg-gray-100">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
          <div className="mb-5">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-800 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
            >
              ← Strona główna
            </Link>
          </div>

          <section className="overflow-hidden rounded-3xl bg-white shadow">
          <div className="h-32 bg-gradient-to-r from-blue-800 via-blue-700 to-cyan-500 sm:h-44" />

          <div className="px-5 pb-8 sm:px-8 lg:px-10">
            <div className="-mt-16 flex flex-col items-center gap-6 sm:-mt-20 lg:flex-row lg:items-end">
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
                  profile.company_name !==
                    displayName && (
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
                      📅 Na BLISKO24 od{" "}
                      {accountDate}
                    </span>
                  )}

                  <span
                    className={`inline-flex items-center gap-2 font-semibold ${activityStatus.className}`}
                  >
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${activityStatus.dotClassName}`}
                    />
                    {activityStatus.label}
                  </span>
                </div>
              </div>
            </div>

            <div className="mx-auto mt-8 max-w-3xl text-center lg:mx-0 lg:text-left">
              <p className="whitespace-pre-line break-words leading-7 text-slate-700">
                {profile.description?.trim() ||
                  "Użytkownik nie dodał jeszcze opisu profilu."}
              </p>
            </div>

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
                  {totalViews.toLocaleString("pl-PL")}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-center">
                <p className="text-sm font-semibold text-gray-500">
                  Dodania do ulubionych
                </p>
                <p className="mt-2 text-3xl font-extrabold text-red-500">
                  ❤️ {totalFavorites.toLocaleString("pl-PL")}
                </p>
              </div>
            </div>
          </div>
        </section>

        <TrustCard
          avatarUrl={profile.avatar_url}
          name={profile.name}
          city={profile.city}
          description={profile.description}
          phone={profile.phone}
          verified={profile.verified}
          activeAdvertisements={userAdvertisements.length}
        />

        <BliskoScore
          avatarUrl={profile.avatar_url}
          description={profile.description}
          city={profile.city}
          candidateRole={profile.candidate_role}
          skills={profile.candidate_skills}
          preferredProvince={profile.preferred_province}
          preferredCity={profile.preferred_city}
          workModes={profile.work_modes}
          availableFrom={profile.available_from}
          openToOffers={profile.open_to_job_offers}
          contactSharingConsent={
            profile.contact_sharing_consent
          }
          yearsOfExperience={
            profile.years_of_experience
          }
          verified={profile.verified}
          reviewsCount={reviewsCount}
          activeAdvertisements={
            userAdvertisements.length
          }
          lastSeen={profile.last_seen}
        />

        <CandidateProfileCard
          role={profile.candidate_role}
          skills={profile.candidate_skills}
          preferredProvince={profile.preferred_province}
          preferredCity={profile.preferred_city}
          workModes={profile.work_modes}
          availableFrom={profile.available_from}
          openToOffers={profile.open_to_job_offers}
          yearsOfExperience={profile.years_of_experience}
        />

        <ProfileContact profile={profile} />

        <ProfileReviews userId={id} />

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
                (advertisement) => (
                  <AdvertisementCard
                    key={advertisement.id}
                    advertisement={advertisement}
                  />
                )
              )}
            </div>
          )}
        </section>

        <AdminProfileActions userId={id} />
        </div>
      </main>
    </>
  );
}