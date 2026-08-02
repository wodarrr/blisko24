"use client";

import { useEffect, useState } from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";

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

export default function Hero() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [sort, setSort] = useState("newest");

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [promotedOnly, setPromotedOnly] =
    useState(false);

  const [urgentOnly, setUrgentOnly] =
    useState(false);

  const [featuredOnly, setFeaturedOnly] =
    useState(false);

  useEffect(() => {
    setSearch(
      searchParams.get("search") ?? ""
    );

    setCategory(
      searchParams.get("category") ?? ""
    );

    setProvince(
      searchParams.get("province") ?? ""
    );

    setCity(
      searchParams.get("city") ?? ""
    );

    setSort(
      searchParams.get("sort") ?? "newest"
    );

    setMinPrice(
      searchParams.get("minPrice") ?? ""
    );

    setMaxPrice(
      searchParams.get("maxPrice") ?? ""
    );

    setPromotedOnly(
      searchParams.get("promoted") === "true"
    );

    setUrgentOnly(
      searchParams.get("urgent") === "true"
    );

    setFeaturedOnly(
      searchParams.get("featured") === "true"
    );
  }, [searchParams]);

  function handleSearch(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const params = new URLSearchParams();

    const trimmedSearch = search.trim();
    const trimmedCity = city.trim();
    const trimmedMinPrice =
      minPrice.trim();
    const trimmedMaxPrice =
      maxPrice.trim();

    if (trimmedSearch) {
      params.set("search", trimmedSearch);
    }

    if (category) {
      params.set("category", category);
    }

    if (province) {
      params.set("province", province);
    }

    if (trimmedCity) {
      params.set("city", trimmedCity);
    }

    if (sort !== "newest") {
      params.set("sort", sort);
    }

    if (trimmedMinPrice) {
      params.set(
        "minPrice",
        trimmedMinPrice
      );
    }

    if (trimmedMaxPrice) {
      params.set(
        "maxPrice",
        trimmedMaxPrice
      );
    }

    if (promotedOnly) {
      params.set("promoted", "true");
    }

    if (urgentOnly) {
      params.set("urgent", "true");
    }

    if (featuredOnly) {
      params.set("featured", "true");
    }

    const queryString = params.toString();

    router.push(
      queryString
        ? `/?${queryString}#ogloszenia`
        : "/#ogloszenia"
    );
  }

  function clearSearch() {
    setSearch("");
    setCategory("");
    setProvince("");
    setCity("");
    setSort("newest");

    setMinPrice("");
    setMaxPrice("");

    setPromotedOnly(false);
    setUrgentOnly(false);
    setFeaturedOnly(false);

    router.push("/#ogloszenia");
  }

  const filtersCount = [
    search.trim(),
    category,
    province,
    city.trim(),
    minPrice.trim(),
    maxPrice.trim(),
    promotedOnly,
    urgentOnly,
    featuredOnly,
    sort !== "newest",
  ].filter(Boolean).length;

  return (
    <section className="overflow-hidden bg-gradient-to-b from-slate-50 via-white to-white">
      <div className="mx-auto max-w-7xl px-4 py-14 text-center sm:px-6 sm:py-16 lg:py-20">

        <span className="inline-flex items-center rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
          🇵🇱 Portal lokalnych możliwości
        </span>

        <h2 className="mx-auto mt-6 max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
          Znajdź ludzi.

          <span className="block text-blue-700">
            Znajdź możliwości.
          </span>
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
          Praca, usługi, pomoc i współpraca —
          wszystko blisko Ciebie, w jednym miejscu.
        </p>

        <form
          onSubmit={handleSearch}
          className="mx-auto mt-9 max-w-6xl"
        >
          <div className="rounded-3xl border border-slate-200 bg-white p-4 text-left shadow-xl shadow-slate-200/60 sm:p-6">

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-12">

              <div className="xl:col-span-4">
                <label
                  htmlFor="hero-search"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Czego szukasz?
                </label>

                <input
                  id="hero-search"
                  type="text"
                  placeholder="Np. hydraulik, kierowca, sprzątanie"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  className="h-14 w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div className="xl:col-span-2">
                <label
                  htmlFor="hero-category"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Kategoria
                </label>

                <select
                  id="hero-category"
                  value={category}
                  onChange={(event) =>
                    setCategory(
                      event.target.value
                    )
                  }
                  className="h-14 w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="">
                    Wszystkie
                  </option>

                  {categories.map((item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="xl:col-span-3">
                <label
                  htmlFor="hero-province"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Województwo
                </label>

                <select
                  id="hero-province"
                  value={province}
                  onChange={(event) =>
                    setProvince(
                      event.target.value
                    )
                  }
                  className="h-14 w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="">
                    Cała Polska
                  </option>

                  {provinces.map((item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="xl:col-span-3">
                <label
                  htmlFor="hero-city"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Miasto
                </label>

                <input
                  id="hero-city"
                  type="text"
                  placeholder="Np. Piekary Śląskie"
                  value={city}
                  onChange={(event) =>
                    setCity(event.target.value)
                  }
                  className="h-14 w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div className="xl:col-span-2">
                <label
                  htmlFor="hero-min-price"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Cena od
                </label>

                <input
                  id="hero-min-price"
                  type="number"
                  min="0"
                  inputMode="decimal"
                  placeholder="0"
                  value={minPrice}
                  onChange={(event) =>
                    setMinPrice(
                      event.target.value
                    )
                  }
                  className="h-14 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div className="xl:col-span-2">
                <label
                  htmlFor="hero-max-price"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Cena do
                </label>

                <input
                  id="hero-max-price"
                  type="number"
                  min="0"
                  inputMode="decimal"
                  placeholder="Bez limitu"
                  value={maxPrice}
                  onChange={(event) =>
                    setMaxPrice(
                      event.target.value
                    )
                  }
                  className="h-14 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div className="xl:col-span-3">
                <label
                  htmlFor="hero-sort"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Sortowanie
                </label>

                <select
                  id="hero-sort"
                  value={sort}
                  onChange={(event) =>
                    setSort(event.target.value)
                  }
                  className="h-14 w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="newest">
                    🆕 Najnowsze
                  </option>

                  <option value="oldest">
                    📅 Najstarsze
                  </option>

                  <option value="popular">
                    👁️ Najpopularniejsze
                  </option>

                  <option value="promoted">
                    ⭐ Najpierw promowane
                  </option>

                  <option value="cheap">
                    💰 Cena rosnąco
                  </option>

                  <option value="expensive">
                    💰 Cena malejąco
                  </option>
                </select>
              </div>

              <div className="xl:col-span-5">
                <p className="mb-2 text-sm font-bold text-slate-700">
                  Rodzaj ogłoszenia
                </p>

                <div className="grid min-h-14 gap-2 sm:grid-cols-3">
                  <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-yellow-200 bg-yellow-50 px-3 py-3 font-semibold text-yellow-900">
                    <input
                      type="checkbox"
                      checked={promotedOnly}
                      onChange={(event) =>
                        setPromotedOnly(
                          event.target.checked
                        )
                      }
                      className="h-4 w-4"
                    />

                    ⭐ Promowane
                  </label>

                  <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-3 font-semibold text-red-800">
                    <input
                      type="checkbox"
                      checked={urgentOnly}
                      onChange={(event) =>
                        setUrgentOnly(
                          event.target.checked
                        )
                      }
                      className="h-4 w-4"
                    />

                    🔥 Pilne
                  </label>

                  <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-purple-200 bg-purple-50 px-3 py-3 font-semibold text-purple-800">
                    <input
                      type="checkbox"
                      checked={featuredOnly}
                      onChange={(event) =>
                        setFeaturedOnly(
                          event.target.checked
                        )
                      }
                      className="h-4 w-4"
                    />

                    📌 Wyróżnione
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Aktywne filtry:{" "}
                <strong className="text-slate-800">
                  {filtersCount}
                </strong>
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={clearSearch}
                  className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Wyczyść
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-blue-700 px-8 py-3 font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-800"
                >
                  🔍 Szukaj ogłoszeń
                </button>
              </div>
            </div>

          </div>
        </form>
      </div>
    </section>
  );
}