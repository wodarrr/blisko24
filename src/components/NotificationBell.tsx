"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { supabase } from "../lib/supabase";

export default function NotificationBell() {
  const [count, setCount] = useState(0);
  const [userId, setUserId] = useState<
    string | null
  >(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCount(
      currentUserId: string
    ) {
      const {
        count: unreadCount,
        error,
      } = await supabase
        .from("notifications")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("user_id", currentUserId)
        .eq("is_read", false);

      if (cancelled) return;

      if (error) {
        console.error(
          "Błąd pobierania liczby powiadomień:",
          error
        );

        setCount(0);
        return;
      }

      setCount(unreadCount ?? 0);
    }

    async function initialize() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (cancelled) return;

      if (error || !user) {
        setUserId(null);
        setCount(0);
        return;
      }

      setUserId(user.id);
      await loadCount(user.id);
    }

    initialize();

    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const currentUserId =
          session?.user?.id ?? null;

        setUserId(currentUserId);

        if (currentUserId) {
          loadCount(currentUserId);
        } else {
          setCount(0);
        }
      }
    );

    return () => {
      cancelled = true;
      authSubscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(
        `notifications-bell-${userId}`
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        async () => {
          const {
            count: unreadCount,
            error,
          } = await supabase
            .from("notifications")
            .select("id", {
              count: "exact",
              head: true,
            })
            .eq("user_id", userId)
            .eq("is_read", false);

          if (error) {
            console.error(
              "Błąd odświeżania licznika powiadomień:",
              error
            );

            return;
          }

          setCount(unreadCount ?? 0);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  if (!userId) {
    return null;
  }

  return (
    <Link
      href="/powiadomienia"
      aria-label={
        count > 0
          ? `Powiadomienia: ${count} nieprzeczytanych`
          : "Powiadomienia"
      }
      title="Powiadomienia"
      className="relative flex h-11 w-11 items-center justify-center rounded-xl text-2xl transition hover:bg-slate-100"
    >
      🔔

      {count > 0 && (
        <span className="absolute right-0 top-0 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold leading-none text-white shadow">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}