"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

type Conversation = {
  id: number;
  advertisement_id: number;
  seller_id: string;
  buyer_id: string;
  created_at: string;
  updated_at: string | null;
};

type Message = {
  id: number;
  conversation_id: number;
  sender_id: string;
  message: string;
  created_at: string;
  is_read: boolean;
};

type Advertisement = {
  id: number;
  title: string;
};

type Profile = {
  id: string;
  name: string | null;
  city: string | null;
  avatar_url: string | null;
};

type ConversationView = Conversation & {
  advertisementTitle: string;
  otherUserName: string;
  otherUserCity: string;
  otherUserAvatar: string | null;
  lastMessage: string;
  lastMessageDate: string | null;
  unreadCount: number;
};

export default function MessagesPage() {
  const [conversations, setConversations] =
    useState<ConversationView[]>([]);

  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState("");

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      await loadConversations(mounted);
    }

    initialize();

    const channel = supabase
      .channel(`messages-list-${Date.now()}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        () => {
          loadConversations(mounted);
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  async function loadConversations(mounted = true) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!mounted) return;

    if (!user) {
      setCurrentUserId("");
      setConversations([]);
      setLoading(false);
      return;
    }

    setCurrentUserId(user.id);

    const { data: conversationData, error: conversationError } =
      await supabase
        .from("conversations")
        .select(
          `
          id,
          advertisement_id,
          seller_id,
          buyer_id,
          created_at,
          updated_at
        `
        )
        .or(
          `buyer_id.eq.${user.id},seller_id.eq.${user.id}`
        )
        .order("updated_at", {
          ascending: false,
          nullsFirst: false,
        })
        .order("created_at", {
          ascending: false,
        });

    if (conversationError) {
      console.error(
        "Błąd pobierania rozmów:",
        conversationError
      );

      if (mounted) {
        setLoading(false);
      }

      return;
    }

    const baseConversations =
      (conversationData as Conversation[] | null) ?? [];

    if (baseConversations.length === 0) {
      if (mounted) {
        setConversations([]);
        setLoading(false);
      }

      return;
    }

    const advertisementIds = [
      ...new Set(
        baseConversations.map(
          (conversation) =>
            conversation.advertisement_id
        )
      ),
    ];

    const otherUserIds = [
      ...new Set(
        baseConversations.map((conversation) =>
          conversation.buyer_id === user.id
            ? conversation.seller_id
            : conversation.buyer_id
        )
      ),
    ];

    const conversationIds = baseConversations.map(
      (conversation) => conversation.id
    );

    const [
      { data: advertisementsData, error: advertisementsError },
      { data: profilesData, error: profilesError },
      { data: messagesData, error: messagesError },
    ] = await Promise.all([
      supabase
        .from("advertisements")
        .select("id, title")
        .in("id", advertisementIds),

      supabase
        .from("profiles")
        .select("id, name, city, avatar_url")
        .in("id", otherUserIds),

      supabase
        .from("messages")
        .select(
          `
          id,
          conversation_id,
          sender_id,
          message,
          created_at,
          is_read
        `
        )
        .in("conversation_id", conversationIds)
        .order("created_at", {
          ascending: false,
        }),
    ]);

    if (advertisementsError) {
      console.error(
        "Błąd pobierania ogłoszeń:",
        advertisementsError
      );
    }

    if (profilesError) {
      console.error(
        "Błąd pobierania profili:",
        profilesError
      );
    }

    if (messagesError) {
      console.error(
        "Błąd pobierania wiadomości:",
        messagesError
      );
    }

    const advertisementsMap = new Map<
      number,
      Advertisement
    >();

    (advertisementsData ?? []).forEach(
      (advertisement: Advertisement) => {
        advertisementsMap.set(
          advertisement.id,
          advertisement
        );
      }
    );

    const profilesMap = new Map<string, Profile>();

    (profilesData ?? []).forEach((profile: Profile) => {
      profilesMap.set(profile.id, profile);
    });

    const lastMessagesMap = new Map<number, Message>();
    const unreadCountsMap = new Map<number, number>();

    ((messagesData as Message[] | null) ?? []).forEach(
      (message) => {
        if (
          !lastMessagesMap.has(
            message.conversation_id
          )
        ) {
          lastMessagesMap.set(
            message.conversation_id,
            message
          );
        }

        if (
          message.sender_id !== user.id &&
          !message.is_read
        ) {
          const previousCount =
            unreadCountsMap.get(
              message.conversation_id
            ) ?? 0;

          unreadCountsMap.set(
            message.conversation_id,
            previousCount + 1
          );
        }
      }
    );

    const preparedConversations: ConversationView[] =
      baseConversations.map((conversation) => {
        const otherUserId =
          conversation.buyer_id === user.id
            ? conversation.seller_id
            : conversation.buyer_id;

        const otherUser =
          profilesMap.get(otherUserId);

        const advertisement =
          advertisementsMap.get(
            conversation.advertisement_id
          );

        const lastMessage =
          lastMessagesMap.get(conversation.id);

        return {
          ...conversation,

          advertisementTitle:
            advertisement?.title ??
            `Ogłoszenie #${conversation.advertisement_id}`,

          otherUserName:
            otherUser?.name?.trim() ||
            "Użytkownik BLISKO24",

          otherUserCity:
            otherUser?.city?.trim() || "",

          otherUserAvatar:
            otherUser?.avatar_url ?? null,

          lastMessage:
            lastMessage?.message ??
            "Rozmowa nie ma jeszcze wiadomości.",

          lastMessageDate:
            lastMessage?.created_at ??
            conversation.updated_at ??
            conversation.created_at,

          unreadCount:
            unreadCountsMap.get(conversation.id) ?? 0,
        };
      });

    preparedConversations.sort((first, second) => {
      const firstDate = new Date(
        first.lastMessageDate ??
          first.updated_at ??
          first.created_at
      ).getTime();

      const secondDate = new Date(
        second.lastMessageDate ??
          second.updated_at ??
          second.created_at
      ).getTime();

      return secondDate - firstDate;
    });

    if (mounted) {
      setConversations(preparedConversations);
      setLoading(false);
    }
  }

  function formatDate(date: string | null) {
    if (!date) return "";

    const messageDate = new Date(date);
    const today = new Date();

    const isToday =
      messageDate.toDateString() ===
      today.toDateString();

    if (isToday) {
      return messageDate.toLocaleTimeString("pl-PL", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    return messageDate.toLocaleDateString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100">
        <div className="mx-auto max-w-5xl px-6 py-12">
          <h1 className="mb-8 text-4xl font-bold">
            💬 Wiadomości
          </h1>

          <div className="rounded-2xl bg-white p-10 text-center shadow">
            <p className="text-gray-500">
              Ładowanie rozmów...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-5xl px-6 py-12">

        <div className="mb-8">
          <h1 className="text-4xl font-bold">
            💬 Wiadomości
          </h1>

          <p className="mt-2 text-gray-500">
            Wszystkie rozmowy dotyczące Twoich
            ogłoszeń.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow">

          {conversations.length === 0 ? (
            <div className="p-12 text-center">

              <div className="text-6xl">
                💬
              </div>

              <h2 className="mt-5 text-2xl font-bold">
                Nie masz jeszcze żadnych rozmów
              </h2>

              <p className="mx-auto mt-3 max-w-lg text-gray-500">
                Gdy napiszesz do właściciela
                ogłoszenia albo ktoś napisze do Ciebie,
                rozmowa pojawi się w tym miejscu.
              </p>

              <Link
                href="/"
                className="mt-7 inline-block rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800"
              >
                Przeglądaj ogłoszenia
              </Link>

            </div>
          ) : (
            <div>
              {conversations.map((conversation) => {
                const firstLetter =
                  conversation.otherUserName
                    .charAt(0)
                    .toUpperCase();

                return (
                  <Link
                    key={conversation.id}
                    href={`/wiadomosci/${conversation.id}`}
                    className={`flex items-center gap-5 border-b p-5 transition last:border-b-0 hover:bg-slate-50 ${
                      conversation.unreadCount > 0
                        ? "bg-blue-50/60"
                        : "bg-white"
                    }`}
                  >
                    <div className="relative shrink-0">

                      {conversation.otherUserAvatar ? (
                        <img
                          src={
                            conversation.otherUserAvatar
                          }
                          alt={
                            conversation.otherUserName
                          }
                          className="h-16 w-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-700">
                          {firstLetter}
                        </div>
                      )}

                      {conversation.unreadCount > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">
                          {conversation.unreadCount > 99
                            ? "99+"
                            : conversation.unreadCount}
                        </span>
                      )}

                    </div>

                    <div className="min-w-0 flex-1">

                      <div className="flex items-start justify-between gap-4">

                        <div className="min-w-0">

                          <h2
                            className={`truncate text-lg ${
                              conversation.unreadCount > 0
                                ? "font-extrabold text-slate-950"
                                : "font-bold text-slate-900"
                            }`}
                          >
                            {
                              conversation.otherUserName
                            }
                          </h2>

                          {conversation.otherUserCity && (
                            <p className="mt-0.5 text-sm text-gray-500">
                              📍{" "}
                              {
                                conversation.otherUserCity
                              }
                            </p>
                          )}

                        </div>

                        <span
                          className={`shrink-0 text-sm ${
                            conversation.unreadCount > 0
                              ? "font-bold text-blue-700"
                              : "text-gray-400"
                          }`}
                        >
                          {formatDate(
                            conversation.lastMessageDate
                          )}
                        </span>

                      </div>

                      <p className="mt-2 truncate text-sm font-semibold text-blue-700">
                        📄{" "}
                        {
                          conversation.advertisementTitle
                        }
                      </p>

                      <p
                        className={`mt-1 truncate ${
                          conversation.unreadCount > 0
                            ? "font-semibold text-slate-900"
                            : "text-gray-600"
                        }`}
                      >
                        {conversation.lastMessage}
                      </p>

                    </div>

                    <div className="shrink-0 text-xl text-gray-400">
                      →
                    </div>

                  </Link>
                );
              })}
            </div>
          )}

        </div>

        {currentUserId && conversations.length > 0 && (
          <p className="mt-4 text-center text-sm text-gray-400">
            Otwórz rozmowę, aby przeczytać wiadomości
            i odpowiedzieć.
          </p>
        )}

      </div>
    </main>
  );
}