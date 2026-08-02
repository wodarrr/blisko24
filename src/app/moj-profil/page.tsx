"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "../../lib/supabase";

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

export default function MyProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");

  const [avatar, setAvatar] =
    useState<File | null>(null);

  const [avatarUrl, setAvatarUrl] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (cancelled) return;

      if (userError || !user) {
        router.replace("/logowanie");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select(
          "name, city, phone, description, avatar_url"
        )
        .eq("id", user.id)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        console.error(
          "Błąd pobierania profilu:",
          error
        );
      }

      if (data) {
        setName(data.name ?? "");
        setCity(data.city ?? "");
        setPhone(data.phone ?? "");
        setDescription(
          data.description ?? ""
        );
        setAvatarUrl(
          data.avatar_url ?? ""
        );
      }

      setLoading(false);
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (saving) return;

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      router.replace("/logowanie");
      return;
    }

    setSaving(true);

    let newAvatarUrl = avatarUrl;

    if (avatar) {
      if (!avatar.type.startsWith("image/")) {
        alert(
          "Wybrany plik nie jest zdjęciem."
        );
        setSaving(false);
        return;
      }

      if (avatar.size > MAX_AVATAR_SIZE) {
        alert(
          "Zdjęcie profilowe może mieć maksymalnie 5 MB."
        );
        setSaving(false);
        return;
      }

      const extension =
        avatar.name
          .split(".")
          .pop()
          ?.toLowerCase() || "jpg";

      const fileName =
        `${user.id}/${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}.${extension}`;

      const { error: uploadError } =
        await supabase.storage
          .from("avatars")
          .upload(fileName, avatar, {
            cacheControl: "3600",
            upsert: false,
            contentType: avatar.type,
          });

      if (uploadError) {
        console.error(
          "Błąd wysyłania avatara:",
          uploadError
        );

        alert(
          "Nie udało się wysłać zdjęcia."
        );

        setSaving(false);
        return;
      }

      const { data: publicUrlData } =
        supabase.storage
          .from("avatars")
          .getPublicUrl(fileName);

      newAvatarUrl =
        publicUrlData.publicUrl;
    }

    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        name: name.trim(),
        city: city.trim(),
        phone: phone.trim(),
        description:
          description.trim(),
        avatar_url:
          newAvatarUrl || null,
      });

    if (error) {
      console.error(
        "Błąd zapisu profilu:",
        error
      );

      alert("Nie udało się zapisać profilu.");
      setSaving(false);
      return;
    }

    setAvatarUrl(newAvatarUrl);
    setAvatar(null);
    setSaving(false);

    alert("Profil został zapisany.");

    router.refresh();
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <p>Ładowanie profilu...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">

        <h1 className="mb-8 text-3xl font-extrabold text-slate-900 sm:text-4xl">
          Mój profil
        </h1>

        <div className="mb-8 flex justify-center">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Zdjęcie profilowe"
              className="h-40 w-40 rounded-full border-4 border-white object-cover shadow-lg"
            />
          ) : (
            <div className="flex h-40 w-40 items-center justify-center rounded-full bg-gray-300 text-5xl shadow">
              👤
            </div>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-3xl bg-white p-5 shadow sm:p-8"
        >
          <div>
            <label
              htmlFor="profile-name"
              className="mb-2 block font-bold text-slate-800"
            >
              Imię i nazwisko
            </label>

            <input
              id="profile-name"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Imię i nazwisko"
              className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div>
            <label
              htmlFor="profile-city"
              className="mb-2 block font-bold text-slate-800"
            >
              Miasto
            </label>

            <input
              id="profile-city"
              value={city}
              onChange={(event) =>
                setCity(event.target.value)
              }
              placeholder="Miasto"
              className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div>
            <label
              htmlFor="profile-phone"
              className="mb-2 block font-bold text-slate-800"
            >
              Telefon
            </label>

            <input
              id="profile-phone"
              type="tel"
              value={phone}
              onChange={(event) =>
                setPhone(event.target.value)
              }
              placeholder="Telefon"
              className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div>
            <label
              htmlFor="profile-description"
              className="mb-2 block font-bold text-slate-800"
            >
              Opis
            </label>

            <textarea
              id="profile-description"
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              rows={6}
              placeholder="Kilka słów o sobie..."
              className="w-full resize-y rounded-xl border border-slate-300 p-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div>
            <label
              htmlFor="profile-avatar"
              className="mb-2 block font-bold text-slate-800"
            >
              Zdjęcie profilowe
            </label>

            <input
              id="profile-avatar"
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file =
                  event.target.files?.[0] ??
                  null;

                setAvatar(file);
              }}
              className="w-full rounded-xl border border-slate-300 p-3"
            />

            {avatar && (
              <p className="mt-2 text-sm text-slate-500">
                Wybrano: {avatar.name}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-blue-700 py-4 font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Zapisywanie..."
              : "Zapisz profil"}
          </button>
        </form>
      </div>
    </main>
  );
}