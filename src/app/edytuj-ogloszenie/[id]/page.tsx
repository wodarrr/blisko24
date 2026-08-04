"use client";

import {
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import {
  useParams,
  useRouter,
} from "next/navigation";

import { supabase } from "../../../lib/supabase";

const MAX_IMAGES = 10;
const MAX_FILE_SIZE = 8 * 1024 * 1024;

const categories = [
  "Szukam pracy",
  "Oferuję pracę",
  "Szukam fachowca",
  "Oferuję usługi",
  "Potrzebuję pomocy",
];

const provinces = [
  "Dolnośląskie",
  "Kujawsko-pomorskie",
  "Lubelskie",
  "Lubuskie",
  "Łódzkie",
  "Małopolskie",
  "Mazowieckie",
  "Opolskie",
  "Podkarpackie",
  "Podlaskie",
  "Pomorskie",
  "Śląskie",
  "Świętokrzyskie",
  "Warmińsko-mazurskie",
  "Wielkopolskie",
  "Zachodniopomorskie",
];

type AdvertisementForm = {
  title: string;
  category: string;
  description: string;
  province: string;
  city: string;
  price: string;
  phone: string;
  email: string;
};

type GalleryImage = {
  key: string;
  id: number | null;
  image_url: string;
  storage_path: string | null;
  file: File | null;
  isNew: boolean;
};

type DatabaseImage = {
  id: number;
  image_url: string;
  storage_path: string | null;
  position: number;
};

const emptyAdvertisement: AdvertisementForm = {
  title: "",
  category: "",
  description: "",
  province: "",
  city: "",
  price: "",
  phone: "",
  email: "",
};

export default function EditAdvertisementPage() {
  const params = useParams();
  const router = useRouter();

  const rawId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const advertisementId = Number(rawId);

  const [advertisement, setAdvertisement] =
    useState<AdvertisementForm>(
      emptyAdvertisement
    );

  const [gallery, setGallery] =
    useState<GalleryImage[]>([]);

  const [
    removedStoragePaths,
    setRemovedStoragePaths,
  ] = useState<string[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadAdvertisement() {
      if (
        !Number.isInteger(advertisementId) ||
        advertisementId <= 0
      ) {
        router.replace("/moje-ogloszenia");
        return;
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (cancelled) return;

      if (userError || !user) {
        router.replace("/logowanie");
        return;
      }

      const { data, error } = await supabase
        .from("advertisements")
        .select(`
          id,
          user_id,
          title,
          category,
          description,
          province,
          city,
          price,
          phone,
          email,
          advertisement_images (
            id,
            image_url,
            storage_path,
            position
          )
        `)
        .eq("id", advertisementId)
        .order("position", {
          referencedTable:
            "advertisement_images",
          ascending: true,
        })
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        console.error(
          "Błąd pobierania ogłoszenia:",
          error
        );

        setErrorMessage(
          "Nie udało się pobrać ogłoszenia."
        );

        setLoading(false);
        return;
      }

      if (!data) {
        alert("Ogłoszenie nie istnieje.");
        router.replace("/moje-ogloszenia");
        return;
      }

      if (data.user_id !== user.id) {
        alert(
          "Nie masz uprawnień do edycji tego ogłoszenia."
        );

        router.replace("/moje-ogloszenia");
        return;
      }

      setAdvertisement({
        title: data.title ?? "",
        category: data.category ?? "",
        description: data.description ?? "",
        province: data.province ?? "",
        city: data.city ?? "",
        price:
          data.price === null ||
          data.price === undefined
            ? ""
            : String(data.price),
        phone: data.phone ?? "",
        email: data.email ?? "",
      });

      const databaseImages =
        Array.isArray(
          data.advertisement_images
        )
          ? (data.advertisement_images as DatabaseImage[])
          : [];

      setGallery(
        databaseImages
          .sort(
            (first, second) =>
              first.position - second.position
          )
          .map((image) => ({
            key: `existing-${image.id}`,
            id: image.id,
            image_url: image.image_url,
            storage_path:
              image.storage_path ?? null,
            file: null,
            isNew: false,
          }))
      );

      setLoading(false);
    }

    loadAdvertisement();

    return () => {
      cancelled = true;
    };
  }, [advertisementId, router]);

  useEffect(() => {
    return () => {
      gallery.forEach((image) => {
        if (
          image.isNew &&
          image.image_url.startsWith("blob:")
        ) {
          URL.revokeObjectURL(
            image.image_url
          );
        }
      });
    };
  }, [gallery]);

  function updateField(
    field: keyof AdvertisementForm,
    value: string
  ) {
    setAdvertisement((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function handleImagesChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(
      event.target.files ?? []
    );

    event.target.value = "";

    if (files.length === 0) return;

    const freePlaces =
      MAX_IMAGES - gallery.length;

    if (freePlaces <= 0) {
      alert(
        "Ogłoszenie może mieć maksymalnie 10 zdjęć."
      );
      return;
    }

    const acceptedFiles: File[] = [];

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        alert(
          `Plik „${file.name}” nie jest zdjęciem.`
        );
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        alert(
          `Zdjęcie „${file.name}” jest za duże. Maksymalnie 8 MB.`
        );
        continue;
      }

      acceptedFiles.push(file);
    }

    if (acceptedFiles.length > freePlaces) {
      alert(
        `Możesz dodać jeszcze tylko ${freePlaces} zdjęć.`
      );
    }

    const newImages = acceptedFiles
      .slice(0, freePlaces)
      .map((file, index) => ({
        key: `new-${Date.now()}-${index}-${Math.random()}`,
        id: null,
        image_url:
          URL.createObjectURL(file),
        storage_path: null,
        file,
        isNew: true,
      }));

    setGallery((previous) => [
      ...previous,
      ...newImages,
    ]);
  }

  function removeImage(index: number) {
    setGallery((previous) => {
      const image = previous[index];

      if (!image) return previous;

      if (
        image.isNew &&
        image.image_url.startsWith("blob:")
      ) {
        URL.revokeObjectURL(
          image.image_url
        );
      }

      if (
        !image.isNew &&
        image.storage_path
      ) {
        setRemovedStoragePaths(
          (paths) => [
            ...paths,
            image.storage_path as string,
          ]
        );
      }

      return previous.filter(
        (_, imageIndex) =>
          imageIndex !== index
      );
    });
  }

  function moveImageLeft(index: number) {
    if (index <= 0) return;

    setGallery((previous) => {
      const updated = [...previous];

      [
        updated[index - 1],
        updated[index],
      ] = [
        updated[index],
        updated[index - 1],
      ];

      return updated;
    });
  }

  function moveImageRight(index: number) {
    setGallery((previous) => {
      if (index >= previous.length - 1) {
        return previous;
      }

      const updated = [...previous];

      [
        updated[index],
        updated[index + 1],
      ] = [
        updated[index + 1],
        updated[index],
      ];

      return updated;
    });
  }

  function setAsMainImage(index: number) {
    if (index === 0) return;

    setGallery((previous) => {
      const updated = [...previous];
      const [selectedImage] =
        updated.splice(index, 1);

      updated.unshift(selectedImage);

      return updated;
    });
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (saving) return;

    const title =
      advertisement.title.trim();

    const category =
      advertisement.category.trim();

    const description =
      advertisement.description.trim();

    const province =
      advertisement.province.trim();

    const city =
      advertisement.city.trim();

    const price =
      advertisement.price.trim();

    const phone =
      advertisement.phone.trim();

    const email =
      advertisement.email.trim();

    if (title.length < 3) {
      alert(
        "Tytuł powinien mieć przynajmniej 3 znaki."
      );
      return;
    }

    if (!category) {
      alert("Wybierz kategorię.");
      return;
    }

    if (!province) {
      alert("Wybierz województwo.");
      return;
    }

    if (!city) {
      alert("Wpisz miasto.");
      return;
    }

    if (gallery.length > MAX_IMAGES) {
      alert(
        "Ogłoszenie może mieć maksymalnie 10 zdjęć."
      );
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/logowanie");
      return;
    }

    setSaving(true);
    setErrorMessage("");

    const uploadedPaths: string[] = [];

    try {
      const uploadedGallery: GalleryImage[] =
        [];

      for (
        let index = 0;
        index < gallery.length;
        index += 1
      ) {
        const image = gallery[index];

        if (!image.isNew || !image.file) {
          uploadedGallery.push(image);
          continue;
        }

        const extension =
          image.file.name
            .split(".")
            .pop()
            ?.toLowerCase() || "jpg";

        const fileName =
          `${Date.now()}-${index}-` +
          `${Math.random()
            .toString(36)
            .slice(2)}.${extension}`;

        const storagePath =
          `${user.id}/` +
          `${advertisementId}/` +
          fileName;

        const { error: uploadError } =
          await supabase.storage
            .from("advertisements")
            .upload(
              storagePath,
              image.file,
              {
                cacheControl: "3600",
                upsert: false,
                contentType:
                  image.file.type,
              }
            );

        if (uploadError) {
          throw uploadError;
        }

        uploadedPaths.push(
          storagePath
        );

        const { data: publicUrlData } =
          supabase.storage
            .from("advertisements")
            .getPublicUrl(storagePath);

        uploadedGallery.push({
          ...image,
          image_url:
            publicUrlData.publicUrl,
          storage_path:
            storagePath,
          file: null,
          isNew: false,
        });
      }

      const {
        data: updatedAdvertisement,
        error: updateError,
      } = await supabase
        .from("advertisements")
        .update({
          title,
          category,
          description,
          province,
          city,
          price,
          phone,
          email,

          status: "pending",
          approved_at: null,
          approved_by: null,
          rejected_at: null,
          rejected_by: null,
          rejection_reason: null,
        })
        .eq("id", advertisementId)
        .eq("user_id", user.id)
        .select("id")
        .maybeSingle();

      if (
        updateError ||
        !updatedAdvertisement
      ) {
        throw (
          updateError ??
          new Error(
            "Nie udało się zaktualizować ogłoszenia."
          )
        );
      }

      const { error: galleryError } =
        await supabase.rpc(
          "replace_advertisement_gallery",
          {
            p_advertisement_id:
              advertisementId,

            p_images:
              uploadedGallery.map(
                (image) => ({
                  image_url:
                    image.image_url,

                  storage_path:
                    image.storage_path,
                })
              ),
          }
        );

      if (galleryError) {
        throw galleryError;
      }

      if (
        removedStoragePaths.length > 0
      ) {
        const { error: removeError } =
          await supabase.storage
            .from("advertisements")
            .remove(
              removedStoragePaths
            );

        if (removeError) {
          console.error(
            "Nie udało się usunąć części starych zdjęć ze Storage:",
            removeError
          );
        }
      }

      gallery.forEach((image) => {
        if (
          image.isNew &&
          image.image_url.startsWith(
            "blob:"
          )
        ) {
          URL.revokeObjectURL(
            image.image_url
          );
        }
      });

      alert(
        "Ogłoszenie zostało zapisane i ponownie wysłane do moderacji."
      );

      router.push(
        "/moje-ogloszenia"
      );

      router.refresh();
    } catch (error) {
      console.error(
        "Błąd zapisywania ogłoszenia:",
        error
      );

      if (uploadedPaths.length > 0) {
        const { error: cleanupError } =
          await supabase.storage
            .from("advertisements")
            .remove(uploadedPaths);

        if (cleanupError) {
          console.error(
            "Błąd sprzątania nowych zdjęć:",
            cleanupError
          );
        }
      }

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Nie udało się zapisać zmian."
      );

      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="rounded-3xl bg-white p-10 text-center shadow">
          <div className="text-5xl">
            ✏️
          </div>

          <p className="mt-4 font-semibold text-slate-700">
            Ładowanie ogłoszenia...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 py-8 sm:py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <Link
          href="/moje-ogloszenia"
          className="font-semibold text-blue-700 hover:underline"
        >
          ← Wróć do moich ogłoszeń
        </Link>

        <div className="mt-5">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-green-700">
            Zarządzanie ogłoszeniem
          </p>

          <h1 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Edytuj ogłoszenie
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-7 rounded-3xl bg-white p-5 shadow sm:p-8"
        >
          <section>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  Zdjęcia ogłoszenia
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Pierwsze zdjęcie jest
                  zdjęciem głównym.
                </p>
              </div>

              <p className="font-bold text-blue-700">
                {gallery.length}/
                {MAX_IMAGES}
              </p>
            </div>

            {gallery.length <
              MAX_IMAGES && (
              <label className="mt-5 flex cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50 px-6 py-7 text-center font-bold text-blue-700 transition hover:border-blue-500 hover:bg-blue-100">
                📷 Dodaj zdjęcia

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={
                    handleImagesChange
                  }
                  className="hidden"
                />
              </label>
            )}

            {gallery.length === 0 ? (
              <div className="mt-5 rounded-2xl bg-slate-100 p-8 text-center text-slate-500">
                To ogłoszenie nie ma
                jeszcze zdjęć.
              </div>
            ) : (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {gallery.map(
                  (image, index) => (
                    <article
                      key={image.key}
                      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                    >
                      <div className="relative">
                        <img
                          src={
                            image.image_url
                          }
                          alt={`Zdjęcie ${
                            index + 1
                          }`}
                          className="h-52 w-full object-cover"
                        />

                        {index === 0 && (
                          <span className="absolute left-3 top-3 rounded-full bg-yellow-400 px-3 py-1 text-xs font-extrabold text-slate-900 shadow">
                            ⭐ GŁÓWNE
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            removeImage(
                              index
                            )
                          }
                          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-xl font-bold text-white shadow hover:bg-red-700"
                          aria-label={`Usuń zdjęcie ${
                            index + 1
                          }`}
                        >
                          ×
                        </button>
                      </div>

                      <div className="space-y-3 p-3">
                        {index !== 0 && (
                          <button
                            type="button"
                            onClick={() =>
                              setAsMainImage(
                                index
                              )
                            }
                            className="w-full rounded-xl bg-yellow-100 px-3 py-2 text-sm font-bold text-yellow-900 hover:bg-yellow-200"
                          >
                            ⭐ Ustaw jako główne
                          </button>
                        )}

                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              moveImageLeft(
                                index
                              )
                            }
                            disabled={
                              index === 0
                            }
                            className="flex-1 rounded-xl bg-slate-100 px-3 py-2 font-bold text-slate-700 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            ←
                          </button>

                          <span className="text-sm font-bold text-slate-500">
                            {index + 1}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              moveImageRight(
                                index
                              )
                            }
                            disabled={
                              index ===
                              gallery.length -
                                1
                            }
                            className="flex-1 rounded-xl bg-slate-100 px-3 py-2 font-bold text-slate-700 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            →
                          </button>
                        </div>
                      </div>
                    </article>
                  )
                )}
              </div>
            )}
          </section>

          <hr className="border-slate-200" />

          <div>
            <label
              htmlFor="edit-title"
              className="mb-2 block font-bold text-slate-800"
            >
              Tytuł
            </label>

            <input
              id="edit-title"
              value={
                advertisement.title
              }
              onChange={(event) =>
                updateField(
                  "title",
                  event.target.value
                )
              }
              maxLength={120}
              required
              className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div>
            <label
              htmlFor="edit-category"
              className="mb-2 block font-bold text-slate-800"
            >
              Kategoria
            </label>

            <select
              id="edit-category"
              value={
                advertisement.category
              }
              onChange={(event) =>
                updateField(
                  "category",
                  event.target.value
                )
              }
              required
              className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="">
                Wybierz kategorię
              </option>

              {categories.map(
                (category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label
              htmlFor="edit-description"
              className="mb-2 block font-bold text-slate-800"
            >
              Opis
            </label>

            <textarea
              id="edit-description"
              value={
                advertisement.description
              }
              onChange={(event) =>
                updateField(
                  "description",
                  event.target.value
                )
              }
              rows={7}
              maxLength={5000}
              className="w-full resize-y rounded-xl border border-slate-300 p-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />

            <p className="mt-2 text-right text-xs text-slate-400">
              {
                advertisement
                  .description.length
              }
              /5000
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="edit-province"
                className="mb-2 block font-bold text-slate-800"
              >
                Województwo
              </label>

              <select
                id="edit-province"
                value={
                  advertisement.province
                }
                onChange={(event) =>
                  updateField(
                    "province",
                    event.target.value
                  )
                }
                required
                className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                <option value="">
                  Wybierz województwo
                </option>

                {provinces.map(
                  (province) => (
                    <option
                      key={province}
                      value={province}
                    >
                      {province}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label
                htmlFor="edit-city"
                className="mb-2 block font-bold text-slate-800"
              >
                Miasto
              </label>

              <input
                id="edit-city"
                value={
                  advertisement.city
                }
                onChange={(event) =>
                  updateField(
                    "city",
                    event.target.value
                  )
                }
                required
                className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="edit-price"
              className="mb-2 block font-bold text-slate-800"
            >
              Cena
            </label>

            <input
              id="edit-price"
              value={
                advertisement.price
              }
              onChange={(event) =>
                updateField(
                  "price",
                  event.target.value
                )
              }
              inputMode="decimal"
              placeholder="Np. 150"
              className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="edit-phone"
                className="mb-2 block font-bold text-slate-800"
              >
                Telefon
              </label>

              <input
                id="edit-phone"
                type="tel"
                value={
                  advertisement.phone
                }
                onChange={(event) =>
                  updateField(
                    "phone",
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="edit-email"
                className="mb-2 block font-bold text-slate-800"
              >
                E-mail
              </label>

              <input
                id="edit-email"
                type="email"
                value={
                  advertisement.email
                }
                onChange={(event) =>
                  updateField(
                    "email",
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>

          {errorMessage && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 font-semibold text-red-700">
              {errorMessage}
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-green-600 px-6 py-4 font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Zapisywanie..."
                : "💾 Zapisz zmiany"}
            </button>

            <Link
              href={`/ogloszenie/${advertisementId}`}
              className="flex items-center justify-center rounded-xl bg-slate-200 px-6 py-4 font-bold text-slate-700 hover:bg-slate-300"
            >
              Anuluj
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}