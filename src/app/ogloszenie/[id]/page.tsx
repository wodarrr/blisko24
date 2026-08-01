import Link from "next/link";
import { getAdvertisement } from "../../../lib/getAdvertisement";
import ReportButton from "../../../components/ReportButton";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdvertisementPage({
  params,
}: Props) {
  const { id } = await params;

  const advertisement = await getAdvertisement(id);

  if (!advertisement) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-bold">
          Ogłoszenie nie istnieje
        </h1>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 py-8 sm:py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <article className="overflow-hidden rounded-2xl bg-white shadow">

          <div className="p-5 sm:p-8">
            <p className="mb-2 text-sm font-semibold text-blue-700">
              {advertisement.category}
            </p>

            <h1 className="break-words text-3xl font-bold text-slate-900 sm:text-4xl">
              {advertisement.title}
            </h1>

            <div className="mt-4 flex flex-col gap-2 text-slate-600 sm:flex-row sm:flex-wrap sm:gap-5">
              <p>📍 {advertisement.city}</p>

              {advertisement.province && (
                <p>🗺️ {advertisement.province}</p>
              )}

              <p>
                👁️ {advertisement.views ?? 0} wyświetleń
              </p>
            </div>

            <p className="mt-6 text-3xl font-extrabold text-blue-700">
              {advertisement.price
                ? `${advertisement.price} zł`
                : "Cena do uzgodnienia"}
            </p>
          </div>

          {advertisement.image_url ? (
            <img
              src={advertisement.image_url}
              alt={advertisement.title}
              className="max-h-[600px] w-full object-cover"
            />
          ) : (
            <div className="flex h-64 flex-col items-center justify-center bg-slate-100 text-slate-400 sm:h-96">
              <span className="text-5xl">📷</span>

              <span className="mt-3 font-medium">
                Brak zdjęcia
              </span>
            </div>
          )}

          <div className="p-5 sm:p-8">
            <section>
              <h2 className="text-2xl font-bold text-slate-900">
                Opis
              </h2>

              <p className="mt-4 whitespace-pre-line break-words leading-7 text-slate-700">
                {advertisement.description || "Brak opisu."}
              </p>
            </section>

            <hr className="my-8 border-slate-200" />

            <section>
              <h2 className="text-2xl font-bold text-slate-900">
                Kontakt
              </h2>

              <div className="mt-6 space-y-3 text-slate-700">
                {advertisement.phone && (
                  <p className="break-all">
                    📞 {advertisement.phone}
                  </p>
                )}

                {advertisement.email && (
                  <p className="break-all">
                    📧 {advertisement.email}
                  </p>
                )}
              </div>

              <Link
                href={`/wiadomosci/nowa?ad=${advertisement.id}`}
                className="mt-6 flex w-full items-center justify-center rounded-xl bg-blue-700 px-6 py-4 text-center font-bold text-white transition hover:bg-blue-800 sm:w-auto"
              >
                💬 Napisz wiadomość
              </Link>
            </section>

            <hr className="my-8 border-slate-200" />

            <section className="rounded-2xl bg-slate-50 p-5 sm:p-6">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Dodane przez
              </p>

              <p className="mt-2 text-xl font-bold text-slate-900">
                {advertisement.profiles?.name ??
                  "Użytkownik BLISKO24"}
              </p>

              {advertisement.profiles?.city && (
                <p className="mt-1 text-gray-500">
                  📍 {advertisement.profiles.city}
                </p>
              )}

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {advertisement.user_id ? (
                  <Link
                    href={`/profil/${advertisement.user_id}`}
                    className="flex min-h-12 w-full items-center justify-center rounded-xl bg-slate-800 px-5 py-3 text-center font-semibold text-white transition hover:bg-slate-900"
                  >
                    👤 Zobacz profil
                  </Link>
                ) : (
                  <div className="flex min-h-12 w-full items-center justify-center rounded-xl bg-slate-200 px-5 py-3 text-center font-semibold text-slate-500">
                    Profil niedostępny
                  </div>
                )}

                <div className="w-full">
                  <ReportButton
                    advertisementId={advertisement.id}
                  />
                </div>
              </div>
            </section>
          </div>

        </article>
      </div>
    </main>
  );
}