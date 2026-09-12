import type { Metadata } from "next";
import { Anton, Plus_Jakarta_Sans } from "next/font/google";
import { ScrollToTop } from "@/components/client";
import "./globals.css";

const anton = Anton({ variable: "--font-anton", weight: "400", subsets: ["latin"] });
const jakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"] });

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
