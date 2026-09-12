import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { currentAdmin } from "@/lib/auth";
import { destroyImage } from "@/lib/cloudinary";
import { clean, ITEM_SHAPES, SPONSOR_TIERS } from "@/lib/content";
import { db } from "@/lib/db";

type Col = keyof typeof ITEM_SHAPES;
type Ctx = RouteContext<"/api/admin/items/[col]">;

async function guard(ctx: Ctx) {
  const { col } = await ctx.params;
  if (!(await currentAdmin())) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (!(col in ITEM_SHAPES)) return { error: NextResponse.json({ error: "Not found" }, { status: 404 }) };
  return { col: col as Col, c: (await db()).collection(col) };
}

function parse(col: Col, body: unknown) {
  const item = clean(ITEM_SHAPES[col], body);
  if (col === "sponsors" && !SPONSOR_TIERS.some(([t]) => t === (item as typeof ITEM_SHAPES.sponsors).tier))
    return null;
  const required = col === "sponsors" ? ["name", "logo"] : ["image"];
  return required.every((k) => (item as Record<string, string>)[k]) ? item : null;
}

const oid = (id: string | null) => (id && ObjectId.isValid(id) ? new ObjectId(id) : null);

// Create (no _id) or update (with _id).
export async function POST(req: Request, ctx: Ctx) {
  const g = await guard(ctx);
  if (g.error) return g.error;
  const body = await req.json().catch(() => ({}));
  const item = parse(g.col, body);
  if (!item) return NextResponse.json({ error: "Data tidak lengkap / tidak valid" }, { status: 400 });

  const id = oid(body._id ?? null);
  if (id) await g.c.updateOne({ _id: id }, { $set: { ...item, updatedAt: new Date() } });
  else {
    // Tag with the current edition so later phases (BIB results, per-year archives) can filter by event.
    const cfg = await (await db()).collection("siteConfig").findOne({ _id: "main" as never });
    // order = timestamp so new items land at the end until reordered
    await g.c.insertOne({ ...item, edition: cfg?.event?.edition ?? "", order: Date.now(), createdAt: new Date() });
  }
  revalidatePath("/", "layout"); // every public page reads this content
  return NextResponse.json({ ok: true });
}

// Reorder: body { ids: [...] } in the desired order → each doc gets order = its position.
export async function PATCH(req: Request, ctx: Ctx) {
  const g = await guard(ctx);
  if (g.error) return g.error;
  const { ids } = await req.json().catch(() => ({}));
  const oids = Array.isArray(ids) ? ids.slice(0, 500).map((i) => oid(String(i))) : [];
  if (!oids.length || oids.some((o) => !o)) return NextResponse.json({ error: "Invalid ids" }, { status: 400 });
  await g.c.bulkWrite(oids.map((_id, i) => ({ updateOne: { filter: { _id: _id! }, update: { $set: { order: i } } } })));
  revalidatePath("/", "layout"); // every public page reads this content
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request, ctx: Ctx) {
  const g = await guard(ctx);
  if (g.error) return g.error;
  const id = oid(new URL(req.url).searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const doc = await g.c.findOneAndDelete({ _id: id });
  if (doc?.publicId) await destroyImage(doc.publicId).catch((e) => console.error("Cloudinary destroy failed:", e));
  revalidatePath("/", "layout"); // every public page reads this content
  return NextResponse.json({ ok: true });
}
