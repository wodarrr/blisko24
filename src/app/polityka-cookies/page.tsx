import Link from "next/link";

export default function CookiesPolicyPage() {
  return (
    <main className="min-h-screen bg-gray-100 py-10 sm:py-14">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <article className="rounded-3xl bg-white p-6 shadow sm:p-10">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-700">
            Informacje techniczne
          </p>

          <h1 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Polityka cookies BLISKO24
          </h1>

          <p className="mt-5 text-sm text-slate-500">
            Data ostatniej aktualizacji: 2 sierpnia 2026 r.
          </p>

          <div className="mt-10 space-y-10 leading-8 text-slate-700">
            <section>
              <h2 className="text-2xl font-bold text-slate-900">
                1. Czym są pliki cookies
              </h2>

              <p className="mt-3">
                Pliki cookies to niewielkie informacje
                zapisywane w urządzeniu użytkownika
                podczas korzystania ze strony
                internetowej. Mogą służyć między innymi
                do utrzymania sesji, zapamiętania
                ustawień oraz zapewnienia prawidłowego
                działania serwisu.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900">
                2. Jak BLISKO24 korzysta z cookies
              </h2>

              <p className="mt-3">
                Portal BLISKO24 wykorzystuje obecnie
                przede wszystkim technologie niezbędne
                do prawidłowego i bezpiecznego działania
                serwisu, w szczególności do:
              </p>

              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>
                  logowania użytkownika i utrzymania
                  aktywnej sesji,
                </li>

                <li>
                  ochrony konta i weryfikacji
                  uwierzytelnienia,
                </li>

                <li>
                  obsługi podstawowych funkcji portalu,
                </li>

                <li>
                  zapewnienia bezpieczeństwa,
                  stabilności i prawidłowego działania
                  strony.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900">
                3. Rodzaje wykorzystywanych cookies
              </h2>

              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse text-left">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border border-slate-200 p-4">
                        Rodzaj
                      </th>

                      <th className="border border-slate-200 p-4">
                        Cel
                      </th>

                      <th className="border border-slate-200 p-4">
                        Wymagana zgoda
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr>
                      <td className="border border-slate-200 p-4 font-semibold">
                        Niezbędne
                      </td>

                      <td className="border border-slate-200 p-4">
                        Logowanie, utrzymanie sesji,
                        bezpieczeństwo i podstawowe
                        działanie portalu
                      </td>

                      <td className="border border-slate-200 p-4">
                        Nie, jeżeli są niezbędne do
                        działania usługi żądanej przez
                        użytkownika
                      </td>
                    </tr>

                    <tr>
                      <td className="border border-slate-200 p-4 font-semibold">
                        Funkcjonalne
                      </td>

                      <td className="border border-slate-200 p-4">
                        Zapamiętywanie wybranych ustawień
                        lub preferencji
                      </td>

                      <td className="border border-slate-200 p-4">
                        Zależnie od sposobu wykorzystania
                      </td>
                    </tr>

                    <tr>
                      <td className="border border-slate-200 p-4 font-semibold">
                        Analityczne
                      </td>

                      <td className="border border-slate-200 p-4">
                        Analiza sposobu korzystania
                        z portalu i statystyki odwiedzin
                      </td>

                      <td className="border border-slate-200 p-4">
                        Tak — przed ich uruchomieniem
                      </td>
                    </tr>

                    <tr>
                      <td className="border border-slate-200 p-4 font-semibold">
                        Marketingowe
                      </td>

                      <td className="border border-slate-200 p-4">
                        Personalizacja reklam oraz
                        śledzenie aktywności reklamowej
                      </td>

                      <td className="border border-slate-200 p-4">
                        Tak — przed ich uruchomieniem
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900">
                4. Obecny zakres działania
              </h2>

              <p className="mt-3">
                BLISKO24 nie wykorzystuje obecnie
                reklamowych ani marketingowych plików
                cookies.
              </p>

              <p className="mt-3">
                Jeżeli w przyszłości zostaną uruchomione
                narzędzia analityczne, marketingowe lub
                reklamowe wymagające zgody, użytkownik
                otrzyma możliwość zaakceptowania albo
                odrzucenia poszczególnych kategorii
                przed ich uruchomieniem.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900">
                5. Dostawcy technologii
              </h2>

              <p className="mt-3">
                W działaniu portalu uczestniczą
                zewnętrzni dostawcy infrastruktury
                technicznej, w szczególności:
              </p>

              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>
                  Supabase — obsługa uwierzytelniania,
                  sesji, bazy danych i przechowywania
                  plików,
                </li>

                <li>
                  Vercel — hosting, publikacja oraz
                  techniczna obsługa aplikacji.
                </li>
              </ul>

              <p className="mt-3">
                Dostawcy mogą stosować własne
                mechanizmy techniczne niezbędne do
                świadczenia usług, zapewnienia
                bezpieczeństwa i utrzymania sesji.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900">
                6. Zarządzanie cookies w przeglądarce
              </h2>

              <p className="mt-3">
                Użytkownik może sprawdzić, usunąć lub
                zablokować pliki cookies w ustawieniach
                swojej przeglądarki.
              </p>

              <p className="mt-3">
                Zablokowanie plików niezbędnych może
                spowodować problemy z logowaniem,
                utrzymaniem sesji oraz korzystaniem
                z niektórych funkcji BLISKO24.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900">
                7. Zgoda użytkownika
              </h2>

              <p className="mt-3">
                Cookies i podobne technologie, które nie
                są niezbędne do działania portalu, będą
                uruchamiane dopiero po uzyskaniu
                odpowiedniej zgody użytkownika.
              </p>

              <p className="mt-3">
                Zgoda powinna być dobrowolna, świadoma,
                jednoznaczna i wyrażona poprzez aktywne
                działanie. Użytkownik powinien mieć
                możliwość jej późniejszego wycofania.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900">
                8. Dane osobowe
              </h2>

              <p className="mt-3">
                Więcej informacji o przetwarzaniu danych
                osobowych znajduje się w:
              </p>

              <Link
                href="/polityka-prywatnosci"
                className="mt-3 inline-flex font-bold text-blue-700 hover:underline"
              >
                Polityce prywatności BLISKO24
              </Link>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900">
                9. Zmiany polityki
              </h2>

              <p className="mt-3">
                Polityka cookies może być aktualizowana
                w związku ze zmianami funkcji portalu,
                wykorzystywanych dostawców lub
                obowiązujących przepisów.
              </p>

              <p className="mt-3">
                Aktualna wersja dokumentu będzie zawsze
                dostępna na tej stronie.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900">
                10. Kontakt
              </h2>

              <p className="mt-3">
                W sprawach dotyczących cookies
                i prywatności można skontaktować się
                pod adresem:
              </p>

              <a
                href="mailto:kontakt@blisko24.com.pl"
                className="mt-2 inline-flex break-all font-bold text-blue-700 hover:underline"
              >
                kontakt@blisko24.com.pl
              </a>
            </section>
          </div>
        </article>
      </div>
    </main>
  );
}