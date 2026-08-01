"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Props = {
  advertisementId: number;
};

export default function FavoriteButton({
  advertisementId,
}: Props) {
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    checkFavorite();
  }, []);

  async function checkFavorite() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("advertisement_id", advertisementId)
      .maybeSingle();

    setFavorite(!!data);
  }

  async function toggleFavorite() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Musisz się zalogować.");
      return;
    }

    if (favorite) {
      await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("advertisement_id", advertisementId);

      setFavorite(false);
    } else {
      await supabase
        .from("favorites")
        .insert({
          user_id: user.id,
          advertisement_id: advertisementId,
        });

      setFavorite(true);
    }
  }

  return (
    <button
      onClick={toggleFavorite}
      className="text-3xl transition hover:scale-110"
      title="Ulubione"
    >
      {favorite ? "❤️" : "🤍"}
    </button>
  );
}