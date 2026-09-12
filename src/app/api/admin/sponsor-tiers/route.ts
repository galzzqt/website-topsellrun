import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { currentAdmin } from "@/lib/auth";
import { orderTiers } from "@/lib/content";
import { db } from "@/lib/db";

// Save the display order of sponsor tiers: body { tiers: ["main", "presented", ...] }.
export async function PUT(req: Request) {
  if (!(await currentAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { tiers } = await req.json().catch(() => ({}));
  const order = orderTiers(tiers).map(([key]) => key);
  await (await db())
    .collection("siteConfig")
    .replaceOne({ _id: "sponsorTiers" as never }, { order, updatedAt: new Date() }, { upsert: true });
  revalidatePath("/", "layout"); // every public page reads this content
  return NextResponse.json({ ok: true, order });
}
