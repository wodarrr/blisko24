export default function NotificationsPage() {
  return (
    <main className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-5xl px-6 py-12">

        <h1 className="mb-8 text-4xl font-bold">
          🔔 Powiadomienia
        </h1>

        <div className="space-y-4">

          <div className="rounded-2xl bg-white p-6 shadow">
            <h2 className="font-bold">
              💬 Nowa wiadomość
            </h2>

            <p className="mt-2 text-gray-600">
              Otrzymałeś nową wiadomość dotyczącą ogłoszenia
              <strong> Hydraulik Katowice</strong>.
            </p>

            <p className="mt-3 text-sm text-gray-400">
              2 minuty temu
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <h2 className="font-bold">
              ❤️ Dodano do ulubionych
            </h2>

            <p className="mt-2 text-gray-600">
              Ktoś zapisał Twoje ogłoszenie do ulubionych.
            </p>

            <p className="mt-3 text-sm text-gray-400">
              godzinę temu
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <h2 className="font-bold">
              👁️ Popularne ogłoszenie
            </h2>

            <p className="mt-2 text-gray-600">
              Twoje ogłoszenie przekroczyło 100 wyświetleń.
            </p>

            <p className="mt-3 text-sm text-gray-400">
              dzisiaj
            </p>
          </div>

        </div>

      </div>
    </main>
  );
}