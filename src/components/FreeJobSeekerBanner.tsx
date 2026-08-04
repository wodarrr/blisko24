import Link from "next/link";

export default function FreeJobSeekerBanner() {
  return (
    <section className="bg-gray-100 px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-gradient-to-r from-green-700 via-emerald-600 to-cyan-600 text-white shadow-xl">
        <div className="grid gap-8 px-6 py-8 sm:px-8 sm:py-10 lg:grid-cols-[1.4fr_0.6fr] lg:items-center lg:px-12">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-green-100">
              Dla kandydatów
            </p>

            <h2 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">
              💙 Szukasz pracy? Nie płać.
            </h2>

            <p className="mt-4 max-w-3xl text-base leading-7 text-green-50 sm:text-lg">
              Dodaj ogłoszenie w kategorii
              „Szukam pracy” całkowicie za darmo.
              Nie pobieramy opłat za publikację ani
              promocję ogłoszeń kandydatów.
            </p>

            <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold text-green-50">
              <span className="rounded-full bg-white/15 px-4 py-2 backdrop-blur">
                ✓ Bez opłat za publikację
              </span>

              <span className="rounded-full bg-white/15 px-4 py-2 backdrop-blur">
                ✓ Bez opłat za promocję
              </span>

              <span className="rounded-full bg-white/15 px-4 py-2 backdrop-blur">
                ✓ Kandydat zawsze za darmo
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              href="/dodaj-ogloszenie?category=Szukam%20pracy"
              className="flex min-h-14 items-center justify-center rounded-2xl bg-white px-6 py-4 text-center font-extrabold text-green-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-green-50"
            >
              Dodaj ogłoszenie za darmo
            </Link>

            <Link
              href="/?category=Szukam%20pracy"
              className="flex min-h-14 items-center justify-center rounded-2xl border border-white/40 bg-white/10 px-6 py-4 text-center font-bold text-white transition hover:bg-white/20"
            >
              Zobacz kandydatów
            </Link>

            <p className="text-center text-xs leading-5 text-green-100">
              Firmy płacą za dotarcie do kandydatów.
              Osoby szukające pracy nie płacą nigdy.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}