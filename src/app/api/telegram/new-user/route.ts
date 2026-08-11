import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type NotificationType =
  | "new_registration"
  | "profile_completed";

type NewUserPayload = {
  id?: string;
  name?: string | null;
  city?: string | null;
  account_type?: "candidate" | "employer" | "both" | null;
  created_at?: string | null;
  notification_type?: NotificationType | null;
};

function getAccountTypeLabel(
  accountType?: NewUserPayload["account_type"]
) {
  switch (accountType) {
    case "candidate":
      return "Kandydat";

    case "employer":
      return "Pracodawca";

    case "both":
      return "Kandydat + pracodawca";

    default:
      return "Nie określono";
  }
}

export async function POST(request: NextRequest) {
  const secret =
    process.env.TELEGRAM_WEBHOOK_SECRET;

  const botToken =
    process.env.TELEGRAM_BOT_TOKEN;

  const chatId =
    process.env.TELEGRAM_CHAT_ID;

  if (!secret || !botToken || !chatId) {
    console.error(
      "Brak wymaganych zmiennych środowiskowych Telegram."
    );

    return NextResponse.json(
      {
        ok: false,
        error: "Brak konfiguracji Telegram.",
      },
      {
        status: 500,
      }
    );
  }

  const requestSecret =
    request.headers.get(
      "x-telegram-secret"
    );

  if (requestSecret !== secret) {
    return NextResponse.json(
      {
        ok: false,
        error: "Brak dostępu.",
      },
      {
        status: 401,
      }
    );
  }

  let payload: NewUserPayload;

  try {
    payload =
      (await request.json()) as NewUserPayload;
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "Nieprawidłowe dane żądania.",
      },
      {
        status: 400,
      }
    );
  }

  const notificationType =
    payload.notification_type ??
    "new_registration";

  const name =
    payload.name?.trim() ||
    "Profil nieuzupełniony";

  const city =
    payload.city?.trim() ||
    "Brak miasta";

  const accountType =
    getAccountTypeLabel(
      payload.account_type
    );

  const createdAt = payload.created_at
    ? new Date(
        payload.created_at
      ).toLocaleString("pl-PL", {
        timeZone: "Europe/Warsaw",
      })
    : new Date().toLocaleString(
        "pl-PL",
        {
          timeZone: "Europe/Warsaw",
        }
      );

  let message: string;

  if (
    notificationType ===
    "profile_completed"
  ) {
    message = [
      "✅ Użytkownik uzupełnił profil BLISKO24",
      "",
      `Imię / nazwa: ${name}`,
      `Miasto: ${city}`,
      `Typ konta: ${accountType}`,
      `Rejestracja: ${createdAt}`,
    ].join("\n");
  } else {
    message = [
      "👤 Nowa rejestracja BLISKO24",
      "",
      `Typ konta: ${accountType}`,
      `Nazwa: ${name}`,
      `Miasto: ${city}`,
      `Data: ${createdAt}`,
    ].join("\n");
  }

  const telegramResponse =
    await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
        }),
      }
    );

  const telegramData =
    await telegramResponse.json();

  if (!telegramResponse.ok) {
    console.error(
      "Błąd Telegram API:",
      telegramData
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Telegram odrzucił wiadomość.",
      },
      {
        status: 502,
      }
    );
  }

  return NextResponse.json({
    ok: true,
  });
}