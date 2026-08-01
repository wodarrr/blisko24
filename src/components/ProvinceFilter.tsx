"use client";

import { useSearchParams } from "next/navigation";

const provinces = [
  "Cała Polska",
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

export default function ProvinceFilter() {
  const searchParams = useSearchParams();

  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const province = searchParams.get("province") || "Cała Polska";

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams();

    if (search) params.set("search", search);
    if (category) params.set("category", category);

    if (e.target.value !== "Cała Polska") {
      params.set("province", e.target.value);
    }

    window.location.href = "/?" + params.toString();
  }

  return (
    <div className="mx-auto mt-8 max-w-7xl px-6">
      <select
        value={province}
        onChange={handleChange}
        className="rounded-xl border bg-white p-3 shadow"
      >
        {provinces.map((item) => (
          <option key={item}>{item}</option>
        ))}
      </select>
    </div>
  );
}