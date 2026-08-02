"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import AdvertisementForm from "../../components/AdvertisementForm";
import AdvertisementFields from "../../components/AdvertisementFields";

const MAX_IMAGES = 10;
const MAX_FILE_SIZE = 8 * 1024 * 1024;

type PreviewImage = {
  file: File;
  previewUrl: string;
};

export default function AddAdvertisementPage() {
  const router = useRouter();

  const [advertisement, setAdvertisement] = useState({
    title: "",
    category: "",
    description: "",
    province: "",
    city: "",
    price: "",
    phone: "",
    email: "",
  });

  const [selectedImages, setSelectedImages] =
    useState<PreviewImage[]>([]);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function checkUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/logowanie");
      }
    }

    checkUser();
  }, [router]);

  useEffect(() => {
    return () => {
      selectedImages.forEach((image) => {
        URL.revokeObjectURL(image.previewUrl);
      });
    };
  }, [selectedImages]);

  const remainingImages =
    MAX_IMAGES - selectedImages.length;

  const imageInputText = useMemo(() => {
    if (selectedImages.length === 0) {
      return `Możesz dodać maksymalnie ${MAX_IMAGES} zdjęć.`;
    }

    return `Wybrano ${selectedImages.length}/${MAX_IMAGES} zdjęć.`;
  }, [selectedImages.length]);

  function handleImagesChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(
      event.target.files ?? []
    );

    event.target.value = "";

    if (files.length === 0) return;

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
          `Zdjęcie „${file.name}” jest za duże. Maksymalny rozmiar to 8 MB.`
        );
        continue;
      }

      acceptedFiles.push(file);
    }

    const availableSlots =
      MAX_IMAGES - selectedImages.length;

    if (acceptedFiles.length > availableSlots) {
      alert(
        `Możesz dodać jeszcze tylko ${availableSlots} zdjęć.`
      );
    }

    const filesToAdd = acceptedFiles.slice(
      0,
      availableSlots
    );

    const newImages = filesToAdd.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setSelectedImages((previous) => [
      ...previous,
      ...newImages,
    ]);
  }

  function removeImage(index: number) {
    setSelectedImages((previous) => {
      const imageToRemove = previous[index];

      if (imageToRemove) {
        URL.revokeObjectURL(
          imageToRemove.previewUrl
        );
      }

      return previous.filter(
        (_, imageIndex) => imageIndex !== index
      );
    });
  }

  function moveImageLeft(index: number) {
    if (index === 0) return;

    setSelectedImages((previous) => {
      const updated = [...previous];

      [updated[index - 1], updated[index]] = [
        updated[index],
        updated[index - 1],
      ];

      return updated;
    });
  }

  function moveImageRight(index: number) {
    setSelectedImages((previous) => {
      if (index >= previous.length - 1) {
        return previous;
      }

      const updated = [...previous];

      [updated[index], updated[index + 1]] = [
        updated[index + 1],
        updated[index],
      ];

      return updated;
    });
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (saving) return;

    const form = event.currentTarget;
    const formData = new FormData(form);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error(
        "Błąd pobierania użytkownika:",
        userError
      );
    }

    if (!user) {
      alert("Musisz być zalogowany.");
      router.push("/logowanie");
      return;
    }

    const title = String(
      formData.get("title") ?? ""
    ).trim();

    const category = String(
      formData.get("category") ?? ""
    ).trim();

    const description = String(
      formData.get("description") ?? ""
    ).trim();

    const province = String(
      formData.get("province") ?? ""
    ).trim();

    const city = String(
      formData.get("city") ?? ""
    ).trim();

    const price = String(
      formData.get("price") ?? ""
    ).trim();

    const phone = String(
      formData.get("phone") ?? ""
    ).trim();

    const email = String(
      formData.get("email") ?? ""
    ).trim();

    if (!title) {
      alert("Wpisz tytuł ogłoszenia.");
      return;
    }

    if (!category) {
      alert("Wybierz kategorię.");
      return;
    }

    if (
      !province ||
      province === "Wybierz województwo"
    ) {
      alert("Wybierz województwo.");
      return;
    }

    if (!city) {
      alert("Wpisz miasto.");
      return;
    }

    setSaving(true);

    setAdvertisement({
      title,
      category,
      description,
      province,
      city,
      price,
      phone,
      email,
    });

    /*
     * Najpierw tworzymy ogłoszenie, aby otrzymać jego ID.
     * Zdjęcia zostaną zapisane w folderze:
     * advertisements/ID_UŻYTKOWNIKA/ID_OGŁOSZENIA/
     */
    const {
      data: createdAdvertisement,
      error: advertisementError,
    } = await supabase
      .from("advertisements")
      .insert([
        {
          title,
          category,
          description,
          province,
          city,
          price,
          phone,
          email,
          image_url: null,
          user_id: user.id,
          status: "pending",
          approved_at: null,
          approved_by: null,
        },
      ])
      .select("id")
      .single();

    if (
      advertisementError ||
      !createdAdvertisement
    ) {
      console.error(
        "Błąd zapisu ogłoszenia:",
        advertisementError
      );

      alert("Nie udało się zapisać ogłoszenia.");
      setSaving(false);
      return;
    }

    const advertisementId =
      createdAdvertisement.id;

    const uploadedFiles: {
      path: string;
      url: string;
      position: number;
    }[] = [];

    try {
      for (
        let index = 0;
        index < selectedImages.length;
        index += 1
      ) {
        const image = selectedImages[index];

        const extension =
          image.file.name
            .split(".")
            .pop()
            ?.toLowerCase() || "jpg";

        const uniqueName = `${Date.now()}-${index}-${Math.random()
          .toString(36)
          .slice(2)}.${extension}`;

        const storagePath = `${user.id}/${advertisementId}/${uniqueName}`;

        const { error: uploadError } =
          await supabase.storage
            .from("advertisements")
            .upload(
              storagePath,
              image.file,
              {
                cacheControl: "3600",
                upsert: false,
                contentType: image.file.type,
              }
            );

        if (uploadError) {
          throw uploadError;
        }

        const { data: publicUrlData } =
          supabase.storage
            .from("advertisements")
            .getPublicUrl(storagePath);

        uploadedFiles.push({
          path: storagePath,
          url: publicUrlData.publicUrl,
          position: index + 1,
        });
      }

      if (uploadedFiles.length > 0) {
        const { error: imagesError } =
          await supabase
            .from("advertisement_images")
            .insert(
              uploadedFiles.map((image) => ({
                advertisement_id:
                  advertisementId,
                image_url: image.url,
                position: image.position,
              }))
            );

        if (imagesError) {
          throw imagesError;
        }

        /*
         * Zachowujemy pierwsze zdjęcie także w starej
         * kolumnie image_url. Dzięki temu działające
         * karty ogłoszeń nadal mają miniaturę.
         */
        const { error: mainImageError } =
          await supabase
            .from("advertisements")
            .update({
              image_url: uploadedFiles[0].url,
            })
            .eq("id", advertisementId)
            .eq("user_id", user.id);

        if (mainImageError) {
          throw mainImageError;
        }
      }
    } catch (error) {
      console.error(
        "Błąd zapisywania zdjęć:",
        error
      );

      if (uploadedFiles.length > 0) {
        const { error: storageCleanupError } =
          await supabase.storage
            .from("advertisements")
            .remove(
              uploadedFiles.map(
                (image) => image.path
              )
            );

        if (storageCleanupError) {
          console.error(
            "Błąd sprzątania Storage:",
            storageCleanupError
          );
        }
      }

      const { error: advertisementCleanupError } =
        await supabase
          .from("advertisements")
          .delete()
          .eq("id", advertisementId)
          .eq("user_id", user.id);

      if (advertisementCleanupError) {
        console.error(
          "Błąd usuwania niedokończonego ogłoszenia:",
          advertisementCleanupError
        );
      }

      alert(
        "Nie udało się zapisać zdjęć. Ogłoszenie nie zostało opublikowane."
      );

      setSaving(false);
      return;
    }

    selectedImages.forEach((image) => {
      URL.revokeObjectURL(image.previewUrl);
    });

    setSelectedImages([]);
    form.reset();
    setSaving(false);

    alert(
      "Ogłoszenie zostało wysłane do moderacji. Pojawi się publicznie po zatwierdzeniu przez administratora."
    );

    router.push("/moje-ogloszenia");

    router.refresh();
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">

        <h1 className="mb-8 text-3xl font-extrabold text-slate-900 sm:text-4xl">
          Dodaj ogłoszenie
        </h1>

        <AdvertisementForm
          onSubmit={handleSubmit}
        >
          <AdvertisementFields />

          <div>
            <label className="mb-2 block font-semibold">
              Opis
            </label>

            <textarea
              name="description"
              rows={5}
              placeholder="Opisz swoje ogłoszenie..."
              className="w-full rounded-xl border p-3"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block font-semibold">
                Województwo
              </label>

              <select
                name="province"
                defaultValue=""
                className="w-full rounded-xl border p-3"
                required
              >
                <option value="" disabled>
                  Wybierz województwo
                </option>

                <option>Dolnośląskie</option>
                <option>Kujawsko-pomorskie</option>
                <option>Lubelskie</option>
                <option>Lubuskie</option>
                <option>Łódzkie</option>
                <option>Małopolskie</option>
                <option>Mazowieckie</option>
                <option>Opolskie</option>
                <option>Podkarpackie</option>
                <option>Podlaskie</option>
                <option>Pomorskie</option>
                <option>Śląskie</option>
                <option>Świętokrzyskie</option>
                <option>Warmińsko-mazurskie</option>
                <option>Wielkopolskie</option>
                <option>Zachodniopomorskie</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block font-semibold">
                Miasto
              </label>

              <input
                name="city"
                type="text"
                placeholder="Np. Warszawa"
                className="w-full rounded-xl border p-3"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block font-semibold">
              Cena
            </label>

            <input
              name="price"
              type="text"
              placeholder="Np. 150"
              className="w-full rounded-xl border p-3"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block font-semibold">
                Telefon
              </label>

              <input
                name="phone"
                type="tel"
                placeholder="Np. 600123456"
                className="w-full rounded-xl border p-3"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold">
                E-mail
              </label>

              <input
                name="email"
                type="email"
                placeholder="Np. jan@blisko24.pl"
                className="w-full rounded-xl border p-3"
              />
            </div>
          </div>

          <section>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <label className="block text-lg font-bold text-slate-900">
                  Zdjęcia
                </label>

                <p className="mt-1 text-sm text-gray-500">
                  Pierwsze zdjęcie będzie zdjęciem głównym.
                </p>
              </div>

              <p className="text-sm font-semibold text-blue-700">
                {imageInputText}
              </p>
            </div>

            {remainingImages > 0 && (
              <label className="mt-5 flex cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50 px-6 py-8 text-center font-bold text-blue-700 transition hover:border-blue-500 hover:bg-blue-100">
                📷 Wybierz zdjęcia

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImagesChange}
                  className="hidden"
                />
              </label>
            )}

            {selectedImages.length > 0 && (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {selectedImages.map(
                  (image, index) => (
                    <div
                      key={image.previewUrl}
                      className="overflow-hidden rounded-2xl border bg-white shadow-sm"
                    >
                      <div className="relative">
                        <img
                          src={image.previewUrl}
                          alt={`Podgląd zdjęcia ${
                            index + 1
                          }`}
                          className="h-48 w-full object-cover"
                        />

                        {index === 0 && (
                          <span className="absolute left-3 top-3 rounded-full bg-yellow-400 px-3 py-1 text-xs font-extrabold text-slate-900 shadow">
                            ⭐ GŁÓWNE
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            removeImage(index)
                          }
                          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-red-600 font-bold text-white shadow hover:bg-red-700"
                          aria-label={`Usuń zdjęcie ${
                            index + 1
                          }`}
                        >
                          ×
                        </button>
                      </div>

                      <div className="flex items-center justify-between gap-3 p-3">
                        <button
                          type="button"
                          onClick={() =>
                            moveImageLeft(index)
                          }
                          disabled={index === 0}
                          className="flex-1 rounded-xl bg-slate-100 px-3 py-2 font-bold text-slate-700 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          ←
                        </button>

                        <span className="text-sm font-semibold text-slate-500">
                          {index + 1}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            moveImageRight(index)
                          }
                          disabled={
                            index ===
                            selectedImages.length - 1
                          }
                          className="flex-1 rounded-xl bg-slate-100 px-3 py-2 font-bold text-slate-700 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          →
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </section>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-blue-700 px-6 py-4 text-lg font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Zapisywanie ogłoszenia..."
              : "Dodaj ogłoszenie"}
          </button>
        </AdvertisementForm>
      </div>

      {advertisement.title && (
        <div className="mx-auto mt-8 max-w-3xl px-4 pb-12 sm:px-6">
          <div className="rounded-2xl bg-white p-6 shadow sm:p-8">
            <h2 className="mb-4 text-2xl font-bold">
              Ostatnio dodane ogłoszenie
            </h2>

            <h3 className="text-xl font-semibold text-blue-700">
              {advertisement.title}
            </h3>

            <p className="mt-2">
              📂 {advertisement.category}
            </p>

            <p className="mt-2">
              🗺️ {advertisement.province}
            </p>

            <p className="mt-2">
              📍 {advertisement.city}
            </p>

            <p className="mt-2">
              💰 {advertisement.price}
            </p>

            <p className="mt-2 whitespace-pre-line">
              {advertisement.description}
            </p>

            <p className="mt-2">
              📞 {advertisement.phone}
            </p>

            <p className="mt-2">
              📧 {advertisement.email}
            </p>
          </div>
        </div>
      )}
    </main>
  );
}