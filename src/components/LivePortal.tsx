export default function LivePortal() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-12">

      <h2 className="mb-8 text-3xl font-bold">
        🔥 Co dzieje się na BLISKO24?
      </h2>

      <div className="grid gap-6 md:grid-cols-4">

        <div className="rounded-2xl bg-white p-6 shadow">
          <div className="text-4xl">💼</div>

          <h3 className="mt-4 text-xl font-bold">
            Oferty pracy
          </h3>

          <p className="mt-2 text-gray-500">
            Nowe ogłoszenia każdego dnia.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow">
          <div className="text-4xl">🛠️</div>

          <h3 className="mt-4 text-xl font-bold">
            Usługi
          </h3>

          <p className="mt-2 text-gray-500">
            Fachowcy z Twojej okolicy.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow">
          <div className="text-4xl">🤝</div>

          <h3 className="mt-4 text-xl font-bold">
            Pomoc
          </h3>

          <p className="mt-2 text-gray-500">
            Sąsiedzi pomagają sąsiadom.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow">
          <div className="text-4xl">🏡</div>

          <h3 className="mt-4 text-xl font-bold">
            Lokalnie
          </h3>

          <p className="mt-2 text-gray-500">
            Wszystko blisko Ciebie.
          </p>
        </div>

      </div>

    </section>
  );
}