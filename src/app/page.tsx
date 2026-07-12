import Header from "../components/Header";


export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100">
      <Header />
        

      {/* Hero */}
      <section className="text-center py-20 px-6">
        <h2 className="text-5xl font-bold text-gray-800">
          Praca. Pomoc. Ludzie.
        </h2>

        <p className="mt-6 text-xl text-gray-600">
          Znajdź ludzi, nie tylko ogłoszenia.
        </p>

        <div className="mt-10 flex justify-center">
          <input
            className="w-full max-w-xl rounded-l-xl border border-gray-300 p-4 text-lg"
            placeholder="Czego szukasz?"
          />

          <button className="rounded-r-xl bg-blue-700 px-8 text-white font-semibold hover:bg-blue-800">
            Szukaj
          </button>
        </div>
      </section>

      {/* Kategorie */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <h3 className="mb-8 text-3xl font-bold text-center">
          Co chcesz zrobić?
        </h3>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-white p-6 shadow">
            <h4 className="text-xl font-bold">💼 Szukam pracy</h4>
            <p className="mt-2 text-gray-600">
              Znajdź pracę lub współpracę.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <h4 className="text-xl font-bold">🔧 Szukam fachowca</h4>
            <p className="mt-2 text-gray-600">
              Znajdź osobę do wykonania usługi.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <h4 className="text-xl font-bold">🤝 Potrzebuję pomocy</h4>
            <p className="mt-2 text-gray-600">
              Znajdź kogoś blisko siebie.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <h4 className="text-xl font-bold">👤 Oferuję umiejętności</h4>
            <p className="mt-2 text-gray-600">
              Pokaż, co potrafisz.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}






