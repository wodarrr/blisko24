import Link from "next/link";

import type { AdminBetaMetrics } from "../../lib/admin";

type Props = {
  users: number;
  ads: number;
  favorites: number;
  betaMetrics: AdminBetaMetrics;
};

type MetricCardProps = {
  label: string;
  value: number;
  icon: string;
  color: string;
  description: string;
};

function MetricCard({
  label,
  value,
  icon,
  color,
  description,
}: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
            {label}
          </p>

          <p className={`mt-3 text-4xl font-extrabold ${color}`}>
            {value}
          </p>
        </div>

        <span className="text-3xl" aria-hidden="true">
          {icon}
        </span>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

export default function Stats({
  users,
  ads,
  favorites,
  betaMetrics,
}: Props) {
  return (
    <section className="mb-10 space-y-10">
      <div>
        <div className="mb-5">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-700">
            Stan portalu
          </p>

          <h2 className="mt-2 text-2xl font-extrabold text-slate-900">
            Najważniejsze dane BLISKO24
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-8 shadow transition hover:-translate-y-1 hover:shadow-lg">
            <p className="text-gray-500">
              Użytkownicy
            </p>

            <h3 className="mt-3 text-5xl font-bold">
              {users}
            </h3>
          </div>

          <Link
            href="#moderacja"
            className="rounded-2xl bg-white p-8 shadow transition hover:-translate-y-1 hover:shadow-lg"
          >
            <p className="text-gray-500">
              Ogłoszenia
            </p>

            <h3 className="mt-3 text-5xl font-bold">
              {ads}
            </h3>

            <p className="mt-4 text-sm font-semibold text-blue-700">
              ↓ Przejdź do moderacji
            </p>
          </Link>

          <div className="rounded-2xl bg-white p-8 shadow transition hover:-translate-y-1 hover:shadow-lg">
            <p className="text-gray-500">
              Ulubione
            </p>

            <h3 className="mt-3 text-5xl font-bold">
              {favorites}
            </h3>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-green-200 bg-green-50 p-5 sm:p-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-green-700">
              Darmowy start
            </p>

            <h2 className="mt-2 text-2xl font-extrabold text-slate-900">
              Wskaźniki wersji beta
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Te liczby pomogą zdecydować, kiedy pojawiło się wystarczające zainteresowanie, aby uruchomić płatności dla pracodawców.
            </p>
          </div>

          <span className="inline-flex w-fit rounded-full bg-green-700 px-4 py-2 text-sm font-bold text-white">
            Kontakty bezpłatne za zgodą
          </span>
        </div>
      </div>

      <div>
        <h3 className="mb-5 text-xl font-extrabold text-slate-900">
          Konta i kandydaci
        </h3>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Kandydaci"
            value={betaMetrics.candidateAccounts}
            icon="👤"
            color="text-blue-700"
            description="Konta działające wyłącznie jako kandydat."
          />

          <MetricCard
            label="Pracodawcy"
            value={betaMetrics.employerAccounts}
            icon="🏢"
            color="text-violet-700"
            description="Konta działające wyłącznie jako pracodawca."
          />

          <MetricCard
            label="Obie role"
            value={betaMetrics.bothAccounts}
            icon="🔄"
            color="text-slate-700"
            description="Konta korzystające z funkcji kandydata i pracodawcy."
          />

          <MetricCard
            label="Otwarci na oferty"
            value={betaMetrics.openCandidates}
            icon="🟢"
            color="text-green-700"
            description="Kandydaci widoczni dla pracodawców i gotowi na propozycje."
          />
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <MetricCard
            label="Nowe konta – 7 dni"
            value={betaMetrics.newUsers7d}
            icon="📈"
            color="text-cyan-700"
            description="Rejestracje z ostatnich siedmiu dni."
          />

          <MetricCard
            label="Wszystkie konta"
            value={betaMetrics.totalUsers}
            icon="👥"
            color="text-slate-900"
            description="Łączna liczba profili zapisanych w portalu."
          />
        </div>
      </div>

      <div>
        <h3 className="mb-5 text-xl font-extrabold text-slate-900">
          Dopasowania i zainteresowanie pracodawców
        </h3>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Dopasowania"
            value={betaMetrics.totalMatches}
            icon="🎯"
            color="text-blue-700"
            description="Wszystkie automatyczne dopasowania kandydatów."
          />

          <MetricCard
            label="Nowe dopasowania"
            value={betaMetrics.newMatches}
            icon="✨"
            color="text-orange-600"
            description="Dopasowania, których pracodawca jeszcze nie obsłużył."
          />

          <MetricCard
            label="Aktywne alerty"
            value={betaMetrics.activeAlerts}
            icon="🔔"
            color="text-violet-700"
            description="Wyszukiwania oczekujące na nowych kandydatów."
          />

          <MetricCard
            label="Odblokowane kontakty"
            value={betaMetrics.unlockedContacts}
            icon="🔓"
            color="text-green-700"
            description="Kontakty skutecznie udostępnione pracodawcom."
          />
        </div>
      </div>

      <div>
        <h3 className="mb-5 text-xl font-extrabold text-slate-900">
          Sposób odblokowania kontaktów
        </h3>

        <div className="grid gap-5 sm:grid-cols-3">
          <MetricCard
            label="Darmowe"
            value={betaMetrics.freeUnlocks}
            icon="🎁"
            color="text-green-700"
            description="Kontakty odblokowane podczas darmowego startu."
          />

          <MetricCard
            label="Testowe płatne"
            value={betaMetrics.paidUnlocks}
            icon="💳"
            color="text-blue-700"
            description="Kontakty odblokowane przez płatność, obecnie w piaskownicy Stripe."
          />

          <MetricCard
            label="Oczekujące"
            value={betaMetrics.pendingUnlocks}
            icon="⏳"
            color="text-orange-600"
            description="Rozpoczęte prośby, które nie zostały jeszcze odblokowane."
          />
        </div>
      </div>
    </section>
  );
}