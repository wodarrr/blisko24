"use client";

import Link from "next/link";

export type AdminReport = {
  id: number;
  reason: string | null;
  advertisement_id: number | null;

  advertisements?: {
    id: number;
    title: string | null;
  } | null;

  profiles?: {
    name: string | null;
  } | null;
};

type Props = {
  reports: AdminReport[];
};

export default function ReportsTable({
  reports,
}: Props) {
  return (
    <section className="overflow-hidden rounded-3xl bg-white shadow">
      <div className="border-b border-slate-200 p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-slate-900">
          🚩 Zgłoszenia
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Liczba zgłoszeń: {reports.length}
        </p>
      </div>

      {reports.length === 0 ? (
        <div className="p-8 text-center">
          <div className="text-5xl">✅</div>

          <p className="mt-4 font-semibold text-green-700">
            Brak zgłoszeń wymagających sprawdzenia.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-[800px] w-full">
            <thead className="bg-slate-50">
              <tr className="text-left text-sm text-slate-600">
                <th className="px-6 py-4">Ogłoszenie</th>
                <th className="px-6 py-4">Powód</th>
                <th className="px-6 py-4">Zgłosił</th>
                <th className="px-6 py-4">Akcja</th>
              </tr>
            </thead>

            <tbody>
              {reports.map((report) => (
                <tr
                  key={report.id}
                  className="border-t border-slate-100"
                >
                  <td className="max-w-xs px-6 py-5">
                    <p className="truncate font-semibold text-slate-900">
                      {report.advertisements?.title ||
                        "Ogłoszenie niedostępne"}
                    </p>
                  </td>

                  <td className="max-w-sm px-6 py-5 text-slate-700">
                    <p className="break-words">
                      {report.reason || "Brak podanego powodu"}
                    </p>
                  </td>

                  <td className="px-6 py-5 text-slate-600">
                    {report.profiles?.name ||
                      "Użytkownik BLISKO24"}
                  </td>

                  <td className="px-6 py-5">
                    {report.advertisement_id ? (
                      <Link
                        href={`/ogloszenie/${report.advertisement_id}`}
                        className="inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                      >
                        Otwórz
                      </Link>
                    ) : (
                      <span className="text-sm text-slate-400">
                        Niedostępne
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}