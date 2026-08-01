type Props = {
  ratings?: Array<{
    rating: number | string | null;
  }> | null;

  compact?: boolean;
};

export default function UserRating({
  ratings,
  compact = false,
}: Props) {
  const validRatings =
    ratings
      ?.map((item) => Number(item.rating))
      .filter(
        (rating) =>
          Number.isFinite(rating) &&
          rating >= 1 &&
          rating <= 5
      ) ?? [];

  if (validRatings.length === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400">
        <span>☆</span>
        <span>Brak opinii</span>
      </span>
    );
  }

  const average =
    validRatings.reduce(
      (sum, rating) => sum + rating,
      0
    ) / validRatings.length;

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-1 text-xs font-bold text-yellow-700"
      title={`Średnia ${average.toFixed(
        1
      )} na podstawie ${
        validRatings.length
      } opinii`}
    >
      <span className="text-yellow-500">
        ★
      </span>

      <span>
        {average.toFixed(1).replace(".", ",")}
      </span>

      {!compact && (
        <span className="font-medium text-slate-500">
          ({validRatings.length})
        </span>
      )}
    </span>
  );
}