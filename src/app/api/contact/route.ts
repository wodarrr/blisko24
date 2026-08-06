import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

type ContactRequest = {
  name?: unknown;
  email?: unknown;
  topic?: unknown;
  message?: unknown;
  website?: unknown;
  privacyAccepted?: unknown;
};

type RateLimitEntry = {
  attempts: number;
  expiresAt: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();

const RATE_LIMIT_WINDOW = 15 * 60 * 1000;
const RATE_LIMIT_MAX_ATTEMPTS = 5;

const allowedTopics = [
  "Pytanie dotyczące portalu",
  "Problem techniczny",
  "Zgłoszenie dotyczące bezpieczeństwa",
  "Propozycja współpracy",
  "Inna sprawa",
];

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip") || "unknown";
}

function isRateLimited(identifier: string) {
  const now = Date.now();
  const currentEntry = rateLimitStore.get(identifier);

  if (!currentEntry || currentEntry.expiresAt <= now) {
    rateLimitStore.set(identifier, {
      attempts: 1,
      expiresAt: now + RATE_LIMIT_WINDOW,
    });

    return false;
  }

  if (currentEntry.attempts >= RATE_LIMIT_MAX_ATTEMPTS) {
    return true;
  }

  currentEntry.attempts += 1;
  rateLimitStore.set(identifier, currentEntry);

  return false;
}

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function readBoolean(
  value: string | undefined,
  defaultValue: boolean,
) {
  if (value === undefined) {
    return defaultValue;
  }

  return ["true", "1", "yes", "on"].includes(
    value.trim().toLowerCase(),
  );
}

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);

  if (isRateLimited(clientIp)) {
    return NextResponse.json(
      {
        error:
          "Wysłano zbyt wiele wiadomości. Spróbuj ponownie za około 15 minut.",
      },
      {
        status: 429,
      },
    );
  }

  let body: ContactRequest;

  try {
    body = (await request.json()) as ContactRequest;
  } catch {
    return NextResponse.json(
      {
        error: "Nieprawidłowe dane formularza.",
      },
      {
        status: 400,
      },
    );
  }

  const name = normalizeText(body.name);
  const email = normalizeText(body.email).toLowerCase();
  const topic = normalizeText(body.topic);
  const message = normalizeText(body.message);
  const website = normalizeText(body.website);

  /*
   * Pole-pułapka dla automatów. Użytkownik go nie widzi,
   * natomiast roboty często próbują je uzupełnić.
   */
  if (website) {
    return NextResponse.json({
      success: true,
    });
  }

  if (name.length < 2 || name.length > 100) {
    return NextResponse.json(
      {
        error:
          "Wpisz prawidłowe imię lub nazwę (od 2 do 100 znaków).",
      },
      {
        status: 400,
      },
    );
  }

  if (!isValidEmail(email) || email.length > 254) {
    return NextResponse.json(
      {
        error: "Wpisz prawidłowy adres e-mail.",
      },
      {
        status: 400,
      },
    );
  }

  if (!allowedTopics.includes(topic)) {
    return NextResponse.json(
      {
        error: "Wybierz temat wiadomości.",
      },
      {
        status: 400,
      },
    );
  }

  if (message.length < 20 || message.length > 5000) {
    return NextResponse.json(
      {
        error:
          "Wiadomość musi zawierać od 20 do 5000 znaków.",
      },
      {
        status: 400,
      },
    );
  }

  if (body.privacyAccepted !== true) {
    return NextResponse.json(
      {
        error:
          "Zaakceptuj informację dotyczącą przetwarzania danych.",
      },
      {
        status: 400,
      },
    );
  }

  const smtpHost = process.env.SMTP_HOST?.trim();
  const smtpPort = Number(process.env.SMTP_PORT ?? "465");
  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpPassword = process.env.SMTP_PASSWORD;
  const contactEmail =
    process.env.CONTACT_EMAIL?.trim() || smtpUser;

  const smtpSecure = readBoolean(
    process.env.SMTP_SECURE,
    smtpPort === 465,
  );

  /*
   * Zezwolenie na samopodpisany certyfikat może działać wyłącznie
   * lokalnie. Na produkcji certyfikat zawsze jest sprawdzany.
   */
  const allowSelfSignedLocally =
    process.env.NODE_ENV !== "production" &&
    readBoolean(
      process.env.SMTP_ALLOW_SELF_SIGNED,
      false,
    );

  if (
    !smtpHost ||
    !smtpUser ||
    !smtpPassword ||
    !contactEmail ||
    !Number.isInteger(smtpPort) ||
    smtpPort < 1 ||
    smtpPort > 65535
  ) {
    console.error("Brak pełnej konfiguracji poczty SMTP.");

    return NextResponse.json(
      {
        error:
          "Formularz jest chwilowo niedostępny. Napisz bezpośrednio na kontakt@blisko24.com.pl.",
      },
      {
        status: 503,
      },
    );
  }

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeTopic = escapeHtml(topic);
  const safeMessage = escapeHtml(message).replaceAll(
    "\n",
    "<br />",
  );

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,

    auth: {
      user: smtpUser,
      pass: smtpPassword,
    },

    connectionTimeout: 15_000,
    greetingTimeout: 15_000,
    socketTimeout: 20_000,

    tls: {
      servername: smtpHost,
      minVersion: "TLSv1.2",
      rejectUnauthorized: !allowSelfSignedLocally,
    },
  });

  try {
    await transporter.sendMail({
      from: `"Formularz BLISKO24" <${smtpUser}>`,
      to: contactEmail,
      replyTo: email,
      subject: `[BLISKO24] ${topic} — ${name}`,

      text: [
        "Nowa wiadomość z formularza BLISKO24",
        "",
        `Imię lub nazwa: ${name}`,
        `E-mail: ${email}`,
        `Temat: ${topic}`,
        "",
        "Wiadomość:",
        message,
      ].join("\n"),

      html: `
        <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
          <h2 style="color: #1d4ed8;">
            Nowa wiadomość z formularza BLISKO24
          </h2>

          <p>
            <strong>Imię lub nazwa:</strong> ${safeName}
          </p>

          <p>
            <strong>E-mail:</strong> ${safeEmail}
          </p>

          <p>
            <strong>Temat:</strong> ${safeTopic}
          </p>

          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />

          <p>
            <strong>Wiadomość:</strong>
          </p>

          <p>${safeMessage}</p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Błąd wysyłania formularza kontaktowego:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Nie udało się wysłać wiadomości. Spróbuj ponownie lub napisz bezpośrednio na kontakt@blisko24.com.pl.",
      },
      {
        status: 500,
      },
    );
  }
}