import { NextResponse } from "next/server";
import { currentAdmin } from "@/lib/auth";
import { uploadImage } from "@/lib/cloudinary";

const MAX_UPLOAD_MB = 5; // keep in sync with the admin form's client-side check
const TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/svg+xml"];

export async function POST(req: Request) {
  if (!(await currentAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const file = (await req.formData().catch(() => null))?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
  if (!TYPES.includes(file.type))
    return NextResponse.json({ error: "Format harus JPG, PNG, WEBP, AVIF, atau SVG" }, { status: 400 });
  if (file.size > MAX_UPLOAD_MB * 1024 * 1024)
    return NextResponse.json({ error: `Ukuran maksimal ${MAX_UPLOAD_MB}MB` }, { status: 400 });
  try {
    return NextResponse.json(await uploadImage(file));
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
