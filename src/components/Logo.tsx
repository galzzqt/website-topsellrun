import Image from "next/image";

// Trimmed/optimized copy of public/images/New Topsellrun Logo.png (1705x761, 549KB → 640x284 webp, 44KB).
export default function Logo({ className = "h-10 w-auto", priority }: { className?: string; priority?: boolean }) {
  return (
    <Image src="/images/topsellrun-logo-new.webp" alt="TopsellRun" width={640} height={284} unoptimized priority={priority} className={className} />
  );
}
