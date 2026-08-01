import Link from "next/link";
import FavoriteButton from "./FavoriteButton";
import { Advertisement } from "../types/advertisement";

type Props = {
  advertisement: Advertisement;
};

export default function AdvertisementCard({
  advertisement,
}: Props) {
  function formatPrice(price: number | string) {
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
      const priceText = String(price).trim();

      return priceText.toLowerCase().includes("zł")
        ? priceText
        : `${priceText} zł`;
    }

    return `${numericPrice.toLocaleString("pl-PL")} zł`;
  }

  function formatRelativeDate(date?: string | null) {
    if (!date) return "";

    const createdDate = new Date(date);

    if (Number.isNaN(createdDate.getTime())) {
      return "";
    }

    const now = new Date();
    const differenceInSeconds = Math.floor(
      (now.getTime() - createdDate.getTime()) / 1000
    );

    if (differenceInSeconds < 0) {
      return createdDate.toLocaleDateString("pl-PL");
    }

    if (differenceInSeconds < 60) {
      return "przed chwilą";
    }

    const minutes = Math.floor(differenceInSeconds / 60);

    if (minutes < 60) {
      return minutes === 1
        ? "minutę temu"
        : `${minutes} min temu`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
      if (hours === 1) {
        return "godzinę temu";
      }

      if (hours >= 2 && hours <= 4) {
        return `${hours} godziny temu`;
      }

      return `${hours} godzin temu`;
    }

    const days = Math.floor(hours / 24);

    if (days === 1) {
      return "wczoraj";
    }

    if (days < 7) {
      return `${days} dni temu`;
    }

    return createdDate.toLocaleDateString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  function formatPromotionEnd(date?: string | null) {
    if (!date) return "";

    const promotionDate = new Date(date);

    if (Number.isNaN(promotionDate.getTime())) {
      return "";
    }

    return promotionDate.toLocaleDateString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  const profileName =
    advertisement.profiles?.name?.trim() ||
    "Użytkownik BLISKO24";

  const profileCity =
    advertisement.profiles?.city?.trim() || "";

  const profileInitial =
    profileName === "Użytkownik BLISKO24"
      ? "👤"
      : profileName.charAt(0).toUpperCase();

  const favoritesCount =
    advertisement.favorites?.length ?? 0;

  const relativeDate = formatRelativeDate(
    advertisement.created_at
  );

  const promotionEnd = formatPromotionEnd(
    advertisement.promoted_until
  );

  return (
    <article
      className={`group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 transition duration-300 hover:-translate-y-1.5 hover:shadow-2xl ${
        advertisement.promoted
          ? "ring-2 ring-yellow-400 shadow-yellow-100"
          : "ring-slate-200"
      }`}
    >
      {/* Zdjęcie */}
      <div className="relative overflow-hidden bg-slate-100">
        <Link
          href={`/ogloszenie/${advertisement.id}`}
          className="block"
        >
          {advertisement.image_url ? (
            <img
              src={advertisement.image_url}
              alt={advertisement.title}
              loading="lazy"
              className="h-52 w-full object-cover transition duration-500 group-hover:scale-105 sm:h-56"
            />
          ) : (
            <div className="flex h-52 w-full flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400 sm:h-56">
              <span className="text-5xl">
                📷
              </span>

              <span className="mt-3 text-sm font-semibold">
                Brak zdjęcia
              </span>
            </div>
          )}
        </Link>

        {/* Oznaczenia górne */}
        <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <div className="flex flex-col items-start gap-2">
            {advertisement.promoted && (
              <span className="rounded-full bg-yellow-400 px-3 py-1.5 text-xs font-extrabold text-slate-900 shadow-lg">
                ⭐ PROMOWANE
              </span>
            )}

            {advertisement.urgent && (
              <span className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-extrabold text-white shadow-lg">
                🔥 PILNE
              </span>
            )}
          </div>

          <div className="pointer-events-auto rounded-full bg-white/95 p-1 shadow-lg backdrop-blur">
            <FavoriteButton
              advertisementId={advertisement.id}
            />
          </div>
        </div>

        {/* Kategoria */}
        {advertisement.category && (
          <span className="absolute bottom-3 left-3 max-w-[78%] truncate rounded-full bg-slate-950/80 px-3 py-1.5 text-xs font-semibold text-white shadow backdrop-blur">
            {advertisement.category}
          </span>
        )}
      </div>

      {/* Treść */}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {/* Autor */}
        <div className="mb-5 flex min-w-0 items-center justify-between gap-3">
          {advertisement.user_id ? (
            <Link
              href={`/profil/${advertisement.user_id}`}
              className="flex min-w-0 items-center gap-3"
            >
              {advertisement.profiles?.avatar_url ? (
                <img
                  src={advertisement.profiles.avatar_url}
                  alt={`Profil ${profileName}`}
                  loading="lazy"
                  className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-slate-100"
                />
              ) : (
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                  {profileInitial}
                </div>
              )}

              <div className="min-w-0">
                <div className="flex min-w-0 items-center gap-2">
                  <p className="truncate font-bold text-slate-800 transition hover:text-blue-700">
                    {profileName}
                  </p>

                  {advertisement.profiles?.verified && (
                    <span
                      title="Zweryfikowany użytkownik"
                      className="shrink-0 text-green-600"
                    >
                      ✔
                    </span>
                  )}
                </div>

                {profileCity && (
                  <p className="truncate text-sm text-slate-500">
                    📍 {profileCity}
                  </p>
                )}
              </div>
            </Link>
          ) : (
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-200">
                👤
              </div>

              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-700">
                  Użytkownik BLISKO24
                </p>

                <p className="text-xs text-slate-400">
                  Profil niedostępny
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Tytuł */}
        <Link
          href={`/ogloszenie/${advertisement.id}`}
          className="block"
        >
          <h3 className="line-clamp-2 min-h-14 break-words text-xl font-extrabold leading-7 text-slate-900 transition group-hover:text-blue-700">
            {advertisement.title}
          </h3>
        </Link>

        {/* Lokalizacja */}
        <div className="mt-4 space-y-1.5 text-sm text-slate-600">
          <p className="flex min-w-0 items-center gap-2">
            <span className="shrink-0">
              📍
            </span>

            <span className="truncate">
              {advertisement.city || "Brak miasta"}
            </span>
          </p>

          {advertisement.province && (
            <p className="flex min-w-0 items-center gap-2">
              <span className="shrink-0">
                🗺️
              </span>

              <span className="truncate">
                {advertisement.province}
              </span>
            </p>
          )}
        </div>

        {/* Cena */}
        <p className="mt-5 break-words text-2xl font-extrabold text-blue-700 sm:text-3xl">
          {formatPrice(advertisement.price)}
        </p>

        {/* Koniec promocji */}
        {advertisement.promoted && promotionEnd && (
          <div className="mt-4 rounded-xl bg-yellow-50 px-4 py-3 text-sm font-semibold text-yellow-800">
            ⭐ Promowane do {promotionEnd}
          </div>
        )}

        {/* Statystyki */}
        <div className="mt-auto pt-5">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-100 pt-4 text-sm text-slate-500">
            <span title="Wyświetlenia">
              👁️{" "}
              {(advertisement.views ?? 0).toLocaleString(
                "pl-PL"
              )}
            </span>

            <span title="Dodania do ulubionych">
              ❤️ {favoritesCount}
            </span>

            {relativeDate && (
              <span
                className="w-full text-xs text-slate-400 sm:ml-auto sm:w-auto sm:text-sm"
                title={new Date(
                  advertisement.created_at
                ).toLocaleString("pl-PL")}
              >
                🕒 {relativeDate}
              </span>
            )}
          </div>

          <Link
            href={`/ogloszenie/${advertisement.id}`}
            className="mt-5 flex w-full items-center justify-center rounded-xl bg-blue-700 px-5 py-3.5 font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-800 hover:shadow-lg"
          >
            Zobacz ogłoszenie
            <span className="ml-2 transition group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
}