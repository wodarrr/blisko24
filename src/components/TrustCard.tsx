"use client";

type Props = {
  avatarUrl?: string | null;
  name?: string | null;
  city?: string | null;
  description?: string | null;
  phone?: string | null;
  verified?: boolean | null;
  activeAdvertisements: number;
};

type Criterion = {
  label: string;
  completed: boolean;
};

export default function TrustCard({
  avatarUrl,
  name,
  city,
  description,
  phone,
  verified,
  activeAdvertisements,
}: Props) {
  const criteria: Criterion[] = [
    {
      label: "Zdjęcie profilowe",
      completed: Boolean(avatarUrl),
    },
    {
      label: "Uzupełniona nazwa i miasto",
      completed: Boolean(
        name?.trim() && city?.trim()
      ),
    },
    {
      label: "Opis profilu",
      completed: Boolean(
        description?.trim()
      ),
    },
    {
      label: "Aktywne ogłoszenie",
      completed: activeAdvertisements > 0,
    },
    {
      label: "Zweryfikowane konto",
      completed: verified === true,
    },
    {
      label: "Dodany numer telefonu",
      completed: Boolean(phone?.trim()),
    },
  ];

  const completedCount = criteria.filter(
    (criterion) => criterion.completed
  ).length;

  const trustLevel = Math.round(
    (completedCount / criteria.length) * 100
  );

  const status =
    trustLevel >= 80
      ? {
          label: "Zaufany użytkownik",
          className:
            "bg-green-100 text-green-700",
        }
      : trustLevel >= 50
        ? {
            label: "Profil częściowo uzupełniony",
            className:
              "bg-yellow-100 text-yellow-800",
          }
        : {
            label: "Profil wymaga uzupełnienia",
            className:
              "bg-red-100 text-red-700",
          };

  return (
    <section className="mt-10 rounded-3xl bg-white p-5 shadow-lg sm:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-700">
            Wiarygodność profilu
          </p>

          <h2 className="mt-2 text-3xl font-extrabold text-slate-900">
            🛡️ Poziom zaufania
          </h2>
        </div>

        <span
          className={`inline-flex w-fit rounded-full px-4 py-2 text-sm font-bold ${status.className}`}
        >
          {status.label}
        </span>
      </div>

      <div className="mt-7">
        <div className="flex items-center justify-between gap-4">
          <span className="font-semibold text-slate-600">
            Uzupełnienie profilu
          </span>

          <span className="text-2xl font-extrabold text-blue-700">
            {trustLevel}%
          </span>
        </div>

        <div className="mt-3 h-4 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-blue-700 transition-all duration-500"
            style={{
              width: `${trustLevel}%`,
            }}
          />
        </div>
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-2">
        {criteria.map((criterion) => (
          <div
            key={criterion.label}
            className={`rounded-2xl border p-4 ${
              criterion.completed
                ? "border-green-200 bg-green-50"
                : "border-slate-200 bg-slate-50"
            }`}
          >
            <p
              className={`font-semibold ${
                criterion.completed
                  ? "text-green-700"
                  : "text-slate-500"
              }`}
            >
              {criterion.completed
                ? "✔"
                : "○"}{" "}
              {criterion.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}