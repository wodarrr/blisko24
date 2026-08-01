"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";

type Message = {
  id: number;
  conversation_id: number;
  sender_id: string;
  message: string;
  created_at: string;
  is_read: boolean;
};

type ConversationProfile = {
  id: string;
  name: string | null;
  city: string | null;
  avatar_url: string | null;
};

export default function ConversationPage() {
  const params = useParams();
  const conversationId = Number(params.id);

  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");
  const [otherUser, setOtherUser] =
    useState<ConversationProfile | null>(null);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    const channelName = `conversation-${conversationId}-${Date.now()}`;
    const channel = supabase.channel(channelName);

    async function markMessagesAsRead(userId: string) {
      const { error } = await supabase
        .from("messages")
        .update({
          is_read: true,
        })
        .eq("conversation_id", conversationId)
        .neq("sender_id", userId)
        .eq("is_read", false);

      if (error) {
        console.error(
          "BŁĄD OZNACZANIA WIADOMOŚCI JAKO PRZECZYTANE:",
          error
        );
      }
    }

    async function loadOtherUser(userId: string) {
      const {
        data: conversation,
        error: conversationError,
      } = await supabase
        .from("conversations")
        .select("buyer_id, seller_id")
        .eq("id", conversationId)
        .single();

      if (conversationError) {
        console.error(
          "BŁĄD POBIERANIA ROZMOWY:",
          conversationError
        );
        return;
      }

      const otherUserId =
        conversation.buyer_id === userId
          ? conversation.seller_id
          : conversation.buyer_id;

      const {
        data: profileData,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("id, name, city, avatar_url")
        .eq("id", otherUserId)
        .maybeSingle();

      if (profileError) {
        console.error(
          "BŁĄD POBIERANIA PROFILU ROZMÓWCY:",
          profileError
        );
        return;
      }

      if (!cancelled) {
        setOtherUser(profileData);
      }
    }

    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (cancelled) return;

      if (!user) {
        setLoading(false);
        return;
      }

      setCurrentUserId(user.id);

      await loadOtherUser(user.id);

      const { data, error } = await supabase
        .from("messages")
        .select(
          "id, conversation_id, sender_id, message, created_at, is_read"
        )
        .eq("conversation_id", conversationId)
        .order("created_at", {
          ascending: true,
        });

      if (cancelled) return;

      if (error) {
        console.error(
          "BŁĄD POBIERANIA WIADOMOŚCI:",
          error
        );
      } else {
        setMessages(data ?? []);

        await markMessagesAsRead(user.id);

        setMessages((previous) =>
          previous.map((message) =>
            message.sender_id !== user.id
              ? {
                  ...message,
                  is_read: true,
                }
              : message
          )
        );
      }

      setLoading(false);

      if (cancelled) return;

      channel
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `conversation_id=eq.${conversationId}`,
          },
          async (payload) => {
            const newMessage =
              payload.new as Message;

            setMessages((previous) => {
              const alreadyExists =
                previous.some(
                  (message) =>
                    message.id === newMessage.id
                );

              if (alreadyExists) {
                return previous;
              }

              return [
                ...previous,
                newMessage,
              ];
            });

            if (
              newMessage.sender_id !== user.id
            ) {
              const {
                error: readError,
              } = await supabase
                .from("messages")
                .update({
                  is_read: true,
                })
                .eq("id", newMessage.id);

              if (readError) {
                console.error(
                  "BŁĄD OZNACZANIA NOWEJ WIADOMOŚCI:",
                  readError
                );
              } else {
                setMessages((previous) =>
                  previous.map((message) =>
                    message.id ===
                    newMessage.id
                      ? {
                          ...message,
                          is_read: true,
                        }
                      : message
                  )
                );
              }
            }
          }
        )
        .subscribe((status) => {
          console.log(
            `REALTIME ${conversationId}:`,
            status
          );
        });
    }

    init();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  async function sendMessage() {
    const messageText = text.trim();

    if (!messageText || sending) return;

    setSending(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Musisz być zalogowany.");
      setSending(false);
      return;
    }

    const {
      data: insertedMessage,
      error,
    } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        message: messageText,
        is_read: false,
      })
      .select(
        "id, conversation_id, sender_id, message, created_at, is_read"
      )
      .single();

    if (error) {
      console.error(
        "BŁĄD WYSYŁANIA WIADOMOŚCI:",
        error
      );

      alert(
        "Nie udało się wysłać wiadomości."
      );

      setSending(false);
      return;
    }

    setMessages((previous) => {
      const alreadyExists =
        previous.some(
          (message) =>
            message.id ===
            insertedMessage.id
        );

      if (alreadyExists) {
        return previous;
      }

      return [
        ...previous,
        insertedMessage,
      ];
    });

    setText("");

    const {
      error: updateError,
    } = await supabase
      .from("conversations")
      .update({
        updated_at:
          new Date().toISOString(),
      })
      .eq("id", conversationId);

    if (updateError) {
      console.error(
        "BŁĄD AKTUALIZACJI ROZMOWY:",
        updateError
      );
    }

    setSending(false);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Ładowanie rozmowy...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="mx-auto flex h-screen max-w-4xl flex-col bg-white shadow">

        <div className="flex items-center gap-4 border-b p-4 sm:p-6">
          {otherUser?.avatar_url ? (
            <img
              src={otherUser.avatar_url}
              alt={
                otherUser.name ||
                "Rozmówca"
              }
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-700">
              {otherUser?.name
                ?.charAt(0)
                .toUpperCase() || "👤"}
            </div>
          )}

          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold text-slate-900 sm:text-2xl">
              {otherUser?.name ||
                "Użytkownik BLISKO24"}
            </h1>

            <p className="truncate text-sm text-gray-500">
              {otherUser?.city
                ? `📍 ${otherUser.city}`
                : `Rozmowa #${conversationId}`}
            </p>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">

          {messages.length === 0 && (
            <p className="text-center text-gray-500">
              Napisz pierwszą wiadomość.
            </p>
          )}

          {messages.map((msg) => {
            const mine =
              msg.sender_id ===
              currentUserId;

            return (
              <div
                key={msg.id}
                className={`flex items-end gap-2 ${
                  mine
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                {!mine && (
                  <div className="shrink-0">
                    {otherUser?.avatar_url ? (
                      <img
                        src={
                          otherUser.avatar_url
                        }
                        alt={
                          otherUser.name ||
                          "Rozmówca"
                        }
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                        {otherUser?.name
                          ?.charAt(0)
                          .toUpperCase() ||
                          "👤"}
                      </div>
                    )}
                  </div>
                )}

                <div
                  className={`max-w-[78%] rounded-2xl px-4 py-3 ${
                    mine
                      ? "bg-blue-700 text-white"
                      : "bg-gray-200 text-gray-900"
                  }`}
                >
                  <p className="whitespace-pre-line break-words">
                    {msg.message}
                  </p>

                  <div
                    className={`mt-2 flex items-center justify-end gap-2 text-xs ${
                      mine
                        ? "text-blue-100"
                        : "text-gray-500"
                    }`}
                  >
                    <span>
                      {new Date(
                        msg.created_at
                      ).toLocaleString(
                        "pl-PL"
                      )}
                    </span>

                    {mine && (
                      <span
                        title={
                          msg.is_read
                            ? "Przeczytano"
                            : "Wysłano"
                        }
                      >
                        {msg.is_read
                          ? "✓✓"
                          : "✓"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          <div ref={bottomRef} />
        </div>

        <div className="border-t p-4">
          <div className="flex gap-3">

            <textarea
              value={text}
              onChange={(event) =>
                setText(
                  event.target.value
                )
              }
              onKeyDown={(event) => {
                if (
                  event.key ===
                    "Enter" &&
                  !event.shiftKey
                ) {
                  event.preventDefault();
                  sendMessage();
                }
              }}
              rows={2}
              placeholder="Napisz wiadomość..."
              className="flex-1 resize-none rounded-xl border p-3"
            />

            <button
              onClick={sendMessage}
              disabled={
                sending || !text.trim()
              }
              className="rounded-xl bg-blue-700 px-5 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50 sm:px-6"
            >
              {sending
                ? "Wysyłanie..."
                : "Wyślij"}
            </button>
          </div>

          <p className="mt-2 text-xs text-gray-400">
            Enter — wyślij • Shift + Enter —
            nowa linia
          </p>
        </div>

      </div>
    </main>
  );
}