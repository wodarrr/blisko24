"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import Header from "../../../components/Header";
import ImageUpload from "../../../components/ImageUpload";
import { supabase } from "../../../lib/supabase";

const provinces = [
  "Dolnośląskie",
  "Kujawsko-pomorskie",
  "Lubelskie",
  "Lubuskie",
  "Łódzkie",
  "Małopolskie",
  "Mazowieckie",
  "Opolskie",
  "Podkarpackie",
  "Podlaskie",
  "Pomorskie",
  "Śląskie",
  "Świętokrzyskie",
  "Warmińsko-mazurskie",
  "Wielkopolskie",
  "Zachodniopomorskie",
];

const skillGroups = [
  {
    name: "🚛 Transport i logistyka",
    skills: [
      "Prawo jazdy B",
      "Prawo jazdy C",
      "Prawo jazdy C+E",
      "ADR",
      "HDS",
      "Tachograf",
      "Wózki widłowe",
      "Obsługa magazynu",
      "Kompletacja zamówień",
      "Logistyka",
    ],
  },
  {
    name: "⚡ Elektryka i technika",
    skills: [
      "Uprawnienia SEP do 1 kV",
      "Uprawnienia SEP powyżej 1 kV",
      "Pomiary elektryczne",
      "Automatyka",
      "Czytanie schematów",
      "Lutowanie",
      "Montaż instalacji",
      "Serwis urządzeń",
    ],
  },
  {
    name: "🏗 Budownictwo i przemysł",
    skills: [
      "Spawanie MAG",
      "Spawanie TIG",
      "Obsługa koparki",
      "Obsługa ładowarki",
      "Prace wykończeniowe",
      "Murowanie",
      "Tynkowanie",
      "Hydraulika",
      "Stolarka",
      "Montaż rusztowań",
    ],
  },
  {
    name: "💻 Biuro i IT",
    skills: [
      "Obsługa komputera",
      "Microsoft Word",
      "Microsoft Excel",
      "PowerPoint",
      "AutoCAD",
      "Canva",
      "Python",
      "JavaScript",
      "Obsługa CRM",
      "Wprowadzanie danych",
    ],
  },
  {
    name: "🛒 Handel i obsługa klienta",
    skills: [
      "Sprzedaż",
      "Obsługa klienta",
      "Kasa fiskalna",
      "Negocjacje",
      "Doradztwo",
      "Telemarketing",
      "Praca z klientem",
      "E-commerce",
    ],
  },
  {
    name: "🍽 Gastronomia i hotelarstwo",
    skills: [
      "Gotowanie",
      "Pomoc kuchenna",
      "Cukiernictwo",
      "Barista",
      "Kelnerstwo",
      "Obsługa hotelowa",
      "HACCP",
    ],
  },
  {
    name: "🏥 Opieka i zdrowie",
    skills: [
      "Opieka nad seniorami",
      "Opieka nad dziećmi",
      "Pierwsza pomoc",
      "Opiekun medyczny",
      "Pomoc osobom z niepełnosprawnością",
    ],
  },
  {
    name: "🌍 Języki",
    skills: [
      "Język angielski",
      "Język niemiecki",
      "Język czeski",
      "Język włoski",
      "Język francuski",
      "Język ukraiński",
    ],
  },
  {
    name: "🤝 Umiejętności miękkie",
    skills: [
      "Praca zespołowa",
      "Samodzielność",
      "Dobra organizacja pracy",
      "Komunikatywność",
      "Dokładność",
      "Odporność na stres",
      "Praca zmianowa",
      "Zarządzanie zespołem",
    ],
  },
];

const workModeOptions = ["Stacjonarna", "Hybrydowa", "Zdalna"];

type AccountType = "candidate" | "employer" | "both";

type ProfileForm = {
  account_type: AccountType;
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

  candidate_role: string;
  candidate_skills: string[];
  preferred_province: string;
  preferred_city: string;
  work_modes: string[];
  available_from: string;
  open_to_job_offers: boolean;
  contact_sharing_consent: boolean;
  years_of_experience: string;
};

const emptyProfile: ProfileForm = {
  account_type: "both",
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

  candidate_role: "",
  candidate_skills: [],
  preferred_province: "",
  preferred_city: "",
  work_modes: [],
  available_from: "",
  open_to_job_offers: false,
  contact_sharing_consent: false,
  years_of_experience: "",
};

export default function EditProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [customSkill, setCustomSkill] = useState("");

  const [showCustomSkill, setShowCustomSkill] = useState(false);

  const [profile, setProfile] = useState<ProfileForm>(emptyProfile);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      router.replace("/logowanie");
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select(
        `
        account_type,
        name,
        city,
        description,
        avatar_url,
        company_name,
        company_description,
        company_logo,
        website,
        facebook,
        instagram,
        opening_hours,
        candidate_role,
        candidate_skills,
        preferred_province,
        preferred_city,
        work_modes,
        available_from,
        open_to_job_offers,
        contact_sharing_consent,
        years_of_experience
      `,
      )
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Błąd pobierania profilu:", error);

      alert("Nie udało się pobrać danych profilu.");

      setLoading(false);
      return;
    }

    const { data: contactData, error: contactError } = await supabase
      .from("candidate_contacts")
      .select("phone")
      .eq("candidate_id", user.id)
      .maybeSingle();

    if (contactError) {
      console.error("Błąd pobierania danych kontaktowych:", contactError);

      alert("Nie udało się pobrać danych kontaktowych.");

      setLoading(false);
      return;
    }

    if (!data) {
      setLoading(false);
      return;
    }

    setProfile({
      account_type: (data.account_type ?? "both") as AccountType,
      name: data.name ?? "",
      city: data.city ?? "",
      phone: contactData?.phone ?? "",
      description: data.description ?? "",

      avatar_url: data.avatar_url ?? "",

      company_name: data.company_name ?? "",
      company_description: data.company_description ?? "",
      company_logo: data.company_logo ?? "",

      website: data.website ?? "",
      facebook: data.facebook ?? "",
      instagram: data.instagram ?? "",

      opening_hours: data.opening_hours ?? "",

      candidate_role: data.candidate_role ?? "",

      candidate_skills: Array.isArray(data.candidate_skills)
        ? data.candidate_skills
        : [],

      preferred_province: data.preferred_province ?? "",

      preferred_city: data.preferred_city ?? "",

      work_modes: Array.isArray(data.work_modes) ? data.work_modes : [],

      available_from: data.available_from ?? "",

      open_to_job_offers: data.open_to_job_offers === true,

      contact_sharing_consent: data.contact_sharing_consent === true,

      years_of_experience:
        data.years_of_experience === null ||
        data.years_of_experience === undefined
          ? ""
          : String(data.years_of_experience),
    });

    setLoading(false);
  }

  function updateTextField(field: keyof ProfileForm, value: string) {
    setProfile((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function updateBooleanField(
    field: "open_to_job_offers" | "contact_sharing_consent",
    value: boolean,
  ) {
    setProfile((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function updateAccountType(accountType: AccountType) {
    setProfile((previous) => ({
      ...previous,
      account_type: accountType,
      open_to_job_offers:
        accountType === "employer" ? false : previous.open_to_job_offers,
      contact_sharing_consent:
        accountType === "employer" ? false : previous.contact_sharing_consent,
    }));
  }

  function toggleSkill(skill: string) {
    setProfile((previous) => {
      const exists = previous.candidate_skills.includes(skill);

      return {
        ...previous,
        candidate_skills: exists
          ? previous.candidate_skills.filter((item) => item !== skill)
          : [...previous.candidate_skills, skill],
      };
    });
  }

  function addCustomSkill() {
    const normalizedSkill = customSkill.trim();

    if (!normalizedSkill) return;

    setProfile((previous) => {
      if (
        previous.candidate_skills.some(
          (skill) => skill.toLowerCase() === normalizedSkill.toLowerCase(),
        )
      ) {
        return previous;
      }

      return {
        ...previous,
        candidate_skills: [...previous.candidate_skills, normalizedSkill],
      };
    });

    setCustomSkill("");
  }

  function toggleWorkMode(workMode: string) {
    setProfile((previous) => {
      const exists = previous.work_modes.includes(workMode);

      return {
        ...previous,
        work_modes: exists
          ? previous.work_modes.filter((item) => item !== workMode)
          : [...previous.work_modes, workMode],
      };
    });
  }

  async function saveProfile() {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      alert("Musisz być zalogowany.");
      router.replace("/logowanie");
      return;
    }

    if (!profile.name.trim()) {
      alert("Wpisz imię lub nazwę użytkownika.");
      return;
    }

    const candidateFeaturesEnabled =
      profile.account_type === "candidate" || profile.account_type === "both";

    const experience = profile.years_of_experience.trim();

    let numericExperience: number | null = null;

    if (experience) {
      const parsedExperience = Number(experience);

      if (
        !Number.isInteger(parsedExperience) ||
        parsedExperience < 0 ||
        parsedExperience > 60
      ) {
        alert("Lata doświadczenia wpisz jako liczbę od 0 do 60.");
        return;
      }

      numericExperience = parsedExperience;
    }

    if (
      candidateFeaturesEnabled &&
      profile.open_to_job_offers &&
      !profile.candidate_role.trim()
    ) {
      alert("Wpisz stanowisko, którego szukasz.");
      return;
    }

    if (
      candidateFeaturesEnabled &&
      profile.contact_sharing_consent &&
      !profile.phone.trim()
    ) {
      alert("Aby zgodzić się na udostępnienie kontaktu, wpisz numer telefonu.");
      return;
    }

    setSaving(true);

    const { error: contactError } = await supabase
      .from("candidate_contacts")
      .upsert(
        {
          candidate_id: user.id,
          phone: profile.phone.trim() || null,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "candidate_id",
        },
      );

    if (contactError) {
      setSaving(false);

      console.error("Błąd zapisu danych kontaktowych:", contactError);

      alert("Nie udało się zapisać numeru telefonu.");

      return;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        account_type: profile.account_type,
        name: profile.name.trim(),
        city: profile.city.trim() || null,
        description: profile.description.trim() || null,

        avatar_url: profile.avatar_url || null,

        company_name: profile.company_name.trim() || null,

        company_description: profile.company_description.trim() || null,

        company_logo: profile.company_logo || null,

        website: profile.website.trim() || null,

        facebook: profile.facebook.trim() || null,

        instagram: profile.instagram.trim() || null,

        opening_hours: profile.opening_hours.trim() || null,

        candidate_role: profile.candidate_role.trim() || null,

        candidate_skills: profile.candidate_skills,

        preferred_province: profile.preferred_province || null,

        preferred_city: profile.preferred_city.trim() || null,

        work_modes: profile.work_modes,

        available_from: profile.available_from || null,

        open_to_job_offers: candidateFeaturesEnabled
          ? profile.open_to_job_offers
          : false,

        contact_sharing_consent: candidateFeaturesEnabled
          ? profile.contact_sharing_consent
          : false,

        years_of_experience: numericExperience,
      })
      .eq("id", user.id);

    setSaving(false);

    if (profileError) {
      console.error("Błąd zapisu profilu:", profileError);

      alert("Nie udało się zapisać profilu.");

      return;
    }

    alert("Profil został zapisany.");
    router.refresh();
  }

  if (loading) {
    return (
      <>
        <Header />
        <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-gray-100 text-slate-900">
          <p>Ładowanie profilu...</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="min-h-screen bg-gray-100 text-slate-900">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
          <div className="mb-8">
            <Link
              href="/"
              className="mb-5 inline-flex items-center rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-800 shadow-sm transition hover:bg-slate-50"
            >
              ← Strona główna
            </Link>
          <p className="text-sm font-bold uppercase tracking-wide text-blue-700">
            Ustawienia
          </p>

          <h1 className="mt-2 text-4xl font-extrabold text-slate-900">
            Edytuj profil i typ konta
          </h1>

          <p className="mt-3 text-gray-500">
            Uzupełnij dane osobowe, informacje kandydata lub dane swojej firmy.
          </p>
        </div>

        <div className="space-y-10 rounded-3xl bg-white p-5 shadow sm:p-8">
          <section className="rounded-3xl border border-blue-200 bg-blue-50 p-5 sm:p-7">
            <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-blue-700">
              Typ konta
            </p>

            <h2 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
              Jak chcesz korzystać z BLISKO24?
            </h2>

            <p className="mt-3 leading-7 text-slate-600">
              Wybór możesz później zmienić. Dane zapisane w niewidocznej części
              profilu nie zostaną usunięte.
            </p>

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {[
                {
                  value: "candidate" as AccountType,
                  icon: "👤",
                  title: "Szukam pracy",
                  description:
                    "Tworzę profil kandydata i chcę otrzymywać propozycje pracy.",
                },
                {
                  value: "employer" as AccountType,
                  icon: "🏢",
                  title: "Szukam pracownika",
                  description:
                    "Tworzę alerty, przeglądam dopasowania i kontaktuję się z kandydatami.",
                },
                {
                  value: "both" as AccountType,
                  icon: "🤝",
                  title: "Obie opcje",
                  description:
                    "Chcę korzystać zarówno z funkcji kandydata, jak i pracodawcy.",
                },
              ].map((option) => {
                const selected = profile.account_type === option.value;

                return (
                  <label
                    key={option.value}
                    className={`cursor-pointer rounded-2xl border p-5 transition ${
                      selected
                        ? "border-blue-600 bg-white shadow-md ring-2 ring-blue-200"
                        : "border-blue-200 bg-blue-50 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <input
                        type="radio"
                        name="account_type"
                        value={option.value}
                        checked={selected}
                        onChange={() => updateAccountType(option.value)}
                        className="mt-1 h-5 w-5"
                      />

                      <div>
                        <div className="text-3xl">{option.icon}</div>
                        <p className="mt-2 font-extrabold text-slate-900">
                          {option.title}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </section>

          <hr className="border-slate-200" />

          <section>
            <h2 className="text-2xl font-bold">Zdjęcie profilowe</h2>

            <p className="mt-2 text-sm text-gray-500">
              Zdjęcie będzie widoczne na profilu, przy ogłoszeniach i w
              rozmowach.
            </p>

            <div className="mt-6 max-w-xs">
              <ImageUpload
                folder="avatars"
                value={profile.avatar_url}
                onUpload={(url) => updateTextField("avatar_url", url)}
              />
            </div>
          </section>

          <hr className="border-slate-200" />

          <section className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Dane użytkownika</h2>

              <p className="mt-2 text-sm text-gray-500">
                Podstawowe informacje profilu. Numer telefonu pozostaje prywatny
                do czasu prawidłowego odblokowania.
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
                    updateTextField("name", event.target.value)
                  }
                  placeholder="Np. Krzysztof"
                  className="w-full rounded-xl border border-slate-300 bg-white p-4 text-slate-900 placeholder:text-slate-400 caret-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block font-semibold">Miasto</label>

                <input
                  value={profile.city}
                  onChange={(event) =>
                    updateTextField("city", event.target.value)
                  }
                  placeholder="Np. Piekary Śląskie"
                  className="w-full rounded-xl border border-slate-300 bg-white p-4 text-slate-900 placeholder:text-slate-400 caret-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block font-semibold">Telefon</label>

              <input
                value={profile.phone}
                onChange={(event) =>
                  updateTextField("phone", event.target.value)
                }
                placeholder="Np. 600 123 456"
                className="w-full rounded-xl border border-slate-300 bg-white p-4 text-slate-900 placeholder:text-slate-400 caret-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />

              <p className="mt-2 text-sm text-slate-500">
                Numer nie jest widoczny publicznie. Może zostać udostępniony
                tylko za Twoją zgodą i po spełnieniu warunków usługi.
              </p>
            </div>

            <div>
              <label className="mb-2 block font-semibold">O mnie</label>

              <textarea
                value={profile.description}
                onChange={(event) =>
                  updateTextField("description", event.target.value)
                }
                placeholder="Napisz kilka zdań o sobie..."
                rows={5}
                className="w-full rounded-xl border border-slate-300 bg-white p-4 text-slate-900 placeholder:text-slate-400 caret-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </section>

          <hr className="border-slate-200" />

          {(profile.account_type === "candidate" ||
            profile.account_type === "both") && (
            <section className="space-y-7 rounded-3xl border border-green-200 bg-green-50 p-5 sm:p-7">
              <div>
                <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-green-700">
                  Dla osób szukających pracy
                </p>

                <h2 className="mt-2 text-3xl font-extrabold text-slate-900">
                  🎯 Profil kandydata
                </h2>

                <p className="mt-3 leading-7 text-green-800">
                  Uzupełnienie tych danych jest bezpłatne. Dzięki nim pracodawcy
                  będą mogli znaleźć Cię po stanowisku, umiejętnościach i
                  lokalizacji.
                </p>
              </div>

              <div>
                <label className="mb-2 block font-semibold">
                  Jakiej pracy szukasz?
                </label>

                <input
                  value={profile.candidate_role}
                  onChange={(event) =>
                    updateTextField("candidate_role", event.target.value)
                  }
                  placeholder="Np. Kierowca kat. C, sprzedawca, hydraulik"
                  className="w-full rounded-xl border border-green-200 bg-white p-4 text-slate-900 placeholder:text-slate-400 caret-slate-900 outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100"
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block font-semibold">
                    Lata doświadczenia
                  </label>

                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={profile.years_of_experience}
                    onChange={(event) =>
                      updateTextField("years_of_experience", event.target.value)
                    }
                    placeholder="Np. 5"
                    className="w-full rounded-xl border border-green-200 bg-white p-4 text-slate-900 placeholder:text-slate-400 caret-slate-900 outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-semibold">
                    Dostępny od
                  </label>

                  <input
                    type="date"
                    value={profile.available_from}
                    onChange={(event) =>
                      updateTextField("available_from", event.target.value)
                    }
                    className="w-full rounded-xl border border-green-200 bg-white p-4 text-slate-900 placeholder:text-slate-400 caret-slate-900 outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100"
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block font-semibold">
                    Preferowane województwo
                  </label>

                  <select
                    value={profile.preferred_province}
                    onChange={(event) =>
                      updateTextField("preferred_province", event.target.value)
                    }
                    className="w-full rounded-xl border border-green-200 bg-white p-4 text-slate-900 placeholder:text-slate-400 caret-slate-900 outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100"
                  >
                    <option value="">Cała Polska</option>

                    {provinces.map((province) => (
                      <option key={province} value={province}>
                        {province}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block font-semibold">
                    Preferowane miasto
                  </label>

                  <input
                    value={profile.preferred_city}
                    onChange={(event) =>
                      updateTextField("preferred_city", event.target.value)
                    }
                    placeholder="Np. Katowice"
                    className="w-full rounded-xl border border-green-200 bg-white p-4 text-slate-900 placeholder:text-slate-400 caret-slate-900 outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100"
                  />
                </div>
              </div>

              <div>
                <p className="mb-3 font-semibold">Preferowana forma pracy</p>

                <div className="grid gap-3 sm:grid-cols-3">
                  {workModeOptions.map((workMode) => {
                    const checked = profile.work_modes.includes(workMode);

                    return (
                      <label
                        key={workMode}
                        className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 ${
                          checked
                            ? "border-green-500 bg-white"
                            : "border-green-200 bg-green-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleWorkMode(workMode)}
                          className="h-5 w-5"
                        />

                        <span className="font-semibold">{workMode}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="mb-3 font-semibold">Umiejętności i uprawnienia</p>

                <div className="space-y-7">
                  {skillGroups.map((group) => (
                    <div key={group.name}>
                      <h3 className="mb-3 text-lg font-extrabold text-slate-900">
                        {group.name}
                      </h3>

                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {group.skills.map((skill) => {
                          const checked =
                            profile.candidate_skills.includes(skill);

                          return (
                            <label
                              key={skill}
                              className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 ${
                                checked
                                  ? "border-green-500 bg-white"
                                  : "border-green-200 bg-green-50"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleSkill(skill)}
                                className="h-5 w-5"
                              />

                              <span className="font-semibold">{skill}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setShowCustomSkill((previous) => !previous)}
                  className={`mt-5 flex w-full items-center justify-between rounded-2xl border p-4 text-left font-bold transition ${
                    showCustomSkill
                      ? "border-blue-500 bg-blue-50 text-blue-800"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span>➕ Inne umiejętności</span>
                  <span>{showCustomSkill ? "−" : "+"}</span>
                </button>

                {showCustomSkill && (
                  <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-4">
                    <label className="mb-2 block font-semibold text-slate-900">
                      Wpisz własną umiejętność
                    </label>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <input
                        value={customSkill}
                        onChange={(event) => setCustomSkill(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            addCustomSkill();
                          }
                        }}
                        placeholder="Np. operator żurawia, montaż klimatyzacji"
                        className="flex-1 rounded-xl border border-blue-200 bg-white p-4 text-slate-900 placeholder:text-slate-400 caret-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />

                      <button
                        type="button"
                        onClick={addCustomSkill}
                        className="rounded-xl bg-blue-700 px-6 py-4 font-bold text-white hover:bg-blue-800"
                      >
                        + Dodaj
                      </button>
                    </div>
                  </div>
                )}

                {profile.candidate_skills.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {profile.candidate_skills.map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className="rounded-full bg-white px-4 py-2 text-sm font-bold text-green-800 shadow-sm ring-1 ring-green-200"
                        title="Kliknij, aby usunąć"
                      >
                        {skill} ×
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <label className="flex cursor-pointer items-start gap-4 rounded-2xl border border-green-300 bg-white p-5">
                <input
                  type="checkbox"
                  checked={profile.open_to_job_offers}
                  onChange={(event) =>
                    updateBooleanField(
                      "open_to_job_offers",
                      event.target.checked,
                    )
                  }
                  className="mt-1 h-5 w-5"
                />

                <div>
                  <p className="font-extrabold text-slate-900">
                    Jestem otwarty na propozycje pracy
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Po włączeniu Twój profil może pojawiać się w wynikach
                    wyszukiwania pracodawców.
                  </p>
                </div>
              </label>

              <label className="flex cursor-pointer items-start gap-4 rounded-2xl border border-blue-200 bg-blue-50 p-5">
                <input
                  type="checkbox"
                  checked={profile.contact_sharing_consent}
                  onChange={(event) =>
                    updateBooleanField(
                      "contact_sharing_consent",
                      event.target.checked,
                    )
                  }
                  className="mt-1 h-5 w-5"
                />

                <div>
                  <p className="font-extrabold text-slate-900">
                    Zgadzam się na udostępnienie kontaktu pracodawcy
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Kontakt będzie mógł zostać przekazany pracodawcy po
                    spełnieniu warunków usługi. Możesz wycofać zgodę w każdej
                    chwili.
                  </p>
                </div>
              </label>
            </section>
          )}

          {profile.account_type !== "candidate" && (
            <hr className="border-slate-200" />
          )}

          {(profile.account_type === "employer" ||
            profile.account_type === "both") && (
            <section className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">Dane firmy</h2>

                <p className="mt-2 text-sm text-gray-500">
                  Uzupełnij tę część, jeśli prowadzisz działalność.
                </p>
              </div>

              <div>
                <label className="mb-2 block font-semibold">Logo firmy</label>

                <div className="max-w-xs">
                  <ImageUpload
                    folder="company-logos"
                    value={profile.company_logo}
                    onUpload={(url) => updateTextField("company_logo", url)}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block font-semibold">Nazwa firmy</label>

                <input
                  value={profile.company_name}
                  onChange={(event) =>
                    updateTextField("company_name", event.target.value)
                  }
                  placeholder="Np. Elektro-Serwis"
                  className="w-full rounded-xl border border-slate-300 bg-white p-4 text-slate-900 placeholder:text-slate-400 caret-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block font-semibold">Opis firmy</label>

                <textarea
                  value={profile.company_description}
                  onChange={(event) =>
                    updateTextField("company_description", event.target.value)
                  }
                  placeholder="Opisz działalność firmy..."
                  rows={5}
                  className="w-full rounded-xl border border-slate-300 bg-white p-4 text-slate-900 placeholder:text-slate-400 caret-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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
                      updateTextField("website", event.target.value)
                    }
                    placeholder="https://twojastrona.pl"
                    className="w-full rounded-xl border border-slate-300 bg-white p-4 text-slate-900 placeholder:text-slate-400 caret-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-semibold">
                    Godziny pracy
                  </label>

                  <input
                    value={profile.opening_hours}
                    onChange={(event) =>
                      updateTextField("opening_hours", event.target.value)
                    }
                    placeholder="Pon–Pt 8:00–17:00"
                    className="w-full rounded-xl border border-slate-300 bg-white p-4 text-slate-900 placeholder:text-slate-400 caret-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block font-semibold">Facebook</label>

                  <input
                    value={profile.facebook}
                    onChange={(event) =>
                      updateTextField("facebook", event.target.value)
                    }
                    placeholder="Link do profilu"
                    className="w-full rounded-xl border border-slate-300 bg-white p-4 text-slate-900 placeholder:text-slate-400 caret-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-semibold">Instagram</label>

                  <input
                    value={profile.instagram}
                    onChange={(event) =>
                      updateTextField("instagram", event.target.value)
                    }
                    placeholder="Link do profilu"
                    className="w-full rounded-xl border border-slate-300 bg-white p-4 text-slate-900 placeholder:text-slate-400 caret-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>
            </section>
          )}

          <button
            type="button"
            onClick={saveProfile}
            disabled={saving}
            className="w-full rounded-xl bg-blue-700 py-4 font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Zapisywanie..." : "💾 Zapisz profil"}
          </button>
          </div>
        </div>
      </main>
    </>
  );
}