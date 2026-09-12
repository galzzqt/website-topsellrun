// Shared (client + server) content schema. DEFAULT_CONFIG doubles as the shape used to sanitize
// CMS input: every leaf is a string, arrays get their item shape from ITEM_TEMPLATES.

export const DEFAULT_CONFIG = {
  banners: [] as { image: string; title: string; linkUrl: string }[], // top carousel; hidden when empty
  event: {
    name: "TopsellRun 2026",
    logo: "", // event/co-brand logo shown in the Upcoming Event section, e.g. Topsell × Samsung
    titleLogo: "", // landscape event logo (e.g. Run for Changes) under the co-brand logo; text title is the fallback
    title: "", // text headline / alt text for titleLogo; falls back to name
    edition: "2026", // edition key — sponsors/gallery (and later BIB results) reference it
    status: "upcoming", // upcoming | completed
    date: "2026-11-15T05:00", // WIB, datetime-local format
    countdownTarget: "2026-11-15T05:00",
    tagline: "Lari bareng, rayakan semangat. Satu garis start untuk semua pelari Topsell.",
    heroImage: "",
  },
  recap: {
    title: "Terima kasih, Pelari!",
    text: "TopsellRun telah selesai digelar. Terima kasih untuk setiap langkah, sorakan, dan semangat yang kalian bawa ke garis finish.",
    nextEventDate: "",
  },
  about: {
    title: "Tentang TopsellRun",
    text: "TopsellRun adalah event lari tahunan dari Topsell untuk pelari pemula hingga yang sudah terbiasa di jalanan. Pilih kategorimu, ajak teman, dan jadikan race day sebagai pesta olahraga bersama.",
  },
  categories: [
    { name: "5K", desc: "Rute ramah pemula — cocok untuk fun run bersama teman dan keluarga." },
    { name: "10K", desc: "Tantang dirimu di rute yang lebih panjang dan kejar personal best." },
  ],
  venue: {
    name: "Venue diumumkan segera",
    address: "Lokasi race akan diumumkan melalui website dan Instagram resmi TopsellRun.",
    mapsUrl: "",
    image: "",
  },
  merch: {
    title: "Jersey & Medali",
    text: "Setiap peserta mendapat jersey resmi, dan setiap finisher membawa pulang medali eksklusif TopsellRun.",
  },
  merchItems: [
    { image: "", caption: "Jersey Resmi" },
    { image: "", caption: "Medali Finisher" },
  ],
  // --- sub-pages under the "Tentang Event" menu ---
  racepack: {
    title: "Racepack",
    text: "Setiap peserta TopsellRun mendapatkan racepack berisi perlengkapan resmi untuk race day.",
  },
  racepackItems: [
    { image: "", caption: "Jersey Resmi" },
    { image: "", caption: "Nomor BIB" },
    { image: "", caption: "Goodie Bag Sponsor" },
  ],
  racepackVenue: {
    name: "Lokasi pengambilan racepack diumumkan segera",
    address: "",
    schedule: "Jadwal pengambilan racepack akan diumumkan melalui website dan Instagram resmi TopsellRun.",
    text: "Bawa bukti pendaftaran dan kartu identitas saat mengambil racepack.",
    mapsUrl: "",
    image: "",
  },
  community: {
    title: "Komunitas",
    text: "TopsellRun tumbuh bersama komunitas lari. Terima kasih untuk setiap komunitas yang ikut meramaikan setiap langkah.",
    joinUrl: "",
  },
  communities: [] as { name: string; logo: string; websiteUrl: string }[],
  sponsorship: {
    title: "Sponsorship",
    text: "Tampilkan brand Anda di depan ribuan pelari dan pengunjung TopsellRun. Paket sponsorship bisa disesuaikan dengan kebutuhan brand.",
  },
  sponsorshipBenefits: [
    { title: "Eksposur Brand", desc: "Logo di jersey, backdrop, media sosial, dan website resmi TopsellRun." },
    { title: "Booth di Race Village", desc: "Area aktivasi brand untuk menjangkau peserta secara langsung." },
    { title: "Konten Kolaborasi", desc: "Publikasi bersama melalui kanal media sosial TopsellRun." },
  ],
  mediaPartner: {
    title: "Media Partner",
    text: "Kami membuka kerja sama dengan media, komunitas konten, dan kreator untuk menyebarkan semangat TopsellRun.",
  },
  mediaPartnerBenefits: [
    { title: "Akses Liputan", desc: "Akses area media dan informasi resmi seputar event." },
    { title: "Logo Media Partner", desc: "Logo tampil di materi publikasi dan website resmi." },
  ],
  achievements: [] as { value: string; label: string }[],
  video: { title: "Highlight Race Day", youtubeUrl: "" },
  instagram: { title: "Keseruan di Instagram", text: "Ikuti momen seru TopsellRun dan update terbaru langsung dari Instagram kami." },
  instagramPosts: [] as { url: string }[], // manual post/reel links (PRD §6: no IG API in v1)
  festival: { title: "Festival & Expo", text: "" },
  festivalItems: [] as { title: string; text: string; image: string }[],
  ticker: "Ayo Gabung TopsellRun 2026 • Save the Date • Run Together, Celebrate Together",
  closing: {
    title: "See you next run!",
    text: "Sampai jumpa di garis start berikutnya. Pantau terus info TopsellRun edisi selanjutnya.",
  },
  cta: { label: "Daftar Sekarang", registerUrl: "" },
  contact: {
    whatsapp: "6282119227871", // digits incl. country code, e.g. 6281234567890
    whatsappText: "Saya mau tanya seputar topsellrun 2026",
    email: "",
    instagramUrl: "https://www.instagram.com/topsellrun/",
    tiktokUrl: "",
    youtubeUrl: "",
    presentedBy: "Topsell",
  },
};

export type SiteConfig = typeof DEFAULT_CONFIG;

export const ITEM_TEMPLATES:Record<string, Record<string, string>> = {
  banners: { image: "", title: "", linkUrl: "" },
  categories: { name: "", desc: "" },
  merchItems: { image: "", caption: "" },
  achievements: { value: "", label: "" },
  festivalItems: { title: "", text: "", image: "" },
  instagramPosts: { url: "" },
  racepackItems: { image: "", caption: "" },
  communities: { name: "", logo: "", websiteUrl: "" },
  sponsorshipBenefits: { title: "", desc: "" },
  mediaPartnerBenefits: { title: "", desc: "" },
};

// instagram.com/p|reel|tv/CODE (optionally /username/ before it) → canonical permalink.
// Rebuilt from [\w-] captures only, so it's safe to drop into embed HTML.
const IG_POST = /^https:\/\/(?:www\.)?instagram\.com\/(?:[\w.]+\/)?(p|reel|tv)\/([\w-]+)/i;
export const instagramPermalink = (url: string) => {
  const m = url.match(IG_POST);
  return m ? `https://www.instagram.com/${m[1].toLowerCase()}/${m[2]}/` : "";
};

export const SPONSOR_TIERS = [
  ["presented", "Presented by"],
  ["main", "Main Sponsor"],
  ["official", "Official Sponsor"],
  ["supported", "Supported by"],
  ["media", "Official Media"],
  ["hospital", "Official Hospital"],
  ["race", "Official Race Partner"],
  ["jersey", "Official Jersey Partner"],
] as const;

export type Tier = (typeof SPONSOR_TIERS)[number];

// Admin-saved tier order (keys) → full tier list: unknown/duplicate keys dropped, tiers missing
// from the saved order (e.g. newly added ones) appended in their default position.
export function orderTiers(saved: unknown): Tier[] {
  const keys = Array.isArray(saved) ? saved : [];
  const picked = [...new Set(keys.map((k) => SPONSOR_TIERS.find(([t]) => t === k)).filter((t): t is Tier => !!t))];
  return [...picked, ...SPONSOR_TIERS.filter((t) => !picked.includes(t))];
}

export const ITEM_SHAPES = {
  sponsors: { name: "", logo: "", tier: "official", websiteUrl: "" },
  gallery: { image: "", publicId: "", caption: "" },
};

const URL_KEY = /(url|image|logo)$/i;

// Keeps only known keys, strings only, and http(s)/path-only values for URL-ish keys (blocks javascript: hrefs).
// Missing leaves fall back to `shape`'s value at top level, "" inside array items.
export function clean<T>(shape: T, input: unknown, key = "", inArray = false): T {
  if (Array.isArray(shape)) {
    const tpl = ITEM_TEMPLATES[key];
    return (Array.isArray(input) ? input.slice(0, 100).map((x) => clean(tpl, x, "", true)) : shape) as T;
  }
  if (shape && typeof shape === "object") {
    const src = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(shape)) out[k] = clean((shape as Record<string, unknown>)[k], src[k], k, inArray);
    return out as T;
  }
  if (typeof input !== "string") return (inArray ? "" : shape) as T;
  const v = input.trim().slice(0, 5000);
  // http(s) or a same-site path like /images/x.webp ("//host" is protocol-relative, so rejected)
  if (URL_KEY.test(key) && v && !/^(https?:\/\/|\/(?!\/))/i.test(v)) return "" as T;
  return v as T;
}

export function cleanConfig(input: unknown): SiteConfig {
  const c = clean(DEFAULT_CONFIG, input);
  if (c.event.status !== "completed") c.event.status = "upcoming";
  c.contact.whatsapp = c.contact.whatsapp.replace(/\D/g, "").replace(/^0/, "62");
  c.instagramPosts = c.instagramPosts.map((p) => ({ url: instagramPermalink(p.url) })).filter((p) => p.url);
  return c;
}

// WhatsApp's official send link; `phone` is digits-only (see cleanConfig).
export const waUrl = (phone: string, text?: string) =>
  `https://api.whatsapp.com/send/?phone=${phone}${text ? `&text=${encodeURIComponent(text)}` : ""}`;

// datetime-local strings are entered and shown as WIB.
export const wibDate = (v: string) => (v ? new Date(`${v}:00+07:00`) : null);

export const formatWib = (v: string) => {
  const d = wibDate(v);
  if (!d || isNaN(+d)) return "";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "full", timeZone: "Asia/Jakarta" }).format(d);
};

export const youtubeId = (url: string) =>
  url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/|live\/)([\w-]{11})/)?.[1] ?? "";
