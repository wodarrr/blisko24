import Link from "next/link";
import { getAdvertisement } from "../../../lib/getAdvertisement";
import ReportButton from "../../../components/ReportButton";
import AddReview from "../../../components/AddReview";
import AdminAdvertisementActions from "../../../components/AdminAdvertisementActions";
import AdvertisementAuthor from "../../../components/advertisement/AdvertisementAuthor";
import AdvertisementGallery from "../../../components/advertisement/AdvertisementGallery";
import OwnerPromotionButton from "../../../components/advertisement/OwnerPromotionButton";
import CandidateContactGate from "../../../components/advertisement/CandidateContactGate";

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
      <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="w-full max-w-lg rounded-3xl bg-white p-10 text-center shadow">
          <div className="text-6xl">📄</div>

          <h1 className="mt-5 text-3xl font-bold text-slate-900">
            Ogłoszenie nie istnieje
          </h1>

          <p className="mt-3 text-gray-500">
            Ogłoszenie mogło zostać usunięte albo podany adres
            jest nieprawidłowy.
          </p>

          <Link
            href="/"
            className="mt-7 inline-flex rounded-xl bg-blue-700 px-6 py-3 font-bold text-white hover:bg-blue-800"
          >
            Wróć na stronę główną
          </Link>
        </div>
      </main>
    );
  }

  const isJobSeeker =
    advertisement.category === "Szukam pracy";

  const hasPrice =
    advertisement.price !== null &&
    advertisement.price !== undefined &&
    String(advertisement.price).trim() !== "";

  const numericPrice = Number(advertisement.price);

  const formattedPrice =
    hasPrice && !Number.isNaN(numericPrice)
      ? `${numericPrice.toLocaleString("pl-PL")} zł`
      : hasPrice
        ? String(advertisement.price)
            .toLowerCase()
            .includes("zł")
          ? String(advertisement.price)
          : `${advertisement.price} zł`
        : "Cena do uzgodnienia";

  return (
    <main className="min-h-screen bg-gray-100 py-8 sm:py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <article className="overflow-hidden rounded-3xl bg-white shadow">
          <div className="p-5 sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              {advertisement.category && (
                <span className="rounded-full bg-blue-100 px-3 py-1.5 text-sm font-bold text-blue-700">
                  {advertisement.category}
                </span>
              )}

              {advertisement.promoted && (
                <span className="rounded-full bg-yellow-400 px-3 py-1.5 text-sm font-extrabold text-slate-900">
                  ⭐ PROMOWANE
                </span>
              )}

              {advertisement.urgent && (
                <span className="rounded-full bg-red-600 px-3 py-1.5 text-sm font-extrabold text-white">
                  🔥 PILNE
                </span>
              )}

              {advertisement.featured && (
                <span className="rounded-full bg-purple-600 px-3 py-1.5 text-sm font-extrabold text-white">
                  📌 WYRÓŻNIONE
                </span>
              )}

              {isJobSeeker && (
                <span className="rounded-full bg-green-100 px-3 py-1.5 text-sm font-extrabold text-green-700">
                  💙 KANDYDAT — BEZPŁATNIE
                </span>
              )}
            </div>

            <h1 className="mt-5 break-words text-3xl font-extrabold text-slate-900 sm:text-4xl">
              {advertisement.title}
            </h1>

            <div className="mt-4 flex flex-col gap-2 text-slate-600 sm:flex-row sm:flex-wrap sm:gap-5">
              <p>📍 {advertisement.city || "Brak miasta"}</p>

              {advertisement.province && (
                <p>🗺️ {advertisement.province}</p>
              )}

              <p>
                👁️{" "}
                {(advertisement.views ?? 0).toLocaleString("pl-PL")}{" "}
                wyświetleń
              </p>
            </div>

            <p className="mt-6 break-words text-3xl font-extrabold text-blue-700">
              {formattedPrice}
            </p>

            <OwnerPromotionButton
              advertisementId={advertisement.id}
              ownerId={advertisement.user_id}
            />
          </div>

          <AdvertisementGallery
            title={advertisement.title}
            images={advertisement.advertisement_images}
            fallbackImage={advertisement.image_url}
          />

          <div className="p-5 sm:p-8">
            <section>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Opis
              </h2>

              <p className="mt-4 whitespace-pre-line break-words leading-7 text-slate-700">
                {advertisement.description?.trim() || "Brak opisu."}
              </p>
            </section>

            <hr className="my-8 border-slate-200" />

            <section>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Kontakt
              </h2>

              {isJobSeeker ? (
                <CandidateContactGate
                  advertisementId={advertisement.id}
                  ownerId={advertisement.user_id}
                />
              ) : (
                <>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {advertisement.phone && (
                      <a
                        href={`tel:${String(advertisement.phone).replace(/[^\d+]/g, "")}`}
                        className="flex min-h-14 items-center rounded-xl border border-slate-200 px-5 py-4 font-semibold text-slate-800 transition hover:bg-slate-50"
                      >
                        📞 {advertisement.phone}
                      </a>
                    )}

                    {advertisement.email && (
                      <a
                        href={`mailto:${advertisement.email}`}
                        className="flex min-h-14 items-center break-all rounded-xl border border-slate-200 px-5 py-4 font-semibold text-slate-800 transition hover:bg-slate-50"
                      >
                        📧 {advertisement.email}
                      </a>
                    )}
                  </div>

                  <Link
                    href={`/wiadomosci/nowa?ad=${advertisement.id}`}
                    className="mt-6 flex w-full items-center justify-center rounded-xl bg-blue-700 px-6 py-4 text-center font-bold text-white transition hover:bg-blue-800 sm:w-auto"
                  >
                    💬 Napisz wiadomość
                  </Link>
                </>
              )}
            </section>

            <hr className="my-8 border-slate-200" />

            <section className="rounded-3xl bg-slate-50 p-5 sm:p-6">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">
                Dodane przez
              </p>

              <div className="mt-5">
                <AdvertisementAuthor
                  userId={advertisement.user_id}
                  profile={advertisement.profiles}
                />
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {advertisement.user_id ? (
                  <Link
                    href={`/profil/${advertisement.user_id}`}
                    className="flex min-h-14 w-full items-center justify-center rounded-xl bg-slate-800 px-5 py-3 text-center font-bold text-white transition hover:bg-slate-900"
                  >
                    👤 Zobacz profil
                  </Link>
                ) : (
                  <div className="flex min-h-14 w-full items-center justify-center rounded-xl bg-slate-200 px-5 py-3 text-center font-semibold text-slate-500">
                    Profil niedostępny
                  </div>
                )}

                <div className="w-full [&_button]:min-h-14 [&_button]:w-full">
                  <ReportButton advertisementId={advertisement.id} />
                </div>
              </div>
            </section>
          </div>
        </article>

        {advertisement.user_id && (
          <AddReview
            reviewedUserId={advertisement.user_id}
            advertisementId={advertisement.id}
          />
        )}

        <AdminAdvertisementActions
          advertisementId={advertisement.id}
        />
      </div>
    </main>
  );
}