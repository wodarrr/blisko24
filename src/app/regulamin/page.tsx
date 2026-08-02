export default function RegulationsPage() {
  return (
    <main className="min-h-screen bg-gray-100 py-10 sm:py-14">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">

        <article className="rounded-3xl bg-white p-6 shadow sm:p-10">

          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-700">
            Regulamin
          </p>

          <h1 className="mt-3 text-4xl font-extrabold text-slate-900">
            Regulamin korzystania z portalu BLISKO24
          </h1>

          <p className="mt-6 text-slate-600">
            Data obowiązywania: {new Date().toLocaleDateString("pl-PL")}
          </p>

          <section className="mt-10 space-y-8 text-slate-700 leading-8">

            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                §1 Postanowienia ogólne
              </h2>

              <p className="mt-3">
                BLISKO24 jest portalem internetowym
                umożliwiającym publikowanie ogłoszeń,
                komunikację pomiędzy użytkownikami oraz
                prezentację usług, ofert pracy i pomocy.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                §2 Konto użytkownika
              </h2>

              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>Rejestracja jest dobrowolna.</li>
                <li>Użytkownik odpowiada za bezpieczeństwo swojego hasła.</li>
                <li>Jeden użytkownik może posiadać jedno konto, chyba że administrator wyrazi zgodę.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                §3 Ogłoszenia
              </h2>

              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>Ogłoszenia muszą być zgodne z prawem.</li>
                <li>Zabronione jest publikowanie treści obraźliwych, oszukańczych lub wprowadzających w błąd.</li>
                <li>Administrator może usunąć ogłoszenie naruszające regulamin bez wcześniejszego ostrzeżenia.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                §4 Odpowiedzialność
              </h2>

              <p className="mt-3">
                Za treść ogłoszeń odpowiada ich autor.
                Administrator nie jest stroną zawieranych
                umów pomiędzy użytkownikami.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                §5 Moderacja
              </h2>

              <p className="mt-3">
                Administrator ma prawo blokować konta,
                usuwać ogłoszenia oraz ograniczać dostęp
                do portalu użytkownikom naruszającym
                regulamin.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                §6 Postanowienia końcowe
              </h2>

              <p className="mt-3">
                Regulamin może być aktualizowany wraz z
                rozwojem portalu. O istotnych zmianach
                użytkownicy zostaną poinformowani.
              </p>
            </div>

          </section>

        </article>

      </div>
    </main>
  );
}