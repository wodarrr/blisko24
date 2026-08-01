import { supabase } from "../lib/supabase";

export default async function ProfileReviews({
  userId,
}: {
  userId: string;
}) {
  const { data: reviews } = await supabase
    .from("reviews")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", {
      ascending: false,
    });

  if (!reviews || reviews.length === 0) {
    return (
      <div className="mt-12 rounded-2xl bg-white p-10 shadow">
        <h2 className="mb-6 text-3xl font-bold">
          Opinie
        </h2>

        <p className="text-gray-500">
          Ten użytkownik nie ma jeszcze opinii.
        </p>
      </div>
    );
  }

  const average =
    reviews.reduce(
      (sum: number, review: any) =>
        sum + review.rating,
      0
    ) / reviews.length;

  return (
    <section className="mt-12 rounded-2xl bg-white p-8 shadow">

      <div className="mb-8 flex items-center justify-between">

        <h2 className="text-3xl font-bold">
          Opinie
        </h2>

        <div className="text-right">

          <p className="text-4xl font-bold text-yellow-500">
            ⭐ {average.toFixed(1)}
          </p>

          <p className="text-gray-500">
            {reviews.length} opinii
          </p>

        </div>

      </div>

      <div className="space-y-6">

        {reviews.map((review: any) => (

          <div
            key={review.id}
            className="rounded-xl bg-gray-50 p-6"
          >

            <p className="text-xl">
              {"⭐".repeat(review.rating)}
            </p>

            <p className="mt-3">
              {review.comment}
            </p>

            <p className="mt-4 text-sm text-gray-500">
              {new Date(
                review.created_at
              ).toLocaleDateString("pl-PL")}
            </p>

          </div>

        ))}

      </div>

    </section>
  );
}