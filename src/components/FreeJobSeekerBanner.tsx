import Link from "next/link";

export default function FreeJobSeekerBanner() {
  return (
    <section className="bg-gray-100 px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-gradient-to-r from-green-700 via-emerald-600 to-cyan-600 text-white shadow-xl">
        <div className="px-6 py-8 sm:px-8 sm:py-10 lg:px-12">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center rounded-full border border-white/30 bg-white/15 px-4 py-2 text-sm font-extrabold uppercase tracking-[0.16em] text-green-50 backdrop-blur">
                🚀 Wersja beta BLISKO24
              </div>

              <h2 className="mt-4 max-w-4xl text-3xl font-extrabold leading-tight sm:text-4xl">
                Dołącz jako jeden z pierwszych użytkowników
              </h2>

              <p className="mt-4 max-w-3xl text-base leading-7 text-green-50 sm:text-lg">
                Tworzymy miejsce, w którym kandydaci, pracodawcy,
                usługodawcy i osoby potrzebujące pomocy mogą łatwiej
                odnaleźć się w swojej okolicy.
              </p>
            </div>

            <div className="shrink-0 rounded-2xl border border-white/25 bg-white/10 px-5 py-4 text-center backdrop-blur">
              <p className="text-sm font-bold text-green-100">
                Dostęp w wersji beta
              </p>

              <p className="mt-1 text-2xl font-extrabold">
                Bezpłatny
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            <div className="rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur sm:p-7">
              <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-green-100">
                Dla kandydatów
              </p>

              <h3 className="mt-3 text-2xl font-extrabold">
                💙 Szukasz pracy? Pokaż się pracodawcom
              </h3>

              <p className="mt-3 leading-7 text-green-50">
                Utwórz profil kandydata lub dodaj ogłoszenie „Szukam
                pracy”. Pracodawcy będą mogli odnaleźć Cię na podstawie
                zawodu, umiejętności i lokalizacji.
              </p>

              <div className="mt-5 flex flex-wrap gap-2 text-sm font-semibold">
                <span className="rounded-full bg-white/15 px-3 py-2">
                  ✓ Bezpłatny profil
                </span>

                <span className="rounded-full bg-white/15 px-3 py-2">
                  ✓ Automatyczne dopasowania
                </span>

                <span className="rounded-full bg-white/15 px-3 py-2">
                  ✓ Kontrola udostępniania kontaktu
                </span>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/ustawienia/profil"
                  className="inline-flex min-h-14 flex-1 items-center justify-center rounded-2xl bg-white px-5 py-4 text-center font-extrabold text-green-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-green-50"
                >
                  Utwórz profil kandydata
                </Link>

                <Link
                  href="/dodaj-ogloszenie?category=Szukam%20pracy"
                  className="inline-flex min-h-14 flex-1 items-center justify-center rounded-2xl border border-white/40 bg-white/10 px-5 py-4 text-center font-bold text-white transition hover:bg-white/20"
                >
                  Dodaj ogłoszenie
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur sm:p-7">
              <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-cyan-100">
                Dla pracodawców
              </p>

              <h3 className="mt-3 text-2xl font-extrabold">
                🎯 Znajdź osobę, która pasuje do Twojej firmy
              </h3>

              <p className="mt-3 leading-7 text-green-50">
                Wyszukuj kandydatów, twórz alerty i otrzymuj
                automatyczne dopasowania. W okresie beta możesz
                przetestować możliwości portalu bez opłat.
              </p>

              <div className="mt-5 flex flex-wrap gap-2 text-sm font-semibold">
                <span className="rounded-full bg-white/15 px-3 py-2">
                  ✓ Bezpłatnie w wersji beta
                </span>

                <span className="rounded-full bg-white/15 px-3 py-2">
                  ✓ Inteligentne dopasowania
                </span>

                <span className="rounded-full bg-white/15 px-3 py-2">
                  ✓ Lokalni kandydaci
                </span>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/znajdz-kandydata"
                  className="inline-flex min-h-14 flex-1 items-center justify-center rounded-2xl bg-white px-5 py-4 text-center font-extrabold text-green-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-green-50"
                >
                  Znajdź kandydata
                </Link>

                <Link
                  href="/dodaj-ogloszenie?category=Oferuję%20pracę"
                  className="inline-flex min-h-14 flex-1 items-center justify-center rounded-2xl border border-white/40 bg-white/10 px-5 py-4 text-center font-bold text-white transition hover:bg-white/20"
                >
                  Dodaj ofertę pracy
                </Link>
              </div>
            </div>
          </div>

          <p className="mt-6 text-center text-sm leading-6 text-green-100">
            Opinie pierwszych użytkowników pomogą nam rozwijać BLISKO24
            i dopasować portal do realnych potrzeb kandydatów oraz firm.
          </p>
        </div>
      </div>
    </section>
  );
}