"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { supabase } from "../../../lib/supabase";

type Advertisement = {
  id: number;
  title: string;
  user_id: string | null;
};

type PromotionType =
  | "promoted"
  | "urgent"
  | "featured";

type PromotionOption = {
  type: PromotionType;
  name: string;
  icon: string;
  description: string;
  price: number;
  days: number;
  className: string;
};

const promotionOptions: PromotionOption[] = [
  {
    type: "promoted",
    name: "Promowane",
    icon: "⭐",
    description:
      "Ogłoszenie będzie wyświetlane wyżej i otrzyma oznaczenie PROMOWANE.",
    price: 19,
    days: 7,
    className:
      "border-yellow-300 bg-yellow-50 hover:border-yellow-500",
  },
  {
    type: "urgent",
    name: "Pilne",
    icon: "🔥",
    description:
      "Ogłoszenie otrzyma czerwone oznaczenie PILNE i mocniejsze wyróżnienie.",
    price: 9,
    days: 7,
    className:
      "border-red-300 bg-red-50 hover:border-red-500",
  },
  {
    type: "featured",
    name: "Wyróżnione",
    icon: "📌",
    description:
      "Ogłoszenie otrzyma specjalne wyróżnienie i bardziej widoczną kartę.",
    price: 14,
    days: 7,
    className:
      "border-purple-300 bg-purple-50 hover:border-purple-500",
  },
];

export default function PromoteAdvertisementPage() {
  const params = useParams();
  const router = useRouter();

  const advertisementId = Number(params.id);

  const [advertisement, setAdvertisement] =
    useState<Advertisement | null>(null);

  const [selectedType, setSelectedType] =
    useState<PromotionType>("promoted");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAdvertisement();
  }, [advertisementId]);

  async function loadAdvertisement() {
    if (
      !Number.isInteger(advertisementId) ||
      advertisementId <= 0
    ) {
      router.replace("/moje-ogloszenia");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/logowanie");
      return;
    }

    const { data, error } = await supabase
      .from("advertisements")
      .select("id, title, user_id")
      .eq("id", advertisementId)
      .maybeSingle();

    if (error) {
      console.error(
        "Błąd pobierania ogłoszenia:",
        error
      );
    }

    if (!data || data.user_id !== user.id) {
      alert(
        "Nie możesz promować tego ogłoszenia."
      );

      router.replace("/moje-ogloszenia");
      return;
    }

    setAdvertisement(data);
    setLoading(false);
  }

  async function createTestPromotion() {
    if (!advertisement || saving) return;

    const option = promotionOptions.find(
      (item) => item.type === selectedType
    );

    if (!option) return;

    const confirmed = window.confirm(
      `Wybrałeś usługę „${option.name}” za ${option.price} zł na ${option.days} dni.\n\nNa razie uruchomimy płatność testową. Kontynuować?`
    );

    if (!confirmed) return;

    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSaving(false);
      router.replace("/logowanie");
      return;
    }

    const { data: promotion, error } =
      await supabase
        .from("advertisement_promotions")
        .insert({
          advertisement_id:
            advertisement.id,
          user_id: user.id,
          promotion_type: option.type,
          days: option.days,
          amount: option.price,
          payment_status: "pending",
        })
        .select("id")
        .single();

    setSaving(false);

    if (error || !promotion) {
      console.error(
        "Błąd tworzenia promocji:",
        error
      );

      alert(
        "Nie udało się przygotować promocji."
      );

      return;
    }

    router.push(
      `/platnosc-testowa/${promotion.id}`
    );
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <p>Ładowanie...</p>
      </main>
    );
  }

  if (!advertisement) {
    return null;
  }

  const selectedOption =
    promotionOptions.find(
      (item) => item.type === selectedType
    ) ?? promotionOptions[0];

  return (
    <main className="min-h-screen bg-gray-100 py-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">

        <Link
          href="/moje-ogloszenia"
          className="text-sm font-semibold text-blue-700 hover:underline"
        >
          ← Wróć do moich ogłoszeń
        </Link>

        <div className="mt-5 rounded-3xl bg-white p-6 shadow sm:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-700">
            Promocja ogłoszenia
          </p>

          <h1 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Zwiększ widoczność ogłoszenia
          </h1>

          <p className="mt-3 text-slate-500">
            Ogłoszenie:{" "}
            <strong className="text-slate-800">
              {advertisement.title}
            </strong>
          </p>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {promotionOptions.map((option) => {
              const selected =
                selectedType === option.type;

              return (
                <button
                  key={option.type}
                  type="button"
                  onClick={() =>
                    setSelectedType(option.type)
                  }
                  className={`rounded-3xl border-2 p-6 text-left transition ${option.className} ${
                    selected
                      ? "ring-4 ring-blue-200"
                      : ""
                  }`}
                >
                  <div className="text-5xl">
                    {option.icon}
                  </div>

                  <h2 className="mt-4 text-2xl font-extrabold text-slate-900">
                    {option.name}
                  </h2>

                  <p className="mt-3 min-h-24 leading-6 text-slate-600">
                    {option.description}
                  </p>

                  <p className="mt-5 text-3xl font-extrabold text-slate-900">
                    {option.price} zł
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    na {option.days} dni
                  </p>

                  {selected && (
                    <p className="mt-4 font-bold text-blue-700">
                      ✓ Wybrano
                    </p>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-8 rounded-2xl bg-slate-50 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Wybrana usługa
                </p>

                <p className="mt-1 text-xl font-extrabold text-slate-900">
                  {selectedOption.icon}{" "}
                  {selectedOption.name}
                </p>
              </div>

              <div className="sm:text-right">
                <p className="text-sm font-semibold text-slate-500">
                  Do zapłaty
                </p>

                <p className="mt-1 text-3xl font-extrabold text-blue-700">
                  {selectedOption.price} zł
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={createTestPromotion}
            disabled={saving}
            className="mt-6 w-full rounded-xl bg-blue-700 px-6 py-4 text-lg font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Przygotowywanie płatności..."
              : "Przejdź do płatności testowej"}
          </button>
        </div>
      </div>
    </main>
  );
}