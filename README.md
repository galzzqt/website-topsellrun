# TopsellRun

Website event TopsellRun (Next.js 16 App Router + Tailwind v4 + Framer Motion + MongoDB + Cloudinary) dengan panel admin CMS di `/admin`.

## Setup

```bash
cp .env.example .env.local   # isi MONGODB_URI, SESSION_SECRET, CLOUDINARY_*
npm install
npm run db                   # MongoDB lokal untuk development (terminal terpisah, biarkan jalan)
                             # → MONGODB_URI=mongodb://127.0.0.1:27018, data di .data/mongo
node --env-file=.env.local scripts/create-admin.mjs admin@topsell.id "password-min-10-karakter"
node --env-file=.env.local scripts/seed-sponsors.mjs   # sponsor awal (logo di public/images/sponsors)
npm run dev
```

Situs publik: `http://localhost:3000` · Admin: `http://localhost:3000/admin`

## Cara kerja

- Semua konten (status event, hero, venue, jersey/medali, video, festival, ticker, CTA daftar, kontak) disimpan di satu dokumen `siteConfig` dan diedit di tab **Event & Konten**. Default awal ada di `src/lib/content.ts`.
- **Status `upcoming`** → hero countdown + tombol daftar. **Status `completed`** → hero recap + banner "See you next run"; tombol daftar berubah jadi "Lihat Next Event" hanya jika tanggal event berikutnya diisi.
- Sponsor & galeri: koleksi `sponsors` / `gallery`, gambar di-upload ke Cloudinary (maks 5MB, tipe gambar saja). Tiap item ditandai `edition` agar bisa difilter per tahun / disambung ke sistem BIB nanti.
- Setiap simpan dari admin memanggil `revalidatePath("/")` → situs publik langsung ter-update tanpa deploy.
- Auth: satu role admin, session token bertanda tangan HMAC di cookie httpOnly; dicek di `src/proxy.ts` **dan** di setiap route handler admin.
- Section Instagram memakai embed resmi Instagram (`embed.js`, tanpa token/API). Admin cukup menempel link post/reel; link non-Instagram otomatis dibuang saat simpan.
- Cek sanitizer konten: `node --test scripts/check-content.mjs`
- Klik "Daftar Sekarang" mendorong event `cta_daftar_click` ke `window.dataLayer` (siap dipakai GTM/GA4).

## Deploy (Dokploy)

Pakai `Dockerfile` (output `standalone`). Set env yang sama dengan `.env.example`. Buat admin di container:
`node scripts/create-admin.mjs <email> <password>`.
