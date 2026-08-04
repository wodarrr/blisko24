"use client";

import Link from "next/link";
import UserRating from "../UserRating";

type Profile = {
  name: string | null;
  city: string | null;
  avatar_url: string | null;
  verified?: boolean;
  last_seen?: string | null;

  reviews?: {
    rating: number | string | null;
  }[];
};

type Props = {
  userId: string | null;
  profile?: Profile | null;
};

function getTrustBadge(profile?: Profile | null) {
  if (!profile) {
    return null;
  }

  const criteria = [
    Boolean(profile.name?.trim()),
    Boolean(profile.city?.trim()),
    Boolean(profile.avatar_url),
    profile.verified === true,
    (profile.reviews?.length ?? 0) > 0,
  ];

  const completed = criteria.filter(Boolean).length;
  const score = Math.round(
    (completed / criteria.length) * 100
  );

  if (score >= 80) {
    return {
      label: `Zaufany ${score}%`,
      className:
        "bg-green-100 text-green-700 ring-green-200",
    };
  }

  if (score >= 60) {
    return {
      label: `Profil ${score}%`,
      className:
        "bg-yellow-100 text-yellow-800 ring-yellow-200",
    };
  }

  return null;
}

function formatLastSeen(
  value?: string | null
) {
  if (!value) return null;

  const lastSeen = new Date(value);

  if (Number.isNaN(lastSeen.getTime())) {
    return null;
  }

  const differenceInMinutes = Math.floor(
    (Date.now() - lastSeen.getTime()) /
      (1000 * 60)
  );

  if (differenceInMinutes < 0) {
    return null;
  }

  if (differenceInMinutes <= 3) {
    return {
      label: "Online teraz",
      className: "text-green-700",
      dotClassName: "bg-green-500",
    };
  }

  if (differenceInMinutes < 60) {
    return {
      label: `Aktywny ${differenceInMinutes} min temu`,
      className: "text-green-700",
      dotClassName: "bg-green-400",
    };
  }

  const hours = Math.floor(
    differenceInMinutes / 60
  );

  if (hours < 24) {
    return {
      label:
        hours === 1
          ? "Aktywny godzinę temu"
          : `Aktywny ${hours} godz. temu`,
      className: "text-yellow-700",
      dotClassName: "bg-yellow-500",
    };
  }

  const days = Math.floor(hours / 24);

  return {
    label:
      days === 1
        ? "Aktywny wczoraj"
        : `Aktywny ${days} dni temu`,
    className: "text-slate-500",
    dotClassName: "bg-slate-400",
  };
}

export default function AdvertisementAuthor({
  userId,
  profile,
}: Props) {
  const profileName =
    profile?.name?.trim() ||
    "Użytkownik BLISKO24";

  const profileCity =
    profile?.city?.trim() || "";

  const profileInitial =
    profileName === "Użytkownik BLISKO24"
      ? "👤"
      : profileName.charAt(0).toUpperCase();

  const trustBadge =
    getTrustBadge(profile);

  const activityStatus =
    formatLastSeen(profile?.last_seen);

  if (!userId) {
    return (
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
    );
  }

  return (
    <Link
      href={`/profil/${userId}`}
      className="group/author flex min-w-0 items-center gap-3 rounded-2xl p-1 transition hover:bg-slate-50"
    >
      {profile?.avatar_url ? (
        <img
          src={profile.avatar_url}
          alt={`Profil ${profileName}`}
          loading="lazy"
          className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-slate-100 transition group-hover/author:ring-blue-200"
        />
      ) : (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
          {profileInitial}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <p className="truncate font-bold text-slate-800 transition group-hover/author:text-blue-700">
            {profileName}
          </p>

          {profile?.verified && (
            <span
              title="Zweryfikowany użytkownik"
              className="shrink-0 text-green-600"
            >
              ✔
            </span>
          )}

          {trustBadge && (
            <span
              className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] font-extrabold ring-1 ${trustBadge.className}`}
              title="Poziom zaufania profilu"
            >
              🛡️ {trustBadge.label}
            </span>
          )}
        </div>

        <div className="mt-1">
          <UserRating
            ratings={profile?.reviews}
          />
        </div>

        {profileCity && (
          <p className="mt-1 truncate text-sm text-slate-500">
            📍 {profileCity}
          </p>
        )}

        {activityStatus && (
          <p
            className={`mt-1 flex items-center gap-1.5 truncate text-xs font-semibold ${activityStatus.className}`}
          >
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${activityStatus.dotClassName}`}
            />

            {activityStatus.label}
          </p>
        )}
      </div>
    </Link>
  );
}