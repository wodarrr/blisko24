"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function MyProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");

  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/logowanie");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setName(data.name ?? "");
        setCity(data.city ?? "");
        setPhone(data.phone ?? "");
        setDescription(data.description ?? "");
        setAvatarUrl(data.avatar_url ?? "");
      }

      setLoading(false);
    }

    loadProfile();
  }, [router]);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    let avatarUrl = "";

if (avatar) {
  const fileName = `${user.id}-${Date.now()}-${avatar.name}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(fileName, avatar);

  if (uploadError) {
    alert("Błąd podczas wysyłania zdjęcia.");
    console.log(uploadError);
    return;
  }

  const { data } = supabase.storage
    .from("avatars")
    .getPublicUrl(fileName);

  avatarUrl = data.publicUrl;
}

    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        name,
        city,
        phone,
        description,
avatar_url: avatarUrl,
      });

    if (error) {
      alert("Błąd zapisu profilu");
      console.log(error);
      return;
    }

    alert("Profil zapisany.");
    window.location.reload();
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
          Mój profil
        </h1>
        <div className="mb-8 flex justify-center">
  {avatarUrl ? (
    <img
      src={avatarUrl}
      className="h-40 w-40 rounded-full object-cover border-4 border-white shadow-lg"
    />
  ) : (
    <div className="flex h-40 w-40 items-center justify-center rounded-full bg-gray-300 text-5xl">
      👤
    </div>
  )}
</div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl bg-white p-8 shadow"
        >

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Imię i nazwisko"
            className="w-full rounded-xl border p-3"
          />

          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Miasto"
            className="w-full rounded-xl border p-3"
          />

          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Telefon"
            className="w-full rounded-xl border p-3"
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            placeholder="Kilka słów o sobie..."
            className="w-full rounded-xl border p-3"
          />

          <button className="w-full rounded-xl bg-blue-700 py-4 font-bold text-white hover:bg-blue-800">
            <div>
  <label className="mb-2 block font-semibold">
    Zdjęcie profilowe
  </label>

  <input
    type="file"
    accept="image/*"
    onChange={(e) => {
      if (e.target.files?.[0]) {
        setAvatar(e.target.files[0]);
      }
    }}
    className="w-full rounded-xl border p-3"
  />
</div>
            Zapisz profil
          </button>

        </form>

      </div>
    </main>
  );
}