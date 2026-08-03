"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { supabase } from "../../lib/supabase";

type Advertisement = {
  id: number;
  title: string;
  city: string | null;
  price: number | string | null;
  image_url: string | null;

  views: number | null;
  created_at: string;

  status: "pending" | "approved" | "rejected" | string | null;
  approved_at: string | null;
  approved_by: string | null;

  promoted: boolean | null;
  promoted_until: string | null;

  urgent: boolean | null;
  urgent_until: string | null;

  featured: boolean | null;
  featured_until: string | null;

  favorites?: {
    id: number;
  }[];
};

function formatPrice(
  price: number | string | null
) {
  if (
    price === null ||
    price === undefined ||
    String(price).trim() === ""
  ) {
    return "Cena do uzgodnienia";
  }

  const normalizedPrice = String(price)
    .replace(/\s/g, "")
    .replace(",", ".");

  const numericPrice = Number(normalizedPrice);

  if (Number.isNaN(numericPrice)) {
    const value = String(price).trim();

    return value.toLowerCase().includes("zł")
      ? value
      : `${value} zł`;
  }

  return `${numericPrice.toLocaleString(
    "pl-PL"
  )} zł`;
}

function isPromotionActive(
  enabled?: boolean | null,
  until?: string | null
) {
  if (!enabled) return false;
  if (!until) return true;

  const endDate = new Date(until);

  if (Number.isNaN(endDate.getTime())) {
    return false;
  }

  return endDate.getTime() > Date.now();
}

function formatPromotionDate(
  date?: string | null
) {
  if (!date) return "";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toLocaleDateString(
    "pl-PL",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  );
}

function getRemainingDays(
  date?: string | null
) {
  if (!date) return null;

  const endDate = new Date(date);

  if (Number.isNaN(endDate.getTime())) {
    return null;
  }

  const difference =
    endDate.getTime() - Date.now();

  if (difference <= 0) {
    return 0;
  }

  return Math.ceil(
    difference / (1000 * 60 * 60 * 24)
  );
}

function getModerationStatus(
  status?: string | null
) {
  switch (status) {
    case "approved":
      return {
        label: "Opublikowane",
        description:
          "Ogłoszenie jest widoczne publicznie.",
        icon: "●",
        containerClass:
          "border-green-200 bg-green-50",
        labelClass: "text-green-700",
      };

    case "rejected":
      return {
        label: "Odrzucone",
        description:
          "Ogłoszenie nie zostało opublikowane.",
        icon: "●",
        containerClass:
          "border-red-200 bg-red-50",
        labelClass: "text-red-700",
      };

    case "pending":
    default:
      return {
        label: "Oczekuje na moderację",
        description:
          "Ogłoszenie nie jest jeszcze widoczne publicznie.",
        icon: "●",
        containerClass:
          "border-yellow-200 bg-yellow-50",
        labelClass: "text-yellow-700",
      };
  }
}

function formatDateTime(
  date?: string | null
) {
  if (!date) return "";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toLocaleString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MyAdvertisementsPage() {
  const router = useRouter();

  const [
    advertisements,
    setAdvertisements,
  ] = useState<Advertisement[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  useEffect(() => {
    loadAdvertisements();
  }, []);

  async function loadAdvertisements() {
    setLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error(
        "Błąd pobierania użytkownika:",
        userError
      );
    }

    if (!user) {
      router.replace("/logowanie");
      return;
    }

    const { data, error } = await supabase
      .from("advertisements")
      .select(`
        id,
        title,
        city,
        price,
        image_url,
        views,
        created_at,
        status,
        approved_at,
        approved_by,
        promoted,
        promoted_until,
        urgent,
        urgent_until,
        featured,
        featured_until,
        favorites (
          id
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "Błąd pobierania ogłoszeń:",
        error
      );

      alert(
        "Nie udało się pobrać Twoich ogłoszeń."
      );

      setAdvertisements([]);
      setLoading(false);
      return;
    }

    setAdvertisements(
      (data ?? []) as Advertisement[]
    );

    setLoading(false);
  }

  async function deleteAdvertisement(
    id: number
  ) {
    const confirmed = window.confirm(
      "Czy na pewno chcesz usunąć to ogłoszenie? Tej operacji nie można cofnąć."
    );

    if (!confirmed) return;

    setDeletingId(id);

    const { error } = await supabase
      .from("advertisements")
      .delete()
      .eq("id", id);

    setDeletingId(null);

    if (error) {
      console.error(
        "Błąd usuwania ogłoszenia:",
        error
      );

      alert(
        "Nie udało się usunąć ogłoszenia."
      );

      return;
    }

    setAdvertisements((previous) =>
      previous.filter(
        (advertisement) =>
          advertisement.id !== id
      )
    );
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="rounded-3xl bg-white p-10 text-center shadow">
          <div className="text-5xl">
            📢
          </div>

          <p className="mt-4 font-semibold text-slate-700">
            Ładowanie Twoich ogłoszeń...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">

        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-700">
              Twoje konto
            </p>

            <h1 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Moje ogłoszenia
            </h1>

            <p className="mt-2 text-slate-500">
              Liczba ogłoszeń:{" "}
              {advertisements.length}
            </p>
          </div>

          <Link
            href="/dodaj-ogloszenie"
            className="inline-flex items-center justify-center rounded-xl bg-blue-700 px-6 py-3.5 font-bold text-white shadow transition hover:bg-blue-800"
          >
            + Dodaj ogłoszenie
          </Link>
        </div>

        {advertisements.length === 0 ? (
          <section className="rounded-3xl bg-white p-8 text-center shadow sm:p-12">
            <div className="text-6xl">
              📭
            </div>

            <h2 className="mt-5 text-2xl font-bold text-slate-900">
              Nie masz jeszcze ogłoszeń
            </h2>

            <p className="mt-3 text-slate-500">
              Dodaj pierwsze ogłoszenie i pokaż
              swoją ofertę użytkownikom BLISKO24.
            </p>

            <Link
              href="/dodaj-ogloszenie"
              className="mt-7 inline-flex rounded-xl bg-blue-700 px-6 py-3 font-bold text-white hover:bg-blue-800"
            >
              Dodaj pierwsze ogłoszenie
            </Link>
          </section>
        ) : (
          <div className="space-y-6">
            {advertisements.map(
              (advertisement) => {
                const promotedActive =
                  isPromotionActive(
                    advertisement.promoted,
                    advertisement.promoted_until
                  );

                const urgentActive =
                  isPromotionActive(
                    advertisement.urgent,
                    advertisement.urgent_until
                  );

                const featuredActive =
                  isPromotionActive(
                    advertisement.featured,
                    advertisement.featured_until
                  );

                const promotedDays =
                  getRemainingDays(
                    advertisement.promoted_until
                  );

                const urgentDays =
                  getRemainingDays(
                    advertisement.urgent_until
                  );

                const featuredDays =
                  getRemainingDays(
                    advertisement.featured_until
                  );

                const deleting =
                  deletingId === advertisement.id;

                const moderationStatus =
                  getModerationStatus(
                    advertisement.status
                  );

                const isApproved =
                  advertisement.status ===
                  "approved";

                const approvedDate =
                  formatDateTime(
                    advertisement.approved_at
                  );

                return (
                  <article
                    key={advertisement.id}
                    className="overflow-hidden rounded-3xl bg-white shadow"
                  >
                    <div className="flex flex-col lg:flex-row">

                      <div className="relative shrink-0 lg:w-72">
                        {advertisement.image_url ? (
                          <img
                            src={
                              advertisement.image_url
                            }
                            alt={
                              advertisement.title
                            }
                            className="h-56 w-full object-cover lg:h-full lg:min-h-72"
                          />
                        ) : (
                          <div className="flex h-56 w-full flex-col items-center justify-center bg-slate-100 text-slate-400 lg:h-full lg:min-h-72">
                            <span className="text-5xl">
                              📷
                            </span>

                            <span className="mt-3 font-semibold">
                              Brak zdjęcia
                            </span>
                          </div>
                        )}

                        <div className="absolute left-3 top-3 flex flex-col items-start gap-2">
                          {promotedActive && (
                            <span className="rounded-full bg-yellow-400 px-3 py-1.5 text-xs font-extrabold text-slate-900 shadow">
                              ⭐ PROMOWANE
                            </span>
                          )}

                          {urgentActive && (
                            <span className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-extrabold text-white shadow">
                              🔥 PILNE
                            </span>
                          )}

                          {featuredActive && (
                            <span className="rounded-full bg-purple-600 px-3 py-1.5 text-xs font-extrabold text-white shadow">
                              📌 WYRÓŻNIONE
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex-1 p-5 sm:p-7">
                        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                          <div className="min-w-0">
                            <h2 className="break-words text-2xl font-extrabold text-slate-900">
                              {advertisement.title}
                            </h2>

                            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
                              <span>
                                📍{" "}
                                {advertisement.city ||
                                  "Brak miasta"}
                              </span>

                              <span>
                                📅{" "}
                                {new Date(
                                  advertisement.created_at
                                ).toLocaleDateString(
                                  "pl-PL"
                                )}
                              </span>
                            </div>
                          </div>

                          <p className="shrink-0 text-2xl font-extrabold text-blue-700">
                            {formatPrice(
                              advertisement.price
                            )}
                          </p>
                        </div>

                        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          <div className="rounded-2xl bg-slate-50 p-4">
                            <p className="text-sm text-slate-500">
                              Wyświetlenia
                            </p>

                            <p className="mt-1 text-2xl font-extrabold text-slate-900">
                              👁️{" "}
                              {(
                                advertisement.views ??
                                0
                              ).toLocaleString(
                                "pl-PL"
                              )}
                            </p>
                          </div>

                          <div className="rounded-2xl bg-slate-50 p-4">
                            <p className="text-sm text-slate-500">
                              Ulubione
                            </p>

                            <p className="mt-1 text-2xl font-extrabold text-slate-900">
                              ❤️{" "}
                              {advertisement
                                .favorites
                                ?.length ?? 0}
                            </p>
                          </div>

                          <div
                            className={`rounded-2xl border p-4 ${moderationStatus.containerClass}`}
                          >
                            <p className="text-sm text-slate-500">
                              Status
                            </p>

                            <p
                              className={`mt-1 font-bold ${moderationStatus.labelClass}`}
                            >
                              {moderationStatus.icon}{" "}
                              {moderationStatus.label}
                            </p>

                            <p className="mt-2 text-xs leading-5 text-slate-500">
                              {moderationStatus.description}
                            </p>
                          </div>
                        </div>

                        {isApproved &&
                          approvedDate && (
                            <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                              ✅ Opublikowano:{" "}
                              <strong>
                                {approvedDate}
                              </strong>
                            </div>
                          )}

                        {!isApproved && (
                          <div className="mt-5 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm leading-6 text-yellow-900">
                            ⏳ To ogłoszenie zobaczysz na
                            swoim koncie, ale pozostali
                            użytkownicy zobaczą je dopiero
                            po akceptacji administratora.
                          </div>
                        )}

                        {(promotedActive ||
                          urgentActive ||
                          featuredActive) && (
                          <section className="mt-5 rounded-2xl border border-slate-200 p-4">
                            <h3 className="font-bold text-slate-900">
                              Aktywne promocje
                            </h3>

                            <div className="mt-3 flex flex-wrap gap-2">
                              {promotedActive && (
                                <span className="rounded-full bg-yellow-100 px-3 py-1.5 text-sm font-semibold text-yellow-900">
                                  ⭐ Promowane
                                  {promotedDays !== null
                                    ? ` — ${promotedDays} dni`
                                    : ""}
                                  {advertisement.promoted_until
                                    ? `, do ${formatPromotionDate(
                                        advertisement.promoted_until
                                      )}`
                                    : ""}
                                </span>
                              )}

                              {urgentActive && (
                                <span className="rounded-full bg-red-100 px-3 py-1.5 text-sm font-semibold text-red-800">
                                  🔥 Pilne
                                  {urgentDays !== null
                                    ? ` — ${urgentDays} dni`
                                    : ""}
                                  {advertisement.urgent_until
                                    ? `, do ${formatPromotionDate(
                                        advertisement.urgent_until
                                      )}`
                                    : ""}
                                </span>
                              )}

                              {featuredActive && (
                                <span className="rounded-full bg-purple-100 px-3 py-1.5 text-sm font-semibold text-purple-800">
                                  📌 Wyróżnione
                                  {featuredDays !== null
                                    ? ` — ${featuredDays} dni`
                                    : ""}
                                  {advertisement.featured_until
                                    ? `, do ${formatPromotionDate(
                                        advertisement.featured_until
                                      )}`
                                    : ""}
                                </span>
                              )}
                            </div>
                          </section>
                        )}

                        <div className="mt-6 flex flex-wrap gap-3">
                          <Link
                            href={`/ogloszenie/${advertisement.id}`}
                            className="rounded-xl bg-blue-700 px-4 py-2.5 font-semibold text-white hover:bg-blue-800"
                          >
                            Zobacz
                          </Link>

                          <Link
                            href={`/edytuj-ogloszenie/${advertisement.id}`}
                            className="rounded-xl bg-green-600 px-4 py-2.5 font-semibold text-white hover:bg-green-700"
                          >
                            Edytuj
                          </Link>

                          {isApproved ? (
                            <Link
                              href={`/promuj-ogloszenie/${advertisement.id}`}
                              className="rounded-xl bg-yellow-400 px-4 py-2.5 font-bold text-slate-900 hover:bg-yellow-500"
                            >
                              ⭐ Promuj
                            </Link>
                          ) : (
                            <span className="cursor-not-allowed rounded-xl bg-slate-200 px-4 py-2.5 font-bold text-slate-500">
                              ⭐ Promocja po publikacji
                            </span>
                          )}

                          <button
                            type="button"
                            disabled={deleting}
                            onClick={() =>
                              deleteAdvertisement(
                                advertisement.id
                              )
                            }
                            className="rounded-xl bg-red-600 px-4 py-2.5 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deleting
                              ? "Usuwanie..."
                              : "Usuń"}
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
      </div>
    </main>
  );
}