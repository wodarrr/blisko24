export default function Hero() {
  return (
    <section className="bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-7xl px-6 py-24 text-center">

        <span className="inline-block rounded-full bg-green-100 px-4 py-1 text-sm font-semibold text-green-700">
          🇵🇱 Portal lokalnych możliwości
        </span>

        <h2 className="mt-8 text-5xl font-extrabold text-slate-900 leading-tight">
          Znajdź ludzi.
          <br />
          Znajdź możliwości.
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-xl text-slate-600">
          Praca, usługi, pomoc i współpraca — wszystko w jednym miejscu.
        </p>

        <div className="mt-12 flex justify-center">
          <div className="flex w-full max-w-3xl overflow-hidden rounded-2xl border bg-white shadow-lg">

            <input
              type="text"
              placeholder="Czego szukasz?"
              className="flex-1 px-6 py-5 outline-none"
            />

            <button className="bg-slate-900 px-10 text-white font-semibold hover:bg-slate-800">
              Szukaj
            </button>

          </div>
        </div>

      </div>
    </section>
  );
}
