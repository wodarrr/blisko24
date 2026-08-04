"use client";

import { useEffect } from "react";

import { supabase } from "../lib/supabase";

const UPDATE_INTERVAL = 2 * 60 * 1000;

export default function UserActivityTracker() {
  useEffect(() => {
    let userId: string | null = null;
    let intervalId: ReturnType<
      typeof setInterval
    > | null = null;
    let cancelled = false;

    async function updateLastSeen(
      currentUserId: string
    ) {
      const { error } = await supabase
        .from("profiles")
        .update({
          last_seen: new Date().toISOString(),
        })
        .eq("id", currentUserId);

      if (error) {
        console.error(
          "Błąd aktualizacji aktywności użytkownika:",
          error
        );
      }
    }

    function stopInterval() {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    }

    function startInterval(
      currentUserId: string
    ) {
      stopInterval();

      intervalId = setInterval(() => {
        if (
          document.visibilityState ===
          "visible"
        ) {
          updateLastSeen(currentUserId);
        }
      }, UPDATE_INTERVAL);
    }

    async function initialize() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (cancelled) return;

      if (error || !user) {
        userId = null;
        stopInterval();
        return;
      }

      userId = user.id;

      await updateLastSeen(user.id);
      startInterval(user.id);
    }

    function handleVisibilityChange() {
      if (
        document.visibilityState ===
          "visible" &&
        userId
      ) {
        updateLastSeen(userId);
      }
    }

    function handleActivity() {
      if (userId) {
        updateLastSeen(userId);
      }
    }

    initialize();

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    window.addEventListener(
      "focus",
      handleActivity
    );

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUserId =
          session?.user?.id ?? null;

        userId = currentUserId;

        if (!currentUserId) {
          stopInterval();
          return;
        }

        await updateLastSeen(
          currentUserId
        );

        startInterval(currentUserId);
      }
    );

    return () => {
      cancelled = true;
      stopInterval();

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );

      window.removeEventListener(
        "focus",
        handleActivity
      );

      subscription.unsubscribe();
    };
  }, []);

  return null;
}