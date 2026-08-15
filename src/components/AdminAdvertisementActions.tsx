"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type AdvertisementData = {
  id: number;
  user_id: string | null;
  title: string | null;
  status: string | null;
  rejection_reason: string | null;
};

type Props = { advertisementId: number };

export default function AdminAdvertisementActions({ advertisementId }: Props) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentAdminId, setCurrentAdminId] = useState("");
  const [advertisement, setAdvertisement] = useState<AdvertisementData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (cancelled) return;

      if (userError || !user) {
        setLoading(false);
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .maybeSingle();

      if (cancelled) return;

      if (profileError || profileData?.is_admin !== true) {
        setLoading(false);
        return;
      }

      setIsAdmin(true);
      setCurrentAdminId(user.id);

      const { data, error } = await supabase
        .from("advertisements")
        .select("id, user_id, title, status, rejection_reason")
        .eq("id", advertisementId)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        console.error("Błąd pobierania danych ogłoszenia dla administratora:", error);
      } else {
        setAdvertisement(data as AdvertisementData | null);
      }

      setLoading(false);
    }

    void loadData();

    return () => {
      cancelled = true;
    };
  }, [advertisementId]);

  async function approveAdvertisement() {
    if (!advertisement || !currentAdminId || processing) return;

    const confirmed = window.confirm(
      "Czy zatwierdzić to ogłoszenie i opublikować je na portalu?"
    );
    if (!confirmed) return;

    setProcessing(true);
    const approvedAt = new Date().toISOString();

    const { data, error } = await supabase
      .from("advertisements")
      .update({
        status: "approved",
        approved_at: approvedAt,
        approved_by: currentAdminId,
      })
      .eq("id", advertisement.id)
      .eq("status", "pending")
      .select("id, user_id, title")
      .maybeSingle();

    if (error) {
      console.error("Błąd zatwierdzania ogłoszenia:", error);
      setProcessing(false);
      alert("Nie udało się zatwierdzić ogłoszenia.");
      return;
    }

    if (!data) {
      setProcessing(false);
      alert("Ogłoszenie nie zostało zatwierdzone. Mogło już zmienić status.");
      window.location.reload();
      return;
    }

    if (data.user_id) {
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert({
          user_id: data.user_id,
          title: "Ogłoszenie opublikowane",
          message: `Twoje ogłoszenie „${data.title || "Bez tytułu"}” zostało zaakceptowane i jest już widoczne publicznie.`,
          type: "advertisement_approved",
          is_read: false,
        });

      if (notificationError) {
        console.error("Błąd tworzenia powiadomienia:", notificationError);
      }
    }

    setAdvertisement((previous) =>
      previous ? { ...previous, status: "approved", rejection_reason: null } : previous
    );
    setProcessing(false);
    alert("Ogłoszenie zostało zatwierdzone i jest już publiczne.");
  }

  async function rejectAdvertisement() {
    if (!advertisement || !currentAdminId || processing) return;

    const reason = window.prompt("Podaj krótki powód odrzucenia ogłoszenia:");
    if (reason === null) return;

    const normalizedReason = reason.trim();

    if (!normalizedReason) {
      alert("Podaj powód odrzucenia ogłoszenia.");
      return;
    }

    const confirmed = window.confirm(
      "Czy na pewno odrzucić to ogłoszenie? Pozostanie ono w historii użytkownika ze statusem „Odrzucone”."
    );
    if (!confirmed) return;

    setProcessing(true);
    const rejectedAt = new Date().toISOString();

    const { data, error } = await supabase
      .from("advertisements")
      .update({
        status: "rejected",
        rejected_at: rejectedAt,
        rejected_by: currentAdminId,
        rejection_reason: normalizedReason,
        approved_at: null,
        approved_by: null,
      })
      .eq("id", advertisement.id)
      .eq("status", "pending")
      .select("id, user_id, title")
      .maybeSingle();

    if (error) {
      console.error("Błąd odrzucania ogłoszenia:", error);
      setProcessing(false);
      alert("Nie udało się odrzucić ogłoszenia.");
      return;
    }

    if (!data) {
      setProcessing(false);
      alert("Ogłoszenie nie zostało odrzucone. Mogło już zmienić status.");
      window.location.reload();
      return;
    }

    if (data.user_id) {
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert({
          user_id: data.user_id,
          title: "Ogłoszenie odrzucone",
          message: `Twoje ogłoszenie „${data.title || "Bez tytułu"}” zostało odrzucone. Powód: ${normalizedReason}`,
          type: "advertisement_rejected",
          is_read: false,
        });

      if (notificationError) {
        console.error("Błąd tworzenia powiadomienia:", notificationError);
      }
    }

    setAdvertisement((previous) =>
      previous
        ? { ...previous, status: "rejected", rejection_reason: normalizedReason }
        : previous
    );
    setProcessing(false);
    alert("Ogłoszenie zostało odrzucone. Użytkownik otrzymał powiadomienie.");
  }

  if (loading || !isAdmin || !advertisement) return null;

  const statusLabel =
    advertisement.status === "pending"
      ? "Do sprawdzenia"
      : advertisement.status === "approved"
        ? "Zaakceptowane"
        : advertisement.status === "rejected"
          ? "Odrzucone"
          : advertisement.status || "Brak statusu";

  return (
    <section className="mt-8 rounded-3xl border-2 border-red-200 bg-red-50 p-5 shadow-sm sm:p-7">
      <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-red-700">
        👑 Panel administratora
      </p>

      <h2 className="mt-2 text-2xl font-extrabold text-slate-950">
        Moderacja tego ogłoszenia
      </h2>

      <p className="mt-2 text-slate-700">
        Status: <strong>{statusLabel}</strong>
      </p>

      {advertisement.status === "rejected" && advertisement.rejection_reason && (
        <p className="mt-3 rounded-xl bg-white p-3 text-sm text-red-800">
          Powód odrzucenia: <strong>{advertisement.rejection_reason}</strong>
        </p>
      )}

      {advertisement.status === "pending" ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={approveAdvertisement}
            disabled={processing}
            className="min-h-14 rounded-xl bg-green-600 px-5 py-3 font-extrabold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {processing ? "Przetwarzanie..." : "✅ Zaakceptuj ogłoszenie"}
          </button>

          <button
            type="button"
            onClick={rejectAdvertisement}
            disabled={processing}
            className="min-h-14 rounded-xl bg-red-600 px-5 py-3 font-extrabold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {processing ? "Przetwarzanie..." : "❌ Odrzuć ogłoszenie"}
          </button>
        </div>
      ) : (
        <p className="mt-5 rounded-xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-700">
          To ogłoszenie zostało już zmoderowane.
        </p>
      )}
    </section>
  );
}