"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signUp } from "../../lib/auth";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sendingReset, setSendingReset] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      alert("Wpisz e-mail i hasło.");
      return;
    }

    const { error } = await signIn(
      email.trim(),
      password
    );

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/");
    router.refresh();
  }

  async function handleRegister() {
    if (!email.trim() || password.length < 8) {
      alert(
        "Wpisz poprawny e-mail i hasło mające minimum 8 znaków."
      );
      return;
    }

    const { error } = await signUp(
      email.trim(),
      password
    );

    if (error) {
      alert(error.message);
      return;
    }

    alert(
      "Konto zostało utworzone. Sprawdź e-mail, jeśli wymagane jest potwierdzenie."
    );
  }

  async function handlePasswordReset() {
    if (!email.trim()) {
      alert(
        "Najpierw wpisz adres e-mail konta administratora."
      );
      return;
    }

    setSendingReset(true);

    const { error } =
      await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo:
            "http://localhost:3000/reset-hasla",
        }
      );

    setSendingReset(false);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    alert(
      "Wysłaliśmy wiadomość. Otwórz link z e-maila i ustaw nowe hasło."
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow">

        <h1 className="mb-8 text-center text-3xl font-bold">
          Logowanie
        </h1>

        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(event) =>
            setEmail(event.target.value)
          }
          className="mb-4 w-full rounded-xl border p-3"
        />

        <input
          type="password"
          placeholder="Hasło"
          value={password}
          onChange={(event) =>
            setPassword(event.target.value)
          }
          className="mb-6 w-full rounded-xl border p-3"
        />

        <button
          onClick={handleLogin}
          className="mb-3 w-full rounded-xl bg-blue-700 py-3 font-semibold text-white hover:bg-blue-800"
        >
          Zaloguj się
        </button>

        <button
          onClick={handleRegister}
          className="mb-4 w-full rounded-xl bg-green-600 py-3 font-semibold text-white hover:bg-green-700"
        >
          Załóż konto
        </button>

        <button
          type="button"
          onClick={handlePasswordReset}
          disabled={sendingReset}
          className="w-full text-sm font-semibold text-blue-700 hover:underline disabled:opacity-50"
        >
          {sendingReset
            ? "Wysyłanie..."
            : "Nie pamiętam hasła"}
        </button>

      </div>
    </main>
  );
}