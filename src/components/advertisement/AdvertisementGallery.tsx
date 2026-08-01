"use client";

import { useMemo, useState } from "react";

type AdvertisementImage = {
  id: number;
  image_url: string;
  position: number;
};

type Props = {
  title: string;
  images?: AdvertisementImage[] | null;
  fallbackImage?: string | null;
};

export default function AdvertisementGallery({
  title,
  images,
  fallbackImage,
}: Props) {
  const galleryImages = useMemo(() => {
    const sortedImages = [...(images ?? [])]
      .filter((image) => Boolean(image.image_url))
      .sort((first, second) => first.position - second.position);

    if (
      sortedImages.length === 0 &&
      fallbackImage
    ) {
      return [
        {
          id: -1,
          image_url: fallbackImage,
          position: 1,
        },
      ];
    }

    return sortedImages;
  }, [images, fallbackImage]);

  const [activeIndex, setActiveIndex] = useState(0);

  function showPreviousImage() {
    setActiveIndex((currentIndex) =>
      currentIndex === 0
        ? galleryImages.length - 1
        : currentIndex - 1
    );
  }

  function showNextImage() {
    setActiveIndex((currentIndex) =>
      currentIndex === galleryImages.length - 1
        ? 0
        : currentIndex + 1
    );
  }

  if (galleryImages.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center bg-slate-100 text-slate-400 sm:h-96">
        <span className="text-6xl">
          📷
        </span>

        <span className="mt-3 font-semibold">
          Brak zdjęcia
        </span>
      </div>
    );
  }

  const activeImage = galleryImages[activeIndex];

  return (
    <section className="bg-slate-950">
      <div className="relative flex min-h-64 items-center justify-center sm:min-h-96">
        <img
          src={activeImage.image_url}
          alt={`${title} — zdjęcie ${activeIndex + 1}`}
          className="max-h-[650px] w-full object-contain"
        />

        {galleryImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={showPreviousImage}
              aria-label="Poprzednie zdjęcie"
              className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-2xl text-white backdrop-blur transition hover:bg-black/75 sm:left-5"
            >
              ‹
            </button>

            <button
              type="button"
              onClick={showNextImage}
              aria-label="Następne zdjęcie"
              className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-2xl text-white backdrop-blur transition hover:bg-black/75 sm:right-5"
            >
              ›
            </button>

            <div className="absolute bottom-4 right-4 rounded-full bg-black/65 px-3 py-1.5 text-sm font-bold text-white backdrop-blur">
              {activeIndex + 1}/{galleryImages.length}
            </div>
          </>
        )}
      </div>

      {galleryImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto border-t border-white/10 p-4">
          {galleryImages.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Pokaż zdjęcie ${index + 1}`}
              className={`shrink-0 overflow-hidden rounded-xl transition ${
                activeIndex === index
                  ? "ring-4 ring-blue-500"
                  : "opacity-70 hover:opacity-100"
              }`}
            >
              <img
                src={image.image_url}
                alt={`${title} — miniatura ${index + 1}`}
                className="h-20 w-28 object-cover sm:h-24 sm:w-36"
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}