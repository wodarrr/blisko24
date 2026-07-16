"use client";
import AdvertisementForm from "../../components/AdvertisementForm";
import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function AddAdvertisementPage() {

 const [advertisement, setAdvertisement] = useState({
  title: "",
  city: "",
  category: "",
  price: "",
  phone: "",
  email: "",
});

 async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();

  const formData = new FormData(event.currentTarget);

  const title = String(formData.get("title"));
  const city = String(formData.get("city"));
  const category = String(formData.get("category"));
  const price = String(formData.get("price"));
  const phone = String(formData.get("phone"));
  const email = String(formData.get("email"));

  setAdvertisement({
    title,
    city,
    category,
    price,
    phone,
    email,
  });

  const { error } = await supabase
    .from("advertisements")
    .insert([
      {
        title,
        city,
        category,
        price,
        phone,
        email,
      },
    ]);

  if (error) {
  alert(JSON.stringify(error, null, 2));
  console.log(error);
  return;
}

  alert("Ogłoszenie zapisane!");
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

            <select 
            name="category"
            className="w-full rounded-xl border p-3">
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
                name="city"
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
            name="price"
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
               name="phone"
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
  name="email"
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
    { advertisement.title&& (
  <div className="mx-auto mt-8 max-w-3xl rounded-2xl bg-white p-8 shadow">
    <h2 className="mb-4 text-2xl font-bold">
      Podgląd ogłoszenia
    </h2>

    <h3 className="text-xl font-semibold text-blue-700">
      {advertisement.title}
    </h3>
    <p className="mt-2 text-slate-600">
  📍 {advertisement.city}
</p>
<p className="mt-2 text-slate-600">
  📂 {advertisement.category}
</p>
<p className="mt-2 text-slate-600">
  💰 {advertisement.price}
</p>
<p className="mt-2 text-slate-600">
  📞 {advertisement.phone}
</p>

<p className="mt-2 text-slate-600">
  📧 {advertisement.email}
</p>
  </div>
)}</main>
  );
}