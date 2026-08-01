"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import AccountCard from "../../components/account/AccountCard";

type ProfileForm = {
  name: string;
  city: string;
  description: string;
  phone: string;
  website: string;
  company_name: string;
};

export default function KontoPage() {
  const router = useRouter();

  const [currentUserId, setCurrentUserId] = useState("");
  const [email, setEmail] = useState("");

  const [adsCount, setAdsCount] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [messagesCount, setMessagesCount] = useState(0);
  const [viewsCount, setViewsCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState<ProfileForm>({
    name: "",
    city: "",
    description: "",
    phone: "",
    website: "",
    company_name: "",
  });

  useEffect(() => {
    async function loadAccount() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/logowanie");
        return;
      }

      setCurrentUserId(user.id);
      setEmail(user.email ?? "");

      const [
        profileResult,
        advertisementsResult,
        favoritesResult,
        conversationsResult,
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select(`
            name,
            city,
            description,
            phone,
            website,
            company_name
          `)
          .eq("id", user.id)
          .maybeSingle(),

        supabase
          .from("advertisements")
          .select("id, views", {
            count: "exact",
          })
          .eq("user_id", user.id),

        supabase
          .from("favorites")
          .select("*", {
            count: "exact",
            head: true,
          })
          .eq("user_id", user.id),

        supabase
          .from("conversations")
          .select("id")
          .or(
            `buyer_id.eq.${user.id},seller_id.eq.${user.id}`
          ),
      ]);

      if (profileResult.error) {
        console.error(
          "Błąd pobierania profilu:",
          profileResult.error
        );
      }

      if (profileResult.data) {
        setProfile({
          name: profileResult.data.name ?? "",
          city: profileResult.data.city ?? "",
          description:
            profileResult.data.description ?? "",
          phone: profileResult.data.phone ?? "",
          website: profileResult.data.website ?? "",
          company_name:
            profileResult.data.company_name ?? "",
        });
      }

      setAdsCount(advertisementsResult.count ?? 0);
      setFavoritesCount(favoritesResult.count ?? 0);

      const totalViews =
        advertisementsResult.data?.reduce(
          (sum, advertisement) =>
            sum + (advertisement.views ?? 0),
          0
        ) ?? 0;

      setViewsCount(totalViews);

      const conversationIds =
        conversationsResult.data?.map(
          (conversation) => conversation.id
        ) ?? [];

      if (conversationIds.length > 0) {
        const { count, error } = await supabase
          .from("messages")
          .select("*", {
            count: "exact",
            head: true,
          })
          .in("conversation_id", conversationIds)
          .neq("sender_id", user.id)
          .eq("is_read", false);

        if (error) {
          console.error(
            "Błąd pobierania nowych wiadomości:",
            error
          );
        }

        setMessagesCount(count ?? 0);
      }

      setLoading(false);
    }

    loadAccount();
  }, [router]);

  function updateProfileField(
    field: keyof ProfileForm,
    value: string
  ) {
    setProfile((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function saveProfile(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!currentUserId) return;

    if (!profile.name.trim()) {
      alert("Wpisz imię, nazwę użytkownika lub nazwę firmy.");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .upsert(
        {
          id: currentUserId,
          name: profile.name.trim(),
          city: profile.city.trim(),
          description: profile.description.trim(),
          phone: profile.phone.trim(),
          website: profile.website.trim(),
          company_name: profile.company_name.trim(),
        },
        {
          onConflict: "id",
        }
      );

    setSaving(false);

    if (error) {
      console.error("Błąd zapisu profilu:", error);
      alert("Nie udało się zapisać profilu.");
      return;
    }

    alert("Profil został zapisany.");
    router.refresh();
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-lg">
          Ładowanie konta...
        </p>
      </main>
    );
  }

  const displayName =
    profile.name.trim() ||
    profile.company_name.trim() ||
    "Użytkowniku";

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">

        <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-blue-800 via-blue-700 to-cyan-500 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-100">
                Panel użytkownika
              </p>

              <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">
                👋 Witaj, {displayName}
              </h1>

              <p className="mt-3 max-w-2xl text-blue-100">
                Zarządzaj ogłoszeniami, wiadomościami,
                profilem i aktywnością w jednym miejscu.
              </p>
            </div>

            <Link
              href="/dodaj-ogloszenie"
              className="flex w-full items-center justify-center rounded-2xl bg-white px-6 py-4 font-extrabold text-blue-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-50 lg:w-auto"
            >
              ➕ Dodaj nowe ogłoszenie
            </Link>

          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-sm text-blue-100">
                Ogłoszenia
              </p>
              <p className="mt-1 text-3xl font-extrabold">
                {adsCount}
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-sm text-blue-100">
                Wyświetlenia
              </p>
              <p className="mt-1 text-3xl font-extrabold">
                {viewsCount}
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-sm text-blue-100">
                Nowe wiadomości
              </p>
              <p className="mt-1 text-3xl font-extrabold">
                {messagesCount}
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-sm text-blue-100">
                Ulubione
              </p>
              <p className="mt-1 text-3xl font-extrabold">
                {favoritesCount}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-6">
            <p className="text-sm font-bold uppercase tracking-wide text-blue-700">
              Centrum zarządzania
            </p>

            <h2 className="mt-1 text-3xl font-extrabold text-slate-900">
              Szybki dostęp
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

            <AccountCard
              title="Moje ogłoszenia"
              value={adsCount}
              href="/moje-ogloszenia"
              icon="📋"
              description="Edytuj, usuwaj i kontroluj swoje oferty."
              accent="blue"
            />

            <AccountCard
              title="Ulubione"
              value={favoritesCount}
              href="/ulubione"
              icon="❤️"
              description="Wróć do zapisanych ofert."
              accent="red"
            />

            <AccountCard
              title="Nowe wiadomości"
              value={messagesCount}
              href="/wiadomosci"
              icon="💬"
              description="Prowadź rozmowy z użytkownikami."
              accent="green"
            />

            <AccountCard
              title="Mój publiczny profil"
              href={
                currentUserId
                  ? `/profil/${currentUserId}`
                  : "/konto"
              }
              icon="👤"
              description="Sprawdź, jak widzą Cię inni."
              accent="yellow"
            />

            <AccountCard
              title="Powiadomienia"
              href="/powiadomienia"
              icon="🔔"
              description="Zobacz najnowszą aktywność."
              accent="yellow"
            />

            <AccountCard
  title="Edytuj profil"
  href="/ustawienia/profil"
  icon="⚙️"
/>

          </div>
        </section>

        <section className="mt-12 rounded-3xl bg-white p-5 shadow sm:p-8">
          <div className="mb-8">
            <p className="text-sm font-bold uppercase tracking-wide text-blue-700">
              Profil
            </p>

            <h2 className="mt-1 text-3xl font-extrabold text-slate-900">
              Edytuj swoje dane
            </h2>

            <p className="mt-2 text-gray-500">
              Informacje będą widoczne na profilu i w rozmowach.
            </p>
          </div>

          <form
            onSubmit={saveProfile}
            className="space-y-6"
          >
            <div>
              <label className="mb-2 block font-semibold">
                Adres e-mail
              </label>

              <input
                type="email"
                value={email}
                disabled
                className="w-full rounded-xl border bg-gray-100 p-3 text-gray-500"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block font-semibold">
                  Imię, nazwa użytkownika lub firmy
                </label>

                <input
                  type="text"
                  value={profile.name}
                  onChange={(event) =>
                    updateProfileField(
                      "name",
                      event.target.value
                    )
                  }
                  placeholder="Np. Krzysztof lub Firma ABC"
                  className="w-full rounded-xl border p-3"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block font-semibold">
                  Miasto
                </label>

                <input
                  type="text"
                  value={profile.city}
                  onChange={(event) =>
                    updateProfileField(
                      "city",
                      event.target.value
                    )
                  }
                  placeholder="Np. Piekary Śląskie"
                  className="w-full rounded-xl border p-3"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block font-semibold">
                O mnie
              </label>

              <textarea
                value={profile.description}
                onChange={(event) =>
                  updateProfileField(
                    "description",
                    event.target.value
                  )
                }
                rows={5}
                placeholder="Napisz kilka zdań o sobie albo firmie..."
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
                  value={profile.phone}
                  onChange={(event) =>
                    updateProfileField(
                      "phone",
                      event.target.value
                    )
                  }
                  placeholder="Np. 600 123 456"
                  className="w-full rounded-xl border p-3"
                />
              </div>

              <div>
                <label className="mb-2 block font-semibold">
                  Nazwa firmy
                </label>

                <input
                  type="text"
                  value={profile.company_name}
                  onChange={(event) =>
                    updateProfileField(
                      "company_name",
                      event.target.value
                    )
                  }
                  placeholder="Opcjonalnie"
                  className="w-full rounded-xl border p-3"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block font-semibold">
                Strona internetowa
              </label>

              <input
                type="url"
                value={profile.website}
                onChange={(event) =>
                  updateProfileField(
                    "website",
                    event.target.value
                  )
                }
                placeholder="https://twojastrona.pl"
                className="w-full rounded-xl border p-3"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl bg-blue-700 px-8 py-4 font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {saving
                  ? "Zapisywanie..."
                  : "Zapisz profil"}
              </button>

              <button
                type="button"
                onClick={logout}
                className="w-full rounded-xl bg-red-600 px-8 py-4 font-bold text-white hover:bg-red-700 sm:w-auto"
              >
                🚪 Wyloguj
              </button>
            </div>
          </form>
        </section>

      </div>
    </main>
  );
}