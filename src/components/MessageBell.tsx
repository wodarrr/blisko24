"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";

export default function MessageBell() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function loadUnreadMessages() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (mounted) {
          setCount(0);
        }

        return;
      }

      const { data: conversations, error: conversationsError } =
        await supabase
          .from("conversations")
          .select("id")
          .or(
            `buyer_id.eq.${user.id},seller_id.eq.${user.id}`
          );

      if (conversationsError) {
        console.error(
          "Błąd pobierania rozmów:",
          conversationsError
        );
        return;
      }

      const conversationIds =
        conversations?.map(
          (conversation) => conversation.id
        ) ?? [];

      if (conversationIds.length === 0) {
        if (mounted) {
          setCount(0);
        }

        return;
      }

      const { count: unreadCount, error: messagesError } =
        await supabase
          .from("messages")
          .select("*", {
            count: "exact",
            head: true,
          })
          .in("conversation_id", conversationIds)
          .neq("sender_id", user.id)
          .eq("is_read", false);

      if (messagesError) {
        console.error(
          "Błąd pobierania nowych wiadomości:",
          messagesError
        );
        return;
      }

      if (mounted) {
        setCount(unreadCount ?? 0);
      }
    }

    loadUnreadMessages();

    const channel = supabase
      .channel(`message-bell-${Date.now()}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        () => {
          loadUnreadMessages();
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <Link
      href="/wiadomosci"
      className="relative text-2xl transition hover:scale-110"
      title="Wiadomości"
    >
      💬

      {count > 0 && (
        <span className="absolute -right-3 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}