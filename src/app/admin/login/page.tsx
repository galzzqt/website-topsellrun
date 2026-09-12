"use client";

import { useState } from "react";
import Logo from "@/components/Logo";

export default function Login() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))),
    });
    if (res.ok) return location.assign("/admin");
    setError((await res.json().catch(() => ({}))).error || "Login gagal");
    setBusy(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-5">
      <form onSubmit={submit} className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-xl">
        <Logo className="mx-auto h-20 w-auto" priority />
        <p className="mt-2 text-center text-sm text-muted">Panel Admin</p>
        <label className="mt-8 block text-sm font-semibold">
          Email
          <input name="email" type="email" required autoComplete="username" className="mt-1 w-full rounded-xl border border-line px-4 py-3" />
        </label>
        <label className="mt-4 block text-sm font-semibold">
          Password
          <input name="password" type="password" required autoComplete="current-password" className="mt-1 w-full rounded-xl border border-line px-4 py-3" />
        </label>
        {error && <p role="alert" className="mt-4 text-sm font-semibold text-brand-red">{error}</p>}
        <button disabled={busy} className="bg-brand mt-6 w-full rounded-full py-3 font-bold text-white disabled:opacity-60">
          {busy ? "Masuk..." : "Masuk"}
        </button>
      </form>
    </main>
  );
}
