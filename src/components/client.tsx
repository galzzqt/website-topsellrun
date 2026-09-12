"use client";

import { MotionConfig, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { wibDate, type SiteConfig } from "@/lib/content";

const slideTo = (el: HTMLElement | null, k: number, n: number) =>
  el?.scrollTo({ left: (((k % n) + n) % n) * el.clientWidth, behavior: "smooth" });

// Native scroll-snap does the swiping; JS only adds autoplay, arrows and dots.
export function BannerCarousel({ banners }: { banners: SiteConfig["banners"] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = banners.length;

  useEffect(() => {
    if (paused || n < 2 || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => slideTo(ref.current, active + 1, n), 5000);
    return () => clearInterval(t);
  }, [active, paused, n]);

  const arrow = "absolute top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl font-bold text-ink shadow-lg transition hover:bg-white hover:text-brand-red sm:flex";

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Banner TopsellRun"
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div>
        <div
          ref={ref}
          onScroll={(e) => setActive(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
          className="flex snap-x snap-mandatory items-start overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {banners.map((b, i) => {
            // Fixed 3:1 frame; images with another ratio are cropped, anchored to the top.
            const img = (
              <Image src={b.image} alt={b.title || `Banner ${i + 1}`} fill priority={i === 0} sizes="100vw" className="object-cover object-top" />
            );
            return (
              <div key={i} className="relative aspect-[3/1] w-full shrink-0 snap-start" aria-roledescription="slide" aria-label={`${i + 1} dari ${n}`}>
                {b.linkUrl ? (
                  <a href={b.linkUrl} target={b.linkUrl.startsWith("/") ? undefined : "_blank"} rel="noopener noreferrer" className="block h-full">
                    {img}
                  </a>
                ) : (
                  img
                )}
              </div>
            );
          })}
        </div>

        {n > 1 && (
          <>
            <button type="button" aria-label="Banner sebelumnya" onClick={() => slideTo(ref.current, active - 1, n)} className={`${arrow} left-4`}>
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button type="button" aria-label="Banner berikutnya" onClick={() => slideTo(ref.current, active + 1, n)} className={`${arrow} right-4`}>
              <ChevronRight className="h-6 w-6" />
            </button>
            <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2 sm:bottom-5">
              {banners.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Ke banner ${i + 1}`}
                  aria-current={i === active}
                  onClick={() => slideTo(ref.current, i, n)}
                  className={`h-2 rounded-full shadow transition-all sm:h-2.5 ${i === active ? "bg-brand w-8" : "w-2 bg-white/80 hover:bg-white sm:w-2.5"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

// Instagram's official embed (no token, no npm wrapper). embed.js swaps each blockquote for an
// auto-height iframe; the markup goes through innerHTML so React never owns the nodes it replaces.
// URLs come from instagramPermalink() ([\w-] only), so interpolating them is safe.
export function InstagramEmbeds({ urls }: { urls: string[] }) {
  return (
    <>
      <div className="grid items-start gap-6 md:grid-cols-2 lg:grid-cols-3">
        {urls.map((u, i) => (
          <div
            key={`${i}-${u}`}
            className="overflow-hidden rounded-2xl bg-white shadow-sm [&_iframe]:!min-w-0"
            dangerouslySetInnerHTML={{
              __html: `<blockquote class="instagram-media" data-instgrm-permalink="${u}?utm_source=ig_embed" data-instgrm-version="14" style="background:#fff;border:0;margin:0;max-width:100%;min-width:0;padding:0;width:100%"><a href="${u}" target="_blank" rel="noopener noreferrer" style="display:block;padding:2rem;text-align:center;font-weight:600;color:#e3122c">Lihat postingan ini di Instagram</a></blockquote>`,
            }}
          />
        ))}
      </div>
      <Script src="https://www.instagram.com/embed.js" strategy="lazyOnload" onReady={() => window.instgrm?.Embeds.process()} />
    </>
  );
}

// On every page change jump to the very top (Next's own scroll targets the page's first element,
// which our reveal animations shift slightly). Links with a #hash keep scrolling to their section.
export function ScrollToTop() {
  const pathname = usePathname();
  useEffect(() => {
    if (!location.hash) window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

// reducedMotion="user": transforms are dropped when the OS asks for reduced motion.
export function MotionRoot({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

export function Reveal({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    instgrm?: { Embeds: { process(): void } };
  }
}

export function CtaButton({ href, label, className = "", source }: { href: string; label: string; className?: string; source: string }) {
  if (!href)
    return (
      <span className={`${className} cursor-not-allowed opacity-60`} aria-disabled>
        Pendaftaran segera dibuka
      </span>
    );
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      // GTM-compatible; picked up once a tag manager is installed.
      onClick={() => (window.dataLayer ??= []).push({ event: "cta_daftar_click", cta_source: source })}
    >
      {label}
    </a>
  );
}

const UNITS = [
  ["Hari", 86400, Infinity],
  ["Jam", 3600, 24],
  ["Menit", 60, 60],
  ["Detik", 1, 60],
] as const;

const tick = (cb: () => void) => {
  const t = setInterval(cb, 1000);
  return () => clearInterval(t);
};

export function Countdown({ target }: { target: string }) {
  // Server snapshot is null → renders "--" and fills in after hydration, no mismatch.
  const now = useSyncExternalStore(tick, () => Math.floor(Date.now() / 1000), () => null);
  const end = Math.floor((wibDate(target)?.getTime() ?? 0) / 1000);
  const left = now === null ? 0 : Math.max(0, end - now);

  return (
    <div className="flex gap-2 sm:gap-3" role="timer" aria-label="Hitung mundur race day">
      {UNITS.map(([label, secs, mod]) => {
        const v = Math.floor(left / secs) % mod;
        return (
          <div key={label} className="w-[4.5rem] rounded-2xl border border-line bg-white py-3 text-center shadow-sm sm:w-24">
            <div className="font-display text-3xl tabular-nums text-brand-red sm:text-5xl">
              {now === null ? "--" : String(v).padStart(2, "0")}
            </div>
            <div className="mt-1 text-[11px] font-semibold uppercase tracking-widest text-muted">{label}</div>
          </div>
        );
      })}
    </div>
  );
}
