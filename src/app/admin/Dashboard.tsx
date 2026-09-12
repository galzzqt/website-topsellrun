"use client";

import {
  ArrowDown, ArrowUp, BriefcaseBusiness, GripVertical, MapPinned, Package, Users,
  Camera, Clapperboard, Ellipsis, ExternalLink, Flag, GalleryHorizontal, Handshake, Image as ImageIcon, Info, MapPin,
  MousePointerClick, PartyPopper, Phone, Shirt, Tent, Trophy, Type, X, type LucideIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Logo from "@/components/Logo";
import { ITEM_TEMPLATES, type SiteConfig, type Tier } from "@/lib/content";
import type { Photo, Sponsor } from "@/lib/db";

const MAX_MB = 5;

const LABELS: Record<string, string> = {
  banners: "Banner Carousel (paling atas) — frame rasio 3:1, ukuran ideal 1920×640 px (gambar lain dipotong dari bawah)",
  linkUrl: "Link saat banner diklik (opsional)",
  event: "Section Upcoming Event — Logo = logo co-brand (mis. Topsell × Samsung), Logo judul = logo event landscape (mis. Run for Changes)",
  titleLogo: "Logo judul event (landscape, PNG transparan)",
  recap: "Hero mode recap (setelah event)",
  about: "Tentang Event",
  categories: "Kategori Lomba",
  venue: "Info Venue",
  merch: "Jersey & Medali",
  merchItems: "Gambar Jersey & Medali",
  achievements: "Pencapaian / Rekor (kosongkan jika tidak ada)",
  racepack: "Halaman Racepack",
  racepackItems: "Isi Racepack (gambar + caption)",
  racepackVenue: "Lokasi Pengambilan Racepack",
  schedule: "Jadwal pengambilan (tanggal & jam)",
  community: "Halaman Komunitas",
  joinUrl: "Link gabung komunitas (grup WA / Instagram, opsional)",
  communities: "Daftar Komunitas",
  websiteUrl: "Link website / Instagram komunitas (opsional)",
  logo: "Logo (PNG transparan disarankan)",
  sponsorship: "Halaman Sponsorship",
  sponsorshipBenefits: "Keuntungan Sponsorship",
  mediaPartner: "Halaman Media Partner",
  mediaPartnerBenefits: "Keuntungan Media Partner",
  video: "Video Highlight",
  instagram: "Section Instagram",
  instagramPosts: "Postingan Instagram (section tampil jika ada minimal 1)",
  url: "Link post / reel Instagram, mis. https://www.instagram.com/reel/ABC123/",
  festival: "Festival Info",
  festivalItems: "Rangkaian Acara Festival",
  ticker: "Teks Ticker Berjalan",
  closing: 'Banner "See you next run" (mode recap)',
  cta: "Tombol Daftar Sekarang",
  contact: "Kontak & Sosial Media",
  name: "Nama",
  edition: "Kode edisi (mis. 2026)",
  status: "Status event",
  date: "Tanggal event (WIB)",
  countdownTarget: "Target countdown (WIB)",
  tagline: "Tagline",
  heroImage: "Foto hero",
  title: "Judul",
  text: "Deskripsi",
  nextEventDate: "Tanggal event berikutnya (opsional, memunculkan CTA next event)",
  desc: "Deskripsi",
  address: "Alamat",
  mapsUrl: "Link Google Maps",
  image: "Gambar",
  caption: "Caption",
  value: "Angka / nilai",
  label: "Label",
  youtubeUrl: "URL YouTube",
  registerUrl: "URL pendaftaran (sistem eksternal)",
  whatsapp: "Nomor WhatsApp (628xxx)",
  whatsappText: "Pesan awal WhatsApp",
  email: "Email",
  instagramUrl: "URL Instagram",
  tiktokUrl: "URL TikTok",
  presentedBy: "Presented by",
};
const DATE_KEYS = ["date", "countdownTarget", "nextEventDate"];
const LONG_KEYS = ["text", "desc", "tagline", "address", "schedule"];

const input = "w-full rounded-xl border border-line bg-white px-3 py-2 text-sm focus:border-brand-red focus:outline-none";
const btn = "rounded-full px-4 py-2 text-sm font-bold disabled:opacity-50";

const MAX_SIDE = 2560; // px, longest side — sharp enough for full-width banners

// Resize + re-encode in the browser before upload, so camera-size photos (20MB+) become ~1MB.
// Falls back to the original file whenever the browser can't do better (SVG/GIF/HEIC, Safari without WebP encoding).
async function shrink(file: File): Promise<File> {
  if (!/^image\/(jpeg|png|webp|avif|bmp)$/.test(file.type)) return file;
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    bmp.close();
    const encode = (type: string) => new Promise<Blob | null>((r) => canvas.toBlob(r, type, 0.85));
    let blob = await encode("image/webp");
    // Safari can't encode WebP (returns PNG); JPEG is fine for photos there, Cloudinary still stores WebP.
    if (blob?.type !== "image/webp") blob = file.type === "image/jpeg" ? await encode("image/jpeg") : null;
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.\w+$/, "") + (blob.type === "image/webp" ? ".webp" : ".jpg"), { type: blob.type });
  } catch {
    return file;
  }
}

async function uploadFile(original: File): Promise<{ url: string; publicId: string }> {
  if (!original.type.startsWith("image/")) throw new Error(`${original.name}: bukan file gambar`);
  const file = await shrink(original);
  if (file.size > MAX_MB * 1024 * 1024) throw new Error(`${original.name}: masih lebih dari ${MAX_MB}MB setelah dikompres`);
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Upload gagal");
  return json;
}

async function api(url: string, method: string, body?: unknown) {
  const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) });
  if (res.status === 401) location.assign("/admin/login");
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "Gagal menyimpan");
  return json;
}

function ImageField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="flex items-center gap-3">
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className="h-16 w-16 rounded-lg border border-line object-cover" />
      ) : (
        <div className="h-16 w-16 rounded-lg border border-dashed border-line" />
      )}
      <label className={`${btn} cursor-pointer border border-line`}>
        {busy ? "Mengunggah..." : "Upload"}
        <input
          type="file"
          accept="image/*"
          hidden
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            setBusy(true);
            try {
              onChange((await uploadFile(f)).url);
            } catch (err) {
              alert((err as Error).message);
            }
            setBusy(false);
          }}
        />
      </label>
      {value && <button type="button" onClick={() => onChange("")} className="text-sm text-brand-red">Hapus</button>}
    </div>
  );
}

type Val = string | Val[] | { [k: string]: Val };

function Field({ k, v, set }: { k: string; v: Val; set: (v: Val) => void }) {
  const label = LABELS[k] ?? k;
  if (Array.isArray(v)) {
    return (
      <div className="space-y-3">
        {v.map((item, i) => (
          <div key={i} className="relative rounded-2xl border border-line bg-surface p-4 pr-12">
            <Field k="" v={item} set={(nv) => set(v.map((x, j) => (j === i ? nv : x)))} />
            <button type="button" onClick={() => set(v.filter((_, j) => j !== i))} className="absolute top-3 right-3 text-brand-red" aria-label="Hapus item"><X className="h-5 w-5" /></button>
          </div>
        ))}
        <button type="button" onClick={() => set([...v, { ...ITEM_TEMPLATES[k] }])} className={`${btn} border border-line`}>
          + Tambah
        </button>
      </div>
    );
  }
  if (typeof v === "object")
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {Object.entries(v).map(([ck, cv]) => (
          <div key={ck} className={LONG_KEYS.includes(ck) || /image$/i.test(ck) ? "sm:col-span-2" : ""}>
            <Field k={ck} v={cv} set={(nv) => set({ ...v, [ck]: nv })} />
          </div>
        ))}
      </div>
    );

  let control;
  if (k === "status")
    control = (
      <select className={input} value={v} onChange={(e) => set(e.target.value)}>
        <option value="upcoming">Upcoming — menunggu event (countdown)</option>
        <option value="completed">Completed — event selesai (recap)</option>
      </select>
    );
  else if (DATE_KEYS.includes(k)) control = <input type="datetime-local" className={input} value={v} onChange={(e) => set(e.target.value)} />;
  else if (/(image|logo)$/i.test(k)) control = <ImageField value={v} onChange={set} />;
  else if (LONG_KEYS.includes(k)) control = <textarea rows={3} className={input} value={v} onChange={(e) => set(e.target.value)} />;
  else control = <input type={/url$/i.test(k) ? "url" : "text"} className={input} value={v} onChange={(e) => set(e.target.value)} />;

  return (
    <label className="block text-xs font-semibold text-muted">
      {label}
      <div className="mt-1 text-ink">{control}</div>
    </label>
  );
}

// Sidebar groups over the siteConfig keys. Keys not listed here land in "Lainnya" so new fields never go missing.
const GROUPS: { id: string; label: string; icon: LucideIcon; keys: string[] }[] = [
  { id: "banner", label: "Banner Carousel", icon: GalleryHorizontal, keys: ["banners"] },
  { id: "event", label: "Event & Hero", icon: Flag, keys: ["event"] },
  { id: "recap", label: "Mode Recap", icon: PartyPopper, keys: ["recap", "closing"] },
  { id: "about", label: "Tentang & Kategori", icon: Info, keys: ["about", "categories"] },
  { id: "venue", label: "Venue", icon: MapPin, keys: ["venue"] },
  { id: "merch", label: "Jersey & Medali", icon: Shirt, keys: ["merch", "merchItems"] },
  { id: "racepack", label: "Racepack", icon: Package, keys: ["racepack", "racepackItems"] },
  { id: "racepackVenue", label: "Racepack Collection", icon: MapPinned, keys: ["racepackVenue"] },
  { id: "community", label: "Komunitas", icon: Users, keys: ["community", "communities"] },
  { id: "partnership", label: "Kerjasama", icon: BriefcaseBusiness, keys: ["sponsorship", "sponsorshipBenefits", "mediaPartner", "mediaPartnerBenefits"] },
  { id: "achievements", label: "Pencapaian", icon: Trophy, keys: ["achievements"] },
  { id: "video", label: "Video Highlight", icon: Clapperboard, keys: ["video"] },
  { id: "instagram", label: "Instagram", icon: Camera, keys: ["instagram", "instagramPosts"] },
  { id: "festival", label: "Festival", icon: Tent, keys: ["festival", "festivalItems"] },
  { id: "ticker", label: "Ticker", icon: Type, keys: ["ticker"] },
  { id: "cta", label: "Tombol Daftar", icon: MousePointerClick, keys: ["cta"] },
  { id: "contact", label: "Kontak & Sosmed", icon: Phone, keys: ["contact"] },
];

function ConfigTab({ initial, keys, hidden }: { initial: SiteConfig; keys: string[]; hidden: boolean }) {
  const [cfg, setCfg] = useState(initial as unknown as Record<string, Val>);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    setMsg("");
    try {
      // Show what the server kept (e.g. invalid links are dropped by the sanitizer).
      setCfg((await api("/api/admin/config", "PUT", cfg)).config);
      setMsg("Tersimpan ✓ — situs publik sudah diperbarui");
    } catch (e) {
      setMsg((e as Error).message);
    }
    setBusy(false);
  }

  return (
    // Stays mounted (just hidden) while other menus are open, so unsaved edits survive switching.
    <div className="space-y-6 pb-24" hidden={hidden}>
      {keys.map((k) => (
        <section key={k} className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-bold">{LABELS[k] ?? k}</h2>
          <Field k={typeof cfg[k] === "string" ? "" : k} v={cfg[k]} set={(nv) => setCfg({ ...cfg, [k]: nv })} />
        </section>
      ))}
      <div className="fixed inset-x-0 bottom-0 border-t border-line bg-white/95 p-4 backdrop-blur lg:left-64">
        <div className="mx-auto flex max-w-4xl items-center justify-end gap-4">
          <span className="text-sm text-muted">{msg}</span>
          <button onClick={save} disabled={busy} className={`${btn} bg-brand px-8 py-3 text-white`}>
            {busy ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </div>
    </div>
  );
}

const EMPTY_SPONSOR = { _id: "", name: "", logo: "", tier: "official", websiteUrl: "" };

const arrowBtn = "rounded p-0.5 hover:bg-surface disabled:opacity-25";

function TierOrder({ tiers, sponsors }: { tiers: Tier[]; sponsors: Sponsor[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function move(i: number, dir: -1 | 1) {
    const keys = tiers.map(([k]) => k);
    [keys[i], keys[i + dir]] = [keys[i + dir], keys[i]];
    setBusy(true);
    await api("/api/admin/sponsor-tiers", "PUT", { tiers: keys }).catch((e) => alert(e.message));
    router.refresh();
    setBusy(false);
  }
  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm">
      <h2 className="font-bold">Urutan Kategori</h2>
      <p className="mb-4 text-sm text-muted">Urutan kategori sponsor di website. Dua kategori teratas tampil dengan logo paling besar; kategori tanpa sponsor tidak ditampilkan.</p>
      <ol className="space-y-1.5">
        {tiers.map(([key, label], i) => {
          const count = sponsors.filter((s) => s.tier === key).length;
          return (
            <li key={key} className="flex items-center gap-3 rounded-xl border border-line px-3 py-2">
              <span className="w-6 text-center text-sm font-bold text-muted">{i + 1}</span>
              <span className="flex">
                <button disabled={busy || i === 0} onClick={() => move(i, -1)} aria-label={`Naikkan kategori ${label}`} className={arrowBtn}>
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button disabled={busy || i === tiers.length - 1} onClick={() => move(i, 1)} aria-label={`Turunkan kategori ${label}`} className={arrowBtn}>
                  <ArrowDown className="h-4 w-4" />
                </button>
              </span>
              <span className={`flex-1 text-sm font-semibold ${count ? "" : "text-muted"}`}>{label}</span>
              <span className="text-xs text-muted">{count ? `${count} sponsor` : "kosong"}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function SponsorTab({ sponsors, tiers }: { sponsors: Sponsor[]; tiers: Tier[] }) {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY_SPONSOR);
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.logo) return alert("Upload logo dulu");
    setBusy(true);
    try {
      await api("/api/admin/items/sponsors", "POST", { ...form, _id: form._id || undefined });
      setForm(EMPTY_SPONSOR);
      router.refresh();
    } catch (err) {
      alert((err as Error).message);
    }
    setBusy(false);
  }

  async function remove(s: Sponsor) {
    if (!confirm(`Hapus sponsor ${s.name}?`)) return;
    await api(`/api/admin/items/sponsors?id=${s._id}`, "DELETE").catch((e) => alert(e.message));
    router.refresh();
  }

  // Optimistic order shown right after a drop/arrow click. Tied to the `sponsors` prop it was
  // made from, so it's ignored automatically once router.refresh() delivers fresh data.
  const [pending, setPending] = useState<{ base: Sponsor[]; tier: string; ids: string[] } | null>(null);
  const [drag, setDrag] = useState<{ tier: string; from: number; over: number } | null>(null);

  const listFor = (tier: string) => {
    const list = sponsors.filter((s) => s.tier === tier);
    if (pending?.base !== sponsors || pending.tier !== tier) return list;
    return pending.ids.map((id) => list.find((s) => s._id === id)!).filter(Boolean);
  };

  // Move item `from` → position `to` within its tier, then save the tier's full order.
  async function reorder(tier: string, list: Sponsor[], from: number, to: number) {
    if (from === to) return;
    const ids = list.map((s) => s._id);
    ids.splice(to, 0, ...ids.splice(from, 1));
    setPending({ base: sponsors, tier, ids });
    setBusy(true);
    await api("/api/admin/items/sponsors", "PATCH", { ids }).catch((e) => {
      alert(e.message);
      setPending(null);
    });
    router.refresh();
    setBusy(false);
  }

  return (
    <div className="space-y-6">
      <form onSubmit={save} className="grid gap-4 rounded-3xl bg-white p-6 shadow-sm sm:grid-cols-2">
        <h2 className="font-bold sm:col-span-2">{form._id ? "Edit sponsor" : "Tambah sponsor"}</h2>
        <label className="text-xs font-semibold text-muted">
          Nama
          <input required className={`${input} mt-1`} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </label>
        <label className="text-xs font-semibold text-muted">
          Tier
          <select className={`${input} mt-1`} value={form.tier} onChange={(e) => setForm({ ...form, tier: e.target.value })}>
            {tiers.map(([t, l]) => <option key={t} value={t}>{l}</option>)}
          </select>
        </label>
        <label className="text-xs font-semibold text-muted">
          Website (opsional)
          <input type="url" className={`${input} mt-1`} value={form.websiteUrl} onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })} />
        </label>
        <div className="text-xs font-semibold text-muted">
          Logo
          <div className="mt-1"><ImageField value={form.logo} onChange={(logo) => setForm({ ...form, logo })} /></div>
        </div>
        <div className="flex gap-2 sm:col-span-2">
          <button disabled={busy} className={`${btn} bg-brand text-white`}>{form._id ? "Simpan" : "Tambah"}</button>
          {form._id && <button type="button" onClick={() => setForm(EMPTY_SPONSOR)} className={`${btn} border border-line`}>Batal</button>}
        </div>
      </form>

      <TierOrder tiers={tiers} sponsors={sponsors} />

      {tiers.map(([tier, label]) => {
        const list = listFor(tier);
        if (!list.length) return null;
        return (
          <section key={tier} className="rounded-3xl bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-muted">
              {label} <span className="font-normal normal-case tracking-normal">— seret untuk mengurutkan (atau pakai ↑ ↓)</span>
            </h3>
            <ol className="space-y-2">
              {list.map((s, i) => {
                const dragging = drag?.tier === tier && drag.from === i;
                const target = drag?.tier === tier && drag.over === i && drag.from !== i;
                return (
                <li
                  key={s._id}
                  // Native HTML5 drag & drop (desktop). Only reorders within the same tier.
                  draggable={!busy}
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "move";
                    setDrag({ tier, from: i, over: i });
                  }}
                  onDragOver={(e) => {
                    if (drag?.tier !== tier) return;
                    e.preventDefault();
                    if (drag.over !== i) setDrag({ ...drag, over: i });
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (drag?.tier === tier) reorder(tier, list, drag.from, i);
                    setDrag(null);
                  }}
                  onDragEnd={() => setDrag(null)}
                  className={`flex items-center gap-3 rounded-2xl border bg-white p-3 transition ${
                    dragging ? "opacity-40" : ""
                  } ${target ? (drag!.from < i ? "border-line border-b-4 border-b-brand-red" : "border-line border-t-4 border-t-brand-red") : "border-line"}`}
                >
                  <GripVertical className="h-5 w-5 shrink-0 cursor-grab text-muted active:cursor-grabbing" aria-hidden />
                  <span className="w-6 text-center text-sm font-bold text-muted">{i + 1}</span>
                  <span className="flex flex-col">
                    <button disabled={busy || i === 0} onClick={() => reorder(tier, list, i, i - 1)} aria-label={`Naikkan ${s.name}`} className={arrowBtn}>
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button disabled={busy || i === list.length - 1} onClick={() => reorder(tier, list, i, i + 1)} aria-label={`Turunkan ${s.name}`} className={arrowBtn}>
                      <ArrowDown className="h-4 w-4" />
                    </button>
                  </span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.logo} alt="" draggable={false} className="h-12 w-20 object-contain" />
                  <span className="flex-1 font-semibold">{s.name}</span>
                  <button onClick={() => setForm({ ...EMPTY_SPONSOR, ...s })} className="text-sm font-semibold">Edit</button>
                  <button onClick={() => remove(s)} className="text-sm font-semibold text-brand-red">Hapus</button>
                </li>
                );
              })}
            </ol>
          </section>
        );
      })}
      {!sponsors.length && <p className="text-center text-muted">Belum ada sponsor.</p>}
    </div>
  );
}

function GalleryTab({ gallery }: { gallery: Photo[] }) {
  const router = useRouter();
  const [status, setStatus] = useState("");

  async function add(files: FileList) {
    const list = [...files];
    for (const [i, f] of list.entries()) {
      setStatus(`Mengunggah ${i + 1}/${list.length}...`);
      try {
        const { url, publicId } = await uploadFile(f);
        await api("/api/admin/items/gallery", "POST", { image: url, publicId, caption: "" });
      } catch (e) {
        alert((e as Error).message);
      }
    }
    setStatus("");
    router.refresh();
  }

  async function remove(p: Photo) {
    if (!confirm("Hapus foto ini?")) return;
    await api(`/api/admin/items/gallery?id=${p._id}`, "DELETE").catch((e) => alert(e.message));
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <label className="flex cursor-pointer flex-col items-center rounded-3xl border-2 border-dashed border-line bg-white p-10 text-center">
        <span className="font-bold">{status || "Klik untuk upload foto (bisa banyak sekaligus)"}</span>
        <span className="mt-1 text-sm text-muted">JPG/PNG/WEBP — foto besar otomatis dikompres ke WebP sebelum diupload</span>
        <input type="file" accept="image/*" multiple hidden disabled={!!status} onChange={(e) => e.target.files && add(e.target.files)} />
      </label>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {gallery.map((p) => (
          <li key={p._id} className="group relative aspect-square overflow-hidden rounded-2xl bg-line">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.image} alt="" className="h-full w-full object-cover" loading="lazy" />
            <button onClick={() => remove(p)} className="absolute top-2 right-2 rounded-full bg-white px-3 py-1 text-xs font-bold text-brand-red shadow">
              Hapus
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

const DATA_MENUS = [
  { id: "sponsor", label: "Sponsor", icon: Handshake },
  { id: "galeri", label: "Galeri", icon: ImageIcon },
];

export default function Dashboard({ email, config, sponsors, gallery, tiers }: { email: string; config: SiteConfig; sponsors: Sponsor[]; gallery: Photo[]; tiers: Tier[] }) {
  const covered = new Set(GROUPS.flatMap((g) => g.keys));
  const extra = Object.keys(config).filter((k) => !covered.has(k));
  const groups = extra.length ? [...GROUPS, { id: "lainnya", label: "Lainnya", icon: Ellipsis, keys: extra }] : GROUPS;
  const [active, setActive] = useState(groups[0].id);
  const group = groups.find((g) => g.id === active);
  const title = group?.label ?? DATA_MENUS.find((m) => m.id === active)?.label;

  const item = (id: string, label: string, Icon: LucideIcon) => (
    <button
      key={id}
      onClick={() => {
        setActive(id);
        scrollTo({ top: 0 });
      }}
      aria-current={active === id ? "page" : undefined}
      className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-semibold whitespace-nowrap transition ${
        active === id ? "bg-brand text-white shadow" : "text-muted hover:bg-surface hover:text-ink"
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </button>
  );
  const heading = "hidden px-3 pt-4 pb-1 text-[11px] font-bold uppercase tracking-widest text-muted lg:block";

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-20 border-b border-line bg-white">
        <div className="flex h-16 items-center gap-4 px-5">
          <p className="flex items-center gap-2"><Logo className="h-9 w-auto" /> <span className="text-xs text-muted">admin</span></p>
          <div className="ml-auto flex items-center gap-3 text-sm">
            <a href="/" target="_blank" className="inline-flex items-center gap-1 font-semibold text-brand-red">Lihat situs <ExternalLink className="h-4 w-4" /></a>
            <span className="hidden text-muted sm:inline">{email}</span>
            <button
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                location.assign("/admin/login");
              }}
              className={`${btn} border border-line`}
            >
              Keluar
            </button>
          </div>
        </div>
      </header>
      <div className="lg:flex">
        {/* Desktop: fixed-height sidebar; mobile: horizontally scrolling menu bar */}
        <aside className="sticky top-16 z-10 border-b border-line bg-white lg:h-[calc(100vh-4rem)] lg:w-64 lg:shrink-0 lg:overflow-y-auto lg:border-r lg:border-b-0">
          <nav className="flex gap-1 overflow-x-auto p-3 [scrollbar-width:none] lg:flex-col [&::-webkit-scrollbar]:hidden" aria-label="Menu admin">
            <p className={heading}>Konten Website</p>
            {groups.map((g) => item(g.id, g.label, g.icon))}
            <p className={heading}>Data</p>
            {DATA_MENUS.map((m) => item(m.id, m.label, m.icon))}
          </nav>
        </aside>
        <main className="min-w-0 flex-1 px-5 py-8">
          <div className="mx-auto max-w-4xl">
            <h1 className="mb-6 font-display text-3xl uppercase">{title}</h1>
            <ConfigTab initial={config} keys={group?.keys ?? []} hidden={!group} />
            {active === "sponsor" && <SponsorTab sponsors={sponsors} tiers={tiers} />}
            {active === "galeri" && <GalleryTab gallery={gallery} />}
          </div>
        </main>
      </div>
    </div>
  );
}
