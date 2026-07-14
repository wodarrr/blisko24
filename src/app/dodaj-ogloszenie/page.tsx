"use client";

export default function AddAdvertisementPage() {
 function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();

  const formData = new FormData(event.currentTarget);
  const title = formData.get("title");

  alert(`Tytuł ogłoszenia: ${title}`);
}

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="mb-8 text-4xl font-bold text-slate-900">
          Dodaj ogłoszenie
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl bg-white p-8 shadow"
        >
          <div>
            <label className="mb-2 block font-semibold">
              Tytuł ogłoszenia
            </label>

            <input
              name="title"
              type="text"
              placeholder="Np. Hydraulik 24h"
              className="w-full rounded-xl border p-3"
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold">
              Kategoria
            </label>

            <select className="w-full rounded-xl border p-3">
              <option>Wybierz kategorię</option>
              <option>Szukam pracy</option>
              <option>Oferuję pracę</option>
              <option>Szukam fachowca</option>
              <option>Oferuję usługi</option>
              <option>Potrzebuję pomocy</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block font-semibold">
              Opis
            </label>

            <textarea
              rows={5}
              placeholder="Opisz swoje ogłoszenie..."
              className="w-full rounded-xl border p-3"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block font-semibold">
                Województwo
              </label>

              <select className="w-full rounded-xl border p-3">
                <option>Wybierz województwo</option>
                <option>Dolnośląskie</option>
                <option>Kujawsko-pomorskie</option>
                <option>Lubelskie</option>
                <option>Lubuskie</option>
                <option>Łódzkie</option>
                <option>Małopolskie</option>
                <option>Mazowieckie</option>
                <option>Opolskie</option>
                <option>Podkarpackie</option>
                <option>Podlaskie</option>
                <option>Pomorskie</option>
                <option>Śląskie</option>
                <option>Świętokrzyskie</option>
                <option>Warmińsko-mazurskie</option>
                <option>Wielkopolskie</option>
                <option>Zachodniopomorskie</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block font-semibold">
                Miasto
              </label>

              <input
                name="title"
                type="text"
                placeholder="Np. Warszawa"
                className="w-full rounded-xl border p-3"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block font-semibold">
              Cena
            </label>

            <input
              type="text"
              placeholder="Np. 150 zł"
              className="w-full rounded-xl border p-3"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block font-semibold">
                Telefon
              </label>

              <input
                type="tel"
                placeholder="Np. 600123456"
                className="w-full rounded-xl border p-3"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold">
                E-mail
              </label>

              <input
                type="email"
                placeholder="Np. jan@blisko24.pl"
                className="w-full rounded-xl border p-3"
              />
            </div>
          </div>

          <button className="w-full rounded-xl bg-blue-700 px-6 py-4 text-lg font-semibold text-white hover:bg-blue-800">
            Dodaj ogłoszenie
          </button>
        </form>
      </div>
    </main>
  );
}