"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { supabase } from "../../lib/supabase";

type AccountType =
  | "candidate"
  | "employer"
  | "both";

type VerificationStatus =
  | "pending"
  | "changes_requested"
  | "verified";

export type AdminUser = {
  id: string;
  name: string | null;
  city: string | null;
  avatar_url: string | null;

  created_at?: string | null;
  last_seen?: string | null;

  account_type?: AccountType | null;

  is_admin: boolean | null;

  verified?: boolean | null;
  verified_at?: string | null;

  verification_status?: VerificationStatus | null;
  verification_note?: string | null;
  verification_reviewed_at?: string | null;
  verification_reviewed_by?: string | null;

  blocked?: boolean | null;
  blocked_at?: string | null;
  blocked_reason?: string | null;
};

type Props = {
  users: AdminUser[];
};

function formatDate(value?: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("pl-PL", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function getAccountTypeLabel(
  accountType?: AccountType | null
) {
  switch (accountType) {
    case "candidate":
      return "👤 Kandydat";

    case "employer":
      return "🏢 Pracodawca";

    case "both":
      return "👤🏢 Oba";

    default:
      return "Nie określono";
  }
}

export default function UsersTable({
  users,
}: Props) {
  const [localUsers, setLocalUsers] =
    useState<AdminUser[]>(users);

  const [search, setSearch] = useState("");

  const [currentUserId, setCurrentUserId] =
    useState("");

  const [
    processingUserId,
    setProcessingUserId,
  ] = useState<string | null>(null);

  useEffect(() => {
    setLocalUsers(users);
  }, [users]);

  useEffect(() => {
    async function loadCurrentUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setCurrentUserId(user?.id ?? "");
    }

    void loadCurrentUser();
  }, []);

  const filteredUsers = useMemo(() => {
    const phrase =
      search.trim().toLowerCase();

    if (!phrase) {
      return localUsers;
    }

    return localUsers.filter((user) => {
      const name =
        user.name?.toLowerCase() ?? "";

      const city =
        user.city?.toLowerCase() ?? "";

      const accountType =
        user.account_type?.toLowerCase() ?? "";

      const fallbackName = user.name?.trim()
        ? ""
        : "profil nieuzupełniony";

      return (
        name.includes(phrase) ||
        city.includes(phrase) ||
        accountType.includes(phrase) ||
        fallbackName.includes(phrase) ||
        user.id
          .toLowerCase()
          .includes(phrase)
      );
    });
  }, [localUsers, search]);

  async function updateUser(
    userId: string,
    changes: Partial<AdminUser>
  ) {
    setProcessingUserId(userId);

    const { error } = await supabase
      .from("profiles")
      .update(changes)
      .eq("id", userId);

    setProcessingUserId(null);

    if (error) {
      console.error(
        "Błąd aktualizacji użytkownika:",
        error
      );

      alert(
        "Nie udało się zmienić danych użytkownika."
      );

      return false;
    }

    setLocalUsers((previous) =>
      previous.map((user) =>
        user.id === userId
          ? {
              ...user,
              ...changes,
            }
          : user
      )
    );

    return true;
  }

  async function sendNotification(
    userId: string,
    title: string,
    message: string,
    type: string
  ) {
    const { error } = await supabase
      .from("notifications")
      .insert({
        user_id: userId,
        title,
        message,
        type,
        is_read: false,
      });

    if (error) {
      console.error(
        "Błąd wysyłania powiadomienia:",
        error
      );
    }
  }

  async function verifyUser(
    user: AdminUser
  ) {
    const confirmed = window.confirm(
      `Czy oznaczyć profil „${
        user.name?.trim() ||
        "Profil nieuzupełniony"
      }” jako zweryfikowany?`
    );

    if (!confirmed) return;

    const now = new Date().toISOString();

    const success = await updateUser(
      user.id,
      {
        verified: true,
        verified_at: now,

        verification_status:
          "verified",

        verification_note: null,

        verification_reviewed_at:
          now,

        verification_reviewed_by:
          currentUserId || null,
      }
    );

    if (!success) return;

    await sendNotification(
      user.id,
      "Profil zweryfikowany",
      "Twój profil został sprawdzony i oznaczony jako zweryfikowany w BLISKO24.",
      "profile_verified"
    );
  }

  async function revokeVerification(
    user: AdminUser
  ) {
    const confirmed = window.confirm(
      `Czy cofnąć weryfikację profilu „${
        user.name?.trim() ||
        "Profil nieuzupełniony"
      }”?`
    );

    if (!confirmed) return;

    const success = await updateUser(
      user.id,
      {
        verified: false,
        verified_at: null,

        verification_status:
          "pending",

        verification_note: null,

        verification_reviewed_at:
          new Date().toISOString(),

        verification_reviewed_by:
          currentUserId || null,
      }
    );

    if (!success) return;

    await sendNotification(
      user.id,
      "Weryfikacja profilu została cofnięta",
      "Twój profil ponownie oczekuje na sprawdzenie przez administratora BLISKO24.",
      "profile_verification_revoked"
    );
  }

  async function requestChanges(
    user: AdminUser
  ) {
    const reason = window.prompt(
      "Napisz użytkownikowi, co powinien poprawić w profilu:"
    );

    if (reason === null) return;

    const normalizedReason =
      reason.trim();

    if (
      normalizedReason.length < 5
    ) {
      alert(
        "Wiadomość powinna mieć przynajmniej 5 znaków."
      );

      return;
    }

    const confirmed = window.confirm(
      `Czy wysłać prośbę o poprawę danych użytkownikowi „${
        user.name?.trim() ||
        "Profil nieuzupełniony"
      }”?`
    );

    if (!confirmed) return;

    const now =
      new Date().toISOString();

    const success = await updateUser(
      user.id,
      {
        verified: false,
        verified_at: null,

        verification_status:
          "changes_requested",

        verification_note:
          normalizedReason,

        verification_reviewed_at:
          now,

        verification_reviewed_by:
          currentUserId || null,
      }
    );

    if (!success) return;

    await sendNotification(
      user.id,
      "Profil wymaga poprawy",
      `Administrator BLISKO24 poprosił o poprawę danych profilu. Powód: ${normalizedReason}`,
      "profile_changes_requested"
    );

    alert(
      "Użytkownik otrzymał prośbę o poprawę danych."
    );
  }

  async function markAsPending(
    user: AdminUser
  ) {
    const confirmed = window.confirm(
      "Czy przywrócić status „Do sprawdzenia”?"
    );

    if (!confirmed) return;

    await updateUser(user.id, {
      verified: false,
      verified_at: null,

      verification_status:
        "pending",

      verification_note: null,

      verification_reviewed_at:
        new Date().toISOString(),

      verification_reviewed_by:
        currentUserId || null,
    });
  }

  async function toggleBlocked(
    user: AdminUser
  ) {
    if (
      user.id === currentUserId
    ) {
      alert(
        "Nie możesz zablokować własnego konta administratora."
      );

      return;
    }

    if (user.blocked) {
      const confirmed = window.confirm(
        `Odblokować użytkownika ${
          user.name?.trim() ||
          "Profil nieuzupełniony"
        }?`
      );

      if (!confirmed) return;

      await updateUser(user.id, {
        blocked: false,
        blocked_at: null,
        blocked_reason: null,
      });

      return;
    }

    const reason = window.prompt(
      "Podaj powód zablokowania konta:"
    );

    if (reason === null) return;

    const trimmedReason =
      reason.trim();

    if (
      trimmedReason.length < 3
    ) {
      alert(
        "Powód blokady powinien mieć przynajmniej 3 znaki."
      );

      return;
    }

    const confirmed = window.confirm(
      `Czy na pewno zablokować użytkownika ${
        user.name?.trim() ||
        "Profil nieuzupełniony"
      }?`
    );

    if (!confirmed) return;

    const success = await updateUser(
      user.id,
      {
        blocked: true,
        blocked_at:
          new Date().toISOString(),
        blocked_reason:
          trimmedReason,
      }
    );

    if (!success) return;

    await sendNotification(
      user.id,
      "Konto zostało zablokowane",
      `Twoje konto zostało zablokowane przez administratora BLISKO24. Powód: ${trimmedReason}`,
      "account_blocked"
    );
  }

  async function toggleAdmin(
    user: AdminUser
  ) {
    if (
      user.id === currentUserId
    ) {
      alert(
        "Nie możesz zmienić własnych uprawnień administratora."
      );

      return;
    }

    if (user.is_admin) {
      const confirmed =
        window.confirm(
          `UWAGA!\n\nCzy na pewno odebrać uprawnienia administratora użytkownikowi „${
            user.name?.trim() ||
            "Profil nieuzupełniony"
          }”?`
        );

      if (!confirmed) return;

      await updateUser(user.id, {
        is_admin: false,
      });

      return;
    }

    const firstConfirmation =
      window.confirm(
        `UWAGA — uprawnienia administratora dają dostęp do zarządzania portalem.\n\nCzy chcesz nadać je użytkownikowi „${
          user.name?.trim() ||
          "Profil nieuzupełniony"
        }”?`
      );

    if (!firstConfirmation) return;

    const confirmationText =
      window.prompt(
        'Aby potwierdzić, wpisz dokładnie: NADAJ ADMINA'
      );

    if (
      confirmationText !==
      "NADAJ ADMINA"
    ) {
      alert(
        "Nie nadano uprawnień administratora."
      );

      return;
    }

    await updateUser(user.id, {
      is_admin: true,
    });
  }

  return (
    <section className="overflow-hidden rounded-3xl bg-white shadow">
      <div className="border-b border-slate-200 p-6 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-700">
              Moderacja kont
            </p>

            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              Użytkownicy
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Liczba kont:{" "}
              {localUsers.length}
            </p>
          </div>

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Szukaj po nazwie, mieście lub typie konta..."
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 lg:max-w-md"
          />
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          Nie znaleziono użytkowników.
        </div>
      ) : (
        <div className="space-y-5 bg-slate-50 p-4 sm:p-6">
          {filteredUsers.map((user) => {
            const hasName =
              Boolean(
                user.name?.trim()
              );

            const userName =
              user.name?.trim() ||
              "Profil nieuzupełniony";

            const processing =
              processingUserId ===
              user.id;

            const verificationStatus: VerificationStatus =
              user.verification_status ??
              (user.verified
                ? "verified"
                : "pending");

            return (
              <article
                key={user.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
              >
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex min-w-0 items-start gap-4">
                    {user.avatar_url ? (
                      <img
                        src={
                          user.avatar_url
                        }
                        alt={userName}
                        className="h-14 w-14 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">
                        {hasName
                          ? userName
                              .charAt(0)
                              .toUpperCase()
                          : "!"}
                      </div>
                    )}

                    <div className="min-w-0">
                      <p
                        className={`text-lg font-extrabold ${
                          hasName
                            ? "text-slate-900"
                            : "text-orange-700"
                        }`}
                      >
                        {userName}
                      </p>

                      {!hasName && (
                        <p className="mt-1 text-xs font-semibold text-orange-600">
                          Brak podstawowych danych profilu
                        </p>
                      )}

                      <p className="mt-2 break-all text-xs text-slate-400">
                        ID: {user.id}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-cyan-50 px-3 py-1.5 text-sm font-semibold text-cyan-800">
                      {getAccountTypeLabel(
                        user.account_type
                      )}
                    </span>

                    {user.is_admin ? (
                      <span className="rounded-full bg-red-100 px-3 py-1.5 text-sm font-bold text-red-700">
                        👑 Administrator
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-600">
                        Użytkownik
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Miasto
                    </p>

                    <p className="mt-1 font-semibold text-slate-800">
                      {user.city || "—"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Rejestracja
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {formatDate(
                        user.created_at
                      )}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Ostatnia aktywność
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {formatDate(
                        user.last_seen
                      )}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Status
                    </p>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {user.is_admin ? (
                        <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-bold text-red-700">
                          👑 Konto administratora
                        </span>
                      ) : (
                        <>
                          {verificationStatus ===
                            "verified" && (
                            <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-700">
                              ✔ Zweryfikowany
                            </span>
                          )}

                          {verificationStatus ===
                            "pending" && (
                            <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-bold text-yellow-800">
                              ⏳ Do sprawdzenia
                            </span>
                          )}

                          {verificationStatus ===
                            "changes_requested" && (
                            <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-bold text-orange-800">
                              ⚠ Wymaga poprawy
                            </span>
                          )}
                        </>
                      )}

                      {user.blocked ? (
                        <span
                          className="rounded-full bg-red-100 px-3 py-1 text-sm font-bold text-red-700"
                          title={
                            user.blocked_reason ||
                            "Brak powodu"
                          }
                        >
                          🚫 Zablokowany
                        </span>
                      ) : (
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                          Aktywny
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {user.verification_note && (
                  <div className="mt-5 rounded-xl border border-orange-200 bg-orange-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-orange-600">
                      Informacja o poprawkach
                    </p>

                    <p className="mt-2 text-sm leading-6 text-orange-800">
                      {user.verification_note}
                    </p>
                  </div>
                )}

                <div className="mt-6 border-t border-slate-200 pt-5">
                  <p className="mb-3 text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
                    Akcje
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/profil/${user.id}`}
                      className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      👁 Profil
                    </Link>

                    {!user.is_admin &&
                      verificationStatus !==
                        "verified" && (
                        <button
                          type="button"
                          disabled={
                            processing
                          }
                          onClick={() =>
                            verifyUser(
                              user
                            )
                          }
                          className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                        >
                          ✅ Zweryfikuj
                        </button>
                      )}

                    {!user.is_admin &&
                      verificationStatus ===
                        "verified" && (
                        <button
                          type="button"
                          disabled={
                            processing
                          }
                          onClick={() =>
                            revokeVerification(
                              user
                            )
                          }
                          className="rounded-lg bg-slate-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
                        >
                          Cofnij weryfikację
                        </button>
                      )}

                    {!user.is_admin &&
                      verificationStatus !==
                        "changes_requested" && (
                        <button
                          type="button"
                          disabled={
                            processing
                          }
                          onClick={() =>
                            requestChanges(
                              user
                            )
                          }
                          className="rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
                        >
                          ✏️ Poproś o poprawę
                        </button>
                      )}

                    {!user.is_admin &&
                      verificationStatus ===
                        "changes_requested" && (
                        <button
                          type="button"
                          disabled={
                            processing
                          }
                          onClick={() =>
                            markAsPending(
                              user
                            )
                          }
                          className="rounded-lg bg-yellow-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-yellow-600 disabled:opacity-50"
                        >
                          ⏳ Do sprawdzenia
                        </button>
                      )}

                    <button
                      type="button"
                      disabled={
                        processing ||
                        user.id ===
                          currentUserId
                      }
                      onClick={() =>
                        toggleBlocked(
                          user
                        )
                      }
                      className={`rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-40 ${
                        user.blocked
                          ? "bg-slate-700 hover:bg-slate-800"
                          : "bg-red-600 hover:bg-red-700"
                      }`}
                    >
                      {user.blocked
                        ? "🔓 Odblokuj"
                        : "🚫 Zablokuj"}
                    </button>

                    <button
                      type="button"
                      disabled={
                        processing ||
                        user.id ===
                          currentUserId
                      }
                      onClick={() =>
                        toggleAdmin(
                          user
                        )
                      }
                      className="rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {user.is_admin
                        ? "Odbierz admina"
                        : "👑 Nadaj admina"}
                    </button>
                  </div>

                  {processing && (
                    <p className="mt-3 text-sm font-semibold text-blue-700">
                      Zapisywanie zmian...
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}