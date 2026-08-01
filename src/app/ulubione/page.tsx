"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import AdvertisementCard from "../../components/AdvertisementCard";

export default function UlubionePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [advertisements, setAdvertisements] = useState<any[]>([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  async function loadFavorites() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/logowanie");
      return;
    }

    const { data, error } = await supabase
      .from("favorites")
      .select(`
        advertisement_id,
        advertisements (
          *,
          profiles (
            name,
            city,
            avatar_url
          )
        )
      `)
      .eq("user_id", user.id);

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    const ads =
      data
        ?.map((item: any) => item.advertisements)
        .filter(Boolean) ?? [];

    setAdvertisements(ads);
    setLoading(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center">
        Ładowanie...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-7xl px-6 py-12">

        <h1 className="mb-8 text-4xl font-bold">
          ❤️ Ulubione ogłoszenia
        </h1>

        {advertisements.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 shadow text-center">
            <p className="text-lg text-slate-600">
              Nie masz jeszcze żadnych ulubionych ogłoszeń.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {advertisements.map((advertisement: any) => (
              <AdvertisementCard
                key={advertisement.id}
                advertisement={advertisement}
              />
            ))}
          </div>
        )}

      </div>
    </main>
  );
}