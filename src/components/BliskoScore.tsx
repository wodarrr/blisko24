type ScoreItem = {
  label: string;
  points: number;
  completed: boolean;
  suggestion: string;
};

type Props = {
  avatarUrl?: string | null;
  description?: string | null;
  city?: string | null;
  candidateRole?: string | null;
  skills?: string[] | null;
  preferredProvince?: string | null;
  preferredCity?: string | null;
  workModes?: string[] | null;
  availableFrom?: string | null;
  openToOffers?: boolean | null;
  contactSharingConsent?: boolean | null;
  yearsOfExperience?: number | null;
  verified?: boolean | null;
  reviewsCount?: number;
  activeAdvertisements?: number;
  lastSeen?: string | null;
};

function wasActiveRecently(
  value?: string | null
) {
  if (!value) return false;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return (
    Date.now() - date.getTime() <=
    7 * 24 * 60 * 60 * 1000
  );
}

function getLevel(score: number) {
  if (score >= 100) {
    return {
      name: "Profil Premium BLISKO24",
      icon: "💎",
      className:
        "bg-cyan-100 text-cyan-900",
    };
  }

  if (score >= 90) {
    return {
      name: "Złoty profil",
      icon: "🥇",
      className:
        "bg-yellow-100 text-yellow-900",
    };
  }

  if (score >= 75) {
    return {
      name: "Srebrny profil",
      icon: "🥈",
      className:
        "bg-slate-200 text-slate-800",
    };
  }

  if (score >= 50) {
    return {
      name: "Brązowy profil",
      icon: "🥉",
      className:
        "bg-orange-100 text-orange-900",
    };
  }

  return {
    name: "Profil podstawowy",
    icon: "🌱",
    className:
      "bg-green-100 text-green-900",
  };
}

export default function BliskoScore({
  avatarUrl,
  description,
  city,
  candidateRole,
  skills,
  preferredProvince,
  preferredCity,
  workModes,
  availableFrom,
  openToOffers,
  contactSharingConsent,
  yearsOfExperience,
  verified,
  reviewsCount = 0,
  activeAdvertisements = 0,
  lastSeen,
}: Props) {
  const normalizedSkills = Array.isArray(
    skills
  )
    ? skills.filter((skill) =>
        Boolean(skill?.trim())
      )
    : [];

  const normalizedWorkModes = Array.isArray(
    workModes
  )
    ? workModes.filter((mode) =>
        Boolean(mode?.trim())
      )
    : [];

  const items: ScoreItem[] = [
    {
      label: "Zdjęcie profilowe",
      points: 10,
      completed: Boolean(avatarUrl),
      suggestion:
        "Dodaj zdjęcie profilowe.",
    },
    {
      label: "Opis profilu",
      points: 10,
      completed:
        (description?.trim().length ?? 0) >=
        40,
      suggestion:
        "Dodaj opis liczący co najmniej 40 znaków.",
    },
    {
      label: "Szukane stanowisko",
      points: 10,
      completed: Boolean(
        candidateRole?.trim()
      ),
      suggestion:
        "Wpisz stanowisko, którego szukasz.",
    },
    {
      label: "Umiejętności",
      points: 15,
      completed:
        normalizedSkills.length >= 3,
      suggestion:
        "Dodaj co najmniej 3 umiejętności.",
    },
    {
      label: "Doświadczenie",
      points: 10,
      completed:
        yearsOfExperience !== null &&
        yearsOfExperience !== undefined,
      suggestion:
        "Uzupełnij lata doświadczenia.",
    },
    {
      label: "Lokalizacja",
      points: 10,
      completed: Boolean(
        city?.trim() ||
          preferredProvince?.trim() ||
          preferredCity?.trim()
      ),
      suggestion:
        "Uzupełnij miasto lub preferowaną lokalizację.",
    },
    {
      label: "Forma pracy",
      points: 5,
      completed:
        normalizedWorkModes.length > 0,
      suggestion:
        "Wybierz preferowaną formę pracy.",
    },
    {
      label: "Dostępność",
      points: 10,
      completed: Boolean(availableFrom),
      suggestion:
        "Podaj datę dostępności.",
    },
    {
      label: "Otwartość na oferty",
      points: 5,
      completed: openToOffers === true,
      suggestion:
        "Włącz otwartość na propozycje pracy.",
    },
    {
      label: "Zgoda na kontakt",
      points: 5,
      completed:
        contactSharingConsent === true,
      suggestion:
        "Zaznacz zgodę na udostępnienie kontaktu.",
    },
    {
      label: "Zweryfikowany profil",
      points: 5,
      completed: verified === true,
      suggestion:
        "Przejdź weryfikację profilu.",
    },
    {
      label: "Aktywność",
      points: 5,
      completed:
        wasActiveRecently(lastSeen),
      suggestion:
        "Zaloguj się i aktualizuj profil regularnie.",
    },
    {
      label: "Aktywność na portalu",
      points: 10,
      completed:
        reviewsCount > 0 ||
        activeAdvertisements > 0,
      suggestion:
        "Dodaj ogłoszenie lub zdobądź pierwszą opinię.",
    },
  ];

  const score = Math.min(
    100,
    items.reduce(
      (sum, item) =>
        sum +
        (item.completed
          ? item.points
          : 0),
      0
    )
  );

  const missingItems = items.filter(
    (item) => !item.completed
  );

  const level = getLevel(score);

  return (
    <section className="mt-10 overflow-hidden rounded-3xl bg-white shadow-lg">
      <div className="bg-gradient-to-r from-slate-950 via-blue-900 to-cyan-600 px-5 py-7 text-white sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-cyan-200">
              Jakość profilu
            </p>

            <h2 className="mt-2 text-3xl font-extrabold">
              🏆 BLISKO SCORE™
            </h2>
          </div>

          <span
            className={`inline-flex w-fit items-center rounded-full px-4 py-2 text-sm font-extrabold ${level.className}`}
          >
            {level.icon} {level.name}
          </span>
        </div>
      </div>

      <div className="p-5 sm:p-8">
        <div className="grid gap-7 lg:grid-cols-[0.35fr_0.65fr] lg:items-center">
          <div className="text-center">
            <p className="text-6xl font-black text-slate-900">
              {score}
            </p>

            <p className="mt-1 text-lg font-bold text-slate-500">
              na 100 punktów
            </p>

            <div className="mt-5 h-4 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-700 to-cyan-500 transition-all duration-700"
                style={{
                  width: `${score}%`,
                }}
              />
            </div>

            <p className="mt-3 text-sm font-semibold text-slate-600">
              {score === 100
                ? "Profil jest kompletny."
                : `Brakuje ${100 - score} pkt do pełnego wyniku.`}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {items.map((item) => (
              <div
                key={item.label}
                className={`rounded-2xl border p-4 ${
                  item.completed
                    ? "border-green-200 bg-green-50"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-bold text-slate-900">
                    {item.completed
                      ? "✔"
                      : "○"}{" "}
                    {item.label}
                  </p>

                  <span className="text-sm font-extrabold text-blue-700">
                    +{item.points}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {missingItems.length > 0 && (
          <details className="mt-8 rounded-2xl border border-blue-200 bg-blue-50 p-5">
            <summary className="cursor-pointer font-extrabold text-blue-900">
              Co poprawić, żeby zwiększyć wynik?
            </summary>

            <div className="mt-4 space-y-3">
              {missingItems.map((item) => (
                <div
                  key={item.label}
                  className="flex items-start justify-between gap-4 rounded-xl bg-white p-4 ring-1 ring-blue-100"
                >
                  <p className="text-sm leading-6 text-slate-700">
                    {item.suggestion}
                  </p>

                  <span className="shrink-0 rounded-full bg-blue-100 px-3 py-1 text-xs font-extrabold text-blue-800">
                    +{item.points} pkt
                  </span>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>
    </section>
  );
}