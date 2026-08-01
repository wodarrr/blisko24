export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-6xl px-6 py-12">

        <h1 className="mb-10 text-4xl font-bold">
          ⚙️ Ustawienia
        </h1>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

          <div className="rounded-2xl bg-white p-8 shadow transition hover:-translate-y-1 hover:shadow-xl">
            <div className="text-5xl">👤</div>

            <h2 className="mt-5 text-2xl font-bold">
              Profil
            </h2>

            <p className="mt-2 text-gray-500">
              Edytuj swoje dane, zdjęcie oraz opis.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-8 shadow transition hover:-translate-y-1 hover:shadow-xl">
            <div className="text-5xl">🏢</div>

            <h2 className="mt-5 text-2xl font-bold">
              Firma
            </h2>

            <p className="mt-2 text-gray-500">
              Dane firmy, strona WWW i media społecznościowe.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-8 shadow transition hover:-translate-y-1 hover:shadow-xl">
            <div className="text-5xl">🔒</div>

            <h2 className="mt-5 text-2xl font-bold">
              Bezpieczeństwo
            </h2>

            <p className="mt-2 text-gray-500">
              Zmień hasło i ustawienia konta.
            </p>
          </div>

        </div>

      </div>
    </main>
  );
}