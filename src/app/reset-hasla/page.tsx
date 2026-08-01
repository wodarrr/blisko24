"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] =
    useState("");

  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(
    "Sprawdzanie linku odzyskiwania..."
  );

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (session) {
        setReady(true);
        setMessage("");
      } else {
        setMessage(
          "Link jest nieprawidłowy albo wygasł. Wróć do logowania i wyślij nowy link."
        );
      }
    }

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (
          event === "PASSWORD_RECOVERY" ||
          event === "SIGNED_IN"
        ) {
          if (session && mounted) {
            setReady(true);
            setMessage("");
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function savePassword(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (password.length < 8) {
      alert("Hasło musi mieć minimum 8 znaków.");
      return;
    }

    if (password !== repeatPassword) {
      alert("Hasła nie są takie same.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setSaving(false);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    alert(
      "Hasło zostało ustawione. Od teraz możesz logować się e-mailem i tym hasłem."
    );

    await supabase.auth.signOut();

    router.replace("/logowanie");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow">

        <h1 className="text-center text-3xl font-bold">
          Ustaw nowe hasło
        </h1>

        {!ready ? (
          <p className="mt-6 text-center text-gray-600">
            {message}
          </p>
        ) : (
          <form
            onSubmit={savePassword}
            className="mt-8 space-y-5"
          >
            <div>
              <label className="mb-2 block font-semibold">
                Nowe hasło
              </label>

              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                minLength={8}
                autoComplete="new-password"
                className="w-full rounded-xl border p-3"
                required
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold">
                Powtórz hasło
              </label>

              <input
                type="password"
                value={repeatPassword}
                onChange={(event) =>
                  setRepeatPassword(
                    event.target.value
                  )
                }
                minLength={8}
                autoComplete="new-password"
                className="w-full rounded-xl border p-3"
                required
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-blue-700 py-3 font-bold text-white hover:bg-blue-800 disabled:opacity-50"
            >
              {saving
                ? "Zapisywanie..."
                : "Ustaw nowe hasło"}
            </button>
          </form>
        )}

      </div>
    </main>
  );
}