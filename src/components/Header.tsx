export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            BLISKO24
          </h1>
          <p className="text-sm text-slate-500">
            blisko ludzi
          </p>
        </div>

        <nav className="hidden md:flex gap-8 text-slate-700">
          <a href="#" className="hover:text-slate-900">
            Strona główna
          </a>

          <a href="#" className="hover:text-slate-900">
            Ogłoszenia
          </a>

          <a href="#" className="hover:text-slate-900">
            O nas
          </a>
        </nav>

        <button className="rounded-xl bg-slate-900 px-5 py-2 text-white hover:opacity-90">
          Zaloguj się
        </button>
      </div>
    </header>
  );
}
