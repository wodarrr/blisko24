"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import ImageUpload from "../../../components/ImageUpload";

type ProfileForm = {
  name: string;
  city: string;
  phone: string;
  description: string;

  avatar_url: string;

  company_name: string;
  company_description: string;
  company_logo: string;

  website: string;
  facebook: string;
  instagram: string;

  opening_hours: string;
};

export default function EditProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState<ProfileForm>({
    name: "",
    city: "",
    phone: "",
    description: "",

    avatar_url: "",

    company_name: "",
    company_description: "",
    company_logo: "",

    website: "",
    facebook: "",
    instagram: "",

    opening_hours: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select(`
        name,
        city,
        phone,
        description,
        avatar_url,
        company_name,
        company_description,
        company_logo,
        website,
        facebook,
        instagram,
        opening_hours
      `)
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Błąd pobierania profilu:", error);
      setLoading(false);
      return;
    }

    setProfile({
      name: data.name ?? "",
      city: data.city ?? "",
      phone: data.phone ?? "",
      description: data.description ?? "",

      avatar_url: data.avatar_url ?? "",

      company_name: data.company_name ?? "",
      company_description:
        data.company_description ?? "",
      company_logo: data.company_logo ?? "",

      website: data.website ?? "",
      facebook: data.facebook ?? "",
      instagram: data.instagram ?? "",

      opening_hours: data.opening_hours ?? "",
    });

    setLoading(false);
  }

  function updateField(
    field: keyof ProfileForm,
    value: string
  ) {
    setProfile((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function saveProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Musisz być zalogowany.");
      return;
    }

    if (!profile.name.trim()) {
      alert("Wpisz imię lub nazwę użytkownika.");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        name: profile.name.trim(),
        city: profile.city.trim(),
        phone: profile.phone.trim(),
        description: profile.description.trim(),

        avatar_url: profile.avatar_url || null,

        company_name:
          profile.company_name.trim() || null,
        company_description:
          profile.company_description.trim() || null,
        company_logo:
          profile.company_logo || null,

        website: profile.website.trim() || null,
        facebook: profile.facebook.trim() || null,
        instagram: profile.instagram.trim() || null,

        opening_hours:
          profile.opening_hours.trim() || null,
      })
      .eq("id", user.id);

    setSaving(false);

    if (error) {
      console.error("Błąd zapisu profilu:", error);
      alert("Nie udało się zapisać profilu.");
      return;
    }

    alert("Profil został zapisany.");
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
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">

        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-wide text-blue-700">
            Ustawienia
          </p>

          <h1 className="mt-2 text-4xl font-extrabold text-slate-900">
            Edytuj profil
          </h1>

          <p className="mt-3 text-gray-500">
            Uzupełnij dane osobowe oraz informacje o firmie.
          </p>
        </div>

        <div className="space-y-10 rounded-3xl bg-white p-5 shadow sm:p-8">

          <section>
            <h2 className="text-2xl font-bold">
              Zdjęcie profilowe
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Zdjęcie będzie widoczne na profilu, przy ogłoszeniach
              i w rozmowach.
            </p>

            <div className="mt-6 max-w-xs">
              <ImageUpload
                folder="avatars"
                value={profile.avatar_url}
                onUpload={(url) =>
                  updateField("avatar_url", url)
                }
              />
            </div>
          </section>

          <hr className="border-slate-200" />

          <section className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">
                Dane użytkownika
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Podstawowe informacje widoczne publicznie.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block font-semibold">
                  Imię lub nazwa użytkownika
                </label>

                <input
                  value={profile.name}
                  onChange={(event) =>
                    updateField(
                      "name",
                      event.target.value
                    )
                  }
                  placeholder="Np. Krzysztof"
                  className="w-full rounded-xl border p-4"
                />
              </div>

              <div>
                <label className="mb-2 block font-semibold">
                  Miasto
                </label>

                <input
                  value={profile.city}
                  onChange={(event) =>
                    updateField(
                      "city",
                      event.target.value
                    )
                  }
                  placeholder="Np. Piekary Śląskie"
                  className="w-full rounded-xl border p-4"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block font-semibold">
                Telefon
              </label>

              <input
                value={profile.phone}
                onChange={(event) =>
                  updateField(
                    "phone",
                    event.target.value
                  )
                }
                placeholder="Np. 600 123 456"
                className="w-full rounded-xl border p-4"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold">
                O mnie
              </label>

              <textarea
                value={profile.description}
                onChange={(event) =>
                  updateField(
                    "description",
                    event.target.value
                  )
                }
                placeholder="Napisz kilka zdań o sobie..."
                rows={5}
                className="w-full rounded-xl border p-4"
              />
            </div>
          </section>

          <hr className="border-slate-200" />

          <section className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">
                Dane firmy
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Uzupełnij tę część, jeśli prowadzisz działalność.
              </p>
            </div>

            <div>
              <label className="mb-2 block font-semibold">
                Logo firmy
              </label>

              <div className="max-w-xs">
                <ImageUpload
                  folder="company-logos"
                  value={profile.company_logo}
                  onUpload={(url) =>
                    updateField("company_logo", url)
                  }
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block font-semibold">
                Nazwa firmy
              </label>

              <input
                value={profile.company_name}
                onChange={(event) =>
                  updateField(
                    "company_name",
                    event.target.value
                  )
                }
                placeholder="Np. Elektro-Serwis"
                className="w-full rounded-xl border p-4"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold">
                Opis firmy
              </label>

              <textarea
                value={profile.company_description}
                onChange={(event) =>
                  updateField(
                    "company_description",
                    event.target.value
                  )
                }
                placeholder="Opisz działalność firmy..."
                rows={5}
                className="w-full rounded-xl border p-4"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block font-semibold">
                  Strona internetowa
                </label>

                <input
                  value={profile.website}
                  onChange={(event) =>
                    updateField(
                      "website",
                      event.target.value
                    )
                  }
                  placeholder="https://twojastrona.pl"
                  className="w-full rounded-xl border p-4"
                />
              </div>

              <div>
                <label className="mb-2 block font-semibold">
                  Godziny pracy
                </label>

                <input
                  value={profile.opening_hours}
                  onChange={(event) =>
                    updateField(
                      "opening_hours",
                      event.target.value
                    )
                  }
                  placeholder="Pon–Pt 8:00–17:00"
                  className="w-full rounded-xl border p-4"
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block font-semibold">
                  Facebook
                </label>

                <input
                  value={profile.facebook}
                  onChange={(event) =>
                    updateField(
                      "facebook",
                      event.target.value
                    )
                  }
                  placeholder="Link do profilu"
                  className="w-full rounded-xl border p-4"
                />
              </div>

              <div>
                <label className="mb-2 block font-semibold">
                  Instagram
                </label>

                <input
                  value={profile.instagram}
                  onChange={(event) =>
                    updateField(
                      "instagram",
                      event.target.value
                    )
                  }
                  placeholder="Link do profilu"
                  className="w-full rounded-xl border p-4"
                />
              </div>
            </div>
          </section>

          <button
            type="button"
            onClick={saveProfile}
            disabled={saving}
            className="w-full rounded-xl bg-blue-700 py-4 font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Zapisywanie..."
              : "💾 Zapisz profil"}
          </button>

        </div>
      </div>
    </main>
  );
}