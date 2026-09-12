import "server-only";
import { MongoClient, ObjectId } from "mongodb";
import { cache } from "react";
import { cleanConfig, DEFAULT_CONFIG, ITEM_SHAPES, orderTiers, type SiteConfig, type Tier } from "./content";

const g = globalThis as unknown as { _mongoConn?: Promise<MongoClient> };

export function db() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not set");
  // Don't cache a failed connect: otherwise one outage (DB down at startup) sticks until a server restart.
  g._mongoConn ??= new MongoClient(process.env.MONGODB_URI).connect().catch((e) => {
    g._mongoConn = undefined;
    throw e;
  });
  return g._mongoConn.then((c) => c.db(process.env.MONGODB_DB || "topsellrun"));
}

export type Sponsor = typeof ITEM_SHAPES.sponsors & { _id: string };
export type Photo = typeof ITEM_SHAPES.gallery & { _id: string };

const plain = <T,>(docs: { _id: ObjectId }[]) => docs.map((d) => ({ ...d, _id: String(d._id) })) as T[];

type Content = { config: SiteConfig; sponsors: Sponsor[]; gallery: Photo[]; tiers: Tier[] };

// cache(): generateMetadata + page share one DB round-trip per request.
export const getContent = cache(async (): Promise<Content> => {
  try {
    const d = await db();
    const [config, sponsors, gallery, tierDoc] = await Promise.all([
      d.collection("siteConfig").findOne({ _id: "main" as never }),
      d.collection("sponsors").find().sort({ order: 1, createdAt: 1 }).toArray(), // order set by admin ↑↓
      d.collection("gallery").find().sort({ createdAt: -1 }).limit(60).toArray(),
      // Separate doc (not in "main") so saving the content form can't overwrite the tier order.
      d.collection("siteConfig").findOne({ _id: "sponsorTiers" as never }),
    ]);
    return {
      config: config ? cleanConfig(config) : DEFAULT_CONFIG,
      sponsors: plain(sponsors),
      gallery: plain(gallery),
      tiers: orderTiers(tierDoc?.order),
    };
  } catch (e) {
    // ponytail: DB unreachable (e.g. at build time) renders defaults; ISR refreshes once DB is back.
    console.error("getContent failed, using defaults:", (e as Error).message);
    return { config: DEFAULT_CONFIG, sponsors: [], gallery: [], tiers: orderTiers(null) };
  }
});
