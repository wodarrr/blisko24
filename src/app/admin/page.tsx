"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { supabase } from "../../lib/supabase";

import {
  getAdminBetaMetrics,
  getAllAdvertisements,
  getAllUsers,
  getReports,
  deleteAdvertisement,
  type AdminBetaMetrics,
} from "../../lib/admin";

import Stats from "../../components/admin/Stats";

import AdvertisementsTable, {
  type AdminAdvertisement,
} from "../../components/admin/AdvertisementsTable";

import UsersTable, {
  type AdminUser,
} from "../../components/admin/UsersTable";

import ReportsTable, {
  type AdminReport,
} from "../../components/admin/ReportsTable";

type AdminAccess =
  | "checking"
  | "allowed"
  | "denied"
  | "error";

type ModeratedAdvertisement =
  AdminAdvertisement & {
    status?: string | null;
    category?: string | null;
    province?: string | null;
    image_url?: string | null;
    created_at?: string | null;
    user_id?: string | null;
  };

const EMPTY_BETA_METRICS: AdminBetaMetrics = {
  totalUsers: 0,
  candidateAccounts: 0,
  employerAccounts: 0,
  bothAccounts: 0,
  openCandidates: 0,
  newUsers7d: 0,
  totalMatches: 0,
  newMatches: 0,
  activeAlerts: 0,
  unlockedContacts: 0,
  freeUnlocks: 0,
  paidUnlocks: 0,
  pendingUnlocks: 0,
};

export default function AdminPage() {
  const router = useRouter();

  const [access, setAccess] =
    useState<AdminAccess>("checking");

  const [loadingData, setLoadingData] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [currentAdminId, setCurrentAdminId] =
    useState("");

  const [usersCount, setUsersCount] =
    useState(0);

  const [adsCount, setAdsCount] =
    useState(0);

  const [
    favoritesCount,
    setFavoritesCount,
  ] = useState(0);

  const [reviewsCount, setReviewsCount] =
    useState(0);

  const [messagesCount, setMessagesCount] =
    useState(0);

  const [reportsCount, setReportsCount] =
    useState(0);

  const [betaMetrics, setBetaMetrics] =
    useState<AdminBetaMetrics>(
      EMPTY_BETA_METRICS
    );

  const [
    advertisements,
    setAdvertisements,
  ] = useState<ModeratedAdvertisement[]>([]);

  const [users, setUsers] =
    useState<AdminUser[]>([]);

  const [reports, setReports] =
    useState<AdminReport[]>([]);

  const [
    processingAdvertisementId,
    setProcessingAdvertisementId,
  ] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (cancelled) return;

      if (userError) {
        console.error(
          "Błąd pobierania użytkownika:",
          userError
        );

        setAccess("error");

        setErrorMessage(
          "Nie udało się sprawdzić zalogowanego użytkownika."
        );

        return;
      }

      if (!user) {
        router.replace("/logowanie");
        return;
      }

      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .maybeSingle();

      if (cancelled) return;

      if (profileError) {
        console.error(
          "Błąd sprawdzania uprawnień:",
          profileError
        );

        setAccess("error");

        setErrorMessage(
          "Nie udało się sprawdzić uprawnień administratora."
        );

        return;
      }

      if (profile?.is_admin !== true) {
        setAccess("denied");
        setLoadingData(false);
        return;
      }

      setCurrentAdminId(user.id);
      setAccess("allowed");

      await loadAdminData(cancelled);
    }

    initialize();

    return () => {
      cancelled = true;
    };
  }, [router]);

  async function loadAdminData(
    cancelled = false
  ) {
    setLoadingData(true);
    setErrorMessage("");

    try {
      const [
        usersResult,
        advertisementsResult,
        favoritesResult,
        reviewsResult,
        messagesResult,
        betaMetricsData,
        advertisementsData,
        usersData,
        reportsData,
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select("*", {
            count: "exact",
            head: true,
          }),

        supabase
          .from("advertisements")
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
          .from("reviews")
          .select("*", {
            count: "exact",
            head: true,
          }),

        supabase
          .from("messages")
          .select("*", {
            count: "exact",
            head: true,
          }),

        getAdminBetaMetrics(),

        getAllAdvertisements(),
        getAllUsers(),
        getReports(),
      ]);

      if (cancelled) return;

      setUsersCount(
        usersResult.count ?? 0
      );

      setAdsCount(
        advertisementsResult.count ?? 0
      );

      setFavoritesCount(
        favoritesResult.count ?? 0
      );

      setReviewsCount(
        reviewsResult.count ?? 0
      );

      setMessagesCount(
        messagesResult.count ?? 0
      );

      setBetaMetrics(betaMetricsData);

      const safeAdvertisements =
        Array.isArray(advertisementsData)
          ? (advertisementsData as ModeratedAdvertisement[])
          : [];

      const safeUsers =
        Array.isArray(usersData)
          ? (usersData as AdminUser[])
          : [];

      const safeReports =
        Array.isArray(reportsData)
          ? (reportsData as AdminReport[])
          : [];

      setAdvertisements(
        safeAdvertisements
      );

      setUsers(safeUsers);
      setReports(safeReports);

      setReportsCount(
        safeReports.length
      );
    } catch (error) {
      console.error(
        "Błąd ładowania panelu:",
        error
      );

      if (!cancelled) {
        setErrorMessage(
          "Nie udało się pobrać wszystkich danych panelu."
        );
      }
    } finally {
      if (!cancelled) {
        setLoadingData(false);
      }
    }
  }

  async function handleApprove(
    advertisementId: number
  ) {
    if (
      processingAdvertisementId !== null
    ) {
      return;
    }

    const confirmed = window.confirm(
      "Czy zatwierdzić to ogłoszenie i opublikować je na portalu?"
    );

    if (!confirmed) return;

    if (!currentAdminId) {
      alert(
        "Nie udało się ustalić konta administratora."
      );
      return;
    }

    setProcessingAdvertisementId(
      advertisementId
    );

    const approvedAt =
      new Date().toISOString();

    const { data, error } = await supabase
      .from("advertisements")
      .update({
        status: "approved",
        approved_at: approvedAt,
        approved_by: currentAdminId,
      })
      .eq("id", advertisementId)
      .eq("status", "pending")
      .select("id, user_id, title")
      .maybeSingle();

    setProcessingAdvertisementId(null);

    if (error) {
      console.error(
        "Błąd zatwierdzania ogłoszenia:",
        error
      );

      alert(
        "Nie udało się zatwierdzić ogłoszenia."
      );

      return;
    }

    if (!data) {
      alert(
        "Ogłoszenie nie zostało zatwierdzone. Mogło już zmienić status."
      );

      await loadAdminData();
      return;
    }

    if (data.user_id) {
      const { error: notificationError } =
        await supabase
          .from("notifications")
          .insert({
            user_id: data.user_id,
            title: "Ogłoszenie opublikowane",
            message: `Twoje ogłoszenie „${
              data.title || "Bez tytułu"
            }” zostało zaakceptowane i jest już widoczne publicznie.`,
            type: "advertisement_approved",
            is_read: false,
          });

      if (notificationError) {
        console.error(
          "Błąd tworzenia powiadomienia:",
          notificationError
        );
      }
    }

    setAdvertisements((previous) =>
      previous.map((advertisement) =>
        advertisement.id ===
        advertisementId
          ? {
              ...advertisement,
              status: "approved",
            }
          : advertisement
      )
    );

    alert(
      "Ogłoszenie zostało zatwierdzone i jest już publiczne."
    );
  }

  async function handleReject(
    advertisementId: number
  ) {
    if (
      processingAdvertisementId !== null
    ) {
      return;
    }

    if (!currentAdminId) {
      alert(
        "Nie udało się ustalić konta administratora."
      );
      return;
    }

    const reason = window.prompt(
      "Podaj krótki powód odrzucenia ogłoszenia:"
    );

    if (reason === null) return;

    const normalizedReason = reason.trim();

    if (!normalizedReason) {
      alert(
        "Podaj powód odrzucenia ogłoszenia."
      );
      return;
    }

    const confirmed = window.confirm(
      "Czy na pewno odrzucić to ogłoszenie? Pozostanie ono w historii użytkownika ze statusem „Odrzucone”."
    );

    if (!confirmed) return;

    setProcessingAdvertisementId(
      advertisementId
    );

    const rejectedAt =
      new Date().toISOString();

    const { data, error } = await supabase
      .from("advertisements")
      .update({
        status: "rejected",
        rejected_at: rejectedAt,
        rejected_by: currentAdminId,
        rejection_reason:
          normalizedReason,
        approved_at: null,
        approved_by: null,
      })
      .eq("id", advertisementId)
      .eq("status", "pending")
      .select("id, user_id, title")
      .maybeSingle();

    if (error) {
      console.error(
        "Błąd odrzucania ogłoszenia:",
        error
      );

      setProcessingAdvertisementId(null);

      alert(
        "Nie udało się odrzucić ogłoszenia."
      );

      return;
    }

    if (!data) {
      setProcessingAdvertisementId(null);

      alert(
        "Ogłoszenie nie zostało odrzucone. Mogło już zmienić status."
      );

      await loadAdminData();
      return;
    }

    if (data.user_id) {
      const { error: notificationError } =
        await supabase
          .from("notifications")
          .insert({
            user_id: data.user_id,
            title: "Ogłoszenie odrzucone",
            message: `Twoje ogłoszenie „${
              data.title || "Bez tytułu"
            }” zostało odrzucone. Powód: ${normalizedReason}`,
            type: "advertisement_rejected",
            is_read: false,
          });

      if (notificationError) {
        console.error(
          "Błąd tworzenia powiadomienia:",
          notificationError
        );
      }
    }

    setAdvertisements((previous) =>
      previous.map((advertisement) =>
        advertisement.id ===
        advertisementId
          ? {
              ...advertisement,
              status: "rejected",
            }
          : advertisement
      )
    );

    setProcessingAdvertisementId(null);

    alert(
      "Ogłoszenie zostało odrzucone. Użytkownik otrzymał powiadomienie."
    );
  }

  async function handleDelete(
    id: number
  ) {
    const confirmed = window.confirm(
      "Czy na pewno chcesz usunąć to ogłoszenie? Tej operacji nie można cofnąć."
    );

    if (!confirmed) return;

    try {
      await deleteAdvertisement(id);

      setAdvertisements((previous) =>
        previous.filter(
          (advertisement) =>
            advertisement.id !== id
        )
      );

      setAdsCount((previous) =>
        Math.max(0, previous - 1)
      );
    } catch (error) {
      console.error(
        "Błąd usuwania ogłoszenia:",
        error
      );

      alert(
        "Nie udało się usunąć ogłoszenia."
      );
    }
  }

  const pendingAdvertisements =
    advertisements.filter(
      (advertisement) =>
        advertisement.status ===
        "pending"
    );

  const moderatedAdvertisements =
    advertisements.filter(
      (advertisement) =>
        advertisement.status !==
        "pending"
    );

  if (access === "checking") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        Sprawdzanie uprawnień...
      </main>
    );
  }

  if (access === "denied") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="max-w-lg rounded-3xl bg-white p-10 text-center shadow">
          <div className="text-6xl">
            🔒
          </div>

          <h1 className="mt-5 text-3xl font-bold">
            Brak dostępu
          </h1>

          <p className="mt-4 text-gray-500">
            Ta część BLISKO24 jest dostępna
            wyłącznie dla administratora.
          </p>

          <Link
            href="/"
            className="mt-7 inline-flex rounded-xl bg-blue-700 px-6 py-3 font-bold text-white"
          >
            Wróć na stronę główną
          </Link>
        </div>
      </main>
    );
  }

  if (access === "error") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="max-w-lg rounded-3xl bg-white p-10 text-center shadow">
          <h1 className="text-3xl font-bold">
            Wystąpił błąd
          </h1>

          <p className="mt-4 text-red-600">
            {errorMessage}
          </p>
        </div>
      </main>
    );
  }

  if (loadingData) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        Ładowanie panelu administratora...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-600">
              Zarządzanie portalem
            </p>

            <h1 className="mt-2 text-4xl font-extrabold">
              👑 Panel administratora
            </h1>
          </div>

          <button
            type="button"
            onClick={() =>
              loadAdminData()
            }
            className="rounded-xl bg-white px-5 py-3 font-bold shadow transition hover:bg-slate-50"
          >
            🔄 Odśwież dane
          </button>
        </div>

        <Stats
          users={usersCount}
          ads={adsCount}
          favorites={favoritesCount}
          betaMetrics={betaMetrics}
        />

        <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl bg-white p-6 shadow">
            <p className="text-sm font-bold text-slate-500">
              DO MODERACJI
            </p>

            <p className="mt-3 text-4xl font-extrabold text-orange-600">
              ⏳{" "}
              {
                pendingAdvertisements.length
              }
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow">
            <p className="text-sm font-bold text-slate-500">
              OPINIE
            </p>

            <p className="mt-3 text-4xl font-extrabold text-yellow-500">
              ⭐ {reviewsCount}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow">
            <p className="text-sm font-bold text-slate-500">
              WIADOMOŚCI
            </p>

            <p className="mt-3 text-4xl font-extrabold text-blue-700">
              💬 {messagesCount}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow">
            <p className="text-sm font-bold text-slate-500">
              ZGŁOSZENIA
            </p>

            <p className="mt-3 text-4xl font-extrabold text-red-600">
              🚩 {reportsCount}
            </p>
          </div>
        </section>

        <section
  id="moderacja"
  className="mt-12 overflow-hidden rounded-3xl bg-white shadow scroll-mt-28"
>
          <div className="border-b border-slate-200 bg-orange-50 p-6 sm:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-700">
                  Moderacja
                </p>

                <h2 className="mt-2 text-2xl font-extrabold text-slate-900">
                  Ogłoszenia oczekujące
                </h2>

                <p className="mt-2 text-sm text-slate-600">
                  Liczba oczekujących:{" "}
                  {
                    pendingAdvertisements.length
                  }
                </p>
              </div>

              {pendingAdvertisements.length >
                0 && (
                <span className="inline-flex rounded-full bg-orange-600 px-4 py-2 font-bold text-white">
                  Wymagają decyzji
                </span>
              )}
            </div>
          </div>

          {pendingAdvertisements.length ===
          0 ? (
            <div className="p-10 text-center">
              <div className="text-6xl">
                ✅
              </div>

              <h3 className="mt-5 text-2xl font-bold text-slate-900">
                Brak ogłoszeń do moderacji
              </h3>

              <p className="mt-3 text-slate-500">
                Wszystkie nowe ogłoszenia zostały
                już sprawdzone.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {pendingAdvertisements.map(
                (advertisement) => {
                  const processing =
                    processingAdvertisementId ===
                    advertisement.id;

                  return (
                    <article
                      key={
                        advertisement.id
                      }
                      className="p-5 sm:p-7"
                    >
                      <div className="flex flex-col gap-6 lg:flex-row">
                        <div className="shrink-0 lg:w-52">
                          {advertisement.image_url ? (
                            <img
                              src={
                                advertisement.image_url
                              }
                              alt={
                                advertisement.title ||
                                "Ogłoszenie"
                              }
                              className="h-44 w-full rounded-2xl object-cover"
                            />
                          ) : (
                            <div className="flex h-44 w-full flex-col items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                              <span className="text-4xl">
                                📷
                              </span>

                              <span className="mt-2 text-sm font-semibold">
                                Brak zdjęcia
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <span className="inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-extrabold text-orange-800">
                                ⏳ OCZEKUJE
                              </span>

                              <h3 className="mt-3 break-words text-2xl font-extrabold text-slate-900">
                                {advertisement.title ||
                                  "Bez tytułu"}
                              </h3>
                            </div>

                            <p className="shrink-0 text-xl font-extrabold text-blue-700">
                              {advertisement.price !==
                                null &&
                              advertisement.price !==
                                undefined &&
                              String(
                                advertisement.price
                              ).trim() !== ""
                                ? `${advertisement.price} zł`
                                : "Cena do uzgodnienia"}
                            </p>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
                            <span>
                              👤{" "}
                              {advertisement
                                .profiles
                                ?.name ||
                                "Użytkownik BLISKO24"}
                            </span>

                            <span>
                              📍{" "}
                              {advertisement.city ||
                                "Brak miasta"}
                            </span>

                            {advertisement.category && (
                              <span>
                                📂{" "}
                                {
                                  advertisement.category
                                }
                              </span>
                            )}

                            {advertisement.created_at && (
                              <span>
                                📅{" "}
                                {new Date(
                                  advertisement.created_at
                                ).toLocaleString(
                                  "pl-PL"
                                )}
                              </span>
                            )}
                          </div>

                          <div className="mt-6 flex flex-wrap gap-3">
                            <Link
                              href={`/ogloszenie/${advertisement.id}`}
                              className="rounded-xl bg-slate-700 px-5 py-3 font-bold text-white transition hover:bg-slate-800"
                            >
                              👁️ Podejrzyj
                            </Link>

                            <button
                              type="button"
                              disabled={
                                processing
                              }
                              onClick={() =>
                                handleApprove(
                                  advertisement.id
                                )
                              }
                              className="rounded-xl bg-green-600 px-5 py-3 font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {processing
                                ? "Przetwarzanie..."
                                : "✅ Akceptuj"}
                            </button>

                            <button
                              type="button"
                              disabled={
                                processing
                              }
                              onClick={() =>
                                handleReject(
                                  advertisement.id
                                )
                              }
                              className="rounded-xl bg-red-600 px-5 py-3 font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {processing
                                ? "Przetwarzanie..."
                                : "❌ Odrzuć"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                }
              )}
            </div>
          )}
        </section>

        <div className="mt-12 space-y-12">
          <AdvertisementsTable
            advertisements={
              moderatedAdvertisements as AdminAdvertisement[]
            }
            onDelete={handleDelete}
          />

          <UsersTable users={users} />

          <ReportsTable
            reports={reports}
          />
        </div>
      </div>
    </main>
  );
}