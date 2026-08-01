"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [sort, setSort] = useState("newest");

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const params = new URLSearchParams();

    const trimmedSearch = search.trim();
    const trimmedCity = city.trim();

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

    const queryString = params.toString();

    router.push(queryString ? `/?${queryString}` : "/");
  }

  function clearSearch() {
    setSearch("");
    setCategory("");
    setProvince("");
    setCity("");
    setSort("newest");

    router.push("/");
  }

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
          Praca, usługi, pomoc i współpraca — wszystko blisko Ciebie,
          w jednym miejscu.
        </p>

        <form
          onSubmit={handleSearch}
          className="mx-auto mt-9 max-w-6xl"
        >
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/60">

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-12">

              <div className="xl:col-span-3">
                <label
                  htmlFor="hero-search"
                  className="sr-only"
                >
                  Czego szukasz?
                </label>

                <input
                  id="hero-search"
                  type="text"
                  placeholder="🔍 Czego szukasz?"
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
                  className="sr-only"
                >
                  Kategoria
                </label>

                <select
                  id="hero-category"
                  value={category}
                  onChange={(event) =>
                    setCategory(event.target.value)
                  }
                  className={`h-14 w-full rounded-xl border border-slate-200 bg-white px-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 ${
                    category
                      ? "text-slate-800"
                      : "text-slate-500"
                  }`}
                >
                  <option value="">
                    📂 Kategoria
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

              <div className="xl:col-span-2">
                <label
                  htmlFor="hero-province"
                  className="sr-only"
                >
                  Województwo
                </label>

                <select
                  id="hero-province"
                  value={province}
                  onChange={(event) =>
                    setProvince(event.target.value)
                  }
                  className={`h-14 w-full rounded-xl border border-slate-200 bg-white px-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 ${
                    province
                      ? "text-slate-800"
                      : "text-slate-500"
                  }`}
                >
                  <option value="">
                    📍 Województwo
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

              <div className="xl:col-span-2">
                <label
                  htmlFor="hero-city"
                  className="sr-only"
                >
                  Miasto
                </label>

                <input
                  id="hero-city"
                  type="text"
                  placeholder="🏙 Miasto"
                  value={city}
                  onChange={(event) =>
                    setCity(event.target.value)
                  }
                  className="h-14 w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div className="xl:col-span-2">
                <label
                  htmlFor="hero-sort"
                  className="sr-only"
                >
                  Sortowanie
                </label>

                <select
                  id="hero-sort"
                  value={sort}
                  onChange={(event) =>
                    setSort(event.target.value)
                  }
                  className="h-14 w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="newest">
                    🆕 Najnowsze
                  </option>

                  <option value="promoted">
                    ⭐ Promowane
                  </option>

                  <option value="cheap">
                    💰 Cena rosnąco
                  </option>

                  <option value="expensive">
                    💰 Cena malejąco
                  </option>
                </select>
              </div>

              <button
                type="submit"
                className="h-14 rounded-xl bg-blue-700 px-6 font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-800 xl:col-span-1"
              >
                Szukaj
              </button>

            </div>

            <div className="mt-4 flex flex-col items-center justify-between gap-3 px-1 text-sm text-slate-500 sm:flex-row">

              <p>
                Wyszukuj po nazwie, kategorii i lokalizacji.
              </p>

              <button
                type="button"
                onClick={clearSearch}
                className="font-semibold text-blue-700 transition hover:text-blue-900 hover:underline"
              >
                Wyczyść filtry
              </button>

            </div>

          </div>
        </form>

      </div>
    </section>
  );
}