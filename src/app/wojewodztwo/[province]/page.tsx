import Link from "next/link";

import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { supabase } from "../../../lib/supabase";

type Props = {
  params: Promise<{
    province: string;
  }>;
};

type Candidate = {
  id: string;
  name: string | null;
  city: string | null;
  avatar_url: string | null;
  verified: boolean | null;
  candidate_role: string | null;
  preferred_city: string | null;
  preferred_province: string | null;
  years_of_experience: number | null;
  account_type: string | null;
  open_to_job_offers: boolean | null;
  blocked: boolean | null;
  is_admin: boolean | null;
};

type EmployerProfile = {
  id: string;
  name: string | null;
  company_name: string | null;
  city: string | null;
  company_logo: string | null;
  avatar_url: string | null;
  company_description: string | null;
  verified: boolean | null;
  account_type: string | null;
  blocked: boolean | null;
  is_admin: boolean | null;
};

type AdvertisementWithProfile = {
  user_id: string;
  profiles: EmployerProfile | EmployerProfile[] | null;
};

function getEmployerProfile(
  value: EmployerProfile | EmployerProfile[] | null
): EmployerProfile | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

export default async function ProvincePage({
  params,
}: Props) {
  const { province: provinceParam } = await params;
  const province = decodeURIComponent(provinceParam);

  const [candidatesResult, employersResult] = await Promise.all([
    supabase
      .from("profiles")
      .select(`
        id,
        name,
        city,
        avatar_url,
        verified,
        candidate_role,
        preferred_city,
        preferred_province,
        years_of_experience,
        account_type,
        open_to_job_offers,
        blocked,
        is_admin
      `)
      .eq("preferred_province", province)
      .eq("open_to_job_offers", true)
      .order("created_at", { ascending: false }),

    supabase
      .from("advertisements")
      .select(`
        user_id,
        profiles!advertisements_user_id_fkey (
          id,
          name,
          company_name,
          city,
          company_logo,
          avatar_url,
          company_description,
          verified,
          account_type,
          blocked,
          is_admin
        )
      `)
      .eq("status", "approved")
      .eq("province", province)
      .order("created_at", { ascending: false }),
  ]);

  if (candidatesResult.error) {
    console.error(
      "Błąd pobierania kandydatów dla województwa:",
      candidatesResult.error
    );
  }

  if (employersResult.error) {
    console.error(
      "Błąd pobierania firm dla województwa:",
      employersResult.error
    );
  }

  const candidates = ((candidatesResult.data ?? []) as Candidate[]).filter(
    (candidate) =>
      candidate.is_admin !== true &&
      candidate.blocked !== true &&
      (candidate.account_type === "candidate" ||
        candidate.account_type === "both") &&
      Boolean(candidate.candidate_role?.trim())
  );

  const employerMap = new Map<string, EmployerProfile>();

  for (const advertisement of
    (employersResult.data ?? []) as AdvertisementWithProfile[]) {
    const profile = getEmployerProfile(advertisement.profiles);

    if (
      !profile ||
      profile.is_admin === true ||
      profile.blocked === true ||
      (profile.account_type !== "employer" &&
        profile.account_type !== "both")
    ) {
      continue;
    }

    const displayName =
      profile.company_name?.trim() || profile.name?.trim();

    if (!displayName) continue;

    employerMap.set(profile.id, profile);
  }

  const employers = Array.from(employerMap.values());

  return (
    <>
      <Header />

      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
          <Link
            href="/"
            className="inline-flex rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-800 shadow-sm transition hover:bg-blue-50 hover:text-blue-700"
          >
            ← Strona główna
          </Link>

          <div className="mt-7 rounded-3xl bg-gradient-to-r from-blue-800 via-blue-700 to-cyan-500 p-7 text-white shadow-xl sm:p-10">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-100">
              BLISKO24 w regionie
            </p>

            <h1 className="mt-2 text-3xl font-extrabold sm:text-5xl">
              {province}
            </h1>

            <p className="mt-3 max-w-3xl text-lg leading-8 text-blue-50">
              Zobacz osoby szukające pracy oraz firmy publikujące oferty
              w tym województwie.
            </p>
          </div>

          <section className="mt-10">
            <div className="mb-6">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-green-700">
                Szukają pracy
              </p>

              <h2 className="mt-2 text-3xl font-extrabold text-slate-950">
                Kandydaci
              </h2>

              <p className="mt-2 text-slate-600">
                Znaleziono: {candidates.length}
              </p>
            </div>

            {candidates.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                <p className="text-lg font-semibold text-slate-800">
                  Na razie brak kandydatów z tego województwa.
                </p>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {candidates.map((candidate) => {
                  const location =
                    candidate.preferred_city?.trim() ||
                    candidate.city?.trim() ||
                    candidate.preferred_province?.trim();

                  return (
                    <Link
                      key={candidate.id}
                      href={`/profil/${candidate.id}`}
                      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-green-300 hover:shadow-lg"
                    >
                      <div className="flex items-center gap-4">
                        {candidate.avatar_url ? (
                          <img
                            src={candidate.avatar_url}
                            alt={candidate.name ?? "Kandydat"}
                            className="h-16 w-16 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
                            👤
                          </div>
                        )}

                        <div className="min-w-0">
                          <h3 className="text-xl font-extrabold text-slate-950">
                            {candidate.candidate_role}
                          </h3>

                          {candidate.name && (
                            <p className="mt-1 text-slate-700">
                              {candidate.name}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-5 space-y-2 text-sm text-slate-600">
                        {location && <p>📍 {location}</p>}

                        {candidate.years_of_experience !== null && (
                          <p>
                            💼 Doświadczenie:{" "}
                            {candidate.years_of_experience} lat
                          </p>
                        )}

                        {candidate.verified && (
                          <p className="font-bold text-green-700">
                            ✔ Zweryfikowany profil
                          </p>
                        )}
                      </div>

                      <p className="mt-5 font-bold text-blue-700">
                        Zobacz profil →
                      </p>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          <section className="mt-14">
            <div className="mb-6">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-700">
                Działają w regionie
              </p>

              <h2 className="mt-2 text-3xl font-extrabold text-slate-950">
                Firmy i pracodawcy
              </h2>

              <p className="mt-2 text-slate-600">
                Znaleziono: {employers.length}
              </p>
            </div>

            {employers.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                <p className="text-lg font-semibold text-slate-800">
                  Na razie brak firm z aktywnymi ogłoszeniami w tym
                  województwie.
                </p>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {employers.map((employer) => {
                  const displayName =
                    employer.company_name?.trim() ||
                    employer.name?.trim() ||
                    "Firma BLISKO24";

                  const logo =
                    employer.company_logo || employer.avatar_url;

                  return (
                    <Link
                      key={employer.id}
                      href={`/profil/${employer.id}`}
                      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg"
                    >
                      <div className="flex items-center gap-4">
                        {logo ? (
                          <img
                            src={logo}
                            alt={displayName}
                            className="h-16 w-16 rounded-2xl object-cover"
                          />
                        ) : (
                          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-3xl">
                            🏢
                          </div>
                        )}

                        <div className="min-w-0">
                          <h3 className="text-xl font-extrabold text-slate-950">
                            {displayName}
                          </h3>

                          {employer.city && (
                            <p className="mt-1 text-slate-600">
                              📍 {employer.city}
                            </p>
                          )}
                        </div>
                      </div>

                      {employer.company_description && (
                        <p className="mt-5 line-clamp-3 leading-7 text-slate-600">
                          {employer.company_description}
                        </p>
                      )}

                      {employer.verified && (
                        <p className="mt-4 font-bold text-green-700">
                          ✔ Zweryfikowany profil
                        </p>
                      )}

                      <p className="mt-5 font-bold text-blue-700">
                        Zobacz firmę →
                      </p>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}