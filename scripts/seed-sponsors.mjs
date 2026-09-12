// Usage: node --env-file=.env.local scripts/seed-sponsors.mjs
// Upserts the initial sponsor list (logos in public/images/sponsors). Safe to re-run; edits made in the
// admin panel to other fields are kept, only name/logo/tier are reset for these entries.
import { MongoClient } from "mongodb";

const EDITION = "2026";
const SPONSORS = [
  ["Topsell", "topsell", "presented"],
  ["Samsung", "samsung", "main"],
  ...[
    ["Dua Kelinci", "dua-kelinci"],
    ["McDonald's", "mcdonalds"],
    ["Bank BRI", "bank-bri"],
    ["BYD", "byd"],
    ["Aquviva", "aquviva"],
    ["AQUA", "aqua"],
    ["BCA", "bca"],
    ["Sido Muncul", "sido-muncul"],
    ["Jamu Jago", "jamu-jago"],
    ["Anker", "anker"],
    ["Dapurdia", "dapurdia"],
    ["Ksatria 88", "ksatria-88"],
    ["Rekso", "rekso"],
    ["Midea", "midea"],
    ["IHC Rumah Sakit Gatoel", "ihc-rs-gatoel"],
    ["Pacific", "pacific"],
    ["JBL", "jbl"],
    ["Comforta", "comforta"],
    ["Bank Mandiri", "mandiri"],
    ["JETE", "jete"],
    ["Indodana", "indodana"],
    ["Isoplus", "isoplus"],
    ["Parahita Diagnostic Center", "parahita"],
  ].map(([name, slug]) => [name, slug, "official"]),
];

const client = await new MongoClient(process.env.MONGODB_URI).connect();
const col = client.db(process.env.MONGODB_DB || "topsellrun").collection("sponsors");
const base = Date.now();
for (const [i, [name, slug, tier]] of SPONSORS.entries()) {
  await col.updateOne(
    { name, edition: EDITION },
    {
      $set: { logo: `/images/sponsors/${slug}.webp`, tier, updatedAt: new Date() },
      // createdAt drives display order within a tier
      $setOnInsert: { websiteUrl: "", createdAt: new Date(base + i) },
    },
    { upsert: true },
  );
}
console.log(`${SPONSORS.length} sponsor siap.`);
await client.close();
