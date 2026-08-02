"use client";

import { Suspense, useEffect } from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import { supabase } from "../../../lib/supabase";

function NewMessageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    let cancelled = false;

    async function startConversation() {
      const adId = searchParams.get("ad");
      const advertisementId = Number(adId);

      if (
        !Number.isInteger(advertisementId) ||
        advertisementId <= 0
      ) {
        router.replace("/wiadomosci");
        return;
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (cancelled) return;

      if (userError) {
        console.error(
          "Błąd pobierania użytkownika:",
          userError
        );
      }

      if (!user) {
        router.replace("/logowanie");
        return;
      }

      const {
        data: advertisement,
        error: advertisementError,
      } = await supabase
        .from("advertisements")
        .select("id, user_id")
        .eq("id", advertisementId)
        .maybeSingle();

      if (cancelled) return;

      if (advertisementError) {
        console.error(
          "Błąd pobierania ogłoszenia:",
          advertisementError
        );

        alert(
          "Nie udało się pobrać danych ogłoszenia."
        );

        router.replace("/");
        return;
      }

      if (!advertisement) {
        alert("Ogłoszenie nie istnieje.");
        router.replace("/");
        return;
      }

      if (!advertisement.user_id) {
        alert(
          "To ogłoszenie nie ma przypisanego właściciela. Nie można rozpocząć rozmowy."
        );

        router.replace(
          `/ogloszenie/${advertisementId}`
        );

        return;
      }

      if (advertisement.user_id === user.id) {
        alert(
          "Nie możesz rozpocząć rozmowy z samym sobą."
        );

        router.replace("/moje-ogloszenia");
        return;
      }

      const {
        data: conversationId,
        error: conversationError,
      } = await supabase.rpc(
        "get_or_create_conversation",
        {
          p_buyer_id: user.id,
          p_seller_id:
            advertisement.user_id,
          p_advertisement_id:
            advertisementId,
        }
      );

      if (cancelled) return;

      if (conversationError) {
        console.error(
          "Błąd tworzenia rozmowy:",
          conversationError
        );

        alert(
          conversationError.message ||
            "Nie udało się rozpocząć rozmowy."
        );

        router.replace(
          `/ogloszenie/${advertisementId}`
        );

        return;
      }

      if (!conversationId) {
        alert(
          "Nie udało się uzyskać numeru rozmowy."
        );

        router.replace(
          `/ogloszenie/${advertisementId}`
        );

        return;
      }

      router.replace(
        `/wiadomosci/${conversationId}`
      );
    }

    startConversation();

    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="rounded-3xl bg-white p-10 text-center shadow">
        <div className="text-5xl">
          💬
        </div>

        <p className="mt-4 text-lg font-semibold text-slate-700">
          Tworzenie rozmowy...
        </p>
      </div>
    </main>
  );
}

function NewMessageLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="rounded-3xl bg-white p-10 text-center shadow">
        <div className="text-5xl">
          💬
        </div>

        <p className="mt-4 text-lg font-semibold text-slate-700">
          Ładowanie...
        </p>
      </div>
    </main>
  );
}

export default function NewMessagePage() {
  return (
    <Suspense
      fallback={<NewMessageLoading />}
    >
      <NewMessageContent />
    </Suspense>
  );
}