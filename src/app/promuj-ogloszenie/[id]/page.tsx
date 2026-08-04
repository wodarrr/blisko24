"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  useParams,
  useRouter,
} from "next/navigation";

import { supabase } from "../../../lib/supabase";

type Advertisement = {
  id: number;
  title: string;
  user_id: string | null;
  status: string | null;
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
  selectedClassName: string;
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
    selectedClassName:
      "ring-4 ring-yellow-200 border-yellow-500",
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
    selectedClassName:
      "ring-4 ring-red-200 border-red-500",
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
    selectedClassName:
      "ring-4 ring-purple-200 border-purple-500",
  },
];

function formatPrice(value: number) {
  return value.toLocaleString("pl-PL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function PromoteAdvertisementPage() {
  const params = useParams();
  const router = useRouter();

  const rawId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const advertisementId = Number(rawId);

  const [advertisement, setAdvertisement] =
    useState<Advertisement | null>(null);

  const [selectedType, setSelectedType] =
    useState<PromotionType>("promoted");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    let cancelled = false;

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
        error: userError,
      } = await supabase.auth.getUser();

      if (cancelled) return;

      if (userError || !user) {
        router.replace("/logowanie");
        return;
      }

      const { data, error } = await supabase
        .from("advertisements")
        .select("id, title, user_id, status")
        .eq("id", advertisementId)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        console.error(
          "Błąd pobierania ogłoszenia:",
          error
        );

        setErrorMessage(
          "Nie udało się pobrać ogłoszenia."
        );

        setLoading(false);
        return;
      }

      if (!data || data.user_id !== user.id) {
        alert(
          "Nie możesz promować tego ogłoszenia."
        );

        router.replace("/moje-ogloszenia");
        return;
      }

      if (data.status !== "approved") {
        alert(
          "Promować można tylko opublikowane ogłoszenia."
        );

        router.replace("/moje-ogloszenia");
        return;
      }

      setAdvertisement(data);
      setLoading(false);
    }

    loadAdvertisement();

    return () => {
      cancelled = true;
    };
  }, [advertisementId, router]);

  const selectedOption = useMemo(
    () =>
      promotionOptions.find(
        (item) =>
          item.type === selectedType
      ) ?? promotionOptions[0],
    [selectedType]
  );

  async function createTestPromotion() {
    if (!advertisement || saving) {
      return;
    }

    const confirmed = window.confirm(
      `Wybrałeś usługę „${selectedOption.name}” za ${formatPrice(
        selectedOption.price
      )} zł na ${selectedOption.days} dni.\n\nTo jest płatność testowa — żadne pieniądze nie zostaną pobrane. Kontynuować?`
    );

    if (!confirmed) return;

    setSaving(true);
    setErrorMessage("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setSaving(false);
      router.replace("/logowanie");
      return;
    }

    const {
      data: promotion,
      error,
    } = await supabase
      .from("advertisement_promotions")
      .insert({
        advertisement_id:
          advertisement.id,
        user_id: user.id,
        promotion_type:
          selectedOption.type,
        days: selectedOption.days,
        amount: selectedOption.price,
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

      setErrorMessage(
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
      <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="rounded-3xl bg-white p-10 text-center shadow">
          <div className="text-5xl">
            🚀
          </div>

          <p className="mt-4 font-semibold text-slate-700">
            Ładowanie promocji...
          </p>
        </div>
      </main>
    );
  }

  if (!advertisement) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-100 py-8 sm:py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <Link
          href="/moje-ogloszenia"
          className="text-sm font-semibold text-blue-700 hover:underline"
        >
          ← Wróć do moich ogłoszeń
        </Link>

        <section className="mt-5 overflow-hidden rounded-3xl bg-white shadow">
          <div className="bg-gradient-to-r from-blue-800 via-blue-700 to-cyan-500 p-6 text-white sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-100">
              Promocja ogłoszenia
            </p>

            <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">
              🚀 Zwiększ widoczność
            </h1>

            <p className="mt-3 text-blue-100">
              Ogłoszenie:{" "}
              <strong className="text-white">
                {advertisement.title}
              </strong>
            </p>
          </div>

          <div className="p-5 sm:p-8">
            <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
              🧪 Tryb testowy: żadna prawdziwa
              płatność nie zostanie pobrana.
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {promotionOptions.map(
                (option) => {
                  const selected =
                    selectedType ===
                    option.type;

                  return (
                    <button
                      key={option.type}
                      type="button"
                      onClick={() =>
                        setSelectedType(
                          option.type
                        )
                      }
                      aria-pressed={selected}
                      className={`rounded-3xl border-2 p-6 text-left transition hover:-translate-y-1 hover:shadow-lg ${option.className} ${
                        selected
                          ? option.selectedClassName
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
                        {formatPrice(
                          option.price
                        )}{" "}
                        zł
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
                }
              )}
            </div>

            <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Wybrana usługa
                  </p>

                  <p className="mt-2 text-xl font-extrabold text-slate-900">
                    {selectedOption.icon}{" "}
                    {selectedOption.name}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Czas trwania:{" "}
                    {selectedOption.days} dni
                  </p>
                </div>

                <div className="sm:text-right">
                  <p className="text-sm font-semibold text-slate-500">
                    Do zapłaty
                  </p>

                  <p className="mt-1 text-3xl font-extrabold text-blue-700">
                    {formatPrice(
                      selectedOption.price
                    )}{" "}
                    zł
                  </p>
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 font-semibold text-red-700">
                {errorMessage}
              </div>
            )}

            <button
              type="button"
              onClick={createTestPromotion}
              disabled={saving}
              className="mt-6 w-full rounded-xl bg-blue-700 px-6 py-4 text-lg font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Przygotowywanie..."
                : "Przejdź do płatności testowej"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}