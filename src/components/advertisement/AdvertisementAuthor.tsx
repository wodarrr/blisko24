import Link from "next/link";
import UserRating from "../UserRating";

type Profile = {
  name: string | null;
  city: string | null;
  avatar_url: string | null;
  verified?: boolean;

  reviews?: {
    rating: number | string | null;
  }[];
};

type Props = {
  userId: string | null;
  profile?: Profile | null;
};

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
      className="flex min-w-0 items-center gap-3"
    >
      {profile?.avatar_url ? (
        <img
          src={profile.avatar_url}
          alt={`Profil ${profileName}`}
          loading="lazy"
          className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-slate-100"
        />
      ) : (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
          {profileInitial}
        </div>
      )}

      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-2">
          <p className="truncate font-bold text-slate-800 transition hover:text-blue-700">
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
      </div>
    </Link>
  );
}