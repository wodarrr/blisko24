"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/logowanie");
      return;
    }

    // Pobieramy właściciela ogłoszenia
    const { data: advertisement } = await supabase
      .from("advertisements")
      .select("user_id")
      .eq("id", Number(adId))
      .single();

    if (!advertisement) {
      router.replace("/");
      return;
    }

    // Nie pozwalamy pisać do samego siebie
    if (advertisement.user_id === user.id) {
      router.replace("/moje-ogloszenia");
      return;
    }

    // Tworzymy lub pobieramy istniejącą rozmowę
    console.log("USER:", user.id);
console.log("ADVERTISEMENT:", advertisement);
console.log("SELLER:", advertisement.user_id);
console.log("AD ID:", adId);
   const { data: conversationId, error } = await supabase.rpc(
  "get_or_create_conversation",
  {
    p_buyer_id: user.id,
    p_seller_id: advertisement.user_id,
    p_advertisement_id: Number(adId),
  }
);

    if (error) {
  console.error("RPC ERROR:", error);
  alert(JSON.stringify(error, null, 2));
  return;
}

if (!conversationId) {
  alert("Nie zwrócono ID rozmowy.");
  return;
}

    router.replace(`/wiadomosci/${conversationId}`);
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="text-xl">Tworzenie rozmowy...</p>
    </main>
  );
}