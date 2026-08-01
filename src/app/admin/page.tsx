"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "../../lib/supabase";

import {
  getAllAdvertisements,
  getAllUsers,
  getReports,
  deleteAdvertisement,
} from "../../lib/admin";

import Stats from "../../components/admin/Stats";
import AdvertisementsTable from "../../components/admin/AdvertisementsTable";
import UsersTable from "../../components/admin/UsersTable";
import ReportsTable from "../../components/admin/ReportsTable";


export default function AdminPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [usersCount, setUsersCount] = useState(0);
  const [adsCount, setAdsCount] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);

  const [advertisements, setAdvertisements] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      router.replace("/");
      return;
    }

    const { count: usersCountData } = await supabase
      .from("profiles")
      .select("*", {
        count: "exact",
        head: true,
      });

    const { count: adsCountData } = await supabase
      .from("advertisements")
      .select("*", {
        count: "exact",
        head: true,
      });

    const { count: favoritesCountData } = await supabase
      .from("favorites")
      .select("*", {
        count: "exact",
        head: true,
      });

    setUsersCount(usersCountData ?? 0);
    setAdsCount(adsCountData ?? 0);
    setFavoritesCount(favoritesCountData ?? 0);

    setAdvertisements(await getAllAdvertisements());
    setUsers(await getAllUsers());
    setReports(await getReports());

    setLoading(false);
  }

  async function handleDelete(id: number) {
    const ok = window.confirm(
      "Czy na pewno usunąć ogłoszenie?"
    );

    if (!ok) return;

    await deleteAdvertisement(id);

    setAdvertisements((prev) =>
      prev.filter((ad) => ad.id !== id)
    );

    setAdsCount((prev) => prev - 1);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        Ładowanie...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">

      <div className="mx-auto max-w-7xl px-6 py-12">

        <h1 className="mb-10 text-4xl font-bold">
          👑 Panel administratora
        </h1>
        

        <Stats
          users={usersCount}
          ads={adsCount}
          favorites={favoritesCount}
        />

        <AdvertisementsTable
          advertisements={advertisements}
          onDelete={handleDelete}
        />

        <UsersTable
          users={users}
        />

        <ReportsTable
          reports={reports}
        />

      </div>

    </main>
  );
}