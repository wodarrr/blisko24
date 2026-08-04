import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

type CheckoutRequest = {
  matchId?: number;
};

function errorResponse(message: string, status: number) {
  return NextResponse.json(
    {
      error: message,
    },
    {
      status,
    },
  );
}

export async function POST(request: NextRequest) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const appUrl = (
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ).replace(/\/$/, "");

  if (!stripeSecretKey || !supabaseUrl || !supabaseAnonKey) {
    console.error("Brak konfiguracji Stripe lub Supabase po stronie serwera.");
    return errorResponse("Brak konfiguracji płatności.", 500);
  }

  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return errorResponse("Musisz być zalogowany.", 401);
  }

  const accessToken = authorization.slice("Bearer ".length).trim();

  if (!accessToken) {
    return errorResponse("Musisz być zalogowany.", 401);
  }

  let body: CheckoutRequest;

  try {
    body = (await request.json()) as CheckoutRequest;
  } catch {
    return errorResponse("Nieprawidłowe dane żądania.", 400);
  }

  const matchId = Number(body.matchId);

  if (!Number.isInteger(matchId) || matchId <= 0) {
    return errorResponse("Nieprawidłowe dopasowanie.", 400);
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(accessToken);

  if (userError || !user) {
    return errorResponse("Sesja logowania wygasła.", 401);
  }

  const { data: unlock, error: unlockError } = await supabase
    .from("contact_unlocks")
    .select("id, employer_id, candidate_id, match_id, status, amount, currency")
    .eq("employer_id", user.id)
    .eq("match_id", matchId)
    .maybeSingle();

  if (unlockError) {
    console.error("Błąd pobierania prośby o odblokowanie:", unlockError);
    return errorResponse("Nie udało się przygotować płatności.", 500);
  }

  if (!unlock) {
    return errorResponse("Nie znaleziono prośby o odblokowanie kontaktu.", 404);
  }

  if (unlock.status === "unlocked") {
    return errorResponse("Kontakt jest już odblokowany.", 409);
  }

  if (unlock.status !== "pending") {
    return errorResponse("Ta prośba nie oczekuje na płatność.", 409);
  }

  const amount = Number(unlock.amount);
  const currency = String(unlock.currency ?? "").toUpperCase();

  if (amount !== 9.99 || currency !== "PLN") {
    console.error("Nieprawidłowa cena prośby o odblokowanie:", {
      unlockId: unlock.id,
      amount,
      currency,
    });

    return errorResponse("Nieprawidłowa cena płatności.", 409);
  }

  const stripe = new Stripe(stripeSecretKey);

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      locale: "pl",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "pln",
            unit_amount: 999,
            product_data: {
              name: "Odblokowanie kontaktu kandydata – BLISKO24",
              description:
                "Jednorazowy dostęp do danych kontaktowych wybranego kandydata.",
            },
          },
        },
      ],
      client_reference_id: String(unlock.id),
      metadata: {
        unlock_id: String(unlock.id),
        employer_id: user.id,
        candidate_id: unlock.candidate_id,
        match_id: String(unlock.match_id),
      },
      payment_intent_data: {
        metadata: {
          unlock_id: String(unlock.id),
          employer_id: user.id,
          candidate_id: unlock.candidate_id,
          match_id: String(unlock.match_id),
        },
      },
      success_url: `${appUrl}/moje-dopasowania?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/moje-dopasowania?payment=cancelled`,
    });

    if (!checkoutSession.url) {
      return errorResponse("Stripe nie zwrócił adresu płatności.", 500);
    }

    return NextResponse.json({
      url: checkoutSession.url,
    });
  } catch (error) {
    console.error("Błąd tworzenia sesji Stripe Checkout:", error);
    return errorResponse("Nie udało się otworzyć płatności Stripe.", 500);
  }
}