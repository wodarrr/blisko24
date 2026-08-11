"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { supabase } from "../lib/supabase";

type Candidate = {
  id: string;
  name: string | null;
  city: string | null;
  avatar_url: string | null;

  candidate_role: string | null;

  preferred_province: string | null;
  preferred_city: string | null;

  years_of_experience: number | null;

  account_type:
    | "candidate"
    | "employer"
    | "both"
    | null;

  open_to_job_offers: boolean | null;

  blocked: boolean | null;
  is_admin: boolean | null;

  created_at: string | null;

  verified: boolean | null;
};

function formatExperience(
  years?: number | null
) {
  if (
    years === null ||
    years === undefined
  ) {
    return null;
  }

  if (years === 0) {
    return "Bez doświadczenia";
  }

  if (years === 1) {
    return "1 rok doświadczenia";
  }

  if (
    years >= 2 &&
    years <= 4
  ) {
    return `${years} lata doświadczenia`;
  }

  return `${years} lat doświadczenia`;
}

function getLocation(candidate: Candidate) {
  const city =
    candidate.preferred_city?.trim() ||
    candidate.city?.trim();

  const province =
    candidate.preferred_province?.trim();

  if (city && province) {
    return `${city}, ${province}`;
  }

  if (city) {
    return city;
  }

  if (province) {
    return province;
  }

  return "Lokalizacja do ustalenia";
}

export default function RecentCandidates() {
  const [candidates, setCandidates] =
    useState<Candidate[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadCandidates() {
      setLoading(true);

      const { data, error } =
        await supabase
          .from("profiles")
          .select(
            `
              id,
              name,
              city,
              avatar_url,
              candidate_role,
              preferred_province,
              preferred_city,
              years_of_experience,
              account_type,
              open_to_job_offers,
              blocked,
              is_admin,
              created_at,
              verified
            `
          )
          .in("account_type", [
            "candidate",
            "both",
          ])
          .eq(
            "open_to_job_offers",
            true
          )
          .or(
            "blocked.eq.false,blocked.is.null"
          )
          .or(
            "is_admin.eq.false,is_admin.is.null"
          )
          .not(
            "candidate_role",
            "is",
            null
          )
          .order("created_at", {
            ascending: false,
          })
          .limit(10);

      if (cancelled) return;

      if (error) {
        console.error(
          "Błąd pobierania ostatnich kandydatów:",
          error
        );

        setCandidates([]);
        setLoading(false);

        return;
      }

      const validCandidates =
        ((data ?? []) as Candidate[])
          .filter(
            (candidate) =>
              candidate.candidate_role?.trim() &&
              candidate.is_admin !== true
          )
          .slice(0, 3);

      setCandidates(validCandidates);
      setLoading(false);
    }

    void loadCandidates();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <section className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
            Ładowanie ostatnich kandydatów...
          </div>
        </div>
      </section>
    );
  }

  if (candidates.length === 0) {
    return null;
  }

  return (
    <section className="bg-white pb-8 pt-12 sm:pb-10 sm:pt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm font-bold text-green-700">
              <span>●</span>
              Kandydaci na BLISKO24
            </div>

            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Ostatnio dołączyli kandydaci
            </h2>

            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              Poznaj osoby, które są otwarte
              na nowe propozycje pracy.
              Nowe profile pojawiają się
              na BLISKO24 na bieżąco.
            </p>
          </div>

          <Link
            href="/znajdz-kandydata"
            className="inline-flex items-center justify-center rounded-xl bg-green-600 px-6 py-3 font-bold text-white shadow transition hover:bg-green-700"
          >
            🎯 Znajdź kandydata
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {candidates.map((candidate) => {
            const role =
              candidate.candidate_role?.trim() ||
              "Kandydat";

            const name =
              candidate.name?.trim();

            const experience =
              formatExperience(
                candidate.years_of_experience
              );

            const location =
              getLocation(candidate);

            return (
              <article
                key={candidate.id}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-green-200 hover:shadow-lg"
              >
                <div className="flex items-start gap-4">
                  {candidate.avatar_url ? (
                    <img
                      src={candidate.avatar_url}
                      alt={
                        name ||
                        "Kandydat BLISKO24"
                      }
                      className="h-14 w-14 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-green-100 text-2xl">
                      👤
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wide text-green-700">
                      Otwarty na oferty
                    </p>

                    <h3 className="mt-1 break-words text-xl font-extrabold text-slate-900">
                      {role}
                    </h3>

                    {name && (
                      <p className="mt-1 truncate text-sm font-semibold text-slate-600">
                        {name}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-5 space-y-3 text-sm text-slate-600">
                  <p className="flex items-start gap-2">
                    <span>📍</span>
                    <span>{location}</span>
                  </p>

                  {experience && (
                    <p className="flex items-start gap-2">
                      <span>💼</span>
                      <span>{experience}</span>
                    </p>
                  )}

                  {candidate.verified && (
                    <p className="flex items-center gap-2 font-semibold text-green-700">
                      <span>✓</span>
                      Profil zweryfikowany
                    </p>
                  )}
                </div>

                <Link
                  href={`/profil/${candidate.id}`}
                  className="mt-6 inline-flex w-full items-center justify-center rounded-xl border border-slate-200 px-4 py-3 font-bold text-slate-800 transition group-hover:border-green-600 group-hover:bg-green-50 group-hover:text-green-700"
                >
                  Zobacz profil →
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}