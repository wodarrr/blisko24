"use client";

import Link from "next/link";

type User = {
  id: string;
  name: string;
  city: string;
  avatar_url: string | null;
  is_admin: boolean;
};

type Props = {
  users: User[];
};

export default function UsersTable({ users }: Props) {
  return (
    <div className="mt-10 rounded-2xl bg-white p-8 shadow">

      <h2 className="mb-6 text-2xl font-bold">
        Użytkownicy
      </h2>

      <table className="w-full">

        <thead>

          <tr className="border-b text-left">

            <th className="pb-3">Avatar</th>
            <th className="pb-3">Imię</th>
            <th className="pb-3">Miasto</th>
            <th className="pb-3">Administrator</th>
            <th className="pb-3">Profil</th>

          </tr>

        </thead>

        <tbody>

          {users.map((user) => (

            <tr
              key={user.id}
              className="border-b"
            >

              <td className="py-4">

                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-300">
                    👤
                  </div>
                )}

              </td>

              <td>{user.name || "-"}</td>

              <td>{user.city || "-"}</td>

              <td>
                {user.is_admin ? "✅" : "—"}
              </td>

              <td>

                <Link
                  href={`/profil/${user.id}`}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Profil
                </Link>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}