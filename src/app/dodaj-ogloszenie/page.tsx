"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";;
import { supabase } from "../../lib/supabase";
import AdvertisementForm from "../../components/AdvertisementForm";
import AdvertisementFields from "../../components/AdvertisementFields";

export default function AddAdvertisementPage() {
  const router = useRouter();
  const [advertisement, setAdvertisement] = useState({
    
    title: "",
    category: "",
    description: "",
    province: "",
    city: "",
    price: "",
    phone: "",
    email: "",
  });
  useEffect(() => {
  async function checkUser() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.replace("/logowanie");
    }
  }

  checkUser();
}, [router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

const form = event.currentTarget;
const formData = new FormData(form);

const {
  data: { user },
} = await supabase.auth.getUser();

if (!user) {
  alert("Musisz być zalogowany.");
  router.push("/logowanie");
  return;
}

    const title = String(formData.get("title"));
    const category = String(formData.get("category"));
    const description = String(formData.get("description"));
    const province = String(formData.get("province"));
    const city = String(formData.get("city"));
    const price = String(formData.get("price"));
    const phone = String(formData.get("phone"));
    const email = String(formData.get("email"));
    const image = formData.get("image") as File;

console.log(image);
console.log(image?.size);
console.log(image?.name);

    setAdvertisement({
      title,
      category,
      description,
      province,
      city,
      price,
      phone,
      email,
    });

    let imageUrl = "";

if (image && image.size > 0) {
  const fileName = `${Date.now()}-${image.name}`;

  const { error: uploadError } = await supabase.storage
    .from("advertisements")
    .upload(fileName, image);

  if (uploadError) {
    alert("Błąd podczas wysyłania zdjęcia");
    console.log(uploadError);
    return;
  }

  const { data } = supabase.storage
    .from("advertisements")
    .getPublicUrl(fileName);

  imageUrl = data.publicUrl;
}
    const { error } = await supabase
      .from("advertisements")
      .insert([
  {
    title,
    category,
    description,
    province,
    city,
    price,
    phone,
    email,
    image_url: imageUrl,
    user_id: user.id,
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

        <AdvertisementForm onSubmit={handleSubmit}>

          <AdvertisementFields />
            

          <div>
            <label className="mb-2 block font-semibold">
              Opis
            </label>

            <textarea
              name="description"
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

              <select
                name="province"
                className="w-full rounded-xl border p-3"
              >
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

          <div>
  <label className="mb-2 block font-semibold">
    Zdjęcie
  </label>

  <input
    name="image"
    type="file"
    accept="image/*"
    className="w-full rounded-xl border p-3"
  />
</div>

<button className="w-full rounded-xl bg-blue-700 px-6 py-4 text-lg font-semibold text-white hover:bg-blue-800">
  Dodaj ogłoszenie
</button>
        </AdvertisementForm>
      </div>

      {advertisement.title && (
        <div className="mx-auto mt-8 max-w-3xl rounded-2xl bg-white p-8 shadow">
          <h2 className="mb-4 text-2xl font-bold">
            Podgląd ogłoszenia
          </h2>

          <h3 className="text-xl font-semibold text-blue-700">
            {advertisement.title}
          </h3>

          <p className="mt-2">📂 {advertisement.category}</p>
          <p className="mt-2">🗺️ {advertisement.province}</p>
          <p className="mt-2">📍 {advertisement.city}</p>
          <p className="mt-2">💰 {advertisement.price}</p>
          <p className="mt-2">{advertisement.description}</p>
          <p className="mt-2">📞 {advertisement.phone}</p>
          <p className="mt-2">📧 {advertisement.email}</p>
        </div>
      )}
    </main>
  );
}