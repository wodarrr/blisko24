"use client";

import { useEffect, useState } from "react";

import { supabase } from "../lib/supabase";

type VerificationStatus =
  | "pending"
  | "changes_requested"
  | "verified"
  | string;

type ProfileModerationData = {
  id: string;
  name: string | null;
  verified: boolean | null;
  verification_status: VerificationStatus | null;
  verification_note: string | null;
  blocked: boolean | null;
  blocked_reason: string | null;
};

type Props = {
  userId: string;
};

export default function AdminProfileActions({
  userId,
}: Props) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentAdminId, setCurrentAdminId] = useState("");
  const [profile, setProfile] =
    useState<ProfileModerationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (cancelled) return;

      if (userError || !user) {
        setLoading(false);
        return;
      }

      const { data: adminProfile, error: adminError } =
        await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .maybeSingle();

      if (cancelled) return;

      if (adminError || adminProfile?.is_admin !== true) {
        setLoading(false);
        return;
      }

      setIsAdmin(true);
      setCurrentAdminId(user.id);

      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, name, verified, verification_status, verification_note, blocked, blocked_reason"
        )
        .eq("id", userId)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        console.error(
          "Błąd pobierania danych profilu do moderacji:",
          error
        );
      } else {
        setProfile(
          data as ProfileModerationData | null
        );
      }

      setLoading(false);
    }

    void loadData();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  async function sendNotification(
    title: string,
    message: string,
    type: string
  ) {
    const { error } = await supabase
      .from("notifications")
      .insert({
        user_id: userId,
        title,
        message,
        type,
        is_read: false,
      });

    if (error) {
      console.error(
        "Błąd tworzenia powiadomienia:",
        error
      );
    }
  }

  async function updateProfile(
    changes: Record<string, unknown>
  ) {
    const { data, error } = await supabase
      .from("profiles")
      .update(changes)
      .eq("id", userId)
      .select(
        "id, name, verified, verification_status, verification_note, blocked, blocked_reason"
      )
      .maybeSingle();

    if (error) {
      console.error(
        "Błąd aktualizacji profilu:",
        error
      );
      alert("Nie udało się zaktualizować profilu.");
      return false;
    }

    if (data) {
      setProfile(
        data as ProfileModerationData
      );
    }

    return true;
  }

  async function verifyProfile() {
    if (!profile || !currentAdminId || processing) return;

    const confirmed = window.confirm(
      "Czy zweryfikować ten profil?"
    );

    if (!confirmed) return;

    setProcessing(true);

    const now = new Date().toISOString();

    const success = await updateProfile({
      verified: true,
      verified_at: now,
      verification_status: "verified",
      verification_note: null,
      verification_reviewed_at: now,
      verification_reviewed_by: currentAdminId,
    });

    if (success) {
      await sendNotification(
        "Profil zweryfikowany",
        "Twój profil został zweryfikowany przez administratora BLISKO24.",
        "profile_verified"
      );

      alert("Profil został zweryfikowany.");
    }

    setProcessing(false);
  }

  async function revokeVerification() {
    if (!profile || !currentAdminId || processing) return;

    const confirmed = window.confirm(
      "Czy cofnąć weryfikację tego profilu?"
    );

    if (!confirmed) return;

    setProcessing(true);

    const success = await updateProfile({
      verified: false,
      verified_at: null,
      verification_status: "pending",
      verification_note: null,
      verification_reviewed_at:
        new Date().toISOString(),
      verification_reviewed_by: currentAdminId,
    });

    if (success) {
      await sendNotification(
        "Weryfikacja profilu została cofnięta",
        "Twój profil ponownie oczekuje na sprawdzenie przez administratora BLISKO24.",
        "profile_verification_revoked"
      );

      alert("Weryfikacja została cofnięta.");
    }

    setProcessing(false);
  }

  async function requestChanges() {
    if (!profile || !currentAdminId || processing) return;

    const reason = window.prompt(
      "Napisz użytkownikowi, co powinien poprawić w profilu:"
    );

    if (reason === null) return;

    const normalizedReason = reason.trim();

    if (normalizedReason.length < 5) {
      alert(
        "Wiadomość powinna mieć przynajmniej 5 znaków."
      );
      return;
    }

    const confirmed = window.confirm(
      "Czy wysłać użytkownikowi prośbę o poprawę profilu?"
    );

    if (!confirmed) return;

    setProcessing(true);

    const now = new Date().toISOString();

    const success = await updateProfile({
      verified: false,
      verified_at: null,
      verification_status: "changes_requested",
      verification_note: normalizedReason,
      verification_reviewed_at: now,
      verification_reviewed_by: currentAdminId,
    });

    if (success) {
      await sendNotification(
        "Profil wymaga poprawy",
        `Administrator BLISKO24 poprosił o poprawę danych profilu. Powód: ${normalizedReason}`,
        "profile_changes_requested"
      );

      alert(
        "Użytkownik otrzymał prośbę o poprawę danych."
      );
    }

    setProcessing(false);
  }

  async function markAsPending() {
    if (!profile || !currentAdminId || processing) return;

    const confirmed = window.confirm(
      "Czy przywrócić status „Do sprawdzenia”?"
    );

    if (!confirmed) return;

    setProcessing(true);

    const success = await updateProfile({
      verified: false,
      verified_at: null,
      verification_status: "pending",
      verification_note: null,
      verification_reviewed_at:
        new Date().toISOString(),
      verification_reviewed_by: currentAdminId,
    });

    if (success) {
      alert("Profil ma teraz status „Do sprawdzenia”.");
    }

    setProcessing(false);
  }

  async function toggleBlocked() {
    if (!profile || processing) return;

    if (profile.id === currentAdminId) {
      alert(
        "Nie możesz zablokować własnego konta administratora."
      );
      return;
    }

    if (profile.blocked) {
      const confirmed = window.confirm(
        "Czy odblokować tego użytkownika?"
      );

      if (!confirmed) return;

      setProcessing(true);

      const success = await updateProfile({
        blocked: false,
        blocked_at: null,
        blocked_reason: null,
      });

      if (success) {
        await sendNotification(
          "Konto odblokowane",
          "Twoje konto w BLISKO24 zostało odblokowane.",
          "profile_unblocked"
        );

        alert("Użytkownik został odblokowany.");
      }

      setProcessing(false);
      return;
    }

    const reason = window.prompt(
      "Podaj powód zablokowania użytkownika:"
    );

    if (reason === null) return;

    const normalizedReason = reason.trim();

    if (normalizedReason.length < 3) {
      alert("Podaj krótki powód blokady.");
      return;
    }

    const confirmed = window.confirm(
      "Czy na pewno zablokować tego użytkownika?"
    );

    if (!confirmed) return;

    setProcessing(true);

    const success = await updateProfile({
      blocked: true,
      blocked_at: new Date().toISOString(),
      blocked_reason: normalizedReason,
    });

    if (success) {
      await sendNotification(
        "Konto zablokowane",
        `Twoje konto w BLISKO24 zostało zablokowane. Powód: ${normalizedReason}`,
        "profile_blocked"
      );

      alert("Użytkownik został zablokowany.");
    }

    setProcessing(false);
  }

  if (loading || !isAdmin || !profile) {
    return null;
  }

  const statusLabel =
    profile.verification_status === "verified"
      ? "Zweryfikowany"
      : profile.verification_status === "changes_requested"
        ? "Wymaga poprawy"
        : "Do sprawdzenia";

  return (
    <section className="mt-12 rounded-3xl border-2 border-red-200 bg-red-50 p-5 shadow-sm sm:p-7">
      <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-red-700">
        👑 Panel administratora
      </p>

      <h2 className="mt-2 text-2xl font-extrabold text-slate-950">
        Moderacja tego profilu
      </h2>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-white px-3 py-1.5 text-sm font-bold text-slate-800">
          Status: {statusLabel}
        </span>

        {profile.blocked && (
          <span className="rounded-full bg-red-600 px-3 py-1.5 text-sm font-bold text-white">
            Zablokowany
          </span>
        )}
      </div>

      {profile.verification_note && (
        <p className="mt-4 rounded-xl bg-white p-4 text-sm text-slate-800">
          Uwagi:{" "}
          <strong>{profile.verification_note}</strong>
        </p>
      )}

      {profile.blocked &&
        profile.blocked_reason && (
          <p className="mt-3 rounded-xl bg-white p-4 text-sm text-red-800">
            Powód blokady:{" "}
            <strong>{profile.blocked_reason}</strong>
          </p>
        )}

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {profile.verified ? (
          <button
            type="button"
            onClick={revokeVerification}
            disabled={processing}
            className="min-h-14 rounded-xl bg-amber-500 px-5 py-3 font-extrabold text-slate-950 transition hover:bg-amber-600 disabled:opacity-50"
          >
            Cofnij weryfikację
          </button>
        ) : (
          <button
            type="button"
            onClick={verifyProfile}
            disabled={processing}
            className="min-h-14 rounded-xl bg-green-600 px-5 py-3 font-extrabold text-white transition hover:bg-green-700 disabled:opacity-50"
          >
            ✅ Zweryfikuj profil
          </button>
        )}

        {profile.verification_status ===
        "changes_requested" ? (
          <button
            type="button"
            onClick={markAsPending}
            disabled={processing}
            className="min-h-14 rounded-xl bg-blue-700 px-5 py-3 font-extrabold text-white transition hover:bg-blue-800 disabled:opacity-50"
          >
            Do sprawdzenia
          </button>
        ) : (
          <button
            type="button"
            onClick={requestChanges}
            disabled={processing}
            className="min-h-14 rounded-xl bg-orange-500 px-5 py-3 font-extrabold text-white transition hover:bg-orange-600 disabled:opacity-50"
          >
            ✏️ Poproś o poprawę
          </button>
        )}

        <button
          type="button"
          onClick={toggleBlocked}
          disabled={processing}
          className={`min-h-14 rounded-xl px-5 py-3 font-extrabold text-white transition disabled:opacity-50 ${
            profile.blocked
              ? "bg-slate-700 hover:bg-slate-800"
              : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {profile.blocked
            ? "🔓 Odblokuj użytkownika"
            : "⛔ Zablokuj użytkownika"}
        </button>
      </div>
    </section>
  );
}