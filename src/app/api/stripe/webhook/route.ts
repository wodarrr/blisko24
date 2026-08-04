import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey =
  process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  if (!stripeSecretKey) {
    console.error("Brak STRIPE_SECRET_KEY.");
    return jsonError("Brak konfiguracji Stripe.", 500);
  }

  if (!stripeWebhookSecret) {
    console.error("Brak STRIPE_WEBHOOK_SECRET.");
    return jsonError("Brak konfiguracji webhooka Stripe.", 500);
  }

  if (!supabaseUrl || !supabaseSecretKey) {
    console.error("Brak adresu Supabase lub klucza serwerowego Supabase.");
    return jsonError("Brak konfiguracji Supabase.", 500);
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return jsonError("Brak podpisu Stripe.", 400);
  }

  const stripe = new Stripe(stripeSecretKey);
  const rawBody = await request.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      stripeWebhookSecret,
    );
  } catch (error) {
    console.error("Nieprawidłowy podpis webhooka Stripe:", error);
    return jsonError("Nieprawidłowy podpis Stripe.", 400);
  }

  if (
    event.type !== "checkout.session.completed" &&
    event.type !== "checkout.session.async_payment_succeeded"
  ) {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (session.payment_status !== "paid") {
    return NextResponse.json({ received: true, payment_status: "not_paid" });
  }

  if (
    session.amount_total !== 999 ||
    session.currency?.toLowerCase() !== "pln"
  ) {
    console.error("Nieprawidłowa kwota lub waluta sesji Stripe:", session.id);
    return jsonError("Nieprawidłowa kwota płatności.", 400);
  }

  const unlockId = Number(session.metadata?.unlock_id);
  const matchId = Number(session.metadata?.match_id);
  const employerId = session.metadata?.employer_id;
  const candidateId = session.metadata?.candidate_id;

  if (
    !Number.isSafeInteger(unlockId) ||
    unlockId <= 0 ||
    !Number.isSafeInteger(matchId) ||
    matchId <= 0 ||
    !employerId ||
    !candidateId
  ) {
    console.error("Brak prawidłowych metadanych sesji Stripe:", session.id);
    return jsonError("Nieprawidłowe dane płatności.", 400);
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data: unlock, error: unlockError } = await supabaseAdmin
    .from("contact_unlocks")
    .select(
      "id, employer_id, candidate_id, match_id, status, amount, currency, payment_reference",
    )
    .eq("id", unlockId)
    .maybeSingle();

  if (unlockError) {
    console.error("Błąd odczytu prośby o odblokowanie:", unlockError);
    return jsonError("Nie udało się zweryfikować płatności.", 500);
  }

  if (!unlock) {
    return jsonError("Nie znaleziono prośby o odblokowanie.", 404);
  }

  const dataMatches =
    unlock.employer_id === employerId &&
    unlock.candidate_id === candidateId &&
    Number(unlock.match_id) === matchId &&
    Number(unlock.amount) === 9.99 &&
    String(unlock.currency).toUpperCase() === "PLN";

  if (!dataMatches) {
    console.error("Dane płatności nie pasują do prośby:", session.id);
    return jsonError("Dane płatności nie pasują do zamówienia.", 400);
  }

  if (unlock.status === "unlocked") {
    return NextResponse.json({ received: true, already_unlocked: true });
  }

  if (unlock.status !== "pending") {
    return jsonError("Ta prośba nie oczekuje na płatność.", 409);
  }

  const now = new Date().toISOString();
  const { data: updatedUnlock, error: updateError } = await supabaseAdmin
    .from("contact_unlocks")
    .update({
      status: "unlocked",
      unlock_method: "payment",
      payment_reference: session.id,
      unlocked_at: now,
      updated_at: now,
    })
    .eq("id", unlockId)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();

  if (updateError) {
    console.error("Błąd odblokowania kontaktu:", updateError);
    return jsonError("Nie udało się odblokować kontaktu.", 500);
  }

  // Drugi równoległy webhook mógł już wykonać tę samą operację.
  if (!updatedUnlock) {
    const { data: currentUnlock } = await supabaseAdmin
      .from("contact_unlocks")
      .select("status, payment_reference")
      .eq("id", unlockId)
      .maybeSingle();

    if (
      currentUnlock?.status === "unlocked" &&
      currentUnlock.payment_reference === session.id
    ) {
      return NextResponse.json({ received: true, already_unlocked: true });
    }

    return jsonError("Nie udało się potwierdzić odblokowania.", 409);
  }

  const { error: notificationError } = await supabaseAdmin
    .from("notifications")
    .insert({
      user_id: employerId,
      title: "Kontakt odblokowany",
      message:
        "Płatność została potwierdzona. Kontakt do kandydata jest już dostępny.",
      type: "contact_unlocked",
      is_read: false,
      link: "/moje-dopasowania",
    });

  if (notificationError) {
    // Kontakt pozostaje bezpiecznie odblokowany, nawet gdy sama notyfikacja się nie zapisze.
    console.error("Nie udało się zapisać powiadomienia:", notificationError);
  }

  return NextResponse.json({ received: true, unlocked: true });
}