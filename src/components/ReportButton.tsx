"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function ReportButton({
  advertisementId,
}: {
  advertisementId: number;
}) {
  const [loading, setLoading] = useState(false);

  async function reportAdvertisement() {
    const reason = prompt(
      "Podaj powód zgłoszenia (np. Spam, Oszustwo, Nieaktualne):"
    );

    if (!reason) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Musisz być zalogowany.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("reports").insert({
      advertisement_id: advertisementId,
      user_id: user.id,
      reason,
    });

    setLoading(false);

    if (error) {
      alert("Nie udało się wysłać zgłoszenia.");
      console.error(error);
      return;
    }

    alert("Dziękujemy! Zgłoszenie zostało wysłane.");
  }

  return (
    <button
      onClick={reportAdvertisement}
      disabled={loading}
      className="rounded-xl bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
    >
      🚩 Zgłoś ogłoszenie
    </button>
  );
}