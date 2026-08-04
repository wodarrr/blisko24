"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { supabase } from "../../lib/supabase";

type Props = {
  advertisementId: number;
  ownerId: string | null;
};

export default function OwnerPromotionButton({
  advertisementId,
  ownerId,
}: Props) {
  const [isOwner, setIsOwner] =
    useState(false);

  const [category, setCategory] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      if (!ownerId) {
        if (!cancelled) {
          setLoading(false);
        }

        return;
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (cancelled) return;

      if (userError || !user) {
        setIsOwner(false);
        setLoading(false);
        return;
      }

      const ownerMatches =
        user.id === ownerId;

      setIsOwner(ownerMatches);

      if (!ownerMatches) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("advertisements")
        .select("category")
        .eq("id", advertisementId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        console.error(
          "Błąd pobierania kategorii ogłoszenia:",
          error
        );

        setLoading(false);
        return;
      }

      setCategory(data?.category ?? null);
      setLoading(false);
    }

    initialize();

    return () => {
      cancelled = true;
    };
  }, [advertisementId, ownerId]);

  if (loading || !isOwner) {
    return null;
  }

  if (category === "Szukam pracy") {
    return (
      <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4">
        <p className="font-bold text-green-800">
          👤 Ogłoszenie kandydata
        </p>

        <p className="mt-2 text-sm leading-6 text-green-700">
          Ogłoszenia w kategorii „Szukam pracy”
          są zawsze bezpłatne i nie wymagają
          promowania.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-4">
      <p className="text-sm font-semibold text-yellow-900">
        To Twoje ogłoszenie
      </p>

      <Link
        href={`/promuj-ogloszenie/${advertisementId}`}
        className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-yellow-400 px-5 py-3 font-extrabold text-slate-900 transition hover:bg-yellow-500 sm:w-auto"
      >
        🚀 Promuj ogłoszenie
      </Link>

      <p className="mt-2 text-xs text-yellow-800">
        Na razie promocje pozostają testowe
        i bez płatności.
      </p>
    </div>
  );
}