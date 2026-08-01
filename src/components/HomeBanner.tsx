import Link from "next/link";

export default function HomeBanner() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-12">

      <Link
        href="/reklama"
        className="block overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 p-10 text-white shadow-xl transition hover:scale-[1.01]"
      >

        <div className="max-w-3xl">

          <span className="rounded-full bg-white/20 px-4 py-2 text-sm font-semibold">
            ⭐ REKLAMA
          </span>

          <h2 className="mt-6 text-4xl font-bold">
            Reklamuj swoją firmę na BLISKO24
          </h2>

          <p className="mt-4 text-lg text-blue-100">
            Dotrzyj do tysięcy mieszkańców swojej okolicy.
            Promuj usługi, sklep lub firmę lokalnie.
          </p>

          <div className="mt-8 inline-block rounded-xl bg-white px-6 py-3 font-bold text-blue-700">
            Zobacz ofertę reklamy →
          </div>

        </div>

      </Link>

    </section>
  );
}