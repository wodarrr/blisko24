import Link from "next/link";

type Props = {
  id: number;
  title: string;
  city: string;
  price: string;
  image_url: string;
};

export default function AdvertisementCard({
  id,
  title,
  city,
  price,
  image_url,
}: Props) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow">
      <div className="flex gap-6">

        {image_url && (
          <img
            src={image_url}
            alt={title}
            className="h-32 w-40 rounded-xl object-cover"
          />
        )}

        <div className="flex-1">

          <h2 className="text-2xl font-bold">
            {title}
          </h2>

          <p className="mt-2">
            📍 {city}
          </p>

          <p className="mt-2 font-bold text-blue-700">
            {price} zł
          </p>

          <Link
            href={`/ogloszenie/${id}`}
            className="mt-5 inline-block rounded-lg bg-blue-700 px-4 py-2 text-white"
          >
            Zobacz
          </Link>

        </div>

      </div>
    </div>
  );
}