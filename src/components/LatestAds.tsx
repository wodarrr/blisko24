import { getAdvertisements } from "../lib/getAdvertisements";
import Link from "next/link";
export default async function LatestAds() {
  const advertisements = await getAdvertisements();

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <h2 className="mb-8 text-3xl font-bold">
        Najnowsze ogłoszenia
      </h2>

      <div className="grid gap-6 md:grid-cols-3">
        {advertisements.map((advertisement: any) => (
          <div
            key={advertisement.id}
            className="rounded-2xl bg-white p-6 shadow"
          >
            <h3 className="text-xl font-bold">
              {advertisement.title}
            </h3>

            <p className="mt-2 text-gray-600">
              📍 {advertisement.city}
            </p>

            <p className="mt-4 font-semibold text-blue-700">
              {advertisement.price}
            </p>
            <Link
  href={`/ogloszenie/${advertisement.id}`}
  className="mt-6 inline-block rounded-xl bg-blue-700 px-4 py-2 font-semibold text-white hover:bg-blue-800"
>
  Zobacz więcej
</Link>
          </div>
        ))}
      </div>
    </section>
  );
}