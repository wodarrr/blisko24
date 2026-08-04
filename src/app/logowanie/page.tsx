"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { signIn, signUp, type AccountType } from "../../lib/auth";
import { supabase } from "../../lib/supabase";

const TERMS_VERSION = "2026-08-02";
const PRIVACY_VERSION = "2026-08-02";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [accountType, setAccountType] = useState<AccountType>("candidate");

  const [acceptTerms, setAcceptTerms] = useState(false);

  const [confirmPrivacy, setConfirmPrivacy] = useState(false);

  const [loggingIn, setLoggingIn] = useState(false);

  const [registering, setRegistering] = useState(false);

  const [sendingReset, setSendingReset] = useState(false);

  async function handleLogin() {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      alert("Wpisz e-mail i hasło.");
      return;
    }

    if (loggingIn) return;

    setLoggingIn(true);

    const { error: loginError } = await signIn(normalizedEmail, password);

    if (loginError) {
      setLoggingIn(false);
      alert(loginError.message);
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Błąd pobierania użytkownika:", userError);

      await supabase.auth.signOut();

      setLoggingIn(false);

      alert("Nie udało się sprawdzić danych konta. Spróbuj ponownie.");

      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("blocked, blocked_reason, blocked_at")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Błąd sprawdzania blokady konta:", profileError);

      await supabase.auth.signOut();

      setLoggingIn(false);

      alert("Nie udało się sprawdzić statusu konta. Spróbuj ponownie.");

      return;
    }

    if (profile?.blocked === true) {
      await supabase.auth.signOut();

      setLoggingIn(false);

      const reason = profile.blocked_reason?.trim();

      alert(
        reason
          ? `Twoje konto zostało zablokowane.\n\nPowód: ${reason}`
          : "Twoje konto zostało zablokowane. Skontaktuj się z administratorem BLISKO24.",
      );

      return;
    }

    setLoggingIn(false);

    router.replace("/");
    router.refresh();
  }

  async function handleRegister() {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || password.length < 8) {
      alert("Wpisz poprawny e-mail i hasło mające minimum 8 znaków.");

      return;
    }

    if (!acceptTerms) {
      alert("Aby utworzyć konto, zaakceptuj Regulamin BLISKO24.");

      return;
    }

    if (!confirmPrivacy) {
      alert("Potwierdź zapoznanie się z Polityką prywatności.");

      return;
    }

    if (registering) return;

    setRegistering(true);

    const acceptedAt = new Date().toISOString();

    const { error } = await signUp(normalizedEmail, password, {
      accountType,
      emailRedirectTo: `${window.location.origin}/`,
      termsVersion: TERMS_VERSION,
      privacyVersion: PRIVACY_VERSION,
      acceptedAt,
    });

    setRegistering(false);

    if (error) {
      console.error("Błąd rejestracji:", error);

      alert(error.message);
      return;
    }

    setAcceptTerms(false);
    setConfirmPrivacy(false);

    alert(
      "Konto zostało utworzone. Sprawdź swoją skrzynkę e-mail, jeżeli wymagane jest potwierdzenie adresu.",
    );
  }

  async function handlePasswordReset() {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      alert("Najpierw wpisz adres e-mail swojego konta.");

      return;
    }

    setSendingReset(true);

    const { error } = await supabase.auth.resetPasswordForEmail(
      normalizedEmail,
      {
        redirectTo: `${window.location.origin}/reset-hasla`,
      },
    );

    setSendingReset(false);

    if (error) {
      console.error("Błąd resetowania hasła:", error);

      alert(error.message);
      return;
    }

    alert("Wysłaliśmy wiadomość. Otwórz link z e-maila i ustaw nowe hasło.");
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      handleLogin();
    }
  }

  const formBusy = loggingIn || registering || sendingReset;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-10 sm:px-6">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-lg sm:p-8">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-700 text-3xl font-extrabold text-white shadow">
            B
          </div>

          <h1 className="mt-5 text-3xl font-extrabold text-slate-900">
            Logowanie
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Zaloguj się albo utwórz konto BLISKO24.
          </p>
        </div>

        <div className="mt-8">
          <label
            htmlFor="login-email"
            className="mb-2 block font-semibold text-slate-800"
          >
            E-mail
          </label>

          <input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="twoj@email.pl"
            value={email}
            disabled={formBusy}
            onChange={(event) => setEmail(event.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full rounded-xl border border-slate-300 p-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
          />
        </div>

        <div className="mt-5">
          <label
            htmlFor="login-password"
            className="mb-2 block font-semibold text-slate-800"
          >
            Hasło
          </label>

          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            placeholder="Minimum 8 znaków"
            value={password}
            disabled={formBusy}
            onChange={(event) => setPassword(event.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full rounded-xl border border-slate-300 p-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
          />
        </div>

        <button
          type="button"
          onClick={handleLogin}
          disabled={formBusy}
          className="mt-7 w-full rounded-xl bg-blue-700 py-3.5 font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loggingIn ? "Sprawdzanie konta..." : "Zaloguj się"}
        </button>

        <div className="my-7 flex items-center gap-4">
          <div className="h-px flex-1 bg-slate-200" />

          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Nowe konto
          </span>

          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <section className="mb-5 rounded-2xl border border-blue-200 bg-blue-50 p-4 sm:p-5">
          <p className="font-extrabold text-slate-900">
            Jak chcesz korzystać z BLISKO24? *
          </p>

          <p className="mt-1 text-sm leading-6 text-slate-600">
            Wybór możesz później zmienić w ustawieniach profilu.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              {
                value: "candidate" as AccountType,
                icon: "👤",
                title: "Szukam pracy",
              },
              {
                value: "employer" as AccountType,
                icon: "🏢",
                title: "Szukam pracownika",
              },
              {
                value: "both" as AccountType,
                icon: "🤝",
                title: "Obie opcje",
              },
            ].map((option) => {
              const selected = accountType === option.value;

              return (
                <label
                  key={option.value}
                  className={`cursor-pointer rounded-xl border p-4 text-center transition ${
                    selected
                      ? "border-blue-600 bg-white shadow-sm ring-2 ring-blue-200"
                      : "border-blue-200 bg-blue-50 hover:bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="registration_account_type"
                    value={option.value}
                    checked={selected}
                    disabled={formBusy}
                    onChange={() => setAccountType(option.value)}
                    className="sr-only"
                  />

                  <span className="block text-2xl">{option.icon}</span>
                  <span className="mt-2 block text-sm font-extrabold text-slate-900">
                    {option.title}
                  </span>
                </label>
              );
            })}
          </div>
        </section>

        <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={acceptTerms}
              disabled={formBusy}
              onChange={(event) => setAcceptTerms(event.target.checked)}
              className="mt-1 h-5 w-5 shrink-0 accent-blue-700"
            />

            <span className="text-sm leading-6 text-slate-700">
              Akceptuję{" "}
              <Link
                href="/regulamin"
                target="_blank"
                className="font-bold text-blue-700 hover:underline"
              >
                Regulamin BLISKO24
              </Link>
              . *
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={confirmPrivacy}
              disabled={formBusy}
              onChange={(event) => setConfirmPrivacy(event.target.checked)}
              className="mt-1 h-5 w-5 shrink-0 accent-blue-700"
            />

            <span className="text-sm leading-6 text-slate-700">
              Potwierdzam, że zapoznałem się z{" "}
              <Link
                href="/polityka-prywatnosci"
                target="_blank"
                className="font-bold text-blue-700 hover:underline"
              >
                Polityką prywatności
              </Link>
              . *
            </span>
          </label>

          <p className="text-xs leading-5 text-slate-500">
            Pola oznaczone gwiazdką są wymagane do utworzenia konta.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRegister}
          disabled={formBusy}
          className="mt-4 w-full rounded-xl bg-green-600 py-3.5 font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {registering ? "Tworzenie konta..." : "Załóż bezpłatne konto"}
        </button>

        <button
          type="button"
          onClick={handlePasswordReset}
          disabled={formBusy}
          className="mt-5 w-full text-sm font-semibold text-blue-700 hover:underline disabled:opacity-50"
        >
          {sendingReset ? "Wysyłanie wiadomości..." : "Nie pamiętam hasła"}
        </button>
      </div>
    </main>
  );
}