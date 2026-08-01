type Props = {
  defaultValues?: any;
};

export default function AdvertisementFields({
  defaultValues,
}: Props) {
  return (
    <>
      <div>
        <label className="mb-2 block font-semibold">
          Tytuł ogłoszenia
        </label>

        <input
          name="title"
          defaultValue={defaultValues?.title}
          type="text"
          placeholder="Np. Hydraulik 24h"
          className="w-full rounded-xl border p-3"
        />
      </div>

      <div>
        <label className="mb-2 block font-semibold">
          Kategoria
        </label>

        <select
          name="category"
          defaultValue={defaultValues?.category}
          className="w-full rounded-xl border p-3"
        >
          <option>Wybierz kategorię</option>
          <option>Szukam pracy</option>
          <option>Oferuję pracę</option>
          <option>Szukam fachowca</option>
          <option>Oferuję usługi</option>
          <option>Potrzebuję pomocy</option>
        </select>
      </div>
    </>
  );
}