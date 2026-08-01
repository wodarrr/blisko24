"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Props = {
  reviewedUserId: string;
  advertisementId: number;
  onReviewAdded?: () => void;
};

export default function AddReview({
  reviewedUserId,
  advertisementId,
  onReviewAdded,
}: Props) {
  const [currentUserId, setCurrentUserId] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [canReview, setCanReview] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] =
    useState(false);

  const [message, setMessage] = useState("");

  useEffect(() => {
    checkReviewPermission();
  }, [reviewedUserId, advertisementId]);

  async function checkReviewPermission() {
    setLoading(true);
    setMessage("");
    setCanReview(false);
    setAlreadyReviewed(false);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage(
        "Zaloguj się, aby sprawdzić możliwość dodania opinii."
      );
      setLoading(false);
      return;
    }

    setCurrentUserId(user.id);

    if (user.id === reviewedUserId) {
      setMessage(
        "Nie możesz wystawić opinii samemu sobie."
      );
      setLoading(false);
      return;
    }

    /*
     * Sprawdzamy, czy użytkownik już wystawił opinię
     * dotyczącą tego samego ogłoszenia.
     */
    const {
      data: existingReview,
      error: existingReviewError,
    } = await supabase
      .from("reviews")
      .select("id")
      .eq("author_id", user.id)
      .eq("user_id", reviewedUserId)
      .eq("advertisement_id", advertisementId)
      .maybeSingle();

    if (existingReviewError) {
      console.error(
        "Błąd sprawdzania istniejącej opinii:",
        existingReviewError
      );

      setMessage(
        "Nie udało się sprawdzić wcześniejszych opinii."
      );
      setLoading(false);
      return;
    }

    if (existingReview) {
      setAlreadyReviewed(true);
      setMessage(
        "Wystawiłeś już opinię dotyczącą tego ogłoszenia."
      );
      setLoading(false);
      return;
    }

    /*
     * Opinię może wystawić tylko osoba, która miała
     * rozmowę z ocenianym użytkownikiem dotyczącą
     * konkretnego ogłoszenia.
     */
    const { data: conversation, error: conversationError } =
      await supabase
        .from("conversations")
        .select("id, buyer_id, seller_id")
        .eq("advertisement_id", advertisementId)
        .or(
          `and(buyer_id.eq.${user.id},seller_id.eq.${reviewedUserId}),and(buyer_id.eq.${reviewedUserId},seller_id.eq.${user.id})`
        )
        .limit(1)
        .maybeSingle();

    if (conversationError) {
      console.error(
        "Błąd sprawdzania rozmowy:",
        conversationError
      );

      setMessage(
        "Nie udało się sprawdzić historii rozmów."
      );
      setLoading(false);
      return;
    }

    if (!conversation) {
      setMessage(
        "Opinię możesz dodać dopiero po rozpoczęciu rozmowy z tym użytkownikiem w sprawie ogłoszenia."
      );
      setLoading(false);
      return;
    }

    setCanReview(true);
    setLoading(false);
  }

  async function submitReview(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!currentUserId || !canReview || saving) {
      return;
    }

    const trimmedComment = comment.trim();

    if (rating < 1 || rating > 5) {
      alert("Wybierz ocenę od 1 do 5 gwiazdek.");
      return;
    }

    if (trimmedComment.length < 5) {
      alert(
        "Komentarz powinien mieć przynajmniej 5 znaków."
      );
      return;
    }

    setSaving(true);

    /*
     * Ponowne sprawdzenie zabezpiecza przed szybkim
     * podwójnym kliknięciem lub otwarciem kilku kart.
     */
    const { data: existingReview } = await supabase
      .from("reviews")
      .select("id")
      .eq("author_id", currentUserId)
      .eq("user_id", reviewedUserId)
      .eq("advertisement_id", advertisementId)
      .maybeSingle();

    if (existingReview) {
      setSaving(false);
      setAlreadyReviewed(true);
      setCanReview(false);
      setMessage(
        "Wystawiłeś już opinię dotyczącą tego ogłoszenia."
      );
      return;
    }

    const { error } = await supabase
      .from("reviews")
      .insert({
        author_id: currentUserId,
        user_id: reviewedUserId,
        advertisement_id: advertisementId,
        rating,
        comment: trimmedComment,
      });

    setSaving(false);

    if (error) {
      console.error("Błąd dodawania opinii:", error);
      alert("Nie udało się dodać opinii.");
      return;
    }

    setComment("");
setRating(5);
setAlreadyReviewed(true);
setCanReview(false);
setMessage("Dziękujemy. Twoja opinia została dodana.");

onReviewAdded?.();

window.location.reload();
  }

  if (loading) {
    return (
      <section className="mt-8 rounded-3xl bg-white p-6 shadow">
        <p className="text-gray-500">
          Sprawdzanie możliwości dodania opinii...
        </p>
      </section>
    );
  }

  if (!canReview) {
    return (
      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">
          ⭐ Dodaj opinię
        </h2>

        <p
          className={`mt-3 ${
            alreadyReviewed
              ? "font-semibold text-green-700"
              : "text-gray-500"
          }`}
        >
          {message}
        </p>
      </section>
    );
  }

  return (
    <section className="mt-8 rounded-3xl bg-white p-5 shadow sm:p-8">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-yellow-600">
          Twoje doświadczenie
        </p>

        <h2 className="mt-2 text-3xl font-extrabold text-slate-900">
          ⭐ Dodaj opinię
        </h2>

        <p className="mt-3 text-gray-500">
          Oceń kontakt i współpracę z użytkownikiem.
        </p>
      </div>

      <form
        onSubmit={submitReview}
        className="mt-8 space-y-6"
      >
        <fieldset>
          <legend className="mb-3 font-semibold text-slate-900">
            Twoja ocena
          </legend>

          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                aria-label={`Ocena ${star} z 5`}
                className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl transition ${
                  star <= rating
                    ? "bg-yellow-100 text-yellow-500 ring-2 ring-yellow-300"
                    : "bg-slate-100 text-slate-300 hover:bg-yellow-50"
                }`}
              >
                ★
              </button>
            ))}
          </div>

          <p className="mt-3 text-sm font-semibold text-slate-600">
            Wybrana ocena: {rating}/5
          </p>
        </fieldset>

        <div>
          <label
            htmlFor="review-comment"
            className="mb-2 block font-semibold text-slate-900"
          >
            Komentarz
          </label>

          <textarea
            id="review-comment"
            value={comment}
            onChange={(event) =>
              setComment(event.target.value)
            }
            rows={5}
            maxLength={1000}
            placeholder="Opisz swoje doświadczenie ze współpracy..."
            className="w-full resize-none rounded-xl border border-slate-300 p-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            required
          />

          <p className="mt-2 text-right text-xs text-gray-400">
            {comment.length}/1000
          </p>
        </div>

        <button
          type="submit"
          disabled={saving || comment.trim().length < 5}
          className="w-full rounded-xl bg-blue-700 px-6 py-4 font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {saving
            ? "Dodawanie opinii..."
            : "⭐ Opublikuj opinię"}
        </button>
      </form>
    </section>
  );
}