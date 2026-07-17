import { getAdvertisement } from "../../../lib/getAdvertisement";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdvertisementPage({ params }: Props) {
  const { id } = await params;

  const advertisement = await getAdvertisement(id);

  if (!advertisement) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-3xl font-bold">
          Ogłoszenie nie istnieje
        </h1>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 py-12">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow">

        <p className="mb-2 text-sm text-slate-500">
          {advertisement.category}
        </p>

        <h1 className="text-4xl font-bold">
          {advertisement.title}
        </h1>

        <p className="mt-3 text-lg text-slate-600">
          📍 {advertisement.city}
        </p>

        <p className="mt-6 text-3xl font-bold text-blue-700">
          {advertisement.price} zł
        </p>

        <hr className="my-8" />

        <h2 className="text-2xl font-bold">
          Opis
        </h2>

        <p className="mt-4 whitespace-pre-line text-slate-700">
          {advertisement.description || "Brak opisu."}
        </p>

        <hr className="my-8" />

        <h2 className="text-2xl font-bold">
          Kontakt
        </h2>

        <div className="mt-6 space-y-3">
          <p>📞 {advertisement.phone}</p>
          <p>📧 {advertisement.email}</p>
        </div>

      </div>
    </main>
  );
}