import Link from "next/link";
import FavoriteButton from "./FavoriteButton";
import AdvertisementAuthor from "./advertisement/AdvertisementAuthor";
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

    const minutes = Math.floor(
      differenceInSeconds / 60
    );

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

  function formatPromotionEnd(
    date?: string | null
  ) {
    if (!date) return "";

    const promotionDate = new Date(date);

    if (Number.isNaN(promotionDate.getTime())) {
      return "";
    }

    return promotionDate.toLocaleDateString(
      "pl-PL",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }
    );
  }

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

        {advertisement.category && (
          <span className="absolute bottom-3 left-3 max-w-[78%] truncate rounded-full bg-slate-950/80 px-3 py-1.5 text-xs font-semibold text-white shadow backdrop-blur">
            {advertisement.category}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="mb-5">
          <AdvertisementAuthor
            userId={advertisement.user_id}
            profile={advertisement.profiles}
          />
        </div>

        <Link
          href={`/ogloszenie/${advertisement.id}`}
          className="block"
        >
          <h3 className="line-clamp-2 min-h-14 break-words text-xl font-extrabold leading-7 text-slate-900 transition group-hover:text-blue-700">
            {advertisement.title}
          </h3>
        </Link>

        <div className="mt-4 space-y-1.5 text-sm text-slate-600">
          <p className="flex min-w-0 items-center gap-2">
            <span className="shrink-0">
              📍
            </span>

            <span className="truncate">
              {advertisement.city ||
                "Brak miasta"}
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

        <p className="mt-5 break-words text-2xl font-extrabold text-blue-700 sm:text-3xl">
          {formatPrice(advertisement.price)}
        </p>

        {advertisement.promoted &&
          promotionEnd && (
            <div className="mt-4 rounded-xl bg-yellow-50 px-4 py-3 text-sm font-semibold text-yellow-800">
              ⭐ Promowane do {promotionEnd}
            </div>
          )}

        <div className="mt-auto pt-5">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-100 pt-4 text-sm text-slate-500">
            <span title="Wyświetlenia">
              👁️{" "}
              {(
                advertisement.views ?? 0
              ).toLocaleString("pl-PL")}
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