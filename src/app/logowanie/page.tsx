"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { signIn, signUp } from "../../lib/auth";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loggingIn, setLoggingIn] =
    useState(false);

  const [registering, setRegistering] =
    useState(false);

  const [sendingReset, setSendingReset] =
    useState(false);

  async function handleLogin() {
    const normalizedEmail = email
      .trim()
      .toLowerCase();

    if (!normalizedEmail || !password) {
      alert("Wpisz e-mail i hasło.");
      return;
    }

    if (loggingIn) return;

    setLoggingIn(true);

    const { error: loginError } = await signIn(
      normalizedEmail,
      password
    );

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
      console.error(
        "Błąd pobierania użytkownika:",
        userError
      );

      await supabase.auth.signOut();

      setLoggingIn(false);

      alert(
        "Nie udało się sprawdzić danych konta. Spróbuj ponownie."
      );

      return;
    }

    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select(
        "blocked, blocked_reason, blocked_at"
      )
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error(
        "Błąd sprawdzania blokady konta:",
        profileError
      );

      await supabase.auth.signOut();

      setLoggingIn(false);

      alert(
        "Nie udało się sprawdzić statusu konta. Spróbuj ponownie."
      );

      return;
    }

    if (profile?.blocked === true) {
      await supabase.auth.signOut();

      setLoggingIn(false);

      const reason =
        profile.blocked_reason?.trim();

      alert(
        reason
          ? `Twoje konto zostało zablokowane.\n\nPowód: ${reason}`
          : "Twoje konto zostało zablokowane. Skontaktuj się z administratorem BLISKO24."
      );

      return;
    }

    setLoggingIn(false);

    router.replace("/");
    router.refresh();
  }

  async function handleRegister() {
    const normalizedEmail = email
      .trim()
      .toLowerCase();

    if (
      !normalizedEmail ||
      password.length < 8
    ) {
      alert(
        "Wpisz poprawny e-mail i hasło mające minimum 8 znaków."
      );

      return;
    }

    if (registering) return;

    setRegistering(true);

    const { error } = await signUp(
      normalizedEmail,
      password
    );

    setRegistering(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert(
      "Konto zostało utworzone. Sprawdź e-mail, jeśli wymagane jest potwierdzenie."
    );
  }

  async function handlePasswordReset() {
    const normalizedEmail = email
      .trim()
      .toLowerCase();

    if (!normalizedEmail) {
      alert(
        "Najpierw wpisz adres e-mail swojego konta."
      );

      return;
    }

    setSendingReset(true);

    const { error } =
      await supabase.auth.resetPasswordForEmail(
        normalizedEmail,
        {
          redirectTo:
            "http://localhost:3000/reset-hasla",
        }
      );

    setSendingReset(false);

    if (error) {
      console.error(
        "Błąd resetowania hasła:",
        error
      );

      alert(error.message);
      return;
    }

    alert(
      "Wysłaliśmy wiadomość. Otwórz link z e-maila i ustaw nowe hasło."
    );
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (event.key === "Enter") {
      event.preventDefault();
      handleLogin();
    }
  }

  const formBusy =
    loggingIn ||
    registering ||
    sendingReset;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4 sm:px-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-lg sm:p-8">

        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-700 text-3xl font-extrabold text-white shadow">
            B
          </div>

          <h1 className="mt-5 text-3xl font-extrabold text-slate-900">
            Logowanie
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Zaloguj się do swojego konta BLISKO24.
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
            onChange={(event) =>
              setEmail(event.target.value)
            }
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
            placeholder="Wpisz hasło"
            value={password}
            disabled={formBusy}
            onChange={(event) =>
              setPassword(event.target.value)
            }
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
          {loggingIn
            ? "Sprawdzanie konta..."
            : "Zaloguj się"}
        </button>

        <button
          type="button"
          onClick={handleRegister}
          disabled={formBusy}
          className="mt-3 w-full rounded-xl bg-green-600 py-3.5 font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {registering
            ? "Tworzenie konta..."
            : "Załóż konto"}
        </button>

        <button
          type="button"
          onClick={handlePasswordReset}
          disabled={formBusy}
          className="mt-5 w-full text-sm font-semibold text-blue-700 hover:underline disabled:opacity-50"
        >
          {sendingReset
            ? "Wysyłanie wiadomości..."
            : "Nie pamiętam hasła"}
        </button>

      </div>
    </main>
  );
}