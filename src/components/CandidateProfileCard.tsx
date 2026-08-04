type Props = {
  role?: string | null;
  skills?: string[] | null;
  preferredProvince?: string | null;
  preferredCity?: string | null;
  workModes?: string[] | null;
  availableFrom?: string | null;
  openToOffers?: boolean | null;
  yearsOfExperience?: number | null;
};

function formatAvailability(
  value?: string | null
) {
  if (!value) {
    return "Do uzgodnienia";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function CandidateProfileCard({
  role,
  skills,
  preferredProvince,
  preferredCity,
  workModes,
  availableFrom,
  openToOffers,
  yearsOfExperience,
}: Props) {
  const normalizedRole = role?.trim() || "";
  const normalizedSkills = Array.isArray(skills)
    ? skills.filter((skill) => skill?.trim())
    : [];

  const normalizedWorkModes = Array.isArray(
    workModes
  )
    ? workModes.filter((mode) => mode?.trim())
    : [];

  const hasCandidateData = Boolean(
    normalizedRole ||
      normalizedSkills.length > 0 ||
      preferredProvince?.trim() ||
      preferredCity?.trim() ||
      normalizedWorkModes.length > 0 ||
      availableFrom ||
      yearsOfExperience !== null &&
        yearsOfExperience !== undefined ||
      openToOffers
  );

  if (!hasCandidateData) {
    return null;
  }

  const preferredLocation = [
    preferredProvince?.trim(),
    preferredCity?.trim(),
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    <section className="mt-10 overflow-hidden rounded-3xl border border-green-200 bg-white shadow-lg">
      <div className="bg-gradient-to-r from-green-800 via-emerald-700 to-cyan-600 px-5 py-7 text-white sm:px-8">
        <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-green-100">
          Dla pracodawców
        </p>

        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-3xl font-extrabold">
            🎯 Profil kandydata
          </h2>

          {openToOffers ? (
            <span className="inline-flex w-fit rounded-full bg-white/15 px-4 py-2 text-sm font-bold ring-1 ring-white/30">
              🟢 Otwarty na propozycje
            </span>
          ) : (
            <span className="inline-flex w-fit rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-green-100 ring-1 ring-white/20">
              ⚪ Obecnie nie szuka ofert
            </span>
          )}
        </div>
      </div>

      <div className="p-5 sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-500">
              Szukane stanowisko
            </p>

            <p className="mt-2 font-extrabold text-slate-900">
              👷 {normalizedRole || "Nie podano"}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-500">
              Doświadczenie
            </p>

            <p className="mt-2 font-extrabold text-slate-900">
              ⭐{" "}
              {yearsOfExperience !== null &&
              yearsOfExperience !== undefined
                ? `${yearsOfExperience} lat`
                : "Nie podano"}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-500">
              Lokalizacja
            </p>

            <p className="mt-2 font-extrabold text-slate-900">
              📍 {preferredLocation || "Cała Polska"}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-500">
              Dostępność
            </p>

            <p className="mt-2 font-extrabold text-slate-900">
              📅 {formatAvailability(availableFrom)}
            </p>
          </div>
        </div>

        {normalizedWorkModes.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-bold text-slate-900">
              Preferowana forma pracy
            </h3>

            <div className="mt-3 flex flex-wrap gap-2">
              {normalizedWorkModes.map((mode) => (
                <span
                  key={mode}
                  className="rounded-full bg-blue-100 px-4 py-2 text-sm font-bold text-blue-800"
                >
                  💼 {mode}
                </span>
              ))}
            </div>
          </div>
        )}

        {normalizedSkills.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-bold text-slate-900">
              Umiejętności i uprawnienia
            </h3>

            <div className="mt-3 flex flex-wrap gap-2">
              {normalizedSkills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-800"
                >
                  ✓ {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <p className="font-bold text-slate-900">
            🔒 Dane kontaktowe są chronione
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Pracodawca może zobaczyć doświadczenie,
            umiejętności i preferencje kandydata bezpłatnie.
            Dane kontaktowe są udostępniane tylko zgodnie
            z ustawieniami i zgodą kandydata.
          </p>
        </div>
      </div>
    </section>
  );
}