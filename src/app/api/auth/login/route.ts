import { NextResponse, type NextRequest } from "next/server";
import { checkPassword, sessionCookie, signSession } from "@/lib/auth";
import { db } from "@/lib/db";

// ponytail: in-memory limiter, fine for a single Dokploy instance; move to Mongo/Redis if scaled out.
const attempts = new Map<string, { n: number; reset: number }>();
const LIMIT = 10, WINDOW = 15 * 60 * 1000;
const DUMMY = "00000000000000000000000000000000:" + "0".repeat(128);

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  const a = attempts.get(ip);
  const now = Date.now();
  if (a && a.reset > now && a.n >= LIMIT)
    return NextResponse.json({ error: "Terlalu banyak percobaan. Coba lagi nanti." }, { status: 429 });

  const body = await req.json().catch(() => ({}));
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  const user = email && (await (await db()).collection("adminUsers").findOne({ email }));
  // Always run scrypt so response time doesn't reveal whether the email exists.
  const ok = checkPassword(password, user ? user.passwordHash : DUMMY) && !!user;

  if (!ok) {
    attempts.set(ip, a && a.reset > now ? { n: a.n + 1, reset: a.reset } : { n: 1, reset: now + WINDOW });
    return NextResponse.json({ error: "Email atau password salah." }, { status: 401 });
  }
  attempts.delete(ip);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(sessionCookie(signSession(email)));
  return res;
}
