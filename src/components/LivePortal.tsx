import Link from "next/link";

const portalAreas = [
  {
    icon: "💼",
    title: "Praca",
    description:
      "Szukaj ofert pracy albo pokaż pracodawcom, czego szukasz.",
    href: "/?category=Oferuję pracę#ogloszenia",
  },
  {
    icon: "🛠️",
    title: "Usługi",
    description:
      "Znajdź fachowca lub zaoferuj swoje umiejętności.",
    href: "/?category=Oferuję usługi#ogloszenia",
  },
  {
    icon: "🤝",
    title: "Pomoc",
    description:
      "Poproś o pomoc lub odpowiedz na potrzeby innych osób.",
    href: "/?category=Potrzebuję pomocy#ogloszenia",
  },
  {
    icon: "🏡",
    title: "Lokalnie",
    description:
      "Odkrywaj możliwości dostępne w swojej miejscowości i okolicy.",
    href: "/#ogloszenia",
  },
];

export default function LivePortal() {
  return (
    <section className="bg-white text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-700">
            Możliwości BLISKO24
          </p>

          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
            Znajdź to, czego potrzebujesz blisko siebie
          </h2>

          <p className="mt-4 text-lg leading-8 text-slate-600">
            Praca, usługi i wzajemna pomoc w jednym miejscu — lokalnie
            albo w dowolnym regionie Polski.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {portalAreas.map((area) => (
            <Link
              key={area.title}
              href={area.href}
              className="group rounded-3xl border border-slate-200 bg-white p-6 text-slate-900 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-4xl transition group-hover:bg-blue-100">
                {area.icon}
              </div>

              <h3 className="mt-5 text-xl font-bold text-slate-950">
                {area.title}
              </h3>

              <p className="mt-3 leading-7 text-slate-600">
                {area.description}
              </p>

              <span className="mt-5 inline-flex items-center font-bold text-blue-700">
                Sprawdź możliwości
                <span className="ml-2 transition group-hover:translate-x-1">
                  →
                </span>
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-10 rounded-3xl bg-slate-900 px-6 py-8 text-center text-white shadow-xl sm:px-10">
          <h3 className="text-2xl font-extrabold text-white sm:text-3xl">
            Nie znalazłeś odpowiedniej oferty?
          </h3>

          <p className="mx-auto mt-3 max-w-2xl leading-7 text-slate-300">
            Dodaj własne bezpłatne ogłoszenie i opisz dokładnie, czego
            szukasz albo co możesz zaoferować.
          </p>

          <Link
            href="/dodaj-ogloszenie"
            className="mt-6 inline-flex rounded-xl bg-blue-600 px-7 py-3 font-bold text-white shadow-lg transition hover:bg-blue-500"
          >
            + Dodaj ogłoszenie
          </Link>
        </div>
      </div>
    </section>
  );
}