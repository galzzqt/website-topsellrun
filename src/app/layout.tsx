import type { Metadata } from "next";
import localFont from "next/font/local";
import { ScrollToTop } from "@/components/client";
import "./globals.css";

// Self-hosted: the woff2 files (latin subset) live in ./fonts, no fonts.gstatic.com fetch at build time.
const anton = localFont({
  src: "./fonts/Anton-Regular.woff2",
  variable: "--font-anton",
  weight: "400",
  display: "swap",
});
const jakarta = localFont({
  src: "./fonts/PlusJakartaSans-Variable.woff2",
  variable: "--font-jakarta",
  weight: "200 800",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TopsellRun — Run Together, Celebrate Together",
  description: "Event lari tahunan TopsellRun. Info kategori lomba, venue, jersey & medali, galeri, dan pendaftaran.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // data-scroll-behavior: Next 16 then switches off our CSS smooth scrolling during page changes,
    // so a new page starts instantly at the top (in-page anchors like /#galeri stay smooth).
    <html lang="id" data-scroll-behavior="smooth" className={`${anton.variable} ${jakarta.variable} antialiased`}>
      <body className="font-sans">
        <ScrollToTop />
        {children}
      </body>
    </html>
  );
}
