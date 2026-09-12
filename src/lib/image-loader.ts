// Cloudinary resizes/converts on its CDN, so the VPS never runs Next's image optimizer.
export default function loader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  // Local files in /public are pre-optimized; ?w only satisfies Next's "loader must use width" check.
  if (!src.includes("res.cloudinary.com") || !src.includes("/upload/")) return `${src}${src.includes("?") ? "&" : "?"}w=${width}`;
  return src.replace("/upload/", `/upload/f_auto,q_${quality ?? "auto"},c_limit,w_${width}/`);
}
