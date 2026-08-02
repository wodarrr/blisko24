"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { supabase } from "../../lib/supabase";

import {
  getAllAdvertisements,
  getAllUsers,
  getReports,
  deleteAdvertisement,
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

export default function AdminPage() {
  const router = useRouter();

  const [access, setAccess] =
    useState<AdminAccess>("checking");

  const [loadingData, setLoadingData] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [usersCount, setUsersCount] = useState(0);
  const [adsCount, setAdsCount] = useState(0);
  const [favoritesCount, setFavoritesCount] =
    useState(0);
  const [reviewsCount, setReviewsCount] =
    useState(0);
  const [messagesCount, setMessagesCount] =
    useState(0);
  const [reportsCount, setReportsCount] =
    useState(0);

  const [advertisements, setAdvertisements] =
    useState<AdminAdvertisement[]>([]);

  const [users, setUsers] =
    useState<AdminUser[]>([]);

  const [reports, setReports] =
    useState<AdminReport[]>([]);

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

        getAllAdvertisements(),
        getAllUsers(),
        getReports(),
      ]);

      if (cancelled) return;

      setUsersCount(usersResult.count ?? 0);
      setAdsCount(advertisementsResult.count ?? 0);
      setFavoritesCount(favoritesResult.count ?? 0);
      setReviewsCount(reviewsResult.count ?? 0);
      setMessagesCount(messagesResult.count ?? 0);

      const safeAdvertisements =
        Array.isArray(advertisementsData)
          ? (advertisementsData as AdminAdvertisement[])
          : [];

      const safeUsers =
        Array.isArray(usersData)
          ? (usersData as AdminUser[])
          : [];

      const safeReports =
        Array.isArray(reportsData)
          ? (reportsData as AdminReport[])
          : [];

      setAdvertisements(safeAdvertisements);
      setUsers(safeUsers);
      setReports(safeReports);
      setReportsCount(safeReports.length);
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

  async function handleDelete(id: number) {
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

      alert("Nie udało się usunąć ogłoszenia.");
    }
  }

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
          <div className="text-6xl">🔒</div>

          <h1 className="mt-5 text-3xl font-bold">
            Brak dostępu
          </h1>

          <p className="mt-4 text-gray-500">
            Ta część BLISKO24 jest dostępna wyłącznie
            dla administratora.
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
            onClick={() => loadAdminData()}
            className="rounded-xl bg-white px-5 py-3 font-bold shadow"
          >
            🔄 Odśwież dane
          </button>
        </div>

        <Stats
          users={usersCount}
          ads={adsCount}
          favorites={favoritesCount}
        />

        <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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

        <div className="mt-12 space-y-12">
          <AdvertisementsTable
            advertisements={advertisements}
            onDelete={handleDelete}
          />

          <UsersTable users={users} />

          <ReportsTable reports={reports} />
        </div>
      </div>
    </main>
  );
}