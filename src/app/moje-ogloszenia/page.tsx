"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

type Advertisement = {
  id: number;
  title: string;
  city: string;
  price: string;
  image_url: string | null;
  views: number;
  favorites?: {
    id: number;
  }[];
  created_at: string;
};

export default function MyAdvertisementsPage() {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadAdvertisements() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/logowanie";
      return;
    }

    const { data, error } = await supabase
      .from("advertisements")
      .select(`
        *,
        favorites (
          id
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setAdvertisements(data);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadAdvertisements();
  }, []);

  async function deleteAdvertisement(id: number) {
    const confirmDelete = window.confirm(
      "Czy na pewno chcesz usunąć to ogłoszenie?"
    );

    if (!confirmDelete) return;

    const { error } = await supabase
      .from("advertisements")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Nie udało się usunąć ogłoszenia.");
      return;
    }

    setAdvertisements((prev) =>
      prev.filter((item) => item.id !== id)
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-6xl px-6 py-12">

        <h1 className="mb-8 text-4xl font-bold">
          Moje ogłoszenia
        </h1>

        {loading && <p>Ładowanie...</p>}

        {!loading && advertisements.length === 0 && (
          <p>Nie dodałeś jeszcze żadnych ogłoszeń.</p>
        )}

        <div className="grid gap-6">

          {advertisements.map((advertisement) => (

            <div
              key={advertisement.id}
              className="rounded-2xl bg-white p-6 shadow"
            >

              <div className="flex gap-6">

                {advertisement.image_url ? (
                  <img
                    src={advertisement.image_url}
                    className="h-32 w-40 rounded-xl object-cover"
                    alt={advertisement.title}
                  />
                ) : (
                  <div className="flex h-32 w-40 items-center justify-center rounded-xl bg-gray-200">
                    Brak zdjęcia
                  </div>
                )}

                <div className="flex-1">

                  <h2 className="text-2xl font-bold">
                    {advertisement.title}
                  </h2>

                  <p className="mt-2">
                    📍 {advertisement.city}
                  </p>

                  <p className="mt-2 font-bold text-blue-700">
                    {advertisement.price} zł
                  </p>

                  <div className="mt-4 flex flex-wrap gap-6 text-gray-600">

                    <span>
                      👁️ {advertisement.views ?? 0}
                    </span>

                    <span>
                      ❤️ {advertisement.favorites?.length ?? 0}
                    </span>

                    <span>
                      📅 {new Date(advertisement.created_at).toLocaleDateString("pl-PL")}
                    </span>

                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">

                    <Link
                      href={`/ogloszenie/${advertisement.id}`}
                      className="rounded-lg bg-blue-700 px-4 py-2 text-white hover:bg-blue-800"
                    >
                      Zobacz
                    </Link>

                    <Link
                      href={`/edytuj-ogloszenie/${advertisement.id}`}
                      className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                    >
                      Edytuj
                    </Link>

                    <button
                      onClick={() => deleteAdvertisement(advertisement.id)}
                      className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                    >
                      Usuń
                    </button>

                  </div>

                </div>

              </div>

            </div>

          ))}

        </div>

      </div>
    </main>
  );
}