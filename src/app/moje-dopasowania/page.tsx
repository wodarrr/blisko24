"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { supabase } from "../../lib/supabase";

type MatchRow = {
  id: number;
  candidate_id: string;
  match_score: number;
  status: string;
  created_at: string;
  matched_role: boolean;
  matched_province: boolean;
  matched_city: boolean;
  matched_experience: boolean;
  matched_skills: boolean;
  matched_work_modes: boolean;

  profiles: {
    id: string;
    name: string | null;
    city: string | null;
    avatar_url: string | null;
    verified: boolean | null;
    candidate_role: string | null;
    candidate_skills: string[] | null;
    preferred_province: string | null;
    preferred_city: string | null;
    work_modes: string[] | null;
    years_of_experience: number | null;
    open_to_job_offers: boolean | null;
  } | null;

  employer_alerts: {
    id: number;
    role: string | null;
    province: string | null;
    city: string | null;
    min_experience: number | null;
    skills: string[] | null;
    required_skills: string[] | null;
    optional_skills: string[] | null;
    work_modes: string[] | null;
  } | null;
};

type UnlockStatus = "pending" | "unlocked" | "cancelled" | "refunded";

type ContactData = {
  candidate_id: string;
  phone: string | null;
  email: string | null;
  unlocked_at: string | null;
};

type UnlockRequestResult = {
  unlock_id: number;
  unlock_status: UnlockStatus;
};

type PlatformSettings = {
  free_contact_unlocks_enabled: boolean;
  payments_enabled: boolean;
  free_period_started_at: string | null;
  free_period_ends_at: string | null;
};

export default function MyMatchesPage() {
  const router = useRouter();

  const [matches, setMatches] = useState<MatchRow[]>([]);

  const [loading, setLoading] = useState(true);

  const [errorMessage, setErrorMessage] = useState("");

  const [accessDenied, setAccessDenied] = useState(false);

  const [unlockStatuses, setUnlockStatuses] = useState<
    Record<string, UnlockStatus>
  >({});

  const [contacts, setContacts] = useState<Record<number, ContactData>>({});

  const [unlockingMatchId, setUnlockingMatchId] = useState<number | null>(null);

  const [platformSettings, setPlatformSettings] =
    useState<PlatformSettings | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadMatches() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (cancelled) return;

      if (userError || !user) {
        router.replace("/logowanie");
        return;
      }

      const { data: accessProfile, error: accessError } = await supabase
        .from("profiles")
        .select("account_type")
        .eq("id", user.id)
        .maybeSingle();

      if (cancelled) return;

      if (
        accessError ||
        (accessProfile?.account_type !== "employer" &&
          accessProfile?.account_type !== "both")
      ) {
        if (accessError) {
          console.error("Błąd sprawdzania typu konta:", accessError);
        }

        setAccessDenied(true);
        setLoading(false);
        return;
      }

      const { data: settingsData, error: settingsError } = await supabase
        .from("platform_settings")
        .select(
          "free_contact_unlocks_enabled, payments_enabled, free_period_started_at, free_period_ends_at",
        )
        .eq("id", 1)
        .maybeSingle();

      if (cancelled) return;

      if (settingsError) {
        console.error("Błąd pobierania ustawień platformy:", settingsError);
      } else if (settingsData) {
        setPlatformSettings(settingsData as PlatformSettings);
      }

      const { data, error } = await supabase
        .from("candidate_matches")
        .select(
          `
          id,
          candidate_id,
          match_score,
          status,
          created_at,
          matched_role,
          matched_province,
          matched_city,
          matched_experience,
          matched_skills,
          matched_work_modes,
          profiles!candidate_matches_candidate_id_fkey (
            id,
            name,
            city,
            avatar_url,
            verified,
            candidate_role,
            candidate_skills,
            preferred_province,
            preferred_city,
            work_modes,
            years_of_experience,
            open_to_job_offers
          ),
          employer_alerts!candidate_matches_alert_id_fkey (
            id,
            role,
            province,
            city,
            min_experience,
            skills,
            required_skills,
            optional_skills,
            work_modes
          )
        `,
        )
        .eq("employer_id", user.id)
        .order("created_at", {
          ascending: false,
        });

      if (cancelled) return;

      if (error) {
        console.error("Błąd pobierania dopasowań:", error);

        setErrorMessage("Nie udało się pobrać dopasowań.");

        setLoading(false);
        return;
      }

      const loadedMatches = (data ?? []) as unknown as MatchRow[];

      const { data: unlockRows, error: unlockError } = await supabase
        .from("contact_unlocks")
        .select("candidate_id, status")
        .eq("employer_id", user.id);

      if (cancelled) return;

      if (unlockError) {
        console.error("Błąd pobierania odblokowań:", unlockError);
      }

      const nextUnlockStatuses: Record<string, UnlockStatus> = {};

      for (const unlock of unlockRows ?? []) {
        nextUnlockStatuses[unlock.candidate_id] = unlock.status as UnlockStatus;
      }

      const unlockedMatches = loadedMatches.filter(
        (match) => nextUnlockStatuses[match.candidate_id] === "unlocked",
      );

      const contactResults = await Promise.all(
        unlockedMatches.map(async (match) => {
          const { data: contactData, error: contactError } = await supabase.rpc(
            "get_unlocked_candidate_contact",
            {
              p_match_id: match.id,
            },
          );

          if (contactError) {
            console.error("Błąd pobierania kontaktu:", contactError);
            return null;
          }

          const contact = (contactData as ContactData[] | null)?.[0];

          return contact
            ? {
                matchId: match.id,
                contact,
              }
            : null;
        }),
      );

      if (cancelled) return;

      const nextContacts: Record<number, ContactData> = {};

      for (const result of contactResults) {
        if (result) {
          nextContacts[result.matchId] = result.contact;
        }
      }

      setMatches(loadedMatches);
      setUnlockStatuses(nextUnlockStatuses);
      setContacts(nextContacts);

      setLoading(false);
    }

    loadMatches();

    return () => {
      cancelled = true;
    };
  }, [router]);

  async function markAsViewed(matchId: number) {
    await supabase
      .from("candidate_matches")
      .update({
        status: "viewed",
        viewed_at: new Date().toISOString(),
      })
      .eq("id", matchId);

    setMatches((previous) =>
      previous.map((match) =>
        match.id === matchId
          ? {
              ...match,
              status: "viewed",
            }
          : match,
      ),
    );
  }

  async function loadUnlockedContact(matchId: number) {
    const { data, error } = await supabase.rpc(
      "get_unlocked_candidate_contact",
      {
        p_match_id: matchId,
      },
    );

    if (error) {
      console.error("Błąd pobierania kontaktu:", error);
      return;
    }

    const contact = (data as ContactData[] | null)?.[0];

    if (contact) {
      setContacts((previous) => ({
        ...previous,
        [matchId]: contact,
      }));
    }
  }

  async function requestContactUnlock(match: MatchRow) {
    setUnlockingMatchId(match.id);

    const { data, error } = await supabase.rpc(
      "request_candidate_contact_unlock",
      {
        p_match_id: match.id,
      },
    );

    if (error) {
      setUnlockingMatchId(null);
      console.error("Błąd tworzenia prośby o kontakt:", error);
      window.alert(error.message || "Nie udało się utworzyć prośby.");
      return;
    }

    const result = (data as UnlockRequestResult[] | null)?.[0];

    if (!result) {
      setUnlockingMatchId(null);
      window.alert("Nie udało się utworzyć prośby o odblokowanie kontaktu.");
      return;
    }

    setUnlockStatuses((previous) => ({
      ...previous,
      [match.candidate_id]: result.unlock_status,
    }));

    if (result.unlock_status === "unlocked") {
      await loadUnlockedContact(match.id);
      setUnlockingMatchId(null);
      return;
    }

    if (!platformSettings?.payments_enabled) {
      setUnlockingMatchId(null);
      window.alert(
        "Nie udało się bezpłatnie odblokować kontaktu. Odśwież stronę i spróbuj ponownie.",
      );
      return;
    }

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.access_token) {
      setUnlockingMatchId(null);
      window.alert("Sesja logowania wygasła. Zaloguj się ponownie.");
      router.replace("/logowanie");
      return;
    }

    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          matchId: match.id,
        }),
      });

      const checkoutData = (await response.json()) as {
        url?: string;
        error?: string;
      };

      if (!response.ok || !checkoutData.url) {
        setUnlockingMatchId(null);
        window.alert(checkoutData.error || "Nie udało się otworzyć płatności.");
        return;
      }

      window.location.assign(checkoutData.url);
    } catch (checkoutError) {
      setUnlockingMatchId(null);
      console.error("Błąd uruchamiania płatności:", checkoutError);
      window.alert("Nie udało się połączyć z płatnością Stripe.");
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <p className="text-lg font-semibold text-slate-700">
          Ładowanie dopasowań...
        </p>
      </main>
    );
  }

  if (accessDenied) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-10">
        <section className="w-full max-w-2xl rounded-3xl border border-amber-200 bg-white p-7 text-center shadow-xl sm:p-10">
          <div className="text-6xl">🎯</div>

          <p className="mt-5 text-sm font-extrabold uppercase tracking-[0.18em] text-amber-700">
            Moduł pracodawcy
          </p>

          <h1 className="mt-3 text-3xl font-extrabold text-slate-900">
            Dopasowania są dostępne dla pracodawców
          </h1>

          <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-600">
            Twoje konto jest obecnie kontem kandydata. Aby tworzyć alerty i
            przeglądać dopasowanych kandydatów, wybierz „Obie opcje” w
            ustawieniach profilu.
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/ustawienia/profil"
              className="rounded-xl bg-blue-700 px-6 py-3.5 font-bold text-white hover:bg-blue-800"
            >
              Zmień typ konta
            </Link>

            <Link
              href="/"
              className="rounded-xl border border-slate-300 bg-white px-6 py-3.5 font-bold text-slate-700 hover:bg-slate-50"
            >
              Wróć na stronę główną
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const now = Date.now();

  const freePeriodStartedAt = platformSettings?.free_period_started_at
    ? new Date(platformSettings.free_period_started_at).getTime()
    : null;

  const freePeriodEndsAt = platformSettings?.free_period_ends_at
    ? new Date(platformSettings.free_period_ends_at).getTime()
    : null;

  const freeContactUnlocksActive = Boolean(
    platformSettings?.free_contact_unlocks_enabled &&
      (freePeriodStartedAt === null || now >= freePeriodStartedAt) &&
      (freePeriodEndsAt === null || now < freePeriodEndsAt),
  );

  return (
    <main className="min-h-screen bg-gray-100 py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <section className="rounded-3xl bg-gradient-to-r from-slate-950 via-blue-900 to-green-700 p-6 text-white shadow-xl sm:p-8">
          <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-green-200">
            Moduł pracodawcy
          </p>

          <h1 className="mt-3 text-3xl font-extrabold sm:text-5xl">
            🎯 Moje dopasowania
          </h1>

          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-200">
            Kandydaci znalezieni automatycznie na podstawie zapisanych alertów.
          </p>
        </section>

        {freeContactUnlocksActive && (
          <section className="mt-6 rounded-3xl border border-green-300 bg-green-50 p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-green-700">
                  Darmowy start BLISKO24
                </p>

                <h2 className="mt-2 text-xl font-extrabold text-green-950 sm:text-2xl">
                  Kontakty odblokujesz teraz bezpłatnie
                </h2>

                <p className="mt-2 max-w-3xl text-sm leading-6 text-green-800 sm:text-base">
                  Kontakt zostanie pokazany wyłącznie wtedy, gdy kandydat
                  wyraził zgodę na jego udostępnienie. Każde odblokowanie
                  zapisujemy, aby rozwijać trafniejsze dopasowania.
                </p>
              </div>

              <div className="w-fit shrink-0 rounded-full bg-green-700 px-5 py-2.5 font-extrabold text-white">
                0 zł
              </div>
            </div>
          </section>
        )}

        {errorMessage && (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5 font-semibold text-red-700">
            {errorMessage}
          </div>
        )}

        {matches.length === 0 ? (
          <section className="mt-8 rounded-3xl bg-white p-10 text-center shadow">
            <div className="text-6xl">🔎</div>

            <h2 className="mt-5 text-3xl font-extrabold text-slate-900">
              Brak dopasowań
            </h2>

            <p className="mt-3 text-slate-500">
              Utwórz alert pracodawcy albo poczekaj, aż pojawi się pasujący
              kandydat.
            </p>

            <Link
              href="/znajdz-kandydata"
              className="mt-6 inline-flex rounded-xl bg-green-700 px-6 py-4 font-bold text-white hover:bg-green-800"
            >
              🎯 Znajdź kandydata
            </Link>
          </section>
        ) : (
          <section className="mt-8 grid gap-6 lg:grid-cols-2">
            {matches.map((match) => {
              const candidate = match.profiles;

              const alert = match.employer_alerts;

              const unlockStatus = unlockStatuses[match.candidate_id] ?? null;

              const unlockedContact = contacts[match.id];

              const candidateSkills = candidate?.candidate_skills ?? [];

              const normalizedCandidateSkills = new Set(
                candidateSkills.map((skill) =>
                  skill.trim().toLocaleLowerCase("pl"),
                ),
              );

              const hasSmartSkillFields =
                (alert?.required_skills?.length ?? 0) > 0 ||
                (alert?.optional_skills?.length ?? 0) > 0;

              const requiredSkills = hasSmartSkillFields
                ? (alert?.required_skills ?? [])
                : (alert?.skills ?? []);

              const optionalSkills = hasSmartSkillFields
                ? (alert?.optional_skills ?? [])
                : [];

              const candidateHasSkill = (skill: string) =>
                normalizedCandidateSkills.has(
                  skill.trim().toLocaleLowerCase("pl"),
                );

              const scoreClass =
                match.match_score >= 85
                  ? "bg-green-100 text-green-800"
                  : match.match_score >= 70
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-blue-100 text-blue-800";

              return (
                <article
                  key={match.id}
                  className="rounded-3xl bg-white p-6 shadow"
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 items-center gap-4">
                      {candidate?.avatar_url ? (
                        <img
                          src={candidate.avatar_url}
                          alt={candidate.name ?? "Kandydat"}
                          className="h-16 w-16 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-slate-200 text-3xl">
                          👤
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h2 className="truncate text-2xl font-extrabold text-slate-900">
                            {candidate?.name ?? "Kandydat BLISKO24"}
                          </h2>

                          {candidate?.verified && (
                            <span
                              title="Zweryfikowany"
                              className="text-green-600"
                            >
                              ✔
                            </span>
                          )}
                        </div>

                        <p className="mt-1 font-semibold text-blue-700">
                          {candidate?.candidate_role ?? "Nie podano stanowiska"}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`w-fit rounded-full px-4 py-2 font-extrabold ${scoreClass}`}
                    >
                      {match.match_score}% dopasowania
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-sm text-slate-500">Lokalizacja</p>

                      <p className="mt-1 font-bold text-slate-900">
                        📍{" "}
                        {[
                          candidate?.preferred_province,
                          candidate?.preferred_city,
                        ]
                          .filter(Boolean)
                          .join(" • ") ||
                          candidate?.city ||
                          "Nie podano"}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-sm text-slate-500">Doświadczenie</p>

                      <p className="mt-1 font-bold text-slate-900">
                        ⭐ {candidate?.years_of_experience ?? 0} lat
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="font-bold text-slate-900">
                      Kryteria dopasowania
                    </h3>

                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {[
                        ["Stanowisko", match.matched_role],
                        ["Województwo", match.matched_province],
                        ["Miasto", match.matched_city],
                        ["Doświadczenie", match.matched_experience],
                        ["Umiejętności", match.matched_skills],
                        ["Forma pracy", match.matched_work_modes],
                      ].map(([label, matched]) => (
                        <div
                          key={String(label)}
                          className={`rounded-xl px-3 py-2 text-sm font-semibold ${
                            matched
                              ? "bg-green-50 text-green-800"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {matched ? "✔" : "✖"} {String(label)}
                        </div>
                      ))}
                    </div>
                  </div>

                  {requiredSkills.length > 0 && (
                    <div className="mt-6">
                      <h3 className="font-bold text-slate-900">
                        Umiejętności wymagane
                      </h3>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {requiredSkills.map((skill) => {
                          const hasSkill = candidateHasSkill(skill);

                          return (
                            <span
                              key={`required-${skill}`}
                              className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                                hasSkill
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {hasSkill ? "✔" : "✖"} {skill}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {optionalSkills.length > 0 && (
                    <div className="mt-6">
                      <h3 className="font-bold text-slate-900">
                        Umiejętności dodatkowe
                      </h3>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {optionalSkills.map((skill) => {
                          const hasSkill = candidateHasSkill(skill);

                          return (
                            <span
                              key={`optional-${skill}`}
                              className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                                hasSkill
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {hasSkill ? "★" : "○"} {skill}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {candidateSkills.length > 0 && (
                    <details className="mt-6 rounded-2xl bg-slate-50 p-4">
                      <summary className="cursor-pointer font-bold text-slate-900">
                        Wszystkie umiejętności kandydata
                      </summary>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {candidateSkills.map((skill) => (
                          <span
                            key={`candidate-${skill}`}
                            className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </details>
                  )}

                  <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-4">
                    <p className="text-sm font-semibold text-blue-900">
                      Alert: {alert?.role || "Dowolne stanowisko"}
                    </p>

                    <p className="mt-1 text-xs text-blue-700">
                      {[alert?.province, alert?.city]
                        .filter(Boolean)
                        .join(" • ") || "Cała Polska"}
                    </p>
                  </div>

                  {unlockedContact && (
                    <div className="mt-6 rounded-2xl border border-green-300 bg-green-50 p-5">
                      <p className="font-extrabold text-green-900">
                        🔓 Kontakt odblokowany
                      </p>

                      {unlockedContact.phone && (
                        <a
                          href={`tel:${unlockedContact.phone}`}
                          className="mt-3 block font-bold text-green-800 hover:underline"
                        >
                          📞 {unlockedContact.phone}
                        </a>
                      )}

                      {unlockedContact.email && (
                        <a
                          href={`mailto:${unlockedContact.email}`}
                          className="mt-2 block font-bold text-green-800 hover:underline"
                        >
                          ✉️ {unlockedContact.email}
                        </a>
                      )}
                    </div>
                  )}

                  {unlockStatus === "unlocked" && !unlockedContact && (
                    <div className="mt-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm font-semibold text-yellow-800">
                      Kontakt był odblokowany, ale obecnie jest niedostępny.
                      Kandydat mógł wycofać zgodę na udostępnianie.
                    </div>
                  )}

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {candidate?.id ? (
                      <Link
                        href={`/profil/${candidate.id}`}
                        onClick={() => markAsViewed(match.id)}
                        className="flex min-h-14 items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-center font-bold text-white hover:bg-black"
                      >
                        👤 Zobacz profil
                      </Link>
                    ) : (
                      <div className="flex min-h-14 items-center justify-center rounded-xl bg-slate-200 px-5 py-3 text-center font-semibold text-slate-500">
                        Profil niedostępny
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => requestContactUnlock(match)}
                      disabled={
                        unlockingMatchId === match.id ||
                        unlockStatus === "unlocked"
                      }
                      className="flex min-h-14 items-center justify-center rounded-xl bg-blue-700 px-5 py-3 text-center font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {unlockingMatchId === match.id
                        ? "Odblokowywanie..."
                        : unlockStatus === "unlocked"
                          ? "🔓 Kontakt odblokowany"
                          : freeContactUnlocksActive
                            ? "🔓 Odblokuj bezpłatnie"
                            : unlockStatus === "pending"
                              ? "💳 Zapłać 9,99 zł"
                              : "🔒 Odblokuj kontakt – 9,99 zł"}
                    </button>
                  </div>

                  {match.status === "new" && (
                    <div className="mt-4 rounded-xl bg-yellow-50 p-3 text-center text-sm font-bold text-yellow-800">
                      Nowe dopasowanie
                    </div>
                  )}
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}