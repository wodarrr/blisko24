type Props = {
  profile: any;
};

export default function ProfileContact({ profile }: Props) {
  return (
    <section className="mt-10 rounded-3xl bg-white p-8 shadow-lg">

      <div className="mb-8 flex items-center gap-4">

        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-100 text-4xl">
          {profile.company_logo ? (
            <img
              src={profile.company_logo}
              alt={profile.company_name || "Logo firmy"}
              className="h-20 w-20 rounded-2xl object-cover"
            />
          ) : (
            "🏢"
          )}
        </div>

        <div>

          <h2 className="text-3xl font-bold text-slate-900">
            {profile.company_name || "Dane kontaktowe"}
          </h2>

          {profile.company_name && (
            <p className="mt-1 font-semibold text-green-600">
              ✔ Firma w BLISKO24
            </p>
          )}

        </div>

      </div>

      {profile.company_description && (
        <div className="mb-8 rounded-2xl bg-slate-50 p-5">
          <h3 className="mb-2 text-lg font-bold">
            O firmie
          </h3>

          <p className="whitespace-pre-line text-slate-700">
            {profile.company_description}
          </p>
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">

        {profile.phone && (
          <div className="rounded-2xl border p-5">
            <p className="text-sm text-gray-500">
              Telefon
            </p>

            <p className="mt-2 text-lg font-bold">
              📞 {profile.phone}
            </p>
          </div>
        )}

        {profile.website && (
          <div className="rounded-2xl border p-5">
            <p className="text-sm text-gray-500">
              Strona WWW
            </p>

            <a
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 block break-all font-bold text-blue-700 hover:underline"
            >
              🌐 {profile.website}
            </a>
          </div>
        )}

        {profile.facebook && (
          <div className="rounded-2xl border p-5">
            <p className="text-sm text-gray-500">
              Facebook
            </p>

            <p className="mt-2 font-bold">
              👍 {profile.facebook}
            </p>
          </div>
        )}

        {profile.instagram && (
          <div className="rounded-2xl border p-5">
            <p className="text-sm text-gray-500">
              Instagram
            </p>

            <p className="mt-2 font-bold">
              📸 {profile.instagram}
            </p>
          </div>
        )}

        {profile.opening_hours && (
          <div className="rounded-2xl border p-5">
            <p className="text-sm text-gray-500">
              Godziny pracy
            </p>

            <p className="mt-2 font-bold">
              🕒 {profile.opening_hours}
            </p>
          </div>
        )}

      </div>

    </section>
  );
}