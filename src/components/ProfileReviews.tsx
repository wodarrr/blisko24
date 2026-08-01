import { supabase } from "../lib/supabase";

type ReviewProfile = {
  name: string | null;
  avatar_url: string | null;
};

type Review = {
  id: number;
  rating: number;
  comment: string | null;
  created_at: string;
  author_id: string | null;
  profiles?: ReviewProfile[] | null;
};

export default async function ProfileReviews({
  userId,
}: {
  userId: string;
}) {
  const { data, error } = await supabase
    .from("reviews")
    .select(`
      id,
      rating,
      comment,
      created_at,
      author_id,
      profiles!reviews_author_id_fkey (
        name,
        avatar_url
      )
    `)
    .eq("user_id", userId)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error("Błąd pobierania opinii:", error);

    return (
      <section className="mt-12 rounded-3xl bg-white p-8 shadow">
        <h2 className="text-3xl font-bold">
          Opinie
        </h2>

        <p className="mt-4 text-red-600">
          Nie udało się pobrać opinii.
        </p>
      </section>
    );
  }

  const reviews = (data ?? []) as Review[];

  if (reviews.length === 0) {
    return (
      <section className="mt-12 rounded-3xl bg-white p-8 shadow">
        <div className="text-5xl">
          ⭐
        </div>

        <h2 className="mt-4 text-3xl font-bold text-slate-900">
          Opinie
        </h2>

        <p className="mt-3 text-gray-500">
          Ten użytkownik nie ma jeszcze żadnych opinii.
        </p>
      </section>
    );
  }

  const average =
    reviews.reduce(
      (sum, review) =>
        sum + Number(review.rating ?? 0),
      0
    ) / reviews.length;

  const distribution = [5, 4, 3, 2, 1].map(
    (rating) => {
      const count = reviews.filter(
        (review) =>
          Number(review.rating) === rating
      ).length;

      const percentage =
        reviews.length > 0
          ? Math.round(
              (count / reviews.length) * 100
            )
          : 0;

      return {
        rating,
        count,
        percentage,
      };
    }
  );

  return (
    <section className="mt-12 rounded-3xl bg-white p-5 shadow sm:p-8">

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">

        <div className="rounded-2xl bg-slate-50 p-6">
          <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
            Średnia ocen
          </p>

          <p className="mt-3 text-5xl font-extrabold text-yellow-500">
            {average.toFixed(1)}
          </p>

          <p className="mt-2 text-2xl">
            {"⭐".repeat(
              Math.max(
                1,
                Math.min(
                  5,
                  Math.round(average)
                )
              )
            )}
          </p>

          <p className="mt-3 text-gray-500">
            Na podstawie {reviews.length} opinii
          </p>
        </div>

        <div>
          <h2 className="text-3xl font-extrabold text-slate-900">
            Opinie użytkowników
          </h2>

          <div className="mt-6 space-y-3">
            {distribution.map((item) => (
              <div
                key={item.rating}
                className="grid grid-cols-[42px_1fr_38px] items-center gap-3"
              >
                <span className="text-sm font-semibold text-slate-700">
                  {item.rating} ⭐
                </span>

                <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-yellow-400"
                    style={{
                      width: `${item.percentage}%`,
                    }}
                  />
                </div>

                <span className="text-right text-sm text-slate-500">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="mt-10 space-y-5">
        {reviews.map((review) => {
          const authorProfile =
            review.profiles?.[0];

          const authorName =
            authorProfile?.name?.trim() ||
            "Użytkownik BLISKO24";

          const authorInitial =
            authorName.charAt(0).toUpperCase();

          const rating = Math.max(
            1,
            Math.min(
              5,
              Number(review.rating ?? 1)
            )
          );

          return (
            <article
              key={review.id}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6"
            >
              <div className="flex items-start gap-4">

                {authorProfile?.avatar_url ? (
                  <img
                    src={
                      authorProfile.avatar_url
                    }
                    alt={authorName}
                    className="h-12 w-12 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                    {authorInitial}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                      <p className="font-bold text-slate-900">
                        {authorName}
                      </p>

                      <p className="mt-1 text-lg">
                        {"⭐".repeat(rating)}
                      </p>
                    </div>

                    <time className="text-sm text-slate-400">
                      {new Date(
                        review.created_at
                      ).toLocaleDateString(
                        "pl-PL",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        }
                      )}
                    </time>

                  </div>

                  <p className="mt-4 whitespace-pre-line break-words leading-7 text-slate-700">
                    {review.comment?.trim() ||
                      "Użytkownik nie dodał komentarza."}
                  </p>
                </div>

              </div>
            </article>
          );
        })}
      </div>

    </section>
  );
}