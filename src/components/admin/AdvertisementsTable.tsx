"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { supabase } from "../../lib/supabase";

export type AdminAdvertisement = {
  id: number;
  title: string | null;
  city: string | null;
  price: number | string | null;

  promoted?: boolean | null;
  promoted_until?: string | null;

  urgent?: boolean | null;
  urgent_until?: string | null;

  featured?: boolean | null;
  featured_until?: string | null;

  profiles?: {
    name: string | null;
  } | null;
};

type Props = {
  advertisements: AdminAdvertisement[];
  onDelete: (id: number) => void;
};

type PromotionChanges = {
  promoted?: boolean;
  promoted_until?: string | null;

  urgent?: boolean;
  urgent_until?: string | null;

  featured?: boolean;
  featured_until?: string | null;
};

function addDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);

  return date.toISOString();
}

function formatDate(date?: string | null) {
  if (!date) return "";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function AdvertisementsTable({
  advertisements,
  onDelete,
}: Props) {
  const [localAdvertisements, setLocalAdvertisements] =
    useState<AdminAdvertisement[]>(advertisements);

  const [processingId, setProcessingId] =
    useState<number | null>(null);

  useEffect(() => {
    setLocalAdvertisements(advertisements);
  }, [advertisements]);

  async function updatePromotion(
    advertisementId: number,
    changes: PromotionChanges
  ) {
    setProcessingId(advertisementId);

    const { error } = await supabase
      .from("advertisements")
      .update(changes)
      .eq("id", advertisementId);

    setProcessingId(null);

    if (error) {
      console.error(
        "Błąd aktualizacji promocji:",
        error
      );

      alert(
        "Nie udało się zmienić promocji ogłoszenia."
      );

      return;
    }

    setLocalAdvertisements((previous) =>
      previous.map((advertisement) =>
        advertisement.id === advertisementId
          ? {
              ...advertisement,
              ...changes,
            }
          : advertisement
      )
    );
  }

  async function promoteAdvertisement(
    advertisement: AdminAdvertisement
  ) {
    const confirmed = window.confirm(
      `Promować ogłoszenie „${
        advertisement.title || "Bez tytułu"
      }” przez 7 dni?`
    );

    if (!confirmed) return;

    await updatePromotion(advertisement.id, {
      promoted: true,
      promoted_until: addDays(7),
    });
  }

  async function markAsUrgent(
    advertisement: AdminAdvertisement
  ) {
    const confirmed = window.confirm(
      `Oznaczyć ogłoszenie „${
        advertisement.title || "Bez tytułu"
      }” jako PILNE przez 7 dni?`
    );

    if (!confirmed) return;

    await updatePromotion(advertisement.id, {
      urgent: true,
      urgent_until: addDays(7),
    });
  }

  async function featureAdvertisement(
    advertisement: AdminAdvertisement
  ) {
    const confirmed = window.confirm(
      `Wyróżnić ogłoszenie „${
        advertisement.title || "Bez tytułu"
      }” przez 7 dni?`
    );

    if (!confirmed) return;

    await updatePromotion(advertisement.id, {
      featured: true,
      featured_until: addDays(7),
    });
  }

  async function disablePromotions(
    advertisement: AdminAdvertisement
  ) {
    const confirmed = window.confirm(
      `Wyłączyć wszystkie promocje ogłoszenia „${
        advertisement.title || "Bez tytułu"
      }”?`
    );

    if (!confirmed) return;

    await updatePromotion(advertisement.id, {
      promoted: false,
      promoted_until: null,

      urgent: false,
      urgent_until: null,

      featured: false,
      featured_until: null,
    });
  }

  return (
    <section className="overflow-hidden rounded-3xl bg-white shadow">
      <div className="border-b border-slate-200 p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-slate-900">
          Wszystkie ogłoszenia
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Liczba ogłoszeń: {localAdvertisements.length}
        </p>
      </div>

      {localAdvertisements.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          Brak ogłoszeń.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1250px]">
            <thead className="bg-slate-50">
              <tr className="text-left text-sm text-slate-600">
                <th className="px-6 py-4">
                  Ogłoszenie
                </th>

                <th className="px-6 py-4">
                  Autor
                </th>

                <th className="px-6 py-4">
                  Miasto
                </th>

                <th className="px-6 py-4">
                  Cena
                </th>

                <th className="px-6 py-4">
                  Status promocji
                </th>

                <th className="px-6 py-4">
                  Akcje
                </th>
              </tr>
            </thead>

            <tbody>
              {localAdvertisements.map(
                (advertisement) => {
                  const processing =
                    processingId === advertisement.id;

                  const hasPromotion =
                    advertisement.promoted ||
                    advertisement.urgent ||
                    advertisement.featured;

                  return (
                    <tr
                      key={advertisement.id}
                      className="border-t border-slate-100 align-top"
                    >
                      <td className="max-w-xs px-6 py-5">
                        <p className="truncate font-semibold text-slate-900">
                          {advertisement.title ||
                            "Bez tytułu"}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          ID: {advertisement.id}
                        </p>
                      </td>

                      <td className="px-6 py-5 text-slate-600">
                        {advertisement.profiles?.name ||
                          "Użytkownik BLISKO24"}
                      </td>

                      <td className="px-6 py-5 text-slate-600">
                        {advertisement.city || "—"}
                      </td>

                      <td className="px-6 py-5 font-semibold text-blue-700">
                        {advertisement.price !== null &&
                        advertisement.price !== undefined &&
                        String(
                          advertisement.price
                        ).trim() !== ""
                          ? `${advertisement.price} zł`
                          : "Do uzgodnienia"}
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex flex-col items-start gap-2">
                          {advertisement.promoted && (
                            <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-bold text-yellow-800">
                              ⭐ Promowane
                              {advertisement.promoted_until &&
                                ` do ${formatDate(
                                  advertisement.promoted_until
                                )}`}
                            </span>
                          )}

                          {advertisement.urgent && (
                            <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-bold text-red-700">
                              🔥 Pilne
                              {advertisement.urgent_until &&
                                ` do ${formatDate(
                                  advertisement.urgent_until
                                )}`}
                            </span>
                          )}

                          {advertisement.featured && (
                            <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-bold text-purple-700">
                              📌 Wyróżnione
                              {advertisement.featured_until &&
                                ` do ${formatDate(
                                  advertisement.featured_until
                                )}`}
                            </span>
                          )}

                          {!hasPromotion && (
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
                              Zwykłe
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex max-w-md flex-wrap gap-2">
                          <Link
                            href={`/ogloszenie/${advertisement.id}`}
                            className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                          >
                            Zobacz
                          </Link>

                          <button
                            type="button"
                            disabled={processing}
                            onClick={() =>
                              promoteAdvertisement(
                                advertisement
                              )
                            }
                            className="rounded-lg bg-yellow-400 px-3 py-2 text-sm font-bold text-slate-900 hover:bg-yellow-500 disabled:opacity-50"
                          >
                            ⭐ Promuj
                          </button>

                          <button
                            type="button"
                            disabled={processing}
                            onClick={() =>
                              markAsUrgent(advertisement)
                            }
                            className="rounded-lg bg-orange-600 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
                          >
                            🔥 Pilne
                          </button>

                          <button
                            type="button"
                            disabled={processing}
                            onClick={() =>
                              featureAdvertisement(
                                advertisement
                              )
                            }
                            className="rounded-lg bg-purple-600 px-3 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
                          >
                            📌 Wyróżnij
                          </button>

                          {hasPromotion && (
                            <button
                              type="button"
                              disabled={processing}
                              onClick={() =>
                                disablePromotions(
                                  advertisement
                                )
                              }
                              className="rounded-lg bg-slate-700 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                            >
                              Wyłącz promocję
                            </button>
                          )}

                          <button
                            type="button"
                            disabled={processing}
                            onClick={() =>
                              onDelete(
                                advertisement.id
                              )
                            }
                            className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                          >
                            Usuń
                          </button>
                        </div>

                        {processing && (
                          <p className="mt-2 text-xs font-bold text-blue-700">
                            Zapisywanie...
                          </p>
                        )}
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}