import { ArrowUpRight, CalendarClock, CalendarDays, ChevronDown, ChevronRight, MapPin, Menu, Sparkle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Countdown, CtaButton, GalleryGrid, InstagramEmbeds, Reveal } from "@/components/client";
import Logo from "@/components/Logo";
import { formatWib, waUrl, youtubeId, type SiteConfig, type Tier } from "@/lib/content";
import type { Photo, Sponsor } from "@/lib/db";

type C = { c: SiteConfig };

const btn = "inline-flex items-center justify-center rounded-full px-7 py-3.5 text-sm font-bold uppercase tracking-wide transition";
const btnBrand = `${btn} bg-brand text-white shadow-lg shadow-brand-red/25 hover:-translate-y-0.5 hover:shadow-xl`;
const btnGhost = `${btn} border-2 border-ink/10 bg-white text-ink hover:border-brand-red hover:text-brand-red`;

// Recap mode hides the register CTA unless a next event date is set (PRD US-2).
export function ctaFor(c: SiteConfig) {
  if (c.event.status === "upcoming") return { label: c.cta.label, href: c.cta.registerUrl };
  if (c.recap.nextEventDate) return { label: "Lihat Next Event", href: c.cta.registerUrl };
  return null;
}

function Heading({ eyebrow, title, center, light }: { eyebrow: string; title: string; center?: boolean; light?: boolean }) {
  return (
    <Reveal className={center ? "text-center" : ""}>
      <p className={`text-xs font-bold uppercase tracking-[0.25em] ${light ? "text-white/80" : "text-brand-red"}`}>{eyebrow}</p>
      <h2 className={`mt-3 font-display text-4xl uppercase leading-none sm:text-6xl ${light ? "text-white" : ""}`}>{title}</h2>
    </Reveal>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl sm:rounded-3xl border-2 border-dashed border-line bg-white px-6 py-14 text-center text-muted">{children}</div>
  );
}

function Placeholder({ label }: { label: React.ReactNode }) {
  return (
    <div className="bg-brand relative flex h-full w-full items-center justify-center overflow-hidden">
      <span className="absolute right-3 bottom-0 font-display text-[7rem] leading-[0.8] text-white/15">RUN</span>
      <span className="relative inline-flex items-center gap-2 font-display text-2xl uppercase tracking-wide text-white">{label}</span>
    </div>
  );
}

const Wrap = ({ id, className = "", children }: { id?: string; className?: string; children: React.ReactNode }) => (
  <section id={id} className={`px-5 py-20 sm:py-28 ${className}`}>
    <div className="mx-auto max-w-6xl">{children}</div>
  </section>
);

type Link2 = { label: string; href: string };
type MenuItem = { label: string; href?: string; children?: Link2[] };
// Top-level navbar.
export const NAV_MENU: MenuItem[] = [
  { label: "Home", href: "/" },
  {
    label: "Tentang Event",
    children: [
      { label: "Race Category", href: "/race-category" },
      { label: "Medal, Jersey & Racepack", href: "/medal-jersey-racepack" },
      { label: "Racepack", href: "/racepack" },
      { label: "Racepack Collection Venue", href: "/racepack-collection" },
      { label: "Komunitas", href: "/komunitas" },
    ],
  },
  {
    label: "Kerjasama",
    children: [
      { label: "Sponsorship", href: "/kerjasama/sponsorship" },
      { label: "Media Partner", href: "/kerjasama/media-partner" },
    ],
  },
  { label: "Gallery", href: "/galeri" },
];

function HomeLogo({ className, priority }: { className?: string; priority?: boolean }) {
  return (
    <Link href="/" className="shrink-0">
      <Logo className={className} priority={priority} />
    </Link>
  );
}

const dropItem = (active: boolean) =>
  `block rounded-xl px-4 py-2.5 text-sm font-semibold transition ${active ? "bg-brand-red/10 text-brand-red" : "text-ink hover:bg-brand-red/5 hover:text-brand-red"}`;

// Desktop dropdown opens on hover and on keyboard focus (focus-within) — CSS only, no JS.
function Dropdown({ label, items, path }: { label: string; items: Link2[]; path: string }) {
  const active = items.some((i) => i.href === path);
  return (
    <li className="group/menu relative">
      <button type="button" className={`flex items-center gap-1 font-semibold hover:text-brand-red group-focus-within/menu:text-brand-red ${active ? "text-brand-red" : "text-muted"}`}>
        {label} <ChevronDown className="h-4 w-4 transition group-hover/menu:rotate-180" />
      </button>
      <div className="invisible absolute top-full left-0 pt-4 opacity-0 transition group-hover/menu:visible group-hover/menu:opacity-100 group-focus-within/menu:visible group-focus-within/menu:opacity-100">
        <ul className="w-64 rounded-2xl border border-line bg-[#fff6f0] p-2 shadow-xl">
          {items.map((i) => (
            <li key={i.href}>
              <Link href={i.href} className={dropItem(i.href === path)}>{i.label}</Link>
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}

export function Navbar({ c, path = "/" }: C & { path?: string }) {
  const cta = ctaFor(c);
  const mobileLink = (href: string, label: string, indent = false) => (
    <li key={href}>
      <Link href={href} className={`block rounded-xl py-2.5 text-sm font-semibold hover:bg-surface ${indent ? "pr-4 pl-8 text-muted" : "px-4"} ${href === path ? "text-brand-red" : ""}`}>
        {label}
      </Link>
    </li>
  );
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur">
      <nav className="mx-auto flex h-20 max-w-6xl items-center justify-between gap-4 px-5">
        <HomeLogo className="h-12 w-auto sm:h-16" priority />
        <ul className="hidden items-center gap-7 text-sm font-semibold text-muted lg:flex">
          {NAV_MENU.map((m) =>
            m.children ? (
              <Dropdown key={m.label} label={m.label} items={m.children} path={path} />
            ) : (
              <li key={m.href}>
                <Link href={m.href!} className={`hover:text-brand-red ${m.href === path ? "text-brand-red" : ""}`}>{m.label}</Link>
              </li>
            ),
          )}
        </ul>
        <div className="flex items-center gap-2">
          {cta && <CtaButton source="navbar" href={cta.href} label={cta.label} className={`${btnBrand} !px-5 !py-2.5 !text-xs`} />}
          {/* Native <details> = mobile menu without JS */}
          <details className="group relative lg:hidden">
            <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-full border border-line" aria-label="Menu">
              <Menu className="h-5 w-5" />
            </summary>
            <ul className="absolute right-0 mt-2 max-h-[75vh] w-64 overflow-y-auto rounded-2xl border border-line bg-white p-2 shadow-xl">
              {NAV_MENU.flatMap((m) =>
                m.children
                  ? [
                      <li key={m.label} className="px-4 pt-3 pb-1 text-[11px] font-bold uppercase tracking-widest text-muted">{m.label}</li>,
                      ...m.children.map((ch) => mobileLink(ch.href, ch.label, true)),
                    ]
                  : [mobileLink(m.href!, m.label)],
              )}
            </ul>
          </details>
        </div>
      </nav>
    </header>
  );
}

export function Hero({ c }: C) {
  const upcoming = c.event.status === "upcoming";
  const cta = ctaFor(c);
  return (
    <section id="event" className="relative overflow-hidden px-5 pt-12 pb-20 sm:pt-20">
      {/* decorative color blocks */}
      <div className="bg-brand absolute -top-40 -right-40 h-[32rem] w-[32rem] rounded-full opacity-10 blur-3xl" />
      <div className="bg-brand absolute top-1/2 -left-24 h-72 w-72 rounded-full opacity-10 blur-3xl" />

      {upcoming && (
        // Upcoming: title → 5:1 banner → description + categories → date/countdown → buttons
        <div className="relative mx-auto mb-10 max-w-6xl">
          <h2 className="font-display text-6xl uppercase leading-[0.9] sm:text-8xl">Upcoming Event</h2>
          <h1 className="sr-only">{c.event.title || c.event.name}</h1>
          <div className="relative mt-8 aspect-[5/1] overflow-hidden rounded-[1.25rem] sm:rounded-[2rem] bg-surface shadow-2xl">
            {c.event.heroImage ? (
              <Image src={c.event.heroImage} alt={c.event.title || c.event.name} fill priority={!c.banners.length} sizes="(min-width:1152px) 72rem, 100vw" className="object-cover" />
            ) : (
              <Placeholder label={`#${c.event.name.replace(/\s+/g, "")}`} />
            )}
          </div>
        </div>
      )}
      <div className={`relative mx-auto grid max-w-6xl items-center gap-12 ${upcoming ? "" : "lg:grid-cols-[1.1fr_1fr]"}`}>
        <div>
          {upcoming ? (
            <>
              {c.event.tagline && <p className="mx-auto max-w-3xl text-center text-lg whitespace-pre-line text-muted">{c.event.tagline}</p>}
              {c.categories.length > 0 && (
                <ul className="mt-6 flex flex-wrap justify-center gap-3">
                  {c.categories.map((cat, i) => (
                    <li key={cat.name + i} className="rounded-xl sm:rounded-2xl border border-line bg-white px-6 py-3 font-display text-3xl text-brand shadow-sm">{cat.name}</li>
                  ))}
                </ul>
              )}
              {c.event.date && (
                <p className="mt-10 flex items-center justify-center gap-3 text-lg font-bold text-brand-red">
                  <CalendarDays className="h-6 w-6 shrink-0" />
                  {formatWib(c.event.date)}
                </p>
              )}
              {c.event.countdownTarget && (
                <div className="mt-6 flex justify-center">
                  <Countdown target={c.event.countdownTarget} />
                </div>
              )}
            </>
          ) : (
            <>
              <p className="inline-flex items-center gap-2 rounded-full bg-brand-red/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-brand-red">
                <span className="h-2 w-2 rounded-full bg-brand-red" />
                Race Recap {c.event.edition}
              </p>
              <h1 className="mt-5 font-display text-6xl uppercase leading-[0.9] sm:text-8xl">{c.recap.title}</h1>
              <p className="mt-5 max-w-xl text-lg text-muted">{c.recap.text}</p>
              {c.achievements.length > 0 && (
                <dl className="mt-8 flex flex-wrap gap-8">
                  {c.achievements.slice(0, 3).map((a) => (
                    <div key={a.label}>
                      <dt className="font-display text-4xl text-brand">{a.value}</dt>
                      <dd className="text-xs font-semibold uppercase tracking-widest text-muted">{a.label}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {c.recap.nextEventDate && (
                <p className="mt-8 font-bold">
                  Next run: <span className="text-brand-red">{formatWib(c.recap.nextEventDate)}</span>
                </p>
              )}
            </>
          )}

          <div className={`mt-8 flex flex-wrap gap-3 ${upcoming ? "justify-center" : ""}`}>
            {cta && <CtaButton source="hero" href={cta.href} label={cta.label} className={btnBrand} />}
            {upcoming ? (
              <a href={c.venue.mapsUrl || "#venue"} {...(c.venue.mapsUrl && { target: "_blank", rel: "noopener noreferrer" })} className={btnGhost}>
                Lihat Lokasi <MapPin className="ml-1.5 h-4 w-4" />
              </a>
            ) : (
              <a href="#galeri" className={btnGhost}>Lihat Galeri</a>
            )}
          </div>
        </div>

        {!upcoming && (
          <div className="relative">
            <div className="bg-brand absolute inset-0 translate-x-4 translate-y-4 rotate-3 rounded-[1.25rem] sm:rounded-[2rem]" />
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.25rem] sm:rounded-[2rem] bg-surface shadow-2xl">
              {c.event.heroImage ? (
                <Image src={c.event.heroImage} alt={c.event.name} fill priority={!c.banners.length} sizes="(min-width:1024px) 45vw, 100vw" className="object-cover" />
              ) : (
                <Placeholder label={`#${c.event.name.replace(/\s+/g, "")}`} />
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

const CHECK_URL = "https://dorun.id/ticket.html";

const CHECK_STEPS = ["Buka halaman cek tiket", "Masukkan data pendaftaran kamu", "Lihat status kepesertaan kamu"];

// Ticket-stub card: medal stub | perforation | info.
export function CheckRegistration({ c, photo }: C & { photo?: Photo }) {
  const name = c.event.title || c.event.name;
  return (
    <section className="px-5 py-10">
      <Reveal className="mx-auto grid max-w-5xl rounded-[1.25rem] sm:rounded-[2rem] border border-line bg-white shadow-xl md:grid-cols-[18rem_1fr]">
        <div className="relative aspect-square overflow-hidden rounded-t-[1.25rem] sm:rounded-t-[2rem] md:aspect-auto md:rounded-l-[2rem] md:rounded-tr-none">
          <Image src={photo?.image || "/images/medal-square.webp"} alt={photo?.caption || `Peserta ${name}`} fill sizes="(min-width:768px) 18rem, 100vw" className="object-cover" />
        </div>
        <div className="relative border-t-2 border-dashed border-line p-8 sm:p-10 md:border-t-0 md:border-l-2">
          {/* perforation notches */}
          <span className="absolute -top-4 -left-4 hidden h-8 w-8 rounded-full border-b border-line bg-[#fff6f0] md:block" />
          <span className="absolute -bottom-4 -left-4 hidden h-8 w-8 rounded-full border-t border-line bg-[#fff6f0] md:block" />
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-red">Cek Kepesertaan</p>
          <h2 className="mt-3 font-display text-4xl uppercase leading-none sm:text-5xl">Sudah Terdaftar?</h2>
          <p className="mt-4 text-muted">
            Pastikan nama kamu sudah tercatat sebagai peserta <b className="text-ink">{name}</b>.
          </p>
          <ol className="mt-6 space-y-3">
            {CHECK_STEPS.map((s, i) => (
              <li key={s} className="flex items-center gap-3 font-semibold">
                <span className="bg-brand flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs text-white">{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
          <a href={CHECK_URL} target="_blank" rel="noopener noreferrer" className={`${btnGhost} mt-8`}>
            Cek Peserta Terdaftar <ArrowUpRight className="ml-1.5 h-4 w-4" />
          </a>
        </div>
      </Reveal>
    </section>
  );
}

export function Ticker({ c }: C) {
  if (!c.ticker) return null;
  const items = Array.from({ length: 6 }, () => c.ticker);
  return (
    <div className="overflow-hidden py-4" aria-label={c.ticker}>
      <div className="bg-brand -mx-4 -rotate-1 py-4 shadow-lg">
        <div className="marquee flex w-max" aria-hidden>
          {[0, 1].map((k) => (
            <div key={k} className="flex shrink-0">
              {items.map((t, i) => (
                <span key={i} className="px-6 font-display text-2xl uppercase tracking-wide whitespace-nowrap text-white sm:text-3xl">
                  {t} <Sparkle className="ml-6 inline h-6 w-6 fill-current align-[-0.1em]" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function About({ c }: C) {
  return (
    <Wrap id="tentang">
      <div className="grid gap-12 lg:grid-cols-2">
        <div>
          <Heading eyebrow="Tentang Event" title={c.about.title} />
          <Reveal delay={0.1}>
            <p className="mt-6 text-lg leading-relaxed whitespace-pre-line text-muted">{c.about.text}</p>
          </Reveal>
        </div>
        <CategoryGrid c={c} />
      </div>
    </Wrap>
  );
}

function CategoryGrid({ c, cols = "sm:grid-cols-2" }: C & { cols?: string }) {
  return (
    <div className={`grid gap-4 ${cols}`}>
      {c.categories.map((cat, i) => (
        <Reveal key={cat.name + i} delay={i * 0.08}>
          <div className="group h-full rounded-2xl sm:rounded-3xl border border-line bg-white p-7 transition hover:-translate-y-1 hover:border-brand-red hover:shadow-xl">
            <div className="font-display text-6xl text-brand">{cat.name}</div>
            <p className="mt-3 whitespace-pre-line text-muted">{cat.desc}</p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

type Place = { name: string; address: string; mapsUrl: string; image: string };
function LocationCard({ v, placeholder, children }: { v: Place; placeholder: string; children?: React.ReactNode }) {
  return (
    <Reveal delay={0.1}>
      <div className="mt-10 grid overflow-hidden rounded-[1.25rem] sm:rounded-[2rem] bg-white shadow-sm md:grid-cols-2">
        <div className="relative aspect-video md:aspect-auto md:min-h-80">
          {v.image ? <Image src={v.image} alt={v.name} fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover" /> : <Placeholder label={<><MapPin className="h-7 w-7" /> {placeholder}</>} />}
        </div>
        <div className="flex flex-col justify-center p-8 sm:p-12">
          <h3 className="font-display text-3xl uppercase sm:text-4xl">{v.name}</h3>
          {v.address && <p className="mt-4 whitespace-pre-line text-muted">{v.address}</p>}
          {children}
          {v.mapsUrl && (
            <a href={v.mapsUrl} target="_blank" rel="noopener noreferrer" className={`${btnGhost} mt-8 self-start`}>
              Buka di Google Maps <ArrowUpRight className="ml-1.5 h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </Reveal>
  );
}

// Home page: venue + jersey + medal in one section. Images come from admin (2:1 crop),
// with the bundled /public/images banners as fallback until they're uploaded.
const kitBanners = ["/images/jersey-2x1.webp", "/images/medal-2x1.webp"];

export function VenueKit({ c }: C) {
  const v = c.venue;
  return (
    <Wrap id="venue" className="logo-bg bg-surface">
      <IntroHeading eyebrow="Info Venue & Race Kit" title="Venue, Jersey & Medali" text={c.merch.text} />
      <Reveal delay={0.1}>
        <figure className="mt-12 overflow-hidden rounded-[1.25rem] sm:rounded-[2rem] bg-white shadow-sm">
          <div className="relative aspect-[2/1]">
            <Image src={v.image || "/images/venue-2x1.webp"} alt={v.name} fill sizes="(min-width:1152px) 72rem, 100vw" className="object-cover" />
          </div>
          <figcaption className="flex flex-wrap items-center justify-between gap-6 p-6 sm:p-8">
            <div>
              <h3 className="font-display text-3xl uppercase sm:text-4xl">{v.name}</h3>
              {v.address && <p className="mt-2 whitespace-pre-line text-muted">{v.address}</p>}
            </div>
            {v.mapsUrl && (
              <a href={v.mapsUrl} target="_blank" rel="noopener noreferrer" className={btnGhost}>
                Buka di Google Maps <ArrowUpRight className="ml-1.5 h-4 w-4" />
              </a>
            )}
          </figcaption>
        </figure>
      </Reveal>
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        {kitBanners.map((fallback, i) => (
          <Reveal key={fallback} delay={i * 0.1}>
            <figure className="group overflow-hidden rounded-[1.25rem] sm:rounded-[2rem] bg-white shadow-sm">
              <div className="relative aspect-[2/1] overflow-hidden">
                <Image src={c.merchItems[i]?.image || fallback} alt={c.merchItems[i]?.caption || (i ? "Medali" : "Jersey")} fill sizes="(min-width:640px) 50vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" />
              </div>
              <figcaption className="px-6 py-5 font-display text-2xl uppercase">{c.merchItems[i]?.caption || (i ? "Medali" : "Jersey")}</figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </Wrap>
  );
}

function KitGrid({ items, cols = "sm:grid-cols-2" }: { items: { image: string; caption: string }[]; cols?: string }) {
  return (
    <div className={`mt-12 grid gap-6 ${cols}`}>
      {items.map((m, i) => (
        <Reveal key={i} delay={(i % 3) * 0.1}>
          <figure className="group overflow-hidden rounded-[1.25rem] sm:rounded-[2rem] border border-line bg-surface">
            <div className="relative aspect-square overflow-hidden">
              {m.image ? (
                <Image src={m.image} alt={m.caption} fill sizes="(min-width:640px) 50vw, 100vw" className="object-contain p-6 transition duration-500 group-hover:scale-105" />
              ) : (
                <Placeholder label="Segera dirilis" />
              )}
            </div>
            <figcaption className="px-6 py-5 font-display text-2xl uppercase">{m.caption}</figcaption>
          </figure>
        </Reveal>
      ))}
    </div>
  );
}

function IntroHeading({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <div className="grid items-end gap-6 md:grid-cols-2">
      <Heading eyebrow={eyebrow} title={title} />
      <Reveal delay={0.1}>
        <p className="text-lg whitespace-pre-line text-muted">{text}</p>
      </Reveal>
    </div>
  );
}

export function Merch({ c }: C) {
  return (
    <Wrap id="merch">
      <IntroHeading eyebrow="Race Kit" title={c.merch.title} text={c.merch.text} />
      <KitGrid items={c.merchItems} />
    </Wrap>
  );
}

// ---------- Sub-pages under "Tentang Event" ----------

export function Breadcrumb({ trail }: { trail: string[] }) {
  return (
    <nav aria-label="Breadcrumb" className="px-5 pt-8">
      <ol className="mx-auto flex max-w-6xl flex-wrap items-center gap-1.5 text-sm text-muted">
        <li><Link href="/" className="hover:text-brand-red">Beranda</Link></li>
        {trail.map((t, i) => (
          <li key={t} className="flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5" />
            <span className={i === trail.length - 1 ? "font-semibold text-ink" : ""}>{t}</span>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function RaceCategory({ c }: C) {
  const cta = ctaFor(c);
  return (
    <Wrap>
      <IntroHeading eyebrow="Tentang Event" title="Race Category" text={c.about.text} />
      <div className="mt-12">
        <CategoryGrid c={c} cols="sm:grid-cols-2 lg:grid-cols-3" />
      </div>
      {cta && <CtaButton source="race-category" href={cta.href} label={cta.label} className={`${btnBrand} mt-10`} />}
    </Wrap>
  );
}

export function Racepack({ c }: C) {
  return (
    <Wrap id="racepack">
      <IntroHeading eyebrow="Race Kit" title={c.racepack.title} text={c.racepack.text} />
      <KitGrid items={c.racepackItems} cols="sm:grid-cols-2 lg:grid-cols-3" />
    </Wrap>
  );
}

export function RacepackVenue({ c }: C) {
  const v = c.racepackVenue;
  return (
    <Wrap>
      <Heading eyebrow="Racepack Collection" title="Lokasi Pengambilan Racepack" />
      <LocationCard v={v} placeholder="Racepack Collection">
        {v.schedule && (
          <p className="mt-6 flex gap-3 whitespace-pre-line font-semibold">
            <CalendarClock className="mt-0.5 h-5 w-5 shrink-0 text-brand-red" />
            {v.schedule}
          </p>
        )}
        {v.text && <p className="mt-4 rounded-xl sm:rounded-2xl bg-surface p-4 text-sm whitespace-pre-line text-muted">{v.text}</p>}
      </LocationCard>
    </Wrap>
  );
}

export function Community({ c }: C) {
  const k = c.community;
  return (
    <Wrap>
      <IntroHeading eyebrow="Tentang Event" title={k.title} text={k.text} />
      <div className="mt-12">
        {c.communities.length ? (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {c.communities.map((m, i) => {
              const inner = (
                <>
                  <span className="relative block aspect-square w-full">
                    {m.logo ? (
                      <Image src={m.logo} alt={m.name} fill sizes="200px" className="object-contain p-4" />
                    ) : (
                      <span className="flex h-full items-center justify-center font-display text-4xl text-brand">{m.name.slice(0, 2)}</span>
                    )}
                  </span>
                  <span className="mt-2 block text-center text-sm font-semibold">{m.name}</span>
                </>
              );
              return (
                <Reveal key={i} delay={(i % 4) * 0.05}>
                  <li className="h-full rounded-2xl sm:rounded-3xl border border-line bg-white p-4 transition hover:border-brand-red hover:shadow-lg">
                    {m.websiteUrl ? <a href={m.websiteUrl} target="_blank" rel="noopener noreferrer">{inner}</a> : inner}
                  </li>
                </Reveal>
              );
            })}
          </ul>
        ) : (
          <Empty>
            <p className="font-display text-2xl uppercase text-ink">Daftar komunitas segera hadir</p>
            <p className="mt-2">Komunitasmu ingin ikut meramaikan TopsellRun? Hubungi kami.</p>
          </Empty>
        )}
        {k.joinUrl && (
          <a href={k.joinUrl} target="_blank" rel="noopener noreferrer" className={`${btnBrand} mt-10`}>
            Gabung Komunitas <ArrowUpRight className="ml-1.5 h-4 w-4" />
          </a>
        )}
      </div>
    </Wrap>
  );
}

export function Partnership({ c, kind }: C & { kind: "sponsorship" | "mediaPartner" }) {
  const info = c[kind];
  const benefits = kind === "sponsorship" ? c.sponsorshipBenefits : c.mediaPartnerBenefits;
  const msg = `Halo admin TopsellRun, saya tertarik kerja sama ${info.title}.`;
  return (
    <Wrap>
      <IntroHeading eyebrow="Kerjasama" title={info.title} text={info.text} />
      {benefits.length > 0 && (
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {benefits.map((b, i) => (
            <Reveal key={i} delay={(i % 3) * 0.08}>
              <div className="h-full rounded-2xl sm:rounded-3xl border border-line bg-white p-7">
                <div className="font-display text-5xl text-brand">{String(i + 1).padStart(2, "0")}</div>
                <h3 className="mt-3 font-display text-2xl uppercase">{b.title}</h3>
                <p className="mt-2 whitespace-pre-line text-muted">{b.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      )}
      <div className="mt-10 flex flex-wrap gap-3">
        {c.contact.whatsapp && (
          <a href={waUrl(c.contact.whatsapp, msg)} target="_blank" rel="noopener noreferrer" className={btnBrand}>
            Hubungi via WhatsApp
          </a>
        )}
        {c.contact.email && (
          <a href={`mailto:${c.contact.email}?subject=${encodeURIComponent(msg)}`} className={btnGhost}>
            Kirim Email
          </a>
        )}
      </div>
    </Wrap>
  );
}

export function Achievements({ c }: C) {
  if (!c.achievements.length) return null;
  return (
    <section className="logo-bg bg-brand px-5 py-20 text-white">
      <div className="mx-auto max-w-6xl">
        <Heading eyebrow={`Pencapaian ${c.event.edition}`} title="Rekor & Milestone" light />
        <dl className="mt-12 grid grid-cols-2 gap-8 md:grid-cols-4">
          {c.achievements.map((a, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <dt className="font-display text-5xl sm:text-7xl">{a.value}</dt>
              <dd className="mt-2 text-sm font-semibold uppercase tracking-widest text-white/80">{a.label}</dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}

// preview: Home shows the first photos with a "Lihat Semua" tile linking to /galeri.
export function Gallery({ c, photos, preview }: C & { photos: Photo[]; preview?: boolean }) {
  return (
    <Wrap id="galeri" className="logo-bg bg-surface">
      <Heading eyebrow="Galeri" title="Momen Peserta" />
      <div className="mt-10">
        {photos.length ? (
          <GalleryGrid photos={preview ? photos.slice(0, 10) : photos} alt={`Foto ${c.event.name}`} moreHref={preview ? "/galeri" : undefined} />
        ) : (
          <Empty>
            <p className="font-display text-2xl uppercase text-ink">Galeri segera hadir</p>
            <p className="mt-2">Foto-foto seru race day akan diunggah di sini.</p>
            {c.contact.instagramUrl && (
              <a href={c.contact.instagramUrl} target="_blank" rel="noopener noreferrer" className={`${btnGhost} mt-6`}>
                Pantau Instagram kami
              </a>
            )}
          </Empty>
        )}
      </div>
    </Wrap>
  );
}

export function Video({ c }: C) {
  const id = youtubeId(c.video.youtubeUrl);
  return (
    <Wrap id="video">
      <Heading eyebrow="Video Highlight" title={c.video.title} center />
      <Reveal delay={0.1} className="mt-10">
        {id ? (
          <div className="relative aspect-video overflow-hidden rounded-[1.25rem] sm:rounded-[2rem] shadow-2xl">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${id}`}
              title={c.video.title}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          </div>
        ) : (
          <Empty>
            <p className="font-display text-2xl uppercase text-ink">Video highlight segera tayang</p>
            <p className="mt-2">Nantikan aftermovie TopsellRun di kanal YouTube kami.</p>
          </Empty>
        )}
      </Reveal>
    </Wrap>
  );
}

export function Instagram({ c }: C) {
  if (!c.instagramPosts.length) return null;
  return (
    <Wrap id="instagram">
      <div className="grid items-end gap-6 md:grid-cols-[1fr_auto]">
        <div>
          <Heading eyebrow="Social Media" title={c.instagram.title} />
          {c.instagram.text && (
            <Reveal delay={0.1}>
              <p className="mt-4 max-w-2xl text-lg text-muted">{c.instagram.text}</p>
            </Reveal>
          )}
        </div>
        {c.contact.instagramUrl && (
          <a href={c.contact.instagramUrl} target="_blank" rel="noopener noreferrer" className={btnBrand}>
            Follow Instagram <ArrowUpRight className="ml-1.5 h-4 w-4" />
          </a>
        )}
      </div>
      <div className="mt-10">
        <InstagramEmbeds urls={c.instagramPosts.map((p) => p.url)} />
      </div>
    </Wrap>
  );
}

export function Festival({ c }: C) {
  if (!c.festivalItems.length && !c.festival.text) return null;
  return (
    <Wrap id="festival" className="logo-bg bg-surface">
      <Heading eyebrow="Rangkaian Acara" title={c.festival.title} />
      {c.festival.text && <p className="mt-6 max-w-2xl text-lg whitespace-pre-line text-muted">{c.festival.text}</p>}
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {c.festivalItems.map((f, i) => (
          <Reveal key={i} delay={i * 0.08}>
            <article className="h-full overflow-hidden rounded-2xl sm:rounded-3xl bg-white shadow-sm">
              {f.image && (
                <div className="relative aspect-[4/3]">
                  <Image src={f.image} alt={f.title} fill sizes="(min-width:768px) 33vw, 100vw" className="object-cover" />
                </div>
              )}
              <div className="p-6">
                <h3 className="font-display text-2xl uppercase">{f.title}</h3>
                <p className="mt-2 whitespace-pre-line text-muted">{f.text}</p>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </Wrap>
  );
}

// `tiers` = admin-chosen tier order; the first two positions get the biggest logo tiles.
export function Sponsors({ c, sponsors, tiers }: C & { sponsors: Sponsor[]; tiers: Tier[] }) {
  const groups = tiers.map(([tier, label], rank) => ({ label, rank, grid: tier !== "presented" && tier !== "main", list: sponsors.filter((s) => s.tier === tier) })).filter((g) => g.list.length);
  const contact = c.contact.email ? `mailto:${c.contact.email}` : c.contact.whatsapp ? waUrl(c.contact.whatsapp) : "";
  return (
    <Wrap id="sponsor">
      <Heading eyebrow="Partner Kami" title="Sponsor" center />
      <div className="mt-12 space-y-20 sm:space-y-24">
        {groups.length ? (
          groups.map((g) => (
            <Reveal key={g.label}>
              <h3 className="flex items-center gap-4 text-center font-display text-2xl uppercase tracking-wide text-ink before:h-0.5 before:flex-1 before:bg-brand-red/25 after:h-0.5 after:flex-1 after:bg-brand-red/25 sm:text-3xl">
                {g.label}
              </h3>
              {/* mobile: 3 tiles per row (last row centered), except presented/main which keep their big tiles; sm+ unchanged */}
              <ul className={g.grid ? "mt-8 flex flex-wrap justify-center gap-2 sm:gap-4" : "mt-8 flex flex-wrap justify-center gap-4"}>
                {g.list.map((s) => {
                  // higher tiers get bigger logo tiles
                  const size = g.rank === 0 ? "h-32 w-64" : g.rank === 1 ? "h-24 w-48" : "h-20 w-36";
                  const smSize = g.rank === 0 ? "sm:h-32 sm:w-64" : g.rank === 1 ? "sm:h-24 sm:w-48" : "sm:h-20 sm:w-36"; // literal for Tailwind
                  const box = g.grid ? `aspect-[9/5] w-full sm:aspect-auto ${smSize}` : size;
                  const logo = (
                    <span className={`relative block ${box}`}>
                      <Image src={s.logo} alt={s.name} fill sizes="256px" className="object-contain" />
                    </span>
                  );
                  return (
                    <li key={s._id} className={`rounded-xl sm:rounded-2xl border border-line bg-white ${g.grid ? "w-[calc((100%-1rem)/3)] p-2 sm:w-auto sm:p-4" : "p-4"} transition hover:border-brand-red hover:shadow-lg`}>
                      {s.websiteUrl ? <a href={s.websiteUrl} target="_blank" rel="noopener noreferrer" title={s.name}>{logo}</a> : logo}
                    </li>
                  );
                })}
              </ul>
            </Reveal>
          ))
        ) : (
          <Empty>
            <p className="font-display text-2xl uppercase text-ink">Slot sponsor masih terbuka</p>
            <p className="mt-2">Tampilkan brand Anda di depan ribuan pelari TopsellRun.</p>
            {contact && <a href={contact} className={`${btnGhost} mt-6`}>Hubungi Kami</a>}
          </Empty>
        )}
      </div>
    </Wrap>
  );
}

export function Closing({ c }: C) {
  if (c.event.status !== "completed") return null;
  const cta = ctaFor(c);
  return (
    <section className="px-5 pb-20">
      <Reveal className="bg-brand relative mx-auto max-w-6xl overflow-hidden rounded-3xl sm:rounded-[2.5rem] px-8 py-16 text-center text-white sm:py-24">
        <span className="pointer-events-none absolute -bottom-16 left-1/2 -translate-x-1/2 font-display text-[14rem] leading-none whitespace-nowrap text-white/10">
          NEXT RUN
        </span>
        <h2 className="relative font-display text-5xl uppercase sm:text-8xl">{c.closing.title}</h2>
        <p className="relative mx-auto mt-5 max-w-xl text-lg text-white/90">{c.closing.text}</p>
        {cta && <CtaButton source="closing" href={cta.href} label={cta.label} className={`${btn} relative mt-8 bg-white text-brand-red hover:-translate-y-0.5`} />}
      </Reveal>
    </section>
  );
}

export function Footer({ c }: C) {
  const k = c.contact;
  const socials = [
    ["Instagram", k.instagramUrl],
    ["TikTok", k.tiktokUrl],
    ["YouTube", k.youtubeUrl],
  ].filter(([, u]) => u);
  return (
    <footer className="logo-bg border-t border-line bg-surface px-5 py-14">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-3">
        <div>
          <HomeLogo className="h-16 w-auto" />
          <p className="mt-6 text-xs font-bold uppercase tracking-widest text-muted">Presented by</p>
          <ul className="mt-3 flex gap-3">
            {[
              ["Topsell", "/images/sponsors/topsell.webp"],
              ["Samsung", "/images/sponsors/samsung.webp"],
            ].map(([name, src]) => (
              <li key={name} className="rounded-xl border border-line bg-white px-4 py-3 shadow-sm">
                <span className="relative block h-7 w-28">
                  <Image src={src} alt={name} fill sizes="112px" className="object-contain" />
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className={`text-sm ${k.whatsapp || k.email ? "" : "hidden"}`}>
          <p className="font-bold uppercase tracking-widest text-muted">Kontak</p>
          <ul className="mt-3 space-y-2">
            {k.whatsapp && <li><a className="hover:text-brand-red" href={waUrl(k.whatsapp)}>WhatsApp: +{k.whatsapp}</a></li>}
            {k.email && <li><a className="hover:text-brand-red" href={`mailto:${k.email}`}>{k.email}</a></li>}
          </ul>
        </div>
        <div className={`text-sm ${socials.length ? "" : "hidden"}`}>
          <p className="font-bold uppercase tracking-widest text-muted">Ikuti Kami</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {socials.map(([name, url]) => (
              <li key={name}>
                <a href={url} target="_blank" rel="noopener noreferrer" className="inline-block rounded-full border border-line bg-white px-4 py-2 font-semibold hover:border-brand-red hover:text-brand-red">
                  {name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="mx-auto mt-12 max-w-6xl text-xs text-muted">© {c.event.edition} {c.event.name}. All rights reserved.</p>
    </footer>
  );
}

export function WhatsAppFab({ c }: C) {
  if (!c.contact.whatsapp) return null;
  return (
    <a
      href={waUrl(c.contact.whatsapp, c.contact.whatsappText)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat admin via WhatsApp"
      className="fixed right-5 bottom-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl transition hover:scale-110"
    >
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor" aria-hidden>
        <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.3-.4.8-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.5-.3Z" />
      </svg>
    </a>
  );
}
