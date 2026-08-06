"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

const categories = [
  { name: "Wszystkie", icon: "🌍" },
  { name: "Szukam pracy", icon: "👨‍💼" },
  { name: "Oferuję pracę", icon: "💼" },
  { name: "Szukam fachowca", icon: "🔨" },
  { name: "Oferuję usługi", icon: "🛠️" },
  { name: "Potrzebuję pomocy", icon: "❤️" },
];

export default function Categories() {
  const searchParams = useSearchParams();

  const search = searchParams.get("search");

  const activeCategory =
    searchParams.get("category") || "Wszystkie";

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-700">
          Kategorie
        </p>

        <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Przeglądaj według kategorii
        </h2>

        <p className="mt-3 max-w-2xl leading-7 text-slate-600">
          Wybierz interesujący Cię rodzaj ogłoszeń i szybko przejdź do
          odpowiednich ofert.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const isActive =
            activeCategory === category.name;

          const href =
            category.name === "Wszystkie"
              ? search
                ? `/?search=${encodeURIComponent(
                    search
                  )}#ogloszenia`
                : "/#ogloszenia"
              : search
                ? `/?search=${encodeURIComponent(
                    search
                  )}&category=${encodeURIComponent(
                    category.name
                  )}#ogloszenia`
                : `/?category=${encodeURIComponent(
                    category.name
                  )}#ogloszenia`;

          return (
            <Link
              key={category.name}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={`group rounded-3xl border p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
                isActive
                  ? "border-blue-700 bg-blue-700 text-white"
                  : "border-slate-200 bg-white text-slate-900 hover:border-blue-300 hover:bg-blue-50"
              }`}
            >
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl text-4xl ${
                  isActive
                    ? "bg-white/15"
                    : "bg-slate-100 group-hover:bg-white"
                }`}
              >
                {category.icon}
              </div>

              <h3
                className={`mt-5 text-xl font-extrabold ${
                  isActive
                    ? "text-white"
                    : "text-slate-900"
                }`}
              >
                {category.name}
              </h3>

              <p
                className={`mt-2 text-sm leading-6 ${
                  isActive
                    ? "text-blue-100"
                    : "text-slate-600"
                }`}
              >
                Kliknij, aby wyświetlić ogłoszenia
              </p>

              <span
                className={`mt-5 inline-flex items-center text-sm font-bold ${
                  isActive
                    ? "text-white"
                    : "text-blue-700"
                }`}
              >
                Zobacz ogłoszenia
                <span className="ml-2 transition group-hover:translate-x-1">
                  →
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}