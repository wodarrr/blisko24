"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { supabase } from "../../lib/supabase";

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

const skillOptions = [
  "Prawo jazdy B",
  "Prawo jazdy C",
  "Prawo jazdy C+E",
  "Wózki widłowe",
  "Spawanie MAG",
  "Spawanie TIG",
  "Uprawnienia SEP",
  "Obsługa koparki",
  "Obsługa komputera",
  "Microsoft Excel",
  "Język angielski",
  "Język niemiecki",
  "Sprzedaż",
  "Obsługa klienta",
  "Praca zmianowa",
];

const workModeOptions = [
  "Stacjonarna",
  "Hybrydowa",
  "Zdalna",
];

type Candidate = {
  id: string;
  name: string | null;
  city: string | null;
  avatar_url: string | null;
  verified: boolean | null;
  description: string | null;
  contact_sharing_consent: boolean | null;
  candidate_role: string | null;
  candidate_skills: string[] | null;
  preferred_province: string | null;
  preferred_city: string | null;
  work_modes: string[] | null;
  available_from: string | null;
  years_of_experience: number | null;
  open_to_job_offers: boolean | null;
  last_seen: string | null;
  active_ads?: number;
  blisko_score?: number;
  match_score?: number;
};


function normalizeText(value?: string | null) {
  return value?.trim().toLowerCase() ?? "";
}

function wasActiveRecently(
  value?: string | null
) {
  if (!value) return false;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return (
    Date.now() - date.getTime() <=
    7 * 24 * 60 * 60 * 1000
  );
}

function calculateBliskoScore(
  candidate: Candidate
) {
  let score = 0;

  if (candidate.avatar_url) score += 10;

  if (
    (candidate.description?.trim().length ??
      0) >= 40
  ) {
    score += 10;
  }

  if (candidate.candidate_role?.trim()) {
    score += 10;
  }

  if (
    (candidate.candidate_skills?.length ??
      0) >= 3
  ) {
    score += 15;
  }

  if (
    candidate.years_of_experience !== null &&
    candidate.years_of_experience !==
      undefined
  ) {
    score += 10;
  }

  if (
    candidate.city?.trim() ||
    candidate.preferred_province?.trim() ||
    candidate.preferred_city?.trim()
  ) {
    score += 10;
  }

  if (
    (candidate.work_modes?.length ?? 0) > 0
  ) {
    score += 5;
  }

  if (candidate.available_from) {
    score += 10;
  }

  if (candidate.open_to_job_offers) {
    score += 5;
  }

  if (
    candidate.contact_sharing_consent
  ) {
    score += 5;
  }

  if (candidate.verified) {
    score += 5;
  }

  if (
    wasActiveRecently(
      candidate.last_seen
    )
  ) {
    score += 5;
  }

  if ((candidate.active_ads ?? 0) > 0) {
    score += 10;
  }

  return Math.min(100, score);
}

function calculateMatchScore(
  candidate: Candidate,
  filters: {
    role: string;
    province: string;
    city: string;
    minExperience: number | null;
    requiredSkills: string[];
    optionalSkills: string[];
    workModes: string[];
    openOnly: boolean;
  }
) {
  const checks: boolean[] = [];

  if (filters.role.trim()) {
    const expected = normalizeText(
      filters.role
    );

    const actual = normalizeText(
      candidate.candidate_role
    );

    checks.push(
      actual.includes(expected) ||
        expected.includes(actual)
    );
  }

  if (filters.province) {
    checks.push(
      normalizeText(
        candidate.preferred_province
      ) === normalizeText(filters.province)
    );
  }

  if (filters.city.trim()) {
    checks.push(
      normalizeText(
        candidate.preferred_city
      ).includes(
        normalizeText(filters.city)
      )
    );
  }

  if (
    filters.minExperience !== null
  ) {
    checks.push(
      (candidate.years_of_experience ??
        0) >= filters.minExperience
    );
  }

  const candidateSkills =
    candidate.candidate_skills ?? [];

  filters.requiredSkills.forEach((skill) => {
    checks.push(
      candidateSkills.includes(skill)
    );
  });

  filters.optionalSkills.forEach((skill) => {
    checks.push(
      candidateSkills.includes(skill)
    );
  });

  const candidateModes =
    candidate.work_modes ?? [];

  filters.workModes.forEach((mode) => {
    checks.push(
      candidateModes.includes(mode)
    );
  });

  if (filters.openOnly) {
    checks.push(
      candidate.open_to_job_offers ===
        true
    );
  }

  if (checks.length === 0) {
    return 100;
  }

  const matchedCount = checks.filter(
    Boolean
  ).length;

  return Math.round(
    (matchedCount / checks.length) * 100
  );
}

function getMatchReasons(
  candidate: Candidate,
  filters: {
    role: string;
    province: string;
    city: string;
    minExperience: number | null;
    requiredSkills: string[];
    optionalSkills: string[];
    workModes: string[];
    openOnly: boolean;
  }
) {
  const reasons: {
    label: string;
    matched: boolean;
  }[] = [];

  if (filters.role.trim()) {
    const expected = normalizeText(filters.role);
    const actual = normalizeText(
      candidate.candidate_role
    );

    reasons.push({
      label: "Stanowisko",
      matched:
        actual.includes(expected) ||
        expected.includes(actual),
    });
  }

  if (filters.province) {
    reasons.push({
      label: "Województwo",
      matched:
        normalizeText(
          candidate.preferred_province
        ) === normalizeText(filters.province),
    });
  }

  if (filters.city.trim()) {
    reasons.push({
      label: "Miasto",
      matched: normalizeText(
        candidate.preferred_city
      ).includes(normalizeText(filters.city)),
    });
  }

  if (filters.minExperience !== null) {
    reasons.push({
      label: `Minimum ${filters.minExperience} lat doświadczenia`,
      matched:
        (candidate.years_of_experience ??
          0) >= filters.minExperience,
    });
  }

  if (
    filters.requiredSkills.length > 0 ||
    filters.optionalSkills.length > 0
  ) {
    const candidateSkills =
      candidate.candidate_skills ?? [];

    filters.requiredSkills.forEach((skill) => {
      reasons.push({
        label: `${skill} — wymagane`,
        matched:
          candidateSkills.includes(skill),
      });
    });

    filters.optionalSkills.forEach((skill) => {
      reasons.push({
        label: `${skill} — dodatkowy atut`,
        matched:
          candidateSkills.includes(skill),
      });
    });
  }

  if (filters.workModes.length > 0) {
    const candidateModes =
      candidate.work_modes ?? [];

    filters.workModes.forEach((mode) => {
      reasons.push({
        label: `Praca ${mode.toLowerCase()}`,
        matched:
          candidateModes.includes(mode),
      });
    });
  }

  if (filters.openOnly) {
    reasons.push({
      label: "Otwarty na propozycje",
      matched:
        candidate.open_to_job_offers === true,
    });
  }

  return reasons;
}

function getScoreBadge(score: number) {
  if (score >= 100) {
    return {
      label: "💎 Premium",
      className:
        "bg-cyan-100 text-cyan-900",
    };
  }

  if (score >= 90) {
    return {
      label: "🥇 Złoty",
      className:
        "bg-yellow-100 text-yellow-900",
    };
  }

  if (score >= 75) {
    return {
      label: "🥈 Srebrny",
      className:
        "bg-slate-200 text-slate-800",
    };
  }

  if (score >= 50) {
    return {
      label: "🥉 Brązowy",
      className:
        "bg-orange-100 text-orange-900",
    };
  }

  return {
    label: "🌱 Podstawowy",
    className:
      "bg-green-100 text-green-900",
  };
}

export default function FindCandidatePage() {
  const [role, setRole] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [minExperience, setMinExperience] =
    useState("");
  const [requiredSkills, setRequiredSkills] =
    useState<string[]>([]);

  const [optionalSkills, setOptionalSkills] =
    useState<string[]>([]);
  const [selectedWorkModes, setSelectedWorkModes] =
    useState<string[]>([]);
  const [openOnly, setOpenOnly] = useState(true);

  const [candidates, setCandidates] =
    useState<Candidate[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] =
    useState("");

  const [showAlertForm, setShowAlertForm] =
    useState(false);

  const [savingAlert, setSavingAlert] =
    useState(false);

  const [alertSaved, setAlertSaved] =
    useState(false);

  const [employerData, setEmployerData] =
    useState({
      companyName: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
    });

  function toggleValue(
    value: string,
    current: string[],
    setter: React.Dispatch<
      React.SetStateAction<string[]>
    >
  ) {
    setter(
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    );
  }

  function cycleSkillState(skill: string) {
    const isOptional =
      optionalSkills.includes(skill);

    const isRequired =
      requiredSkills.includes(skill);

    if (!isOptional && !isRequired) {
      setOptionalSkills((previous) => [
        ...previous,
        skill,
      ]);
      return;
    }

    if (isOptional) {
      setOptionalSkills((previous) =>
        previous.filter(
          (item) => item !== skill
        )
      );

      setRequiredSkills((previous) => [
        ...previous,
        skill,
      ]);
      return;
    }

    setRequiredSkills((previous) =>
      previous.filter(
        (item) => item !== skill
      )
    );
  }

  const numericExperience = useMemo(() => {
    if (!minExperience.trim()) return null;

    const parsed = Number(minExperience);

    return Number.isFinite(parsed)
      ? parsed
      : null;
  }, [minExperience]);

  async function searchCandidates() {
    setLoading(true);
    setErrorMessage("");

    let query = supabase
      .from("profiles")
      .select(`
        id,
        name,
        city,
        avatar_url,
        verified,
        description,
        contact_sharing_consent,
        candidate_role,
        candidate_skills,
        preferred_province,
        preferred_city,
        work_modes,
        available_from,
        years_of_experience,
        open_to_job_offers,
        last_seen
      `);

    if (openOnly) {
      query = query.eq(
        "open_to_job_offers",
        true
      );
    }

    if (role.trim()) {
      query = query.ilike(
        "candidate_role",
        `%${role.trim()}%`
      );
    }

    if (province) {
      query = query.eq(
        "preferred_province",
        province
      );
    }

    // Miasto i doświadczenie wpływają na procent
    // dopasowania, ale nie usuwają kandydatów
    // z wyników wyszukiwania.

    const { data, error } = await query
      .order("verified", {
        ascending: false,
      })
      .order("last_seen", {
        ascending: false,
        nullsFirst: false,
      })
      .limit(100);

    setLoading(false);
    setSearched(true);

    if (error) {
      console.error(
        "Błąd wyszukiwania kandydatów:",
        error
      );

      setErrorMessage(
        "Nie udało się wyszukać kandydatów."
      );

      setCandidates([]);
      return;
    }

    let filtered =
      (data ?? []) as Candidate[];

    if (requiredSkills.length > 0) {
      filtered = filtered.filter(
        (candidate) => {
          const candidateSkills =
            candidate.candidate_skills ?? [];

          return requiredSkills.every(
            (skill) =>
              candidateSkills.includes(skill)
          );
        }
      );
    }

    // Umiejętności dodatkowe i forma pracy
    // wpływają na procent dopasowania,
    // ale nie usuwają kandydatów z wyników.

    const candidateIds = filtered.map(
      (candidate) => candidate.id
    );

    const adsCount = new Map<
      string,
      number
    >();

    if (candidateIds.length > 0) {
      const {
        data: advertisementsData,
        error: advertisementsError,
      } = await supabase
        .from("advertisements")
        .select("user_id")
        .eq("status", "approved")
        .in("user_id", candidateIds);

      if (advertisementsError) {
        console.error(
          "Błąd pobierania liczby ogłoszeń kandydatów:",
          advertisementsError
        );
      }

      (advertisementsData ?? []).forEach(
        (advertisement) => {
          if (!advertisement.user_id) return;

          adsCount.set(
            advertisement.user_id,
            (adsCount.get(
              advertisement.user_id
            ) ?? 0) + 1
          );
        }
      );
    }

    const preparedCandidates =
      filtered
        .map((candidate) => {
          const candidateWithAds = {
            ...candidate,
            active_ads:
              adsCount.get(candidate.id) ??
              0,
          };

          return {
            ...candidateWithAds,
            blisko_score:
              calculateBliskoScore(
                candidateWithAds
              ),
            match_score:
              calculateMatchScore(
                candidateWithAds,
                {
                  role,
                  province,
                  city,
                  minExperience:
                    numericExperience,
                  requiredSkills,
                  optionalSkills,
                  workModes:
                    selectedWorkModes,
                  openOnly,
                }
              ),
          };
        })
        .sort(
          (first, second) =>
            (second.match_score ?? 0) -
              (first.match_score ?? 0) ||
            (second.blisko_score ?? 0) -
              (first.blisko_score ?? 0)
        );

    setCandidates(preparedCandidates);
  }

  async function openAlertForm() {
    setAlertSaved(false);
    setErrorMessage("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      alert(
        "Aby zapisać alert kandydata, musisz się zalogować."
      );
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select(
        "name, company_name, phone"
      )
      .eq("id", user.id)
      .maybeSingle();

    setEmployerData({
      companyName:
        profile?.company_name ?? "",
      contactName:
        profile?.name ?? "",
      contactEmail:
        user.email ?? "",
      contactPhone:
        profile?.phone ?? "",
    });

    setShowAlertForm(true);
  }

  function updateEmployerField(
    field:
      | "companyName"
      | "contactName"
      | "contactEmail"
      | "contactPhone",
    value: string
  ) {
    setEmployerData((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function saveEmployerAlert() {
    if (savingAlert) return;

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      alert("Musisz być zalogowany.");
      return;
    }

    if (!employerData.contactEmail.trim()) {
      alert("Podaj adres e-mail do powiadomień.");
      return;
    }

    if (
      !employerData.companyName.trim() &&
      !employerData.contactName.trim()
    ) {
      alert(
        "Podaj nazwę firmy albo imię osoby kontaktowej."
      );
      return;
    }

    setSavingAlert(true);
    setErrorMessage("");

    const { error } = await supabase
      .from("employer_alerts")
      .insert({
        user_id: user.id,
        company_name:
          employerData.companyName.trim() ||
          null,
        contact_name:
          employerData.contactName.trim() ||
          null,
        contact_email:
          employerData.contactEmail.trim(),
        contact_phone:
          employerData.contactPhone.trim() ||
          null,
        role: role.trim() || null,
        province: province || null,
        city: city.trim() || null,
        min_experience:
          numericExperience,
        skills: [
          ...requiredSkills,
          ...optionalSkills,
        ],
        required_skills: requiredSkills,
        optional_skills: optionalSkills,
        work_modes: selectedWorkModes,
        open_only: openOnly,
        active: true,
      });

    setSavingAlert(false);

    if (error) {
      console.error(
        "Błąd zapisywania alertu pracodawcy:",
        error
      );

      setErrorMessage(
        "Nie udało się zapisać alertu."
      );
      return;
    }

    setAlertSaved(true);
    setShowAlertForm(false);

    alert(
      "Alert został zapisany. Powiadomienia o nowych pasujących kandydatach dodamy w kolejnym etapie."
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-blue-900 to-green-700 p-6 text-white shadow-xl sm:p-8">
          <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-green-200">
            Moduł pracodawcy
          </p>

          <h1 className="mt-3 text-3xl font-extrabold sm:text-5xl">
            🎯 Znajdź kandydata
          </h1>

          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-200">
            Wyszukuj osoby otwarte na propozycje
            pracy według stanowiska,
            doświadczenia, lokalizacji i
            umiejętności. Dane kontaktowe
            kandydatów pozostają chronione.
          </p>
        </section>

        <section className="mt-8 rounded-3xl bg-white p-5 shadow sm:p-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block font-semibold">
                Stanowisko
              </label>

              <input
                value={role}
                onChange={(event) =>
                  setRole(event.target.value)
                }
                placeholder="Np. Kierowca kat. C+E"
                className="w-full rounded-xl border p-4"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold">
                Minimalne doświadczenie
              </label>

              <input
                type="number"
                min="0"
                max="60"
                value={minExperience}
                onChange={(event) =>
                  setMinExperience(
                    event.target.value
                  )
                }
                placeholder="Np. 3 lata"
                className="w-full rounded-xl border p-4"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold">
                Województwo
              </label>

              <select
                value={province}
                onChange={(event) =>
                  setProvince(event.target.value)
                }
                className="w-full rounded-xl border p-4"
              >
                <option value="">
                  Cała Polska
                </option>

                {provinces.map((item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block font-semibold">
                Miasto
              </label>

              <input
                value={city}
                onChange={(event) =>
                  setCity(event.target.value)
                }
                placeholder="Np. Katowice"
                className="w-full rounded-xl border p-4"
              />
            </div>
          </div>

          <div className="mt-7">
            <p className="mb-3 font-semibold">
              Forma pracy
            </p>

            <div className="flex flex-wrap gap-3">
              {workModeOptions.map((mode) => {
                const selected =
                  selectedWorkModes.includes(mode);

                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() =>
                      toggleValue(
                        mode,
                        selectedWorkModes,
                        setSelectedWorkModes
                      )
                    }
                    className={`rounded-full px-4 py-2 font-semibold ${
                      selected
                        ? "bg-blue-700 text-white"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {selected ? "✓ " : ""}
                    {mode}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-7">
            <div className="mb-4">
              <p className="font-semibold">
                Umiejętności kandydata
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Klikaj kafelek, aby zmienić jego status:
                nie wybrano → dodatkowy atut → wymagane.
              </p>
            </div>

            <div className="mb-4 flex flex-wrap gap-3 text-xs font-bold">
              <span className="rounded-full bg-slate-100 px-3 py-2 text-slate-600">
                ⚪ Nie wybrano
              </span>

              <span className="rounded-full bg-green-100 px-3 py-2 text-green-800">
                🟢 Dodatkowy atut
              </span>

              <span className="rounded-full bg-red-100 px-3 py-2 text-red-800">
                🔴 Wymagane
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {skillOptions.map((skill) => {
                const isRequired =
                  requiredSkills.includes(skill);

                const isOptional =
                  optionalSkills.includes(skill);

                const stateLabel = isRequired
                  ? "🔴 Wymagane"
                  : isOptional
                    ? "🟢 Atut"
                    : "⚪ Nie wybrano";

                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() =>
                      cycleSkillState(skill)
                    }
                    className={`rounded-2xl border p-4 text-left transition ${
                      isRequired
                        ? "border-red-300 bg-red-50 text-red-900"
                        : isOptional
                          ? "border-green-300 bg-green-50 text-green-900"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span className="block font-bold">
                      {skill}
                    </span>

                    <span className="mt-1 block text-xs font-semibold">
                      {stateLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <label className="mt-7 flex cursor-pointer items-start gap-4 rounded-2xl border border-green-200 bg-green-50 p-5">
            <input
              type="checkbox"
              checked={openOnly}
              onChange={(event) =>
                setOpenOnly(
                  event.target.checked
                )
              }
              className="mt-1 h-5 w-5"
            />

            <div>
              <p className="font-bold text-slate-900">
                Tylko osoby otwarte na propozycje
              </p>

              <p className="mt-1 text-sm text-slate-600">
                Zalecane ustawienie — pokazuje
                kandydatów, którzy zgodzili się
                pojawiać w wyszukiwarce pracodawców.
              </p>
            </div>
          </label>

          <button
            type="button"
            onClick={searchCandidates}
            disabled={loading}
            className="mt-7 w-full rounded-xl bg-blue-700 px-6 py-4 text-lg font-bold text-white hover:bg-blue-800 disabled:opacity-50"
          >
            {loading
              ? "Wyszukiwanie..."
              : "🔎 Szukaj kandydatów"}
          </button>

          {errorMessage && (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 font-semibold text-red-700">
              {errorMessage}
            </div>
          )}
        </section>

        {searched && (
          <section className="mt-10">
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-700">
                  Wyniki wyszukiwania
                </p>

                <h2 className="mt-1 text-3xl font-extrabold text-slate-900">
                  Znaleziono {candidates.length}
                </h2>
              </div>

              <button
                type="button"
                onClick={openAlertForm}
                className="rounded-xl bg-green-700 px-5 py-3 font-bold text-white hover:bg-green-800"
              >
                🔔 Powiadom mnie o nowych
              </button>
            </div>

            {showAlertForm && (
              <div className="mb-8 rounded-3xl border border-green-200 bg-green-50 p-5 sm:p-7">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-green-700">
                      Alert pracodawcy
                    </p>

                    <h3 className="mt-2 text-2xl font-extrabold text-slate-900">
                      Zostaw dane do powiadomień
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Gdy pojawi się kandydat zgodny z tym wyszukiwaniem,
                      system będzie mógł wysłać informację na podany e-mail.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setShowAlertForm(false)
                    }
                    className="self-start rounded-xl bg-white px-4 py-2 font-bold text-slate-600 ring-1 ring-slate-200"
                  >
                    Zamknij
                  </button>
                </div>

                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block font-semibold">
                      Nazwa firmy
                    </label>

                    <input
                      value={employerData.companyName}
                      onChange={(event) =>
                        updateEmployerField(
                          "companyName",
                          event.target.value
                        )
                      }
                      placeholder="Np. Firma ABC"
                      className="w-full rounded-xl border border-green-200 bg-white p-4"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block font-semibold">
                      Osoba kontaktowa
                    </label>

                    <input
                      value={employerData.contactName}
                      onChange={(event) =>
                        updateEmployerField(
                          "contactName",
                          event.target.value
                        )
                      }
                      placeholder="Imię i nazwisko"
                      className="w-full rounded-xl border border-green-200 bg-white p-4"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block font-semibold">
                      E-mail do powiadomień
                    </label>

                    <input
                      type="email"
                      value={employerData.contactEmail}
                      onChange={(event) =>
                        updateEmployerField(
                          "contactEmail",
                          event.target.value
                        )
                      }
                      placeholder="firma@example.pl"
                      className="w-full rounded-xl border border-green-200 bg-white p-4"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block font-semibold">
                      Telefon
                    </label>

                    <input
                      type="tel"
                      value={employerData.contactPhone}
                      onChange={(event) =>
                        updateEmployerField(
                          "contactPhone",
                          event.target.value
                        )
                      }
                      placeholder="Np. 600 123 456"
                      className="w-full rounded-xl border border-green-200 bg-white p-4"
                    />
                  </div>
                </div>

                <div className="mt-5 rounded-2xl bg-white p-4 text-sm text-slate-600 ring-1 ring-green-200">
                  <strong>Zapisane kryteria:</strong>{" "}
                  {role.trim() || "dowolne stanowisko"}
                  {province ? ` • ${province}` : ""}
                  {city.trim() ? ` • ${city.trim()}` : ""}
                  {numericExperience !== null
                    ? ` • min. ${numericExperience} lat doświadczenia`
                    : ""}
                  {requiredSkills.length > 0
                    ? ` • wymagane: ${requiredSkills.join(", ")}`
                    : ""}
                  {optionalSkills.length > 0
                    ? ` • atuty: ${optionalSkills.join(", ")}`
                    : ""}
                </div>

                <button
                  type="button"
                  onClick={saveEmployerAlert}
                  disabled={savingAlert}
                  className="mt-5 w-full rounded-xl bg-green-700 px-6 py-4 font-bold text-white hover:bg-green-800 disabled:opacity-50"
                >
                  {savingAlert
                    ? "Zapisywanie alertu..."
                    : "🔔 Zapisz alert kandydata"}
                </button>
              </div>
            )}

            {alertSaved && (
              <div className="mb-8 rounded-2xl border border-green-200 bg-green-50 p-4 font-semibold text-green-800">
                ✅ Alert został zapisany.
              </div>
            )}

            {candidates.length === 0 ? (
              <div className="rounded-3xl bg-white p-10 text-center shadow">
                <div className="text-5xl">
                  🔎
                </div>

                <h3 className="mt-4 text-2xl font-bold">
                  Brak pasujących kandydatów
                </h3>

                <p className="mt-2 text-slate-500">
                  Zmień część filtrów albo zapisz
                  alert, aby otrzymać powiadomienie,
                  gdy pojawi się odpowiednia osoba.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {candidates.map((candidate) => (
                  <article
                    key={candidate.id}
                    className="rounded-3xl bg-white p-6 shadow"
                  >
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
                      <div className="rounded-full bg-blue-100 px-3 py-1.5 text-sm font-extrabold text-blue-800">
                        🎯 {candidate.match_score ?? 0}% dopasowania
                      </div>

                      <div
                        className={`rounded-full px-3 py-1.5 text-sm font-extrabold ${
                          getScoreBadge(
                            candidate.blisko_score ?? 0
                          ).className
                        }`}
                      >
                        🏆 BLISKO SCORE{" "}
                        {candidate.blisko_score ?? 0}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {candidate.avatar_url ? (
                        <img
                          src={candidate.avatar_url}
                          alt={
                            candidate.name ??
                            "Kandydat"
                          }
                          className="h-16 w-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 text-3xl">
                          👤
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate text-xl font-extrabold text-slate-900">
                            {candidate.name ??
                              "Kandydat BLISKO24"}
                          </h3>

                          {candidate.verified && (
                            <span
                              title="Zweryfikowany"
                              className="text-green-600"
                            >
                              ✔
                            </span>
                          )}
                        </div>

                        <p className="mt-1 font-semibold text-blue-700">
                          {candidate.candidate_role ??
                            "Nie podano stanowiska"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 space-y-2 text-sm text-slate-600">
                      <p>
                        📍{" "}
                        {[
                          candidate.preferred_province,
                          candidate.preferred_city,
                        ]
                          .filter(Boolean)
                          .join(" • ") ||
                          "Cała Polska"}
                      </p>

                      <p>
                        ⭐{" "}
                        {candidate.years_of_experience ??
                          0}{" "}
                        lat doświadczenia
                      </p>

                      <p>
                        💼{" "}
                        {candidate.work_modes?.join(
                          ", "
                        ) || "Forma do uzgodnienia"}
                      </p>

                      <p>
                        📋{" "}
                        {candidate.active_ads ?? 0}{" "}
                        aktywnych ogłoszeń
                      </p>

                      <p>
                        {candidate.available_from
                          ? `🟢 Dostępny od ${new Date(
                              candidate.available_from
                            ).toLocaleDateString(
                              "pl-PL"
                            )}`
                          : "🟡 Dostępność do uzgodnienia"}
                      </p>
                    </div>

                    {candidate.candidate_skills &&
                      candidate.candidate_skills
                        .length > 0 && (
                        <div className="mt-5 flex flex-wrap gap-2">
                          {candidate.candidate_skills
                            .slice(0, 6)
                            .map((skill) => (
                              <span
                                key={skill}
                                className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold text-green-800"
                              >
                                {skill}
                              </span>
                            ))}
                        </div>
                      )}

                    <details className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-4">
                      <summary className="cursor-pointer font-extrabold text-blue-900">
                        Dlaczego {candidate.match_score ?? 0}%?
                      </summary>

                      <div className="mt-4 space-y-2">
                        {getMatchReasons(
                          candidate,
                          {
                            role,
                            province,
                            city,
                            minExperience:
                              numericExperience,
                            requiredSkills,
                            optionalSkills,
                            workModes:
                              selectedWorkModes,
                            openOnly,
                          }
                        ).map((reason) => (
                          <div
                            key={reason.label}
                            className={`rounded-xl px-3 py-2 text-sm font-semibold ${
                              reason.matched
                                ? "bg-green-50 text-green-800"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {reason.matched
                              ? "✔"
                              : "✖"}{" "}
                            {reason.label}
                          </div>
                        ))}
                      </div>
                    </details>

                    <Link
                      href={`/profil/${candidate.id}`}
                      className="mt-6 flex w-full items-center justify-center rounded-xl bg-slate-900 px-5 py-3 font-bold text-white hover:bg-black"
                    >
                      Zobacz profil
                    </Link>

                    <div className="mt-3 rounded-xl bg-blue-50 p-3 text-center text-xs font-semibold text-blue-800">
                      🔒 Dane kontaktowe chronione
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}