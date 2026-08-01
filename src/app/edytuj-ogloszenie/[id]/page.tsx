"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import { getAdvertisement } from "../../../lib/getAdvertisement";

export default function EditAdvertisementPage() {
  const params = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [price, setPrice] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    async function loadAdvertisement() {
      const advertisement = await getAdvertisement(params.id as string);

      if (!advertisement) {
        alert("Nie znaleziono ogłoszenia");
        router.push("/moje-ogloszenia");
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || advertisement.user_id !== user.id) {
        alert("Nie masz dostępu do tego ogłoszenia.");
        router.push("/moje-ogloszenia");
        return;
      }

      setTitle(advertisement.title);
      setCategory(advertisement.category);
      setDescription(advertisement.description);
      setProvince(advertisement.province);
      setCity(advertisement.city);
      setPrice(advertisement.price);
      setPhone(advertisement.phone);
      setEmail(advertisement.email);

      setLoading(false);
    }

    loadAdvertisement();
  }, [params.id, router]);

  async function handleSubmit(
  event: React.FormEvent<HTMLFormElement>
) {
  event.preventDefault();

  console.log("PARAM ID:", params.id);

  const { data: test } = await supabase
    .from("advertisements")
    .select("id, title")
    .eq("id", Number(params.id));

  console.log("TEST:", test);

  const { data, error } = await supabase
    .from("advertisements")
    
  .update({
    title,
    category,
    description,
    province,
    city,
    price,
    phone,
    email,
  })
  .eq("id", Number(params.id))
  .select();

console.log("DATA:", data);
console.log("ERROR:", error);

    if (error) {
      alert("Błąd podczas zapisu.");
      console.log(error);
      return;
    }

    alert("Ogłoszenie zaktualizowane.");

    router.push("/moje-ogloszenia");
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        Ładowanie...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-3xl px-6 py-12">

        <h1 className="mb-8 text-4xl font-bold">
          Edytuj ogłoszenie
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl bg-white p-8 shadow"
        >

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border p-3"
            placeholder="Tytuł"
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            className="w-full rounded-xl border p-3"
          />

          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full rounded-xl border p-3"
            placeholder="Miasto"
          />

          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full rounded-xl border p-3"
            placeholder="Cena"
          />

          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-xl border p-3"
            placeholder="Telefon"
          />

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border p-3"
            placeholder="Email"
          />

          <button className="w-full rounded-xl bg-green-600 py-4 text-white font-bold hover:bg-green-700">
            Zapisz zmiany
          </button>

        </form>

      </div>
    </main>
  );
}