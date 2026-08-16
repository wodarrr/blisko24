export default function HomeIntro() {
  return (
    <section className="overflow-hidden bg-gradient-to-b from-slate-50 via-white to-white">
      <div className="mx-auto max-w-7xl px-4 py-12 text-center sm:px-6 sm:py-14 lg:py-16">
        <span className="inline-flex items-center rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
          🇵🇱 Portal lokalnych możliwości
        </span>

        <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
          Znajdź ludzi.
          <span className="block text-blue-700">
            Znajdź możliwości.
          </span>
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
          Praca, usługi, pomoc i współpraca — wszystko blisko Ciebie, w jednym miejscu.
        </p>
      </div>
    </section>
  );
}