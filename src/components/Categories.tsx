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
    <section className="mx-auto max-w-7xl px-6 py-12">

      <h2 className="mb-8 text-3xl font-bold">
        Przeglądaj według kategorii
      </h2>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

        {categories.map((category) => {

          const href =
            category.name === "Wszystkie"
              ? search
                ? `/?search=${encodeURIComponent(search)}`
                : "/"
              : search
              ? `/?search=${encodeURIComponent(search)}&category=${encodeURIComponent(category.name)}`
              : `/?category=${encodeURIComponent(category.name)}`;

          return (
            <Link
              key={category.name}
              href={href}
              className={`rounded-2xl border p-6 transition-all hover:-translate-y-1 hover:shadow-xl ${
                activeCategory === category.name
                  ? "border-blue-700 bg-blue-700 text-white"
                  : "bg-white"
              }`}
            >
              <div className="text-4xl">
                {category.icon}
              </div>

              <h3 className="mt-4 text-xl font-bold">
                {category.name}
              </h3>

              <p className="mt-2 text-sm opacity-70">
                Kliknij aby wyświetlić ogłoszenia
              </p>

            </Link>
          );
        })}

      </div>

    </section>
  );
}