type Props = {
  users: number;
  ads: number;
  favorites: number;
};

export default function Stats({
  users,
  ads,
  favorites,
}: Props) {
  return (
    <div className="mb-10 grid gap-6 md:grid-cols-3">

      <div className="rounded-2xl bg-white p-8 shadow">
        <p className="text-gray-500">
          Użytkownicy
        </p>

        <h2 className="mt-3 text-5xl font-bold">
          {users}
        </h2>
      </div>

      <div className="rounded-2xl bg-white p-8 shadow">
        <p className="text-gray-500">
          Ogłoszenia
        </p>

        <h2 className="mt-3 text-5xl font-bold">
          {ads}
        </h2>
      </div>

      <div className="rounded-2xl bg-white p-8 shadow">
        <p className="text-gray-500">
          Ulubione
        </p>

        <h2 className="mt-3 text-5xl font-bold">
          {favorites}
        </h2>
      </div>

    </div>
  );
}