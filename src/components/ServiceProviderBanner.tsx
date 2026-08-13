import Link from "next/link";

export default function ServiceProviderBanner() {
  return (
    <section className="bg-white px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-3xl border border-blue-200 bg-gradient-to-r from-blue-700 to-cyan-600 px-6 py-8 text-white shadow-lg sm:px-8 sm:py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-blue-100">
                Dla fachowców i usługodawców
              </p>

              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Oferujesz usługi? Dodaj swoją ofertę
              </h2>

              <p className="mt-3 text-lg leading-8 text-blue-50">
                Pokaż mieszkańcom swojej okolicy, czym się zajmujesz. Dodaj
                bezpłatne ogłoszenie i pozwól klientom znaleźć Cię po usłudze,
                mieście i województwie.
              </p>
            </div>

            <Link
              href="/dodaj-ogloszenie?category=Oferuj%C4%99%20us%C5%82ugi"
              className="inline-flex w-full shrink-0 items-center justify-center rounded-2xl bg-white px-7 py-4 text-lg font-extrabold text-blue-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-50 lg:w-auto"
            >
              + Dodaj swoją ofertę
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}