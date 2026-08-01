"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

export default function EditProfilePage() {
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState({
    name: "",
    city: "",
    phone: "",
    description: "",

    company_name: "",
    company_description: "",

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

    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (data) {
      setProfile({
        name: data.name ?? "",
        city: data.city ?? "",
        phone: data.phone ?? "",
        description: data.description ?? "",

        company_name: data.company_name ?? "",
        company_description:
          data.company_description ?? "",

        website: data.website ?? "",
        facebook: data.facebook ?? "",
        instagram: data.instagram ?? "",

        opening_hours:
          data.opening_hours ?? "",
      });
    }

    setLoading(false);
  }

  async function saveProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update(profile)
      .eq("id", user.id);

    if (error) {
      alert("Nie udało się zapisać.");
      return;
    }

    alert("Profil zapisany.");
  }

  if (loading) {
    return (
      <main className="p-10">
        Ładowanie...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">

      <div className="mx-auto max-w-4xl px-6 py-12">

        <h1 className="mb-8 text-4xl font-bold">
          Edytuj profil
        </h1>

        <div className="space-y-6 rounded-3xl bg-white p-8 shadow">

          <input
            value={profile.name}
            onChange={(e) =>
              setProfile({
                ...profile,
                name: e.target.value,
              })
            }
            placeholder="Imię"
            className="w-full rounded-xl border p-4"
          />

          <input
            value={profile.city}
            onChange={(e) =>
              setProfile({
                ...profile,
                city: e.target.value,
              })
            }
            placeholder="Miasto"
            className="w-full rounded-xl border p-4"
          />

          <input
            value={profile.phone}
            onChange={(e) =>
              setProfile({
                ...profile,
                phone: e.target.value,
              })
            }
            placeholder="Telefon"
            className="w-full rounded-xl border p-4"
          />

          <textarea
            value={profile.description}
            onChange={(e) =>
              setProfile({
                ...profile,
                description: e.target.value,
              })
            }
            placeholder="Opis"
            rows={5}
            className="w-full rounded-xl border p-4"
          />

          <hr />

          <input
            value={profile.company_name}
            onChange={(e) =>
              setProfile({
                ...profile,
                company_name: e.target.value,
              })
            }
            placeholder="Nazwa firmy"
            className="w-full rounded-xl border p-4"
          />

          <textarea
            value={profile.company_description}
            onChange={(e) =>
              setProfile({
                ...profile,
                company_description: e.target.value,
              })
            }
            placeholder="Opis firmy"
            rows={4}
            className="w-full rounded-xl border p-4"
          />

          <input
            value={profile.website}
            onChange={(e) =>
              setProfile({
                ...profile,
                website: e.target.value,
              })
            }
            placeholder="https://..."
            className="w-full rounded-xl border p-4"
          />

          <input
            value={profile.facebook}
            onChange={(e) =>
              setProfile({
                ...profile,
                facebook: e.target.value,
              })
            }
            placeholder="Facebook"
            className="w-full rounded-xl border p-4"
          />

          <input
            value={profile.instagram}
            onChange={(e) =>
              setProfile({
                ...profile,
                instagram: e.target.value,
              })
            }
            placeholder="Instagram"
            className="w-full rounded-xl border p-4"
          />

          <input
            value={profile.opening_hours}
            onChange={(e) =>
              setProfile({
                ...profile,
                opening_hours: e.target.value,
              })
            }
            placeholder="Godziny pracy"
            className="w-full rounded-xl border p-4"
          />

          <button
            onClick={saveProfile}
            className="w-full rounded-xl bg-blue-700 py-4 font-bold text-white hover:bg-blue-800"
          >
            💾 Zapisz profil
          </button>

        </div>

      </div>

    </main>
  );
}