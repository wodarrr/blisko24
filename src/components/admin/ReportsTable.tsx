"use client";

import Link from "next/link";

type Report = {
  id: number;
  reason: string;
  advertisement_id: number;
  advertisements?: {
    id: number;
    title: string;
  } | null;
  profiles?: {
    name: string;
  } | null;
};

type Props = {
  reports: Report[];
};

export default function ReportsTable({ reports }: Props) {
  return (
    <div className="mt-10 rounded-2xl bg-white p-8 shadow">

      <h2 className="mb-6 text-2xl font-bold">
        🚩 Zgłoszenia
      </h2>

      {reports.length === 0 ? (
        <p className="text-gray-500">
          Brak zgłoszeń.
        </p>
      ) : (
        <table className="w-full">

          <thead>

            <tr className="border-b text-left">

              <th className="pb-3">Ogłoszenie</th>
              <th className="pb-3">Powód</th>
              <th className="pb-3">Zgłosił</th>
              <th className="pb-3">Akcja</th>

            </tr>

          </thead>

          <tbody>

            {reports.map((report) => (

              <tr
                key={report.id}
                className="border-b"
              >

                <td className="py-4">
                  {report.advertisements?.title ?? "-"}
                </td>

                <td>
                  {report.reason}
                </td>

                <td>
                  {report.profiles?.name ?? "-"}
                </td>

                <td>

                  <Link
                    href={`/ogloszenie/${report.advertisement_id}`}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  >
                    Otwórz
                  </Link>

                </td>

              </tr>

            ))}

          </tbody>

        </table>
      )}

    </div>
  );
}