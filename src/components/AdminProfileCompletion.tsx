"use client";

import { useEffect, useMemo, useState } from "react";

import { supabase } from "../lib/supabase";

type AccountType = "candidate" | "employer" | "both";

type TargetProfile = {
  account_type: AccountType | null;
  name: string | null;
  city: string | null;
  description: string | null;
  company_name: string | null;
  company_description: string | null;
  candidate_role: string | null;
  candidate_skills: string[] | null;
  preferred_province: string | null;
  preferred_city: string | null;
  work_modes: string[] | null;
  open_to_job_offers: boolean | null;
  contact_sharing_consent: boolean | null;
};

type CheckItem = {
  label: string;
  completed: boolean;
};

type Props = {
  userId: string;
};

function normalizeAccountType(value: unknown): AccountType {
  if (value === "employer" || value === "both") {
    return value;
  }

  return "candidate";
}

export default function AdminProfileCompletion({
  userId,
}: Props) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] =
    useState<TargetProfile | null>(null);
  const [privatePhone, setPrivatePhone] =
    useState("");
  const [activeAlertsCount, setActiveAlertsCount] =
    useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (!cancelled) setLoading(false);
        return;
      }

      const { data: adminProfile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .maybeSingle();

      if (cancelled) return;

      if (adminProfile?.is_admin !== true) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setIsAdmin(true);

      const [
        profileResult,
        contactResult,
        alertsResult,
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select(`
            account_type,
            name,
            city,
            description,
            company_name,
            company_description,
            candidate_role,
            candidate_skills,
            preferred_province,
            preferred_city,
            work_modes,
            open_to_job_offers,
            contact_sharing_consent
          `)
          .eq("id", userId)
          .maybeSingle(),

        supabase
          .from("candidate_contacts")
          .select("phone")
          .eq("candidate_id", userId)
          .maybeSingle(),

        supabase
          .from("employer_alerts")
          .select("*", {
            count: "exact",
            head: true,
          })
          .eq("user_id", userId)
          .eq("active", true),
      ]);

      if (cancelled) return;

      if (profileResult.data) {
        setProfile(
          profileResult.data as TargetProfile
        );
      }

      setPrivatePhone(
        contactResult.data?.phone ?? ""
      );

      setActiveAlertsCount(
        alertsResult.count ?? 0
      );

      setLoading(false);
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const checks = useMemo<CheckItem[]>(() => {
    if (!profile) return [];

    const accountType = normalizeAccountType(
      profile.account_type
    );

    const candidateEnabled =
      accountType === "candidate" ||
      accountType === "both";

    const employerEnabled =
      accountType === "employer" ||
      accountType === "both";

    const items: CheckItem[] = [];

    if (candidateEnabled) {
      items.push(
        {
          label: "Nazwa / imię profilu",
          completed:
            (profile.name ?? "").trim().length >
            0,
        },
        {
          label: "Opis kandydata",
          completed:
            (profile.description ?? "")
              .trim().length > 0,
        },
        {
          label: "Poszukiwane stanowisko",
          completed:
            (profile.candidate_role ?? "")
              .trim().length > 0,
        },
        {
          label: "Umiejętności",
          completed:
            Array.isArray(
              profile.candidate_skills
            ) &&
            profile.candidate_skills.length > 0,
        },
        {
          label: "Lokalizacja",
          completed:
            (profile.preferred_province ?? "")
              .trim().length > 0 ||
            (profile.preferred_city ?? "")
              .trim().length > 0 ||
            (profile.city ?? "").trim()
              .length > 0,
        },
        {
          label: "Forma pracy",
          completed:
            Array.isArray(profile.work_modes) &&
            profile.work_modes.length > 0,
        },
        {
          label: "Włączone propozycje pracy",
          completed:
            profile.open_to_job_offers === true,
        },
        {
          label:
            "Prywatny kontakt i zgoda na udostępnianie",
          completed:
            privatePhone.trim().length > 0 &&
            profile.contact_sharing_consent ===
              true,
        }
      );
    }

    if (employerEnabled) {
      if (
        !items.some(
          (item) =>
            item.label ===
            "Nazwa / imię profilu"
        )
      ) {
        items.push({
          label: "Nazwa / imię profilu",
          completed:
            (profile.name ?? "").trim().length >
            0,
        });
      }

      items.push(
        {
          label: "Nazwa firmy",
          completed:
            (profile.company_name ?? "")
              .trim().length > 0,
        },
        {
          label: "Opis firmy",
          completed:
            (profile.company_description ?? "")
              .trim().length > 0,
        },
        {
          label: "Miasto firmy",
          completed:
            (profile.city ?? "").trim()
              .length > 0,
        },
        {
          label: "Aktywny alert kandydata",
          completed: activeAlertsCount > 0,
        }
      );
    }

    return items;
  }, [activeAlertsCount, privatePhone, profile]);

  if (!isAdmin || loading || !profile) {
    return null;
  }

  const completed = checks.filter(
    (item) => item.completed
  ).length;

  const percentage =
    checks.length > 0
      ? Math.round(
          (completed / checks.length) * 100
        )
      : 0;

  const missing = checks.filter(
    (item) => !item.completed
  );

  return (
    <section className="mt-10 overflow-hidden rounded-3xl border-2 border-violet-200 bg-white shadow">
      <div className="border-b border-violet-100 bg-violet-50 p-5 sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-violet-700">
              👑 Widok administratora
            </p>

            <h2 className="mt-2 text-2xl font-extrabold text-slate-950 sm:text-3xl">
              Kompletność profilu: {percentage}%
            </h2>

            <p className="mt-2 text-slate-600">
              Ukończono {completed} z{" "}
              {checks.length} wymaganych elementów.
            </p>
          </div>

          <div
            className={`rounded-2xl px-5 py-3 text-center font-extrabold ${
              percentage === 100
                ? "bg-green-100 text-green-800"
                : percentage >= 60
                  ? "bg-amber-100 text-amber-800"
                  : "bg-red-100 text-red-700"
            }`}
          >
            {percentage === 100
              ? "Profil kompletny"
              : `${missing.length} braków`}
          </div>
        </div>

        <div className="mt-5 h-4 overflow-hidden rounded-full bg-white ring-1 ring-violet-200">
          <div
            className={`h-full rounded-full transition-all ${
              percentage === 100
                ? "bg-green-600"
                : percentage >= 60
                  ? "bg-amber-500"
                  : "bg-red-600"
            }`}
            style={{
              width: `${percentage}%`,
            }}
          />
        </div>
      </div>

      {missing.length > 0 ? (
        <div className="p-5 sm:p-7">
          <p className="font-extrabold text-slate-900">
            Brakuje:
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {missing.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-800"
              >
                <span>✕</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-5 font-bold text-green-800 sm:p-7">
          ✅ Wszystkie najważniejsze elementy profilu są uzupełnione.
        </div>
      )}
    </section>
  );
}