export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gray-100 py-10 sm:py-14">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">

        <section className="rounded-3xl bg-white p-6 shadow sm:p-10">

          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-700">
            Kontakt
          </p>

          <h1 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Skontaktuj się z nami
          </h1>

          <p className="mt-6 leading-8 text-slate-700">
            Jeżeli masz pytania dotyczące działania
            portalu, chcesz zgłosić błąd, nieodpowiednie
            ogłoszenie lub przesłać propozycję rozwoju,
            skontaktuj się z administracją BLISKO24.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-2">

            <div className="rounded-2xl bg-blue-50 p-6">
              <div className="text-4xl">📧</div>

              <h2 className="mt-4 text-xl font-bold">
                E-mail
              </h2>

              <p className="mt-3 break-all text-slate-700">
                kontakt@blisko24.com.pl
              </p>

              <p className="mt-3 text-sm text-slate-500">
                Odpowiadamy możliwie najszybciej.
              </p>
            </div>

            <div className="rounded-2xl bg-green-50 p-6">
              <div className="text-4xl">🛡️</div>

              <h2 className="mt-4 text-xl font-bold">
                Zgłoszenia
              </h2>

              <p className="mt-3 text-slate-700 leading-7">
                Jeżeli zauważysz naruszenie regulaminu,
                oszustwo lub nielegalną treść,
                skorzystaj z funkcji zgłoszenia
                dostępnej przy ogłoszeniach.
              </p>
            </div>

          </div>

          <div className="mt-10 rounded-2xl border border-blue-200 bg-blue-50 p-6">

            <h2 className="text-xl font-bold text-slate-900">
              Informacja
            </h2>

            <p className="mt-3 leading-7 text-slate-700">
              Portal BLISKO24 jest stale rozwijany.
              Wszystkie zgłoszenia użytkowników są
              analizowane i pomagają ulepszać serwis.
            </p>

          </div>

        </section>

      </div>
    </main>
  );
}