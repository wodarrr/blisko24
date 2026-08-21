"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import Header from "../../components/Header";
import AccountCard from "../../components/account/AccountCard";
import { supabase } from "../../lib/supabase";

type AccountType = "candidate" | "employer" | "both";

type DashboardProfile = {
  account_type: AccountType;
  name: string;
  city: string;
  description: string;
  company_name: string;
  company_description: string;
  candidate_role: string;
  candidate_skills: string[];
  preferred_province: string;
  preferred_city: string;
  work_modes: string[];
  open_to_job_offers: boolean;
  contact_sharing_consent: boolean;
};

type OnboardingStep = {
  id: string;
  label: string;
  description: string;
  completed: boolean;
  href: string;
};

const emptyProfile: DashboardProfile = {
  account_type: "candidate",
  name: "",
  city: "",
  description: "",
  company_name: "",
  company_description: "",
  candidate_role: "",
  candidate_skills: [],
  preferred_province: "",
  preferred_city: "",
  work_modes: [],
  open_to_job_offers: false,
  contact_sharing_consent: false,
};

function normalizeAccountType(value: unknown): AccountType {
  if (value === "employer" || value === "both") {
    return value;
  }

  return "candidate";
}

function accountTypeLabel(accountType: AccountType) {
  if (accountType === "candidate") {
    return "Kandydat";
  }

  if (accountType === "employer") {
    return "Pracodawca";
  }

  return "Kandydat i pracodawca";
}

export default function KontoPage() {
  const router = useRouter();

  const [currentUserId, setCurrentUserId] = useState("");
  const [email, setEmail] = useState("");
  const [privatePhone, setPrivatePhone] = useState("");

  const [adsCount, setAdsCount] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [messagesCount, setMessagesCount] = useState(0);
  const [viewsCount, setViewsCount] = useState(0);
  const [activeAlertsCount, setActiveAlertsCount] = useState(0);

  const [profile, setProfile] =
    useState<DashboardProfile>(emptyProfile);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadAccount() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (cancelled) return;

      if (userError || !user) {
        router.replace("/logowanie");
        return;
      }

      setCurrentUserId(user.id);
      setEmail(user.email ?? "");

      const [
        profileResult,
        advertisementsResult,
        favoritesResult,
        conversationsResult,
        contactResult,
        alertsResult,
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select(`
            account_type,
            name,
            city,
            description,
            company_name,
            company_description,
            candidate_role,
            candidate_skills,
            preferred_province,
            preferred_city,
            work_modes,
            open_to_job_offers,
            contact_sharing_consent
          `)
          .eq("id", user.id)
          .maybeSingle(),

        supabase
          .from("advertisements")
          .select("id, views", {
            count: "exact",
          })
          .eq("user_id", user.id),

        supabase
          .from("favorites")
          .select("*", {
            count: "exact",
            head: true,
          })
          .eq("user_id", user.id),

        supabase
          .from("conversations")
          .select("id")
          .or(
            `buyer_id.eq.${user.id},seller_id.eq.${user.id}`
          ),

        supabase
          .from("candidate_contacts")
          .select("phone")
          .eq("candidate_id", user.id)
          .maybeSingle(),

        supabase
          .from("employer_alerts")
          .select("*", {
            count: "exact",
            head: true,
          })
          .eq("user_id", user.id)
          .eq("active", true),
      ]);

      if (cancelled) return;

      if (profileResult.error) {
        console.error(
          "Błąd pobierania profilu:",
          profileResult.error
        );

        setErrorMessage(
          "Nie udało się pobrać danych profilu. Odśwież stronę i spróbuj ponownie."
        );
      }

      if (profileResult.data) {
        const data = profileResult.data;

        setProfile({
          account_type: normalizeAccountType(
            data.account_type
          ),
          name: data.name ?? "",
          city: data.city ?? "",
          description: data.description ?? "",
          company_name: data.company_name ?? "",
          company_description:
            data.company_description ?? "",
          candidate_role: data.candidate_role ?? "",
          candidate_skills: Array.isArray(
            data.candidate_skills
          )
            ? data.candidate_skills
            : [],
          preferred_province:
            data.preferred_province ?? "",
          preferred_city: data.preferred_city ?? "",
          work_modes: Array.isArray(data.work_modes)
            ? data.work_modes
            : [],
          open_to_job_offers:
            data.open_to_job_offers === true,
          contact_sharing_consent:
            data.contact_sharing_consent === true,
        });
      }

      if (advertisementsResult.error) {
        console.error(
          "Błąd pobierania ogłoszeń:",
          advertisementsResult.error
        );
      }

      if (favoritesResult.error) {
        console.error(
          "Błąd pobierania ulubionych:",
          favoritesResult.error
        );
      }

      if (conversationsResult.error) {
        console.error(
          "Błąd pobierania rozmów:",
          conversationsResult.error
        );
      }

      if (contactResult.error) {
        console.error(
          "Błąd pobierania prywatnego kontaktu:",
          contactResult.error
        );
      }

      if (alertsResult.error) {
        console.error(
          "Błąd pobierania alertów pracodawcy:",
          alertsResult.error
        );
      }

      setPrivatePhone(contactResult.data?.phone ?? "");
      setAdsCount(advertisementsResult.count ?? 0);
      setFavoritesCount(favoritesResult.count ?? 0);
      setActiveAlertsCount(alertsResult.count ?? 0);

      const totalViews =
        advertisementsResult.data?.reduce(
          (sum, advertisement) =>
            sum + (advertisement.views ?? 0),
          0
        ) ?? 0;

      setViewsCount(totalViews);

      const conversationIds =
        conversationsResult.data?.map(
          (conversation) => conversation.id
        ) ?? [];

      if (conversationIds.length > 0) {
        const { count, error } = await supabase
          .from("messages")
          .select("*", {
            count: "exact",
            head: true,
          })
          .in("conversation_id", conversationIds)
          .neq("sender_id", user.id)
          .eq("is_read", false);

        if (error) {
          console.error(
            "Błąd pobierania nowych wiadomości:",
            error
          );
        }

        if (!cancelled) {
          setMessagesCount(count ?? 0);
        }
      }

      if (!cancelled) {
        setLoading(false);
      }
    }

    loadAccount();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const candidateEnabled =
    profile.account_type === "candidate" ||
    profile.account_type === "both";

  const employerEnabled =
    profile.account_type === "employer" ||
    profile.account_type === "both";

  const onboardingSteps = useMemo(() => {
    const steps: OnboardingStep[] = [];

    if (candidateEnabled) {
      steps.push(
        {
          id: "profile-name",
          label: "Uzupełnij nazwę profilu",
          description:
            "Podaj imię albo nazwę, pod którą chcesz występować.",
          completed: profile.name.trim().length > 0,
          href: "/ustawienia/profil",
        },
        {
          id: "candidate-description",
          label: "Napisz kilka zdań o sobie",
          description:
            "Krótki opis pomaga pracodawcy poznać kandydata.",
          completed: profile.description.trim().length > 0,
          href: "/ustawienia/profil",
        },
        {
          id: "candidate-role",
          label: "Wpisz poszukiwane stanowisko",
          description:
            "To najważniejsza informacja dla inteligentnego dopasowania.",
          completed: profile.candidate_role.trim().length > 0,
          href: "/ustawienia/profil",
        },
        {
          id: "candidate-skills",
          label: "Wybierz umiejętności",
          description:
            "Dodaj przynajmniej jedną umiejętność lub uprawnienie.",
          completed: profile.candidate_skills.length > 0,
          href: "/ustawienia/profil",
        },
        {
          id: "candidate-location",
          label: "Określ preferowaną lokalizację",
          description:
            "Wybierz województwo, miasto albo uzupełnij miasto profilu.",
          completed:
            profile.preferred_province.trim().length > 0 ||
            profile.preferred_city.trim().length > 0 ||
            profile.city.trim().length > 0,
          href: "/ustawienia/profil",
        },
        {
          id: "candidate-work-mode",
          label: "Wybierz formę pracy",
          description:
            "Zaznacz pracę stacjonarną, hybrydową lub zdalną.",
          completed: profile.work_modes.length > 0,
          href: "/ustawienia/profil",
        },
        {
          id: "candidate-visible",
          label: "Włącz propozycje pracy",
          description:
            "Dzięki temu profil pojawi się w wyszukiwarce pracodawców.",
          completed: profile.open_to_job_offers,
          href: "/ustawienia/profil",
        },
        {
          id: "candidate-contact",
          label: "Dodaj prywatny kontakt i zgodę",
          description:
            "Numer pozostanie ukryty do prawidłowego odblokowania przez pracodawcę.",
          completed:
            privatePhone.trim().length > 0 &&
            profile.contact_sharing_consent,
          href: "/ustawienia/profil",
        }
      );
    }

    if (employerEnabled) {
      if (!steps.some((step) => step.id === "profile-name")) {
        steps.push({
          id: "profile-name",
          label: "Uzupełnij nazwę profilu",
          description:
            "Podaj nazwę osoby odpowiedzialnej za konto.",
          completed: profile.name.trim().length > 0,
          href: "/ustawienia/profil",
        });
      }

      steps.push(
        {
          id: "company-name",
          label: "Dodaj nazwę firmy",
          description:
            "Kandydat powinien wiedzieć, kto szuka pracownika.",
          completed: profile.company_name.trim().length > 0,
          href: "/ustawienia/profil",
        },
        {
          id: "company-description",
          label: "Opisz firmę",
          description:
            "Napisz krótko, czym zajmuje się firma i kogo zatrudnia.",
          completed:
            profile.company_description.trim().length > 0,
          href: "/ustawienia/profil",
        },
        {
          id: "company-city",
          label: "Uzupełnij miasto",
          description:
            "Lokalizacja pomaga znaleźć kandydatów w pobliżu.",
          completed: profile.city.trim().length > 0,
          href: "/ustawienia/profil",
        },
        {
          id: "employer-alert",
          label: "Utwórz pierwszy alert kandydata",
          description:
            "Zapisz kryteria, a BLISKO24 będzie szukać dopasowań automatycznie.",
          completed: activeAlertsCount > 0,
          href: "/znajdz-kandydata",
        }
      );
    }

    return steps;
  }, [
    activeAlertsCount,
    candidateEnabled,
    employerEnabled,
    privatePhone,
    profile,
  ]);

  const completedSteps = onboardingSteps.filter(
    (step) => step.completed
  ).length;

  const completionPercentage =
    onboardingSteps.length > 0
      ? Math.round(
          (completedSteps / onboardingSteps.length) * 100
        )
      : 0;

  async function logout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (loading) {
    return (
      <>
        <Header />

        <main className="flex min-h-screen items-center justify-center bg-gray-100">
          <p className="text-lg text-slate-900">Ładowanie konta...</p>
        </main>
      </>
    );
  }

  const displayName =
    profile.name.trim() ||
    profile.company_name.trim() ||
    "Użytkowniku";

  const nextIncompleteStep = onboardingSteps.find(
    (step) => !step.completed
  );

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

        {errorMessage && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 font-semibold text-red-700">
            {errorMessage}
          </div>
        )}

        {completionPercentage < 100 && (
          <section className="mb-8 overflow-hidden rounded-3xl border-2 border-red-300 bg-gradient-to-r from-red-50 via-orange-50 to-amber-50 p-5 shadow-lg sm:p-7">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-red-700">
                  🚨 Uwaga — Twój profil jest niekompletny
                </p>

                <h2 className="mt-2 text-2xl font-extrabold text-slate-950 sm:text-3xl">
                  Profil ukończony w {completionPercentage}%
                </h2>

                <p className="mt-3 text-base font-semibold leading-7 text-slate-800">
                  Dokończ profil, żeby pracodawcy i inni użytkownicy mogli Cię znaleźć
                  i zobaczyć najważniejsze informacje o Tobie.
                </p>

                <div className="mt-5 h-4 overflow-hidden rounded-full bg-white ring-1 ring-red-200">
                  <div
                    className="h-full rounded-full bg-red-600 transition-all"
                    style={{
                      width: `${completionPercentage}%`,
                    }}
                  />
                </div>

                {nextIncompleteStep && (
                  <p className="mt-3 text-sm font-bold text-slate-700">
                    Następny krok: {nextIncompleteStep.label}
                  </p>
                )}
              </div>

              <Link
                href={nextIncompleteStep?.href ?? "/ustawienia/profil"}
                className="inline-flex w-full shrink-0 items-center justify-center rounded-2xl bg-red-600 px-7 py-4 text-center text-base font-extrabold text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-red-700 lg:w-auto"
              >
                Uzupełnij profil teraz →
              </Link>
            </div>
          </section>
        )}

        <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-blue-800 via-blue-700 to-cyan-500 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-100">
                  Panel użytkownika
                </p>

                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white">
                  {accountTypeLabel(profile.account_type)}
                </span>
              </div>

              <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">
                👋 Witaj, {displayName}
              </h1>

              <p className="mt-3 max-w-2xl text-blue-100">
                Dokończ konfigurację konta, a później zarządzaj profilem, ogłoszeniami i aktywnością w jednym miejscu.
              </p>
            </div>

            <Link
              href={
                nextIncompleteStep?.href ??
                (employerEnabled
                  ? "/znajdz-kandydata"
                  : `/profil/${currentUserId}`)
              }
              className="flex w-full items-center justify-center rounded-2xl bg-white px-6 py-4 font-extrabold text-blue-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-50 lg:w-auto"
            >
              {nextIncompleteStep
                ? "Dokończ konfigurację"
                : employerEnabled
                  ? "Znajdź kandydata"
                  : "Zobacz mój profil"}
            </Link>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-sm text-blue-100">Ogłoszenia</p>
              <p className="mt-1 text-3xl font-extrabold">
                {adsCount}
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-sm text-blue-100">Wyświetlenia</p>
              <p className="mt-1 text-3xl font-extrabold">
                {viewsCount}
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-sm text-blue-100">Nowe wiadomości</p>
              <p className="mt-1 text-3xl font-extrabold">
                {messagesCount}
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-sm text-blue-100">
                {employerEnabled
                  ? "Aktywne alerty"
                  : "Ulubione"}
              </p>
              <p className="mt-1 text-3xl font-extrabold">
                {employerEnabled
                  ? activeAlertsCount
                  : favoritesCount}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-10 overflow-hidden rounded-3xl bg-white shadow">
          <div className="border-b border-slate-200 p-5 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-green-700">
                  Pierwsze kroki
                </p>

                <h2 className="mt-2 text-3xl font-extrabold text-slate-900">
                  Przygotuj konto do działania
                </h2>

                <p className="mt-2 text-slate-500">
                  Ukończono {completedSteps} z {onboardingSteps.length} kroków.
                </p>
              </div>

              <p className="text-4xl font-extrabold text-green-700">
                {completionPercentage}%
              </p>
            </div>

            <div
              className="mt-6 h-4 overflow-hidden rounded-full bg-slate-100"
              role="progressbar"
              aria-label="Ukończenie konfiguracji konta"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={completionPercentage}
            >
              <div
                className="h-full rounded-full bg-green-600 transition-all"
                style={{
                  width: `${completionPercentage}%`,
                }}
              />
            </div>
          </div>

          {completionPercentage === 100 ? (
            <div className="border-b border-green-200 bg-green-50 p-5 sm:p-7">
              <p className="text-xl font-extrabold text-green-800">
                ✅ Konto jest gotowe do działania
              </p>

              <p className="mt-2 text-green-700">
                Wszystkie najważniejsze elementy zostały uzupełnione.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {onboardingSteps.map((step) => (
                <Link
                  key={step.id}
                  href={step.href}
                  className="flex items-start gap-4 p-5 transition hover:bg-slate-50 sm:px-8"
                >
                  <span
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-bold ${
                      step.completed
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {step.completed ? "✓" : "!"}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`font-extrabold ${
                        step.completed
                          ? "text-green-800"
                          : "text-slate-900"
                      }`}
                    >
                      {step.label}
                    </p>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      {step.description}
                    </p>
                  </div>

                  <span className="shrink-0 font-bold text-blue-700">
                    {step.completed ? "Gotowe" : "Uzupełnij →"}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="mt-10">
          <div className="mb-6">
            <p className="text-sm font-bold uppercase tracking-wide text-blue-700">
              Centrum zarządzania
            </p>

            <h2 className="mt-1 text-3xl font-extrabold text-slate-900">
              Szybki dostęp
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {employerEnabled && (
              <>
                <AccountCard
                  title="Znajdź kandydata"
                  href="/znajdz-kandydata"
                  icon="🎯"
                  description="Utwórz alert i wyszukaj odpowiednią osobę."
                  accent="green"
                />

                <AccountCard
                  title="Moje dopasowania"
                  href="/moje-dopasowania"
                  icon="🤝"
                  description="Zobacz kandydatów dopasowanych przez BLISKO SCORE."
                  accent="blue"
                />
              </>
            )}

            <AccountCard
              title="Moje ogłoszenia"
              value={adsCount}
              href="/moje-ogloszenia"
              icon="📋"
              description="Edytuj, usuwaj i kontroluj swoje ogłoszenia."
              accent="blue"
            />

            {candidateEnabled && (
              <AccountCard
                title="Mój publiczny profil"
                href={
                  currentUserId
                    ? `/profil/${currentUserId}`
                    : "/konto"
                }
                icon="👤"
                description="Sprawdź, jak widzą Cię inni użytkownicy."
                accent="yellow"
              />
            )}

            <AccountCard
              title="Nowe wiadomości"
              value={messagesCount}
              href="/wiadomosci"
              icon="💬"
              description="Prowadź rozmowy z użytkownikami."
              accent="green"
            />

            <AccountCard
              title="Powiadomienia"
              href="/powiadomienia"
              icon="🔔"
              description="Zobacz najnowszą aktywność na koncie."
              accent="yellow"
            />

            <AccountCard
              title="Edytuj profil"
              href="/ustawienia/profil"
              icon="⚙️"
              description="Zmień typ konta i uzupełnij swoje dane."
              accent="blue"
            />

            <AccountCard
              title="Ulubione"
              value={favoritesCount}
              href="/ulubione"
              icon="❤️"
              description="Wróć do zapisanych ogłoszeń."
              accent="red"
            />
          </div>
        </section>

        <section className="mt-12 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div>
            <p className="font-bold text-slate-900">Zalogowano jako</p>
            <p className="mt-1 break-all text-sm text-slate-500">
              {email}
            </p>
          </div>

          <button
            type="button"
            onClick={logout}
            className="rounded-xl bg-red-600 px-6 py-3 font-bold text-white transition hover:bg-red-700"
          >
            🚪 Wyloguj
          </button>
        </section>
        </div>
      </main>
    </>
  );
}