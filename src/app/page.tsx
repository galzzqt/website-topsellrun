import type { Metadata } from "next";
import { BannerCarousel, MotionRoot } from "@/components/client";
import * as S from "@/components/sections";
import { getContent } from "@/lib/db";

// ISR: admin writes call revalidatePath("/"); this is only the safety net.
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const { config: c } = await getContent();
  return {
    title: `${c.event.name} — Run Together, Celebrate Together`,
    description: c.event.status === "upcoming" ? c.event.tagline : c.recap.text,
    openGraph: c.event.heroImage ? { images: [c.event.heroImage] } : undefined,
  };
}

export default async function Home() {
  const { config: c, sponsors, gallery, tiers } = await getContent();
  return (
    <MotionRoot>
      <div aria-hidden className="majapahit-bg" />
      <S.Navbar c={c} />
      <main id="top">
        {c.banners.length > 0 && <BannerCarousel banners={c.banners} />}
        <S.Hero c={c} />
        <S.Ticker c={c} />
        <S.About c={c} />
        <S.Venue c={c} />
        <S.Merch c={c} />
        <S.Achievements c={c} />
        <S.Gallery c={c} photos={gallery} />
        <S.Video c={c} />
        <S.Instagram c={c} />
        <S.Festival c={c} />
        <S.Sponsors c={c} sponsors={sponsors} tiers={tiers} />
        <S.Closing c={c} />
      </main>
      <S.Footer c={c} />
      <S.WhatsAppFab c={c} />
    </MotionRoot>
  );
}
