"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { supabase } from "../lib/supabase";

import AuthButton from "./AuthButton";
import NotificationBell from "./NotificationBell";
import MessageBell from "./MessageBell";

export default function Header() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkAdminStatus(
      userId?: string
    ) {
      if (!userId) {
        if (!cancelled) {
          setIsAdmin(false);
        }

        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", userId)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        console.error(
          "Błąd sprawdzania uprawnień administratora:",
          error
        );

        setIsAdmin(false);
        return;
      }

      setIsAdmin(data?.is_admin === true);
    }

    async function initialize() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      await checkAdminStatus(user?.id);
    }

    initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        checkAdminStatus(
          session?.user?.id
        );
      }
    );

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between px-4 py-3 sm:px-6">

        <Link
          href="/"
          className="flex min-w-0 items-center gap-3"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-700 text-xl font-bold text-white shadow-lg sm:h-12 sm:w-12 sm:text-2xl">
            B
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
              BLISKO24
            </h1>

            <p className="-mt-1 hidden text-xs text-gray-500 sm:block">
              Portal lokalnych możliwości
            </p>
          </div>
        </Link>

        {/* Menu komputerowe */}
        <nav className="hidden items-center gap-6 lg:flex">
          <Link
            href="/"
            className="font-medium text-slate-700 transition hover:text-blue-700"
          >
            Strona główna
          </Link>

          <Link
            href="/konto"
            className="font-medium text-slate-700 transition hover:text-blue-700"
          >
            Moje konto
          </Link>

          <MessageBell />

          <NotificationBell />

          {isAdmin && (
            <Link
              href="/admin"
              className="font-semibold text-red-600 transition hover:text-red-700"
            >
              👑 Admin
            </Link>
          )}

          <Link
            href="/dodaj-ogloszenie"
            className="rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white shadow-lg transition hover:bg-blue-800"
          >
            + Dodaj ogłoszenie
          </Link>

          <AuthButton />
        </nav>

        {/* Menu mobilne */}
        <details className="relative lg:hidden">
          <summary className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-xl border border-slate-200 bg-white text-2xl text-slate-800 shadow-sm">
            ☰
          </summary>

          <div className="fixed inset-x-0 top-20 z-[100] border-t border-slate-200 bg-white p-4 shadow-xl">
            <nav className="mx-auto flex max-w-7xl flex-col gap-2">

              <Link
                href="/"
                className="rounded-xl px-4 py-3 font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-700"
              >
                Strona główna
              </Link>

              <Link
                href="/konto"
                className="rounded-xl px-4 py-3 font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-700"
              >
                Moje konto
              </Link>

              <Link
                href="/wiadomosci"
                className="flex items-center gap-3 rounded-xl px-4 py-3 font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-700"
              >
                <span className="text-xl">
                  💬
                </span>

                Wiadomości
              </Link>

              <Link
                href="/powiadomienia"
                className="flex items-center gap-3 rounded-xl px-4 py-3 font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-700"
              >
                <span className="text-xl">
                  🔔
                </span>

                Powiadomienia
              </Link>

              {isAdmin && (
                <Link
                  href="/admin"
                  className="rounded-xl px-4 py-3 font-semibold text-red-600 hover:bg-red-50"
                >
                  👑 Panel administratora
                </Link>
              )}

              <Link
                href="/dodaj-ogloszenie"
                className="mt-2 rounded-xl bg-blue-700 px-4 py-3 text-center font-semibold text-white hover:bg-blue-800"
              >
                + Dodaj ogłoszenie
              </Link>

              <div className="mt-2 border-t border-slate-200 pt-4">
                <AuthButton />
              </div>

            </nav>
          </div>
        </details>

      </div>
    </header>
  );
}