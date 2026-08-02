import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gray-100 py-10 sm:py-14">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <section className="rounded-3xl bg-white p-6 shadow sm:p-10">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-700">
            O BLISKO24
          </p>

          <h1 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Znajdź ludzi, nie tylko ogłoszenia
          </h1>

          <p className="mt-6 leading-8 text-slate-700">
            BLISKO24 to portal lokalnych możliwości,
            stworzony po to, aby ułatwiać kontakt między
            osobami szukającymi pracy, usług, pomocy
            i współpracy.
          </p>

          <p className="mt-4 leading-8 text-slate-700">
            Chcemy, aby użytkownik mógł szybko znaleźć
            kogoś ze swojej okolicy, porozmawiać z nim,
            sprawdzić profil oraz opinie i bezpiecznie
            nawiązać kontakt.
          </p>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <article className="rounded-2xl bg-blue-50 p-6">
              <div className="text-4xl">📍</div>

              <h2 className="mt-4 text-xl font-bold text-slate-900">
                Lokalnie
              </h2>

              <p className="mt-2 leading-7 text-slate-600">
                Ogłoszenia można wyszukiwać według
                miasta, województwa i kategorii.
              </p>
            </article>

            <article className="rounded-2xl bg-green-50 p-6">
              <div className="text-4xl">🤝</div>

              <h2 className="mt-4 text-xl font-bold text-slate-900">
                Między ludźmi
              </h2>

              <p className="mt-2 leading-7 text-slate-600">
                Profile, wiadomości i opinie pomagają
                lepiej poznać drugą stronę przed
                nawiązaniem współpracy.
              </p>
            </article>

            <article className="rounded-2xl bg-yellow-50 p-6">
              <div className="text-4xl">🛡️</div>

              <h2 className="mt-4 text-xl font-bold text-slate-900">
                Z zasadami
              </h2>

              <p className="mt-2 leading-7 text-slate-600">
                Portal posiada system zgłoszeń,
                moderację oraz możliwość blokowania
                kont naruszających zasady.
              </p>
            </article>

            <article className="rounded-2xl bg-purple-50 p-6">
              <div className="text-4xl">🌱</div>

              <h2 className="mt-4 text-xl font-bold text-slate-900">
                Rozwijany krok po kroku
              </h2>

              <p className="mt-2 leading-7 text-slate-600">
                BLISKO24 jest stale rozwijany na
                podstawie potrzeb użytkowników i ich
                zgłoszeń.
              </p>
            </article>
          </div>

          <section className="mt-10 rounded-2xl bg-slate-900 p-6 text-white sm:p-8">
            <h2 className="text-2xl font-bold">
              Masz pomysł lub zauważyłeś problem?
            </h2>

            <p className="mt-3 leading-7 text-slate-300">
              Napisz do nas. Każda sensowna uwaga
              pomaga rozwijać portal i poprawiać jego
              bezpieczeństwo.
            </p>

            <Link
              href="/kontakt"
              className="mt-6 inline-flex rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-700"
            >
              Przejdź do kontaktu
            </Link>
          </section>
        </section>
      </div>
    </main>
  );
}