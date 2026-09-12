import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { currentAdmin } from "@/lib/auth";
import { cleanConfig } from "@/lib/content";
import { db } from "@/lib/db";

export async function PUT(req: Request) {
  const admin = await currentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const config = cleanConfig(await req.json().catch(() => null));
  await (await db())
    .collection("siteConfig")
    .replaceOne({ _id: "main" as never }, { ...config, updatedAt: new Date(), updatedBy: admin.email }, { upsert: true });
  revalidatePath("/", "layout"); // every public page reads this content
  return NextResponse.json({ ok: true, config });
}
