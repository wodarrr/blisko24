"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

const topicOptions = [
  "Pytanie dotyczące portalu",
  "Problem techniczny",
  "Zgłoszenie dotyczące bezpieczeństwa",
  "Propozycja współpracy",
  "Inna sprawa",
];

type FormData = {
  name: string;
  email: string;
  topic: string;
  message: string;
  website: string;
  privacyAccepted: boolean;
};

const initialFormData: FormData = {
  name: "",
  email: "",
  topic: topicOptions[0],
  message: "",
  website: "",
  privacyAccepted: false,
};

export default function ContactPage() {
  const [formData, setFormData] =
    useState<FormData>(initialFormData);

  const [sending, setSending] = useState(false);
  const [successMessage, setSuccessMessage] =
    useState("");
  const [errorMessage, setErrorMessage] =
    useState("");

  function updateTextField(
    field: "name" | "email" | "topic" | "message" | "website",
    value: string,
  ) {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    if (!formData.name.trim()) {
      setErrorMessage("Wpisz swoje imię lub nazwę.");
      return;
    }

    if (!formData.email.trim()) {
      setErrorMessage("Wpisz swój adres e-mail.");
      return;
    }

    if (formData.message.trim().length < 20) {
      setErrorMessage(
        "Wiadomość powinna zawierać przynajmniej 20 znaków.",
      );
      return;
    }

    if (!formData.privacyAccepted) {
      setErrorMessage(
        "Zaakceptuj informację dotyczącą przetwarzania danych.",
      );
      return;
    }

    setSending(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          topic: formData.topic,
          message: formData.message.trim(),
          website: formData.website,
          privacyAccepted: formData.privacyAccepted,
        }),
      });

      const result = (await response.json()) as {
        message?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(
          result.error ??
            "Nie udało się wysłać wiadomości.",
        );
      }

      setSuccessMessage(
        result.message ??
          "Wiadomość została wysłana. Dziękujemy za kontakt.",
      );

      setFormData(initialFormData);
    } catch (error) {
      console.error(
        "Błąd wysyłania formularza kontaktowego:",
        error,
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Nie udało się wysłać wiadomości. Spróbuj ponownie.",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 py-10 sm:py-14">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <section className="rounded-3xl bg-white p-6 shadow sm:p-10">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-700">
            Kontakt
          </p>

          <h1 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Skontaktuj się z nami
          </h1>

          <p className="mt-6 max-w-3xl leading-8 text-slate-700">
            Jeżeli masz pytania dotyczące działania portalu,
            chcesz zgłosić błąd, nieodpowiednie ogłoszenie
            albo przesłać propozycję rozwoju, napisz do
            zespołu BLISKO24.
          </p>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">
            <form
              onSubmit={submitForm}
              className="rounded-3xl border border-slate-200 bg-slate-50 p-5 sm:p-7"
            >
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-700">
                  Formularz kontaktowy
                </p>

                <h2 className="mt-2 text-2xl font-extrabold text-slate-900">
                  Napisz wiadomość
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Wiadomość zostanie wysłana bezpośrednio
                  na skrzynkę zespołu BLISKO24.
                </p>
              </div>

              <div
                className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden"
                aria-hidden="true"
              >
                <label htmlFor="website">
                  Strona internetowa
                </label>

                <input
                  id="website"
                  name="website"
                  type="text"
                  value={formData.website}
                  onChange={(event) =>
                    updateTextField(
                      "website",
                      event.target.value,
                    )
                  }
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <div className="mt-7 grid gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block font-semibold text-slate-900"
                  >
                    Imię lub nazwa
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    minLength={2}
                    maxLength={100}
                    autoComplete="name"
                    value={formData.name}
                    onChange={(event) =>
                      updateTextField(
                        "name",
                        event.target.value,
                      )
                    }
                    placeholder="Np. Krzysztof"
                    className="w-full rounded-xl border border-slate-300 bg-white p-4 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block font-semibold text-slate-900"
                  >
                    Adres e-mail
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    maxLength={254}
                    autoComplete="email"
                    value={formData.email}
                    onChange={(event) =>
                      updateTextField(
                        "email",
                        event.target.value,
                      )
                    }
                    placeholder="Np. kontakt@example.com"
                    className="w-full rounded-xl border border-slate-300 bg-white p-4 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label
                  htmlFor="topic"
                  className="mb-2 block font-semibold text-slate-900"
                >
                  Temat wiadomości
                </label>

                <select
                  id="topic"
                  name="topic"
                  required
                  value={formData.topic}
                  onChange={(event) =>
                    updateTextField(
                      "topic",
                      event.target.value,
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white p-4 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                >
                  {topicOptions.map((topic) => (
                    <option key={topic} value={topic}>
                      {topic}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between gap-4">
                  <label
                    htmlFor="message"
                    className="font-semibold text-slate-900"
                  >
                    Wiadomość
                  </label>

                  <span className="text-xs text-slate-500">
                    {formData.message.length}/5000
                  </span>
                </div>

                <textarea
                  id="message"
                  name="message"
                  required
                  minLength={20}
                  maxLength={5000}
                  rows={8}
                  value={formData.message}
                  onChange={(event) =>
                    updateTextField(
                      "message",
                      event.target.value,
                    )
                  }
                  placeholder="Opisz swoją sprawę możliwie dokładnie..."
                  className="w-full resize-y rounded-xl border border-slate-300 bg-white p-4 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4">
                <input
                  type="checkbox"
                  checked={formData.privacyAccepted}
                  onChange={(event) =>
                    setFormData((previous) => ({
                      ...previous,
                      privacyAccepted:
                        event.target.checked,
                    }))
                  }
                  required
                  className="mt-1 h-5 w-5 shrink-0"
                />

                <span className="text-sm leading-6 text-slate-700">
                  Wyrażam zgodę na wykorzystanie podanych
                  danych w celu udzielenia odpowiedzi na
                  wiadomość. Zapoznałem się z{" "}
                  <Link
                    href="/polityka-prywatnosci"
                    className="font-semibold text-blue-700 underline hover:text-blue-800"
                  >
                    polityką prywatności
                  </Link>
                  .
                </span>
              </label>

              {errorMessage && (
                <div
                  role="alert"
                  className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700"
                >
                  {errorMessage}
                </div>
              )}

              {successMessage && (
                <div
                  role="status"
                  className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-800"
                >
                  ✅ {successMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={sending}
                className="mt-6 w-full rounded-xl bg-blue-700 px-6 py-4 font-bold text-white shadow-lg transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sending
                  ? "Wysyłanie wiadomości..."
                  : "📨 Wyślij wiadomość"}
              </button>
            </form>

            <div className="space-y-6">
              <div className="rounded-2xl bg-blue-50 p-6">
                <div className="text-4xl">📧</div>

                <h2 className="mt-4 text-xl font-bold">
                  E-mail
                </h2>

                <a
                  href="mailto:kontakt@blisko24.com.pl"
                  className="mt-3 block break-all font-semibold text-blue-700 hover:underline"
                >
                  kontakt@blisko24.com.pl
                </a>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Odpowiadamy możliwie najszybciej.
                </p>
              </div>

              <div className="rounded-2xl bg-green-50 p-6">
                <div className="text-4xl">🛡️</div>

                <h2 className="mt-4 text-xl font-bold">
                  Zgłoszenia
                </h2>

                <p className="mt-3 leading-7 text-slate-700">
                  Jeśli zauważysz naruszenie regulaminu,
                  próbę oszustwa lub nielegalną treść,
                  skorzystaj również z funkcji zgłoszenia
                  dostępnej przy ogłoszeniu.
                </p>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
                <div className="text-4xl">🔒</div>

                <h2 className="mt-4 text-xl font-bold">
                  Bezpieczeństwo
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-700">
                  Nigdy nie przesyłaj formularzem haseł,
                  numerów kart płatniczych ani innych
                  poufnych danych.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 rounded-2xl border border-blue-200 bg-blue-50 p-6">
            <h2 className="text-xl font-bold text-slate-900">
              Portal rozwijany wspólnie z użytkownikami
            </h2>

            <p className="mt-3 leading-7 text-slate-700">
              BLISKO24 jest stale ulepszany. Wszystkie
              zgłoszenia użytkowników są analizowane i
              pomagają rozwijać serwis.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}