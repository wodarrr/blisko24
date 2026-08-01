type ProfileContactData = {
  company_name?: string | null;
  company_logo?: string | null;
  company_description?: string | null;

  phone?: string | null;
  website?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  opening_hours?: string | null;

  city?: string | null;
  verified?: boolean | null;
};

type Props = {
  profile: ProfileContactData;
};

function normalizeUrl(value?: string | null) {
  if (!value?.trim()) return null;

  const trimmedValue = value.trim();

  if (
    trimmedValue.startsWith("http://") ||
    trimmedValue.startsWith("https://")
  ) {
    return trimmedValue;
  }

  return `https://${trimmedValue}`;
}

function normalizePhone(value?: string | null) {
  if (!value?.trim()) return null;

  return value.replace(/[^\d+]/g, "");
}

export default function ProfileContact({
  profile,
}: Props) {
  const hasCompanyData = Boolean(
    profile.company_name?.trim() ||
      profile.company_logo ||
      profile.company_description?.trim() ||
      profile.website?.trim() ||
      profile.facebook?.trim() ||
      profile.instagram?.trim() ||
      profile.opening_hours?.trim()
  );

  const hasContactData = Boolean(
    profile.phone?.trim() ||
      profile.website?.trim() ||
      profile.facebook?.trim() ||
      profile.instagram?.trim() ||
      profile.opening_hours?.trim()
  );

  if (!hasCompanyData && !hasContactData) {
    return null;
  }

  const websiteUrl = normalizeUrl(profile.website);
  const facebookUrl = normalizeUrl(profile.facebook);
  const instagramUrl = normalizeUrl(profile.instagram);
  const phoneNumber = normalizePhone(profile.phone);

  return (
    <section className="mt-10 overflow-hidden rounded-3xl bg-white shadow-lg">
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-blue-700 px-5 py-8 text-white sm:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">

          <div className="shrink-0">
            {profile.company_logo ? (
              <img
                src={profile.company_logo}
                alt={
                  profile.company_name?.trim() ||
                  "Logo firmy"
                }
                className="h-24 w-24 rounded-2xl border-4 border-white/20 bg-white object-cover shadow-xl"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white/20 bg-white/10 text-5xl shadow-xl">
                🏢
              </div>
            )}
          </div>

          <div className="min-w-0">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-200">
              Wizytówka firmy
            </p>

            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <h2 className="break-words text-3xl font-extrabold sm:text-4xl">
                {profile.company_name?.trim() ||
                  "Dane kontaktowe"}
              </h2>

              {profile.verified && (
                <span className="inline-flex w-fit items-center rounded-full bg-green-400/20 px-3 py-1.5 text-sm font-bold text-green-100 ring-1 ring-green-300/40">
                  ✔ Zweryfikowana firma
                </span>
              )}
            </div>

            {profile.city && (
              <p className="mt-3 text-blue-100">
                📍 {profile.city}
              </p>
            )}
          </div>

        </div>
      </div>

      <div className="p-5 sm:p-8">

        {profile.company_description?.trim() && (
          <div className="rounded-2xl bg-slate-50 p-5 sm:p-6">
            <h3 className="text-xl font-bold text-slate-900">
              O firmie
            </h3>

            <p className="mt-3 whitespace-pre-line break-words leading-7 text-slate-700">
              {profile.company_description}
            </p>
          </div>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">

          {profile.phone?.trim() && (
            <div className="rounded-2xl border border-slate-200 p-5">
              <p className="text-sm font-semibold text-slate-500">
                Telefon
              </p>

              <p className="mt-2 break-all text-lg font-bold text-slate-900">
                📞 {profile.phone}
              </p>
            </div>
          )}

          {profile.opening_hours?.trim() && (
            <div className="rounded-2xl border border-slate-200 p-5">
              <p className="text-sm font-semibold text-slate-500">
                Godziny pracy
              </p>

              <p className="mt-2 whitespace-pre-line font-bold text-slate-900">
                🕒 {profile.opening_hours}
              </p>
            </div>
          )}

          {websiteUrl && (
            <div className="rounded-2xl border border-slate-200 p-5">
              <p className="text-sm font-semibold text-slate-500">
                Strona internetowa
              </p>

              <a
                href={websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 block break-all font-bold text-blue-700 hover:underline"
              >
                🌐 {profile.website}
              </a>
            </div>
          )}

          {facebookUrl && (
            <div className="rounded-2xl border border-slate-200 p-5">
              <p className="text-sm font-semibold text-slate-500">
                Facebook
              </p>

              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 block break-all font-bold text-blue-700 hover:underline"
              >
                👍 {profile.facebook}
              </a>
            </div>
          )}

          {instagramUrl && (
            <div className="rounded-2xl border border-slate-200 p-5">
              <p className="text-sm font-semibold text-slate-500">
                Instagram
              </p>

              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 block break-all font-bold text-pink-700 hover:underline"
              >
                📸 {profile.instagram}
              </a>
            </div>
          )}

        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">

          {phoneNumber && (
            <a
              href={`tel:${phoneNumber}`}
              className="flex min-h-14 w-full items-center justify-center rounded-xl bg-green-600 px-6 py-4 text-center font-bold text-white transition hover:bg-green-700"
            >
              📞 Zadzwoń
            </a>
          )}

          {websiteUrl && (
            <a
              href={websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-14 w-full items-center justify-center rounded-xl bg-blue-700 px-6 py-4 text-center font-bold text-white transition hover:bg-blue-800"
            >
              🌐 Odwiedź stronę
            </a>
          )}

        </div>

      </div>
    </section>
  );
}