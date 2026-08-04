"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { supabase } from "../../lib/supabase";

type Notification = {
  id: number;
  user_id: string | null;
  title: string | null;
  message: string | null;
  type: string | null;
  is_read: boolean | null;
  link: string | null;
  created_at: string;
};

function getNotificationIcon(
  type?: string | null
) {
  switch (type) {
    case "advertisement_approved":
      return "✅";

    case "advertisement_rejected":
      return "❌";

    case "new_message":
      return "💬";

    case "new_review":
      return "⭐";

    case "favorite":
      return "❤️";

    default:
      return "🔔";
  }
}

function getNotificationStyle(
  type?: string | null
) {
  switch (type) {
    case "advertisement_approved":
      return {
        border: "border-green-200",
        background: "bg-green-50",
        iconBackground: "bg-green-100",
      };

    case "advertisement_rejected":
      return {
        border: "border-red-200",
        background: "bg-red-50",
        iconBackground: "bg-red-100",
      };

    case "new_message":
      return {
        border: "border-blue-200",
        background: "bg-blue-50",
        iconBackground: "bg-blue-100",
      };

    case "new_review":
      return {
        border: "border-yellow-200",
        background: "bg-yellow-50",
        iconBackground: "bg-yellow-100",
      };

    case "favorite":
      return {
        border: "border-pink-200",
        background: "bg-pink-50",
        iconBackground: "bg-pink-100",
      };

    default:
      return {
        border: "border-slate-200",
        background: "bg-slate-50",
        iconBackground: "bg-slate-100",
      };
  }
}

function formatRelativeDate(
  date?: string | null
) {
  if (!date) return "";

  const notificationDate = new Date(date);

  if (
    Number.isNaN(
      notificationDate.getTime()
    )
  ) {
    return "";
  }

  const now = new Date();

  const differenceInSeconds =
    Math.floor(
      (now.getTime() -
        notificationDate.getTime()) /
        1000
    );

  if (differenceInSeconds < 0) {
    return notificationDate.toLocaleString(
      "pl-PL"
    );
  }

  if (differenceInSeconds < 60) {
    return "przed chwilą";
  }

  const minutes = Math.floor(
    differenceInSeconds / 60
  );

  if (minutes < 60) {
    return `${minutes} min temu`;
  }

  const hours = Math.floor(
    minutes / 60
  );

  if (hours === 1) {
    return "godzinę temu";
  }

  if (hours < 24) {
    return `${hours} godz. temu`;
  }

  const days = Math.floor(
    hours / 24
  );

  if (days === 1) {
    return "wczoraj";
  }

  if (days < 7) {
    return `${days} dni temu`;
  }

  return notificationDate.toLocaleDateString(
    "pl-PL",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  );
}

export default function NotificationsPage() {
  const router = useRouter();

  const [
    notifications,
    setNotifications,
  ] = useState<Notification[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [
    processingNotificationId,
    setProcessingNotificationId,
  ] = useState<number | null>(null);

  const [
    markingAllAsRead,
    setMarkingAllAsRead,
  ] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const unreadCount = useMemo(
    () =>
      notifications.filter(
        (notification) =>
          notification.is_read !== true
      ).length,
    [notifications]
  );

  async function loadNotifications() {
    setLoading(true);
    setErrorMessage("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error(
        "Błąd pobierania użytkownika:",
        userError
      );

      setErrorMessage(
        "Nie udało się sprawdzić zalogowanego użytkownika."
      );

      setLoading(false);
      return;
    }

    if (!user) {
      router.replace("/logowanie");
      return;
    }

    const { data, error } =
      await supabase
        .from("notifications")
        .select(`
          id,
          user_id,
          title,
          message,
          type,
          is_read,
          link,
          created_at
        `)
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        });

    if (error) {
      console.error(
        "Błąd pobierania powiadomień:",
        error
      );

      setErrorMessage(
        "Nie udało się pobrać powiadomień."
      );

      setNotifications([]);
      setLoading(false);
      return;
    }

    setNotifications(
      (data ?? []) as Notification[]
    );

    setLoading(false);
  }

  async function markAsRead(
    notificationId: number
  ) {
    const notification =
      notifications.find(
        (item) =>
          item.id === notificationId
      );

    if (
      !notification ||
      notification.is_read === true
    ) {
      return;
    }

    setProcessingNotificationId(
      notificationId
    );

    const { error } = await supabase
      .from("notifications")
      .update({
        is_read: true,
      })
      .eq("id", notificationId);

    setProcessingNotificationId(null);

    if (error) {
      console.error(
        "Błąd oznaczania powiadomienia:",
        error
      );

      alert(
        "Nie udało się oznaczyć powiadomienia jako przeczytane."
      );

      return;
    }

    setNotifications((previous) =>
      previous.map((item) =>
        item.id === notificationId
          ? {
              ...item,
              is_read: true,
            }
          : item
      )
    );
  }

  async function markAllAsRead() {
    if (
      unreadCount === 0 ||
      markingAllAsRead
    ) {
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      alert(
        "Nie udało się sprawdzić użytkownika."
      );
      return;
    }

    setMarkingAllAsRead(true);

    const { error } = await supabase
      .from("notifications")
      .update({
        is_read: true,
      })
      .eq("user_id", user.id)
      .eq("is_read", false);

    setMarkingAllAsRead(false);

    if (error) {
      console.error(
        "Błąd oznaczania wszystkich powiadomień:",
        error
      );

      alert(
        "Nie udało się oznaczyć wszystkich powiadomień jako przeczytane."
      );

      return;
    }

    setNotifications((previous) =>
      previous.map((notification) => ({
        ...notification,
        is_read: true,
      }))
    );
  }

  async function handleNotificationClick(
    notification: Notification
  ) {
    await markAsRead(notification.id);

    if (notification.link) {
      router.push(notification.link);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="rounded-3xl bg-white p-10 text-center shadow">
          <div className="text-6xl">
            🔔
          </div>

          <p className="mt-4 font-semibold text-slate-700">
            Ładowanie powiadomień...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">

        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-700">
              Twoje konto
            </p>

            <h1 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">
              🔔 Powiadomienia
            </h1>

            <p className="mt-2 text-slate-500">
              Nieprzeczytane:{" "}
              <strong className="text-slate-900">
                {unreadCount}
              </strong>
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              disabled={markingAllAsRead}
              className="rounded-xl bg-blue-700 px-5 py-3 font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {markingAllAsRead
                ? "Zapisywanie..."
                : "✓ Oznacz wszystkie jako przeczytane"}
            </button>
          )}
        </div>

        {errorMessage && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            {errorMessage}
          </div>
        )}

        {notifications.length === 0 ? (
          <section className="rounded-3xl bg-white p-10 text-center shadow">
            <div className="text-6xl">
              📭
            </div>

            <h2 className="mt-5 text-2xl font-bold text-slate-900">
              Brak powiadomień
            </h2>

            <p className="mt-3 text-slate-500">
              Gdy wydarzy się coś ważnego,
              zobaczysz tutaj informację.
            </p>

            <Link
              href="/"
              className="mt-7 inline-flex rounded-xl bg-blue-700 px-6 py-3 font-bold text-white hover:bg-blue-800"
            >
              Wróć na stronę główną
            </Link>
          </section>
        ) : (
          <div className="space-y-4">
            {notifications.map(
              (notification) => {
                const unread =
                  notification.is_read !==
                  true;

                const style =
                  getNotificationStyle(
                    notification.type
                  );

                const processing =
                  processingNotificationId ===
                  notification.id;

                const content = (
                  <article
                    className={`rounded-3xl border p-5 shadow-sm transition sm:p-6 ${
                      unread
                        ? `${style.border} ${style.background} shadow`
                        : "border-slate-200 bg-white"
                    } ${
                      notification.link
                        ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-lg"
                        : ""
                    }`}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">

                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl ${style.iconBackground}`}
                      >
                        {getNotificationIcon(
                          notification.type
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h2 className="break-words text-lg font-extrabold text-slate-900">
                                {notification.title ||
                                  "Powiadomienie"}
                              </h2>

                              {unread && (
                                <span className="rounded-full bg-blue-700 px-2.5 py-1 text-xs font-bold text-white">
                                  NOWE
                                </span>
                              )}
                            </div>

                            <p className="mt-2 break-words leading-7 text-slate-600">
                              {notification.message ||
                                "Brak treści powiadomienia."}
                            </p>
                          </div>

                          <p
                            className="shrink-0 text-sm text-slate-400"
                            title={new Date(
                              notification.created_at
                            ).toLocaleString(
                              "pl-PL"
                            )}
                          >
                            {formatRelativeDate(
                              notification.created_at
                            )}
                          </p>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-3">
                          {unread && (
                            <button
                              type="button"
                              disabled={processing}
                              onClick={(
                                event
                              ) => {
                                event.stopPropagation();

                                markAsRead(
                                  notification.id
                                );
                              }}
                              className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-blue-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 disabled:opacity-50"
                            >
                              {processing
                                ? "Zapisywanie..."
                                : "Oznacz jako przeczytane"}
                            </button>
                          )}

                          {notification.link && (
                            <span className="text-sm font-bold text-blue-700">
                              Przejdź dalej →
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );

                if (
                  notification.link
                ) {
                  return (
                    <div
                      key={
                        notification.id
                      }
                      role="button"
                      tabIndex={0}
                      onClick={() =>
                        handleNotificationClick(
                          notification
                        )
                      }
                      onKeyDown={(
                        event
                      ) => {
                        if (
                          event.key ===
                            "Enter" ||
                          event.key === " "
                        ) {
                          event.preventDefault();

                          handleNotificationClick(
                            notification
                          );
                        }
                      }}
                    >
                      {content}
                    </div>
                  );
                }

                return (
                  <div
                    key={notification.id}
                  >
                    {content}
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>
    </main>
  );
}