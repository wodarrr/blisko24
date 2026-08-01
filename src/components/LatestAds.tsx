import { getAdvertisements } from "../lib/getAdvertisements";
import AdvertisementCard from "./AdvertisementCard";

type Props = {
  search?: string;
  category?: string;
  province?: string;
  city?: string;
  sort?: string;
};

export default async function LatestAds({
  search,
  category,
  province,
  city,
  sort,
}: Props) {
  const advertisements = await getAdvertisements(
  search,
  category,
  province,
  city,
  sort
);

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">

      <h2 className="mb-8 text-3xl font-bold">
        Najnowsze ogłoszenia
      </h2>

      {advertisements.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center shadow">
          <p className="text-lg text-gray-500">
            Nie znaleziono żadnych ogłoszeń.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {advertisements.map((advertisement: any) => (
            <AdvertisementCard
              key={advertisement.id}
              advertisement={advertisement}
            />
          ))}
        </div>
      )}

    </section>
  );
}