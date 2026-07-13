export default function Categories() {
  const categories = [
  {
    icon: "💼",
    title: "Szukam pracy",
    description: "Znajdź pracę lub nowe zlecenia.",
  },
  {
    icon: "🔧",
    title: "Szukam fachowca",
    description: "Hydraulik, elektryk i inni.",
  },
  {
    icon: "🤝",
    title: "Potrzebuję pomocy",
    description: "Pomoc sąsiedzka i codzienne sprawy.",
  },
  {
    icon: "👤",
    title: "Oferuję usługi",
    description: "Pokaż swoje umiejętności i zdobywaj klientów.",
  },
];

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <h2 className="mb-10 text-center text-3xl font-bold">
        Wybierz kategorię
      </h2>

      <div className="grid gap-6 md:grid-cols-2">
        {categories.map((category) => (
          <div
            key={category.title}
            className="rounded-2xl bg-white p-6 shadow"
          >
            <div className="text-5xl">{category.icon}</div>

            <h3 className="mt-4 text-xl font-bold">
              {category.title}
            </h3>

            <p className="mt-2">
              {category.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}