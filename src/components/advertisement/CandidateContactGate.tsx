"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { supabase } from "../../lib/supabase";

type Props = {
  advertisementId: number;
  ownerId: string | null;
};

export default function CandidateContactGate({
  advertisementId,
  ownerId,
}: Props) {
  const [isOwner, setIsOwner] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    let cancelled = false;

    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (cancelled) return;

      setIsOwner(
        Boolean(user && ownerId && user.id === ownerId)
      );

      setLoading(false);
    }

    checkUser();

    return () => {
      cancelled = true;
    };
  }, [ownerId]);

  if (loading) {
    return (
      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <p className="text-sm text-slate-500">
          Sprawdzanie dostępu do kontaktu...
        </p>
      </div>
    );
  }

  if (isOwner) {
    return (
      <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-5">
        <p className="font-bold text-green-800">
          👤 To Twoje ogłoszenie
        </p>

        <p className="mt-2 text-sm leading-6 text-green-700">
          Twoje dane kontaktowe są ukryte przed
          pozostałymi użytkownikami. Możesz je
          zmienić w edycji ogłoszenia.
        </p>

        <Link
          href={`/edytuj-ogloszenie/${advertisementId}`}
          className="mt-4 inline-flex rounded-xl bg-green-700 px-5 py-3 font-bold text-white hover:bg-green-800"
        >
          ✏️ Edytuj ogłoszenie
        </Link>
      </div>
    );
  }

  function handleTestUnlock() {
    alert(
      "Odblokowanie kontaktu działa obecnie w trybie testowym. Prawdziwe płatności uruchomimy po przygotowaniu regulaminu, RODO i systemu rozliczeń."
    );
  }

  return (
    <div className="mt-6 rounded-3xl border border-blue-200 bg-blue-50 p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-700 text-2xl text-white">
          🔒
        </div>

        <div>
          <h3 className="text-xl font-extrabold text-slate-900">
            Dane kontaktowe kandydata są ukryte
          </h3>

          <p className="mt-2 leading-7 text-slate-600">
            Profil i doświadczenie kandydata możesz
            sprawdzić bezpłatnie. Telefon, e-mail oraz
            możliwość bezpośredniego kontaktu będą
            dostępne dla pracodawcy po wykupieniu dostępu.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={handleTestUnlock}
          className="flex min-h-14 items-center justify-center rounded-xl bg-blue-700 px-5 py-3 text-center font-bold text-white transition hover:bg-blue-800"
        >
          🔓 Odblokuj kontakt — tryb testowy
        </button>

        {ownerId ? (
          <Link
            href={`/profil/${ownerId}`}
            className="flex min-h-14 items-center justify-center rounded-xl bg-white px-5 py-3 text-center font-bold text-slate-800 ring-1 ring-slate-200 hover:bg-slate-50"
          >
            👤 Zobacz profil kandydata
          </Link>
        ) : (
          <div className="flex min-h-14 items-center justify-center rounded-xl bg-slate-100 px-5 py-3 text-center font-semibold text-slate-500">
            Profil niedostępny
          </div>
        )}
      </div>

      <p className="mt-4 text-xs leading-5 text-blue-800">
        Kandydat nie ponosi żadnych opłat. Dane zostaną
        udostępnione dopiero po jego zgodzie i opłaceniu
        dostępu przez pracodawcę.
      </p>
    </div>
  );
}