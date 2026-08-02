export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-gray-100 py-10 sm:py-14">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <article className="rounded-3xl bg-white p-6 shadow sm:p-10">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-700">
            Ochrona danych
          </p>

          <h1 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Polityka prywatności BLISKO24
          </h1>

          <p className="mt-5 text-sm text-slate-500">
            Data ostatniej aktualizacji: 2 sierpnia 2026 r.
          </p>

          <div className="mt-10 space-y-10 leading-8 text-slate-700">
            <section>
              <h2 className="text-2xl font-bold text-slate-900">
                1. Administrator danych
              </h2>

              <p className="mt-3">
                Administratorem danych osobowych
                przetwarzanych w związku z działaniem
                portalu BLISKO24 jest Krzysztof
                Wodarczyk, operator portalu dostępnego
                pod adresem blisko24.com.pl.
              </p>

              <p className="mt-3">
                W sprawach dotyczących prywatności
                i danych osobowych można skontaktować
                się pod adresem:
              </p>

              <p className="mt-2 font-bold text-blue-700">
                kontakt@blisko24.com.pl
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900">
                2. Jakie dane przetwarzamy
              </h2>

              <p className="mt-3">
                W zależności od sposobu korzystania
                z portalu możemy przetwarzać:
              </p>

              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>adres e-mail i identyfikator konta,</li>
                <li>
                  imię, nazwę profilu, miejscowość,
                  numer telefonu i opis profilu,
                </li>
                <li>
                  zdjęcie profilowe oraz zdjęcia
                  dodawane do ogłoszeń,
                </li>
                <li>
                  treść ogłoszeń, opinii, zgłoszeń
                  i wiadomości,
                </li>
                <li>
                  dane dotyczące ulubionych ogłoszeń
                  i aktywności w portalu,
                </li>
                <li>
                  informacje techniczne, takie jak
                  adres IP, dane urządzenia, przeglądarki,
                  logi i identyfikatory sesji.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900">
                3. Cele i podstawy przetwarzania
              </h2>

              <div className="mt-4 overflow-x-auto">
                <table className="min-w-[720px] w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border border-slate-200 p-4">
                        Cel
                      </th>

                      <th className="border border-slate-200 p-4">
                        Podstawa
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr>
                      <td className="border border-slate-200 p-4">
                        Założenie i obsługa konta,
                        publikowanie ogłoszeń, wiadomości,
                        opinii i korzystanie z funkcji
                        portalu
                      </td>

                      <td className="border border-slate-200 p-4">
                        Niezbędność do wykonania umowy
                        o świadczenie usług drogą
                        elektroniczną
                      </td>
                    </tr>

                    <tr>
                      <td className="border border-slate-200 p-4">
                        Bezpieczeństwo portalu,
                        zapobieganie nadużyciom,
                        moderacja i dochodzenie roszczeń
                      </td>

                      <td className="border border-slate-200 p-4">
                        Prawnie uzasadniony interes
                        administratora
                      </td>
                    </tr>

                    <tr>
                      <td className="border border-slate-200 p-4">
                        Odpowiadanie na wiadomości
                        i zgłoszenia
                      </td>

                      <td className="border border-slate-200 p-4">
                        Podjęcie działań na żądanie
                        użytkownika lub prawnie
                        uzasadniony interes administratora
                      </td>
                    </tr>

                    <tr>
                      <td className="border border-slate-200 p-4">
                        Wypełnienie obowiązków
                        wynikających z przepisów prawa
                      </td>

                      <td className="border border-slate-200 p-4">
                        Obowiązek prawny administratora
                      </td>
                    </tr>

                    <tr>
                      <td className="border border-slate-200 p-4">
                        Dodatkowe działania wymagające
                        dobrowolnej zgody
                      </td>

                      <td className="border border-slate-200 p-4">
                        Zgoda użytkownika, którą można
                        wycofać
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900">
                4. Dane widoczne publicznie
              </h2>

              <p className="mt-3">
                Informacje umieszczone przez użytkownika
                w publicznym profilu lub ogłoszeniu mogą
                być widoczne dla innych użytkowników
                i osób odwiedzających portal.
              </p>

              <p className="mt-3">
                Nie należy publikować danych, których
                użytkownik nie chce ujawniać publicznie,
                w szczególności numerów dokumentów,
                danych finansowych, haseł lub innych
                informacji poufnych.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900">
                5. Odbiorcy danych
              </h2>

              <p className="mt-3">
                Dane mogą być powierzane podmiotom
                wspierającym działanie portalu,
                w szczególności dostawcom:
              </p>

              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>
                  infrastruktury bazodanowej,
                  uwierzytelniania i przechowywania
                  plików — Supabase,
                </li>
                <li>
                  hostingu i publikacji aplikacji —
                  Vercel,
                </li>
                <li>
                  usług pocztowych, technicznych,
                  bezpieczeństwa i obsługi prawnej,
                  jeżeli będą wykorzystywane.
                </li>
              </ul>

              <p className="mt-3">
                Dane mogą zostać udostępnione organom
                publicznym, jeżeli obowiązek taki wynika
                z przepisów prawa.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900">
                6. Przekazywanie danych poza EOG
              </h2>

              <p className="mt-3">
                Dostawcy usług technicznych mogą
                przetwarzać dane poza Europejskim
                Obszarem Gospodarczym. W takim przypadku
                przekazanie danych odbywa się na
                podstawie mechanizmów przewidzianych
                przez przepisy o ochronie danych,
                w szczególności decyzji stwierdzającej
                odpowiedni stopień ochrony albo
                standardowych klauzul umownych.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900">
                7. Okres przechowywania danych
              </h2>

              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>
                  dane konta są przechowywane przez
                  okres jego aktywności,
                </li>
                <li>
                  dane mogą zostać usunięte po usunięciu
                  konta, z zastrzeżeniem danych
                  niezbędnych do realizacji obowiązków
                  prawnych lub obrony przed roszczeniami,
                </li>
                <li>
                  logi bezpieczeństwa mogą być
                  przechowywane przez czas niezbędny
                  do wykrywania nadużyć,
                </li>
                <li>
                  dane przetwarzane na podstawie zgody
                  są przechowywane do jej wycofania lub
                  ustania celu przetwarzania.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900">
                8. Prawa użytkownika
              </h2>

              <p className="mt-3">
                Osobie, której dane dotyczą, przysługuje
                — zależnie od podstawy i okoliczności
                przetwarzania — prawo do:
              </p>

              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>dostępu do swoich danych,</li>
                <li>sprostowania danych,</li>
                <li>usunięcia danych,</li>
                <li>ograniczenia przetwarzania,</li>
                <li>przenoszenia danych,</li>
                <li>wniesienia sprzeciwu,</li>
                <li>
                  wycofania zgody bez wpływu na zgodność
                  wcześniejszego przetwarzania,
                </li>
                <li>
                  wniesienia skargi do Prezesa Urzędu
                  Ochrony Danych Osobowych.
                </li>
              </ul>

              <p className="mt-3">
                W celu realizacji praw należy napisać
                na adres kontakt@blisko24.com.pl.
                Administrator może poprosić o informacje
                potrzebne do potwierdzenia tożsamości.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900">
                9. Dobrowolność podania danych
              </h2>

              <p className="mt-3">
                Podanie danych jest dobrowolne, lecz
                niektóre informacje są niezbędne do
                założenia konta i korzystania
                z określonych funkcji portalu.
              </p>

              <p className="mt-3">
                Brak podania wymaganych danych może
                uniemożliwić rejestrację, opublikowanie
                ogłoszenia lub skorzystanie z wiadomości.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900">
                10. Zautomatyzowane decyzje
              </h2>

              <p className="mt-3">
                Portal nie podejmuje obecnie wobec
                użytkowników decyzji opartych wyłącznie
                na zautomatyzowanym przetwarzaniu,
                które wywoływałyby skutki prawne lub
                w podobny sposób istotnie na nich
                wpływały.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900">
                11. Bezpieczeństwo
              </h2>

              <p className="mt-3">
                Administrator stosuje środki techniczne
                i organizacyjne mające chronić dane
                przed utratą, nieuprawnionym dostępem,
                zmianą lub ujawnieniem. Użytkownik
                powinien również chronić swoje hasło
                i nie udostępniać konta osobom trzecim.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900">
                12. Zmiany polityki
              </h2>

              <p className="mt-3">
                Polityka może być aktualizowana wraz
                z rozwojem portalu, zmianami
                technologicznymi lub prawnymi.
                Aktualna wersja będzie publikowana
                na tej stronie.
              </p>
            </section>
          </div>

          <div className="mt-12 rounded-2xl border border-yellow-200 bg-yellow-50 p-5 text-sm leading-6 text-yellow-900">
            W sprawach związanych z danymi osobowymi
            skontaktuj się z administracją BLISKO24:
            kontakt@blisko24.com.pl.
          </div>
        </article>
      </div>
    </main>
  );
}