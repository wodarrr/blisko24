import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-24 bg-slate-900 text-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-14 md:grid-cols-4">

        {/* Logo */}

        <div>
          <h2 className="text-3xl font-extrabold">
            BLISKO24
          </h2>

          <p className="mt-4 text-slate-300">
            Portal lokalnych możliwości.
          </p>

          <p className="mt-2 text-slate-400">
            Praca • Usługi • Pomoc • Sąsiedzi
          </p>
        </div>

        {/* Portal */}

        <div>
          <h3 className="mb-4 text-lg font-bold">
            Portal
          </h3>

          <ul className="space-y-2 text-slate-300">

            <li>
              <Link href="/">
                Strona główna
              </Link>
            </li>

            <li>
              <Link href="/dodaj-ogloszenie">
                Dodaj ogłoszenie
              </Link>
            </li>

            <li>
              <Link href="/konto">
                Moje konto
              </Link>
            </li>

          </ul>
        </div>

        {/* Informacje */}

        <div>
          <h3 className="mb-4 text-lg font-bold">
            Informacje
          </h3>

          <ul className="space-y-2 text-slate-300">

            <li>
              <Link href="/regulamin">
                Regulamin
              </Link>
            </li>

            <li>
              <Link href="/polityka-prywatnosci">
                Polityka prywatności
              </Link>
            </li>

            <li>
              <Link href="/kontakt">
                Kontakt
              </Link>
            </li>

          </ul>
        </div>

        {/* Kontakt */}

        <div>
          <h3 className="mb-4 text-lg font-bold">
            Kontakt
          </h3>

          <p className="text-slate-300">
            kontakt@blisko24.pl
          </p>

          <p className="mt-2 text-slate-400">
            Polska
          </p>
        </div>

      </div>

      <div className="border-t border-slate-800 py-6 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} BLISKO24. Wszelkie prawa zastrzeżone.
      </div>
    </footer>
  );
}