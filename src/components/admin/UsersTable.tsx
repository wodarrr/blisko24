"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

export type AdminUser = {
  id: string;
  name: string | null;
  city: string | null;
  avatar_url: string | null;
  is_admin: boolean | null;
  verified?: boolean | null;
  blocked?: boolean | null;
  blocked_at?: string | null;
  blocked_reason?: string | null;
};

type Props = {
  users: AdminUser[];
};

export default function UsersTable({
  users,
}: Props) {
  const [localUsers, setLocalUsers] =
    useState<AdminUser[]>(users);

  const [search, setSearch] = useState("");
  const [currentUserId, setCurrentUserId] =
    useState("");

  const [processingUserId, setProcessingUserId] =
    useState<string | null>(null);

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

    loadCurrentUser();
  }, []);

  const filteredUsers = useMemo(() => {
    const phrase = search.trim().toLowerCase();

    if (!phrase) {
      return localUsers;
    }

    return localUsers.filter((user) => {
      const name =
        user.name?.toLowerCase() ?? "";

      const city =
        user.city?.toLowerCase() ?? "";

      return (
        name.includes(phrase) ||
        city.includes(phrase) ||
        user.id.toLowerCase().includes(phrase)
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

  async function toggleVerification(
    user: AdminUser
  ) {
    await updateUser(user.id, {
      verified: !user.verified,
    });
  }

  async function toggleBlocked(
    user: AdminUser
  ) {
    if (user.id === currentUserId) {
      alert(
        "Nie możesz zablokować własnego konta administratora."
      );
      return;
    }

    if (user.blocked) {
      const confirmed = window.confirm(
        `Odblokować użytkownika ${
          user.name || "BLISKO24"
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

    const trimmedReason = reason.trim();

    if (trimmedReason.length < 3) {
      alert(
        "Powód blokady powinien mieć przynajmniej 3 znaki."
      );
      return;
    }

    const confirmed = window.confirm(
      `Czy na pewno zablokować użytkownika ${
        user.name || "BLISKO24"
      }?`
    );

    if (!confirmed) return;

    await updateUser(user.id, {
      blocked: true,
      blocked_at: new Date().toISOString(),
      blocked_reason: trimmedReason,
    });
  }

  async function toggleAdmin(
    user: AdminUser
  ) {
    if (user.id === currentUserId) {
      alert(
        "Nie możesz odebrać uprawnień administratora własnemu kontu."
      );
      return;
    }

    const action = user.is_admin
      ? "odebrać uprawnienia administratora"
      : "nadać uprawnienia administratora";

    const confirmed = window.confirm(
      `Czy na pewno chcesz ${action} użytkownikowi ${
        user.name || "BLISKO24"
      }?`
    );

    if (!confirmed) return;

    await updateUser(user.id, {
      is_admin: !user.is_admin,
    });
  }

  return (
    <section className="overflow-hidden rounded-3xl bg-white shadow">
      <div className="border-b border-slate-200 p-6 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Użytkownicy
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Liczba kont: {localUsers.length}
            </p>
          </div>

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Szukaj po nazwie lub mieście..."
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 lg:max-w-sm"
          />
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          Nie znaleziono użytkowników.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px]">
            <thead className="bg-slate-50">
              <tr className="text-left text-sm text-slate-600">
                <th className="px-6 py-4">
                  Użytkownik
                </th>

                <th className="px-6 py-4">
                  Miasto
                </th>

                <th className="px-6 py-4">
                  Status
                </th>

                <th className="px-6 py-4">
                  Uprawnienia
                </th>

                <th className="px-6 py-4">
                  Akcje
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => {
                const userName =
                  user.name?.trim() ||
                  "Użytkownik BLISKO24";

                const processing =
                  processingUserId === user.id;

                return (
                  <tr
                    key={user.id}
                    className="border-t border-slate-100 align-top"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={userName}
                            className="h-12 w-12 shrink-0 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                            {userName
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="font-bold text-slate-900">
                            {userName}
                          </p>

                          <p className="mt-1 max-w-52 truncate text-xs text-slate-400">
                            {user.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5 text-slate-600">
                      {user.city || "—"}
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex flex-col items-start gap-2">
                        {user.verified ? (
                          <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-700">
                            ✔ Zweryfikowany
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
                            Niezweryfikowany
                          </span>
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
                          <span className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700">
                            Aktywny
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      {user.is_admin ? (
                        <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-bold text-red-700">
                          👑 Administrator
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
                          Użytkownik
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/profil/${user.id}`}
                          className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                        >
                          Profil
                        </Link>

                        <button
                          type="button"
                          disabled={processing}
                          onClick={() =>
                            toggleVerification(user)
                          }
                          className="rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                        >
                          {user.verified
                            ? "Cofnij weryfikację"
                            : "Zweryfikuj"}
                        </button>

                        <button
                          type="button"
                          disabled={
                            processing ||
                            user.id === currentUserId
                          }
                          onClick={() =>
                            toggleBlocked(user)
                          }
                          className={`rounded-lg px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40 ${
                            user.blocked
                              ? "bg-slate-700 hover:bg-slate-800"
                              : "bg-red-600 hover:bg-red-700"
                          }`}
                        >
                          {user.blocked
                            ? "Odblokuj"
                            : "Zablokuj"}
                        </button>

                        <button
                          type="button"
                          disabled={
                            processing ||
                            user.id === currentUserId
                          }
                          onClick={() =>
                            toggleAdmin(user)
                          }
                          className="rounded-lg bg-purple-600 px-3 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {user.is_admin
                            ? "Odbierz admina"
                            : "Nadaj admina"}
                        </button>
                      </div>

                      {processing && (
                        <p className="mt-2 text-xs font-semibold text-blue-700">
                          Zapisywanie...
                        </p>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}