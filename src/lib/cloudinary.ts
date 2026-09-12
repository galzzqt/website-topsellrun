import { createHash } from "node:crypto";

// Plain REST calls to Cloudinary — no SDK needed for signed upload/destroy.
function creds() {
  const { CLOUDINARY_CLOUD_NAME: cloud, CLOUDINARY_API_KEY: key, CLOUDINARY_API_SECRET: secret } = process.env;
  if (!cloud || !key || !secret) throw new Error("Cloudinary env vars are not set");
  return { cloud, key, secret };
}

function signed(params: Record<string, string>) {
  const { key, secret } = creds();
  const all = { ...params, timestamp: String(Math.floor(Date.now() / 1000)) };
  const toSign = Object.keys(all).sort().map((k) => `${k}=${all[k as keyof typeof all]}`).join("&");
  return { ...all, api_key: key, signature: createHash("sha1").update(toSign + secret).digest("hex") };
}

async function call(action: string, body: FormData) {
  const res = await fetch(`https://api.cloudinary.com/v1_1/${creds().cloud}/image/${action}`, { method: "POST", body });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || "Cloudinary error");
  return json;
}

export async function uploadImage(file: File) {
  const form = new FormData();
  const params: Record<string, string> = { folder: process.env.CLOUDINARY_FOLDER || "topsellrun" };
  // Store rasters as WebP (Cloudinary converts on upload); SVG stays vector so logos remain sharp.
  if (file.type !== "image/svg+xml") params.format = "webp";
  for (const [k, v] of Object.entries(signed(params))) form.append(k, v);
  form.append("file", file);
  const r = await call("upload", form);
  return { url: r.secure_url as string, publicId: r.public_id as string };
}

export async function destroyImage(publicId: string) {
  const form = new FormData();
  for (const [k, v] of Object.entries(signed({ public_id: publicId }))) form.append(k, v);
  await call("destroy", form);
}
