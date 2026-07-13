export default function LatestAds() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <h2 className="mb-8 text-3xl font-bold">
        Najnowsze ogłoszenia
      </h2>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 shadow">
          <h3 className="text-xl font-bold">
            Kierowca kat. C+E
          </h3>

          <p className="mt-2 text-gray-600">
            📍 Warszawa
          </p>

          <p className="mt-4 font-semibold text-blue-700">
            6500–8500 zł
          </p>
        </div>
      </div>
    </section>
  );
}