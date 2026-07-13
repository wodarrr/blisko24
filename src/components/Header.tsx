export default function Header() {
  return (
    <header className="bg-white shadow">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <h1 className="text-3xl font-bold text-blue-700">
          BLISKO24
        </h1>

        <nav className="flex items-center gap-6">
          <a href="#" className="hover:underline">
            Strona główna
          </a>

          <a href="#" className="hover:underline">
            Ogłoszenia
          </a>

          <a href="#" className="hover:underline">
            Zaloguj
          </a>

          <a
  href="/dodaj-ogloszenie"
  className="rounded-xl bg-blue-700 px-5 py-2 font-semibold text-white hover:bg-blue-800"
>
  + Dodaj ogłoszenie
</a>
        </nav>
      </div>
    </header>
  );
}