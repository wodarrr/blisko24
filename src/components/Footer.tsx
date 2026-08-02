import Link from "next/link";

const footerLinks = {
  portal: [
    {
      label: "Strona główna",
      href: "/",
    },
    {
      label: "Dodaj ogłoszenie",
      href: "/dodaj-ogloszenie",
    },
    {
      label: "Moje ogłoszenia",
      href: "/moje-ogloszenia",
    },
    {
      label: "Moje konto",
      href: "/konto",
    },
  ],

  information: [
    {
      label: "O nas",
      href: "/o-nas",
    },
    {
      label: "Kontakt",
      href: "/kontakt",
    },
    {
      label: "Regulamin",
      href: "/regulamin",
    },
    {
      label: "Polityka prywatności",
      href: "/polityka-prywatnosci",
    },
    {
      label: "Polityka cookies",
      href: "/polityka-cookies",
    },
  ],
};

export default function Footer() {
  return (
    <footer className="mt-24 bg-slate-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4">

        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-3"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-700 text-2xl font-extrabold shadow-lg">
              B
            </div>

            <div>
              <p className="text-2xl font-extrabold tracking-tight">
                BLISKO24
              </p>

              <p className="text-xs text-slate-400">
                Portal lokalnych możliwości
              </p>
            </div>
          </Link>

          <p className="mt-5 max-w-sm leading-7 text-slate-300">
            Miejsce, w którym możesz znaleźć pracę,
            zaoferować usługę, poprosić o pomoc lub
            nawiązać kontakt z osobami w swojej okolicy.
          </p>

          <p className="mt-4 text-sm font-semibold text-slate-400">
            Praca • Usługi • Pomoc • Ludzie
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold">
            Portal
          </h2>

          <ul className="mt-5 space-y-3">
            {footerLinks.portal.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-slate-300 transition hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-bold">
            Informacje i zasady
          </h2>

          <ul className="mt-5 space-y-3">
            {footerLinks.information.map(
              (link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-slate-300 transition hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              )
            )}
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-bold">
            Kontakt
          </h2>

          <div className="mt-5 space-y-3 text-slate-300">
            <p>
              <span className="mr-2">
                📧
              </span>

              <a
                href="mailto:kontakt@blisko24.com.pl"
                className="break-all transition hover:text-white"
              >
                kontakt@blisko24.com.pl
              </a>
            </p>

            <p>
              <span className="mr-2">
                🌍
              </span>

              Polska
            </p>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-4 text-sm leading-6 text-slate-400">
            Masz pytanie, zauważyłeś błąd lub
            nieodpowiednie ogłoszenie? Skorzystaj ze
            strony kontaktowej albo funkcji zgłoszenia.
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-sm text-slate-400 sm:px-6 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} BLISKO24.
            Wszelkie prawa zastrzeżone.
          </p>

          <p>
            Znajdź ludzi, nie tylko ogłoszenia.
          </p>
        </div>
      </div>
    </footer>
  );
}