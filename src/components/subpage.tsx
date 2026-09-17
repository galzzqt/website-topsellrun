import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MotionRoot } from "@/components/client";
import * as S from "@/components/sections";
import type { SiteConfig, Tier } from "@/lib/content";
import { getContent, type Photo, type Sponsor } from "@/lib/db";

// Sub-pages of the "Tentang Event" and "Kerjasama" menus (see NAV_MENU). Content comes from the same CMS config as Home.
type Data = { c: SiteConfig; sponsors: Sponsor[]; tiers: Tier[]; gallery: Photo[] };
const PAGES: Record<string, { trail: string[]; render: (d: Data) => React.ReactNode }> = {
  galeri: { trail: ["Gallery"], render: ({ c, gallery }) => <S.Gallery c={c} photos={gallery} /> },
  "race-category": { trail: ["Tentang Event", "Race Category"], render: ({ c }) => <S.RaceCategory c={c} /> },
  "medal-jersey-racepack": {
    trail: ["Tentang Event", "Medal, Jersey & Racepack"],
    render: ({ c }) => (
      <>
        <S.Merch c={c} />
        <S.Racepack c={c} />
      </>
    ),
  },
  racepack: { trail: ["Tentang Event", "Racepack"], render: ({ c }) => <S.Racepack c={c} /> },
  "racepack-collection": { trail: ["Tentang Event", "Racepack Collection Venue"], render: ({ c }) => <S.RacepackVenue c={c} /> },
  komunitas: { trail: ["Tentang Event", "Komunitas"], render: ({ c }) => <S.Community c={c} /> },
  "kerjasama/sponsorship": {
    trail: ["Kerjasama", "Sponsorship"],
    render: ({ c, sponsors, tiers }) => (
      <>
        <S.Partnership c={c} kind="sponsorship" />
        <S.Sponsors c={c} sponsors={sponsors} tiers={tiers} />
      </>
    ),
  },
  "kerjasama/media-partner": {
    trail: ["Kerjasama", "Media Partner"],
    render: ({ c, sponsors, tiers }) => (
      <>
        <S.Partnership c={c} kind="mediaPartner" />
        {sponsors.some((s) => s.tier === "media") && <S.Sponsors c={c} sponsors={sponsors.filter((s) => s.tier === "media")} tiers={tiers} />}
      </>
    ),
  },
};

// Route files: app/[slug] and app/kerjasama/[slug]. Not a [...slug] catch-all: Hostinger's deploy drops
// folders with "..." in the name, which made every sub-page 404 in production.
export const subPageKeys = (prefix = "") =>
  Object.keys(PAGES).filter((k) => k.startsWith(prefix) && !k.slice(prefix.length).includes("/")).map((k) => k.slice(prefix.length));

export async function subPageMetadata(key: string): Promise<Metadata> {
  const page = PAGES[key];
  const { config: c } = await getContent();
  return page ? { title: `${page.trail.at(-1)} — ${c.event.name}` } : {};
}

export async function SubPage({ pageKey: key }: { pageKey: string }) {
  const page = PAGES[key];
  if (!page) notFound();
  const { config: c, sponsors, tiers, gallery } = await getContent();
  return (
    <MotionRoot>
      <div aria-hidden className="majapahit-bg" />
      <S.Navbar c={c} path={`/${key}`} />
      <main>
        <S.Breadcrumb trail={page.trail} />
        {page.render({ c, sponsors, tiers, gallery })}
        <S.Ticker c={c} />
      </main>
      <S.Footer c={c} />
      <S.WhatsAppFab c={c} />
    </MotionRoot>
  );
}
