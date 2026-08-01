"use client";

import Link from "next/link";

type Advertisement = {
  id: number;
  title: string;
  city: string;
  price: number;
  profiles?: {
    name: string;
  } | null;
};

type Props = {
  advertisements: Advertisement[];
  onDelete: (id: number) => void;
};

export default function AdvertisementsTable({
  advertisements,
  onDelete,
}: Props) {
  return (
    <div className="rounded-2xl bg-white p-8 shadow">

      <h2 className="mb-6 text-2xl font-bold">
        Wszystkie ogłoszenia
      </h2>

      <table className="w-full">

        <thead>

          <tr className="border-b text-left">

            <th className="pb-3">
              Tytuł
            </th>

            <th className="pb-3">
              Autor
            </th>

            <th className="pb-3">
              Miasto
            </th>

            <th className="pb-3">
              Cena
            </th>

            <th className="pb-3">
              Akcja
            </th>

          </tr>

        </thead>

        <tbody>

          {advertisements.map((advertisement) => (

            <tr
              key={advertisement.id}
              className="border-b"
            >

              <td className="py-4">
                {advertisement.title}
              </td>

              <td>
                {advertisement.profiles?.name ?? "-"}
              </td>

              <td>
                {advertisement.city}
              </td>

              <td>
                {advertisement.price} zł
              </td>

              <td className="space-x-2">

                <Link
                  href={`/ogloszenie/${advertisement.id}`}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Zobacz
                </Link>

                <button
                  onClick={() => onDelete(advertisement.id)}
                  className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                >
                  Usuń
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}