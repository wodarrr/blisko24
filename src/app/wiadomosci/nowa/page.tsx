"use client";

import { useEffect } from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function NewMessagePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    startConversation();
  }, []);

  async function startConversation() {
    const adId = searchParams.get("ad");

    if (!adId) {
      router.replace("/wiadomosci");
      return;
    }

    const numericAdId = Number(adId);

    if (
      !Number.isInteger(numericAdId) ||
      numericAdId <= 0
    ) {
      alert("Nieprawidłowe ID ogłoszenia.");
      router.replace("/");
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error(
        "BŁĄD POBIERANIA UŻYTKOWNIKA:",
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
      .select("id, user_id, title")
      .eq("id", numericAdId)
      .maybeSingle();

    if (advertisementError) {
      console.error(
        "BŁĄD POBIERANIA OGŁOSZENIA:",
        advertisementError
      );

      alert("Nie udało się pobrać ogłoszenia.");
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

      console.error(
        "OGŁOSZENIE BEZ USER_ID:",
        advertisement
      );

      router.replace(
        `/ogloszenie/${numericAdId}`
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
      error,
    } = await supabase.rpc(
      "get_or_create_conversation",
      {
        p_buyer_id: user.id,
        p_seller_id:
          advertisement.user_id,
        p_advertisement_id:
          numericAdId,
      }
    );

    if (error) {
      console.error("RPC ERROR:", error);
      alert(
        `Nie udało się utworzyć rozmowy: ${error.message}`
      );
      return;
    }

    if (!conversationId) {
      alert(
        "Nie zwrócono ID rozmowy."
      );
      return;
    }

    router.replace(
      `/wiadomosci/${conversationId}`
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="text-xl">
        Tworzenie rozmowy...
      </p>
    </main>
  );
}