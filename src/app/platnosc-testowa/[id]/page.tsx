"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { supabase } from "../../../lib/supabase";

type TestPayment = {
  id: number;
  advertisement_id: number;
  promotion_type: string;
  days: number;
  amount: number | string;
  payment_status: string;
  advertisements?: {
    id: number;
    title: string | null;
  } | null;
};

function getPromotionName(type: string) {
  switch (type) {
    case "promoted":
      return "⭐ Promowane";

    case "urgent":
      return "🔥 Pilne";

    case "featured":
      return "📌 Wyróżnione";

    default:
      return "Promocja ogłoszenia";
  }
}

export default function TestPaymentPage() {
  const params = useParams();
  const router = useRouter();

  const promotionId = Number(params.id);

  const [payment, setPayment] =
    useState<TestPayment | null>(null);

  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    loadPayment();
  }, [promotionId]);

  async function loadPayment() {
    if (
      !Number.isInteger(promotionId) ||
      promotionId <= 0
    ) {
      setErrorMessage(
        "Nieprawidłowy identyfikator płatności."
      );
      setLoading(false);
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
      .from("advertisement_promotions")
      .select(`
        id,
        advertisement_id,
        promotion_type,
        days,
        amount,
        payment_status,
        advertisements (
          id,
          title
        )
      `)
      .eq("id", promotionId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error(
        "Błąd pobierania płatności:",
        error
      );

      setErrorMessage(
        "Nie udało się pobrać danych płatności."
      );
      setLoading(false);
      return;
    }

    if (!data) {
      setErrorMessage(
        "Płatność nie istnieje albo nie należy do Twojego konta."
      );
      setLoading(false);
      return;
    }

    setPayment({
  ...data,
  advertisements: Array.isArray(data.advertisements)
    ? data.advertisements[0] ?? null
    : data.advertisements,
} as TestPayment);
    setLoading(false);
  }

  async function completeTestPayment() {
    if (!payment || paying) return;

    if (payment.payment_status === "paid") {
      router.push(
        `/ogloszenie/${payment.advertisement_id}`
      );
      return;
    }

    setPaying(true);
    setErrorMessage("");

    const { error } = await supabase.rpc(
      "complete_test_promotion",
      {
        p_promotion_id: payment.id,
      }
    );

    setPaying(false);

    if (error) {
      console.error(
        "Błąd płatności testowej:",
        error
      );

      setErrorMessage(
        error.message ||
          "Nie udało się wykonać płatności testowej."
      );
      return;
    }

    alert(
      "Płatność testowa zakończona. Promocja została aktywowana."
    );

    router.replace(
      `/ogloszenie/${payment.advertisement_id}`
    );

    router.refresh();
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <p>Ładowanie płatności...</p>
      </main>
    );
  }

  if (!payment) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow">
          <div className="text-6xl">⚠️</div>

          <h1 className="mt-5 text-3xl font-bold">
            Nie znaleziono płatności
          </h1>

          <p className="mt-4 text-red-600">
            {errorMessage}
          </p>

          <Link
            href="/moje-ogloszenia"
            className="mt-7 inline-flex rounded-xl bg-blue-700 px-6 py-3 font-bold text-white"
          >
            Wróć do ogłoszeń
          </Link>
        </div>
      </main>
    );
  }

  const alreadyPaid =
    payment.payment_status === "paid";

  return (
    <main className="min-h-screen bg-gray-100 py-10">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">

        <Link
          href={`/promuj-ogloszenie/${payment.advertisement_id}`}
          className="text-sm font-semibold text-blue-700 hover:underline"
        >
          ← Wróć do wyboru promocji
        </Link>

        <section className="mt-5 rounded-3xl bg-white p-6 shadow sm:p-8">
          <div className="text-center">
            <div className="text-6xl">
              🧪
            </div>

            <p className="mt-4 text-sm font-bold uppercase tracking-[0.2em] text-purple-700">
              Tryb testowy
            </p>

            <h1 className="mt-3 text-3xl font-extrabold text-slate-900">
              Płatność testowa
            </h1>

            <p className="mt-3 text-slate-500">
              Nie zostaną pobrane żadne prawdziwe
              pieniądze.
            </p>
          </div>

          <div className="mt-8 space-y-4 rounded-2xl bg-slate-50 p-6">
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">
                Ogłoszenie
              </span>

              <strong className="text-right text-slate-900">
                {payment.advertisements?.title ||
                  `Ogłoszenie #${payment.advertisement_id}`}
              </strong>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-slate-500">
                Usługa
              </span>

              <strong>
                {getPromotionName(
                  payment.promotion_type
                )}
              </strong>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-slate-500">
                Okres
              </span>

              <strong>
                {payment.days} dni
              </strong>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <div className="flex items-center justify-between gap-4">
                <span className="font-semibold text-slate-700">
                  Do zapłaty
                </span>

                <strong className="text-3xl text-blue-700">
                  {Number(
                    payment.amount
                  ).toLocaleString("pl-PL", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  zł
                </strong>
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
              {errorMessage}
            </div>
          )}

          {alreadyPaid ? (
            <Link
              href={`/ogloszenie/${payment.advertisement_id}`}
              className="mt-6 flex w-full items-center justify-center rounded-xl bg-green-600 px-6 py-4 font-bold text-white hover:bg-green-700"
            >
              ✓ Promocja opłacona — zobacz ogłoszenie
            </Link>
          ) : (
            <button
              type="button"
              onClick={completeTestPayment}
              disabled={paying}
              className="mt-6 w-full rounded-xl bg-green-600 px-6 py-4 text-lg font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {paying
                ? "Przetwarzanie..."
                : "🧪 Zapłać testowo"}
            </button>
          )}

          <p className="mt-4 text-center text-xs text-slate-400">
            To wyłącznie symulacja płatności używana
            podczas tworzenia BLISKO24.
          </p>
        </section>
      </div>
    </main>
  );
}