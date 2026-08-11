"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { supabase } from "../lib/supabase";

type Employer = {
  id: string;
  name: string | null;
  city: string | null;

  company_name: string | null;
  company_description: string | null;
  company_logo: string | null;

  account_type:
    | "candidate"
    | "employer"
    | "both"
    | null;

  blocked: boolean | null;
  is_admin: boolean | null;

  created_at: string | null;
  verified: boolean | null;
};

function getEmployerName(employer: Employer) {
  return (
    employer.company_name?.trim() ||
    employer.name?.trim() ||
    ""
  );
}

export default function RecentEmployers() {
  const [employers, setEmployers] =
    useState<Employer[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadEmployers() {
      setLoading(true);

      const { data, error } =
        await supabase
          .from("profiles")
          .select(
            `
              id,
              name,
              city,
              company_name,
              company_description,
              company_logo,
              account_type,
              blocked,
              is_admin,
              created_at,
              verified
            `
          )
          .in("account_type", [
            "employer",
            "both",
          ])
          .or(
            "blocked.eq.false,blocked.is.null"
          )
          .or(
            "is_admin.eq.false,is_admin.is.null"
          )
          .order("created_at", {
            ascending: false,
          })
          .limit(12);

      if (cancelled) return;

      if (error) {
        console.error(
          "Błąd pobierania ostatnich pracodawców:",
          error
        );

        setEmployers([]);
        setLoading(false);

        return;
      }

      const validEmployers =
        ((data ?? []) as Employer[])
          .filter((employer) => {
            const employerName =
              getEmployerName(employer);

            return (
              employerName.length > 0 &&
              employer.is_admin !== true
            );
          })
          .slice(0, 6);

      setEmployers(validEmployers);
      setLoading(false);
    }

    void loadEmployers();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <section className="bg-slate-50 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            Ładowanie ostatnich pracodawców...
          </div>
        </div>
      </section>
    );
  }

  if (employers.length === 0) {
    return null;
  }

  return (
    <section className="bg-slate-50 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700">
              <span>●</span>
              Pracodawcy na BLISKO24
            </div>

            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Ostatnio dołączyli pracodawcy
            </h2>

            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              Firmy i pracodawcy również
              dołączają do BLISKO24.
              Sprawdź najnowsze profile.
            </p>
          </div>

          <Link
            href="/znajdz-kandydata"
            className="inline-flex items-center justify-center rounded-xl bg-blue-700 px-6 py-3 font-bold text-white shadow transition hover:bg-blue-800"
          >
            🏢 Dla pracodawców
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {employers.map((employer) => {
            const employerName =
              getEmployerName(employer);

            const description =
              employer.company_description?.trim();

            return (
              <article
                key={employer.id}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
              >
                <div className="flex items-start gap-4">
                  {employer.company_logo ? (
                    <img
                      src={employer.company_logo}
                      alt={employerName}
                      className="h-14 w-14 shrink-0 rounded-2xl object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-2xl">
                      🏢
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                      Pracodawca
                    </p>

                    <h3 className="mt-1 break-words text-xl font-extrabold text-slate-900">
                      {employerName}
                    </h3>

                    {employer.city && (
                      <p className="mt-2 text-sm font-semibold text-slate-600">
                        📍 {employer.city}
                      </p>
                    )}
                  </div>
                </div>

                {description && (
                  <p className="mt-5 line-clamp-3 text-sm leading-6 text-slate-600">
                    {description}
                  </p>
                )}

                {employer.verified && (
                  <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-green-700">
                    <span>✓</span>
                    Profil zweryfikowany
                  </p>
                )}

                <Link
                  href={`/profil/${employer.id}`}
                  className="mt-6 inline-flex w-full items-center justify-center rounded-xl border border-slate-200 px-4 py-3 font-bold text-slate-800 transition group-hover:border-blue-600 group-hover:bg-blue-50 group-hover:text-blue-700"
                >
                  Zobacz profil →
                </Link>
              </article>
            );
          })}
        </div>

        <div className="mt-8 rounded-2xl bg-white p-5 sm:flex sm:items-center sm:justify-between sm:gap-6">
          <div>
            <p className="font-extrabold text-slate-900">
              Jesteś pracodawcą?
            </p>

            <p className="mt-1 text-sm text-slate-600">
              Utwórz profil i korzystaj z
              wyszukiwarki kandydatów BLISKO24.
            </p>
          </div>

          <Link
            href="/logowanie"
            className="mt-4 inline-flex rounded-xl bg-slate-900 px-5 py-3 font-bold text-white transition hover:bg-slate-800 sm:mt-0"
          >
            Dołącz jako pracodawca
          </Link>
        </div>
      </div>
    </section>
  );
}