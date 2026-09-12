// Copy all TopsellRun data from one MongoDB to another (e.g. local dev → Atlas).
// Usage: node --env-file=.env.local scripts/copy-db.mjs <source-uri>
//   source = the URI given as argument (e.g. mongodb://127.0.0.1:27018)
//   target = MONGODB_URI from .env.local
// Upserts by _id: safe to re-run, never deletes anything in the target.
import { MongoClient } from "mongodb";

const source = process.argv[2];
const target = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "topsellrun";
if (!source || !target) {
  console.error("Usage: node --env-file=.env.local scripts/copy-db.mjs <source-uri>   (target = MONGODB_URI)");
  process.exit(1);
}
if (source === target) {
  console.error("Source and target are the same database — nothing to do.");
  process.exit(1);
}

const hide = (uri) => uri.replace(/\/\/[^@/]*@/, "//***@"); // never print credentials
const [src, dst] = await Promise.all([new MongoClient(source).connect(), new MongoClient(target).connect()]);
console.log(`Copy ${hide(source)} → ${hide(target)} (db: ${dbName})`);

for (const { name } of await src.db(dbName).listCollections().toArray()) {
  const docs = await src.db(dbName).collection(name).find().toArray();
  if (!docs.length) continue;
  const res = await dst
    .db(dbName)
    .collection(name)
    .bulkWrite(docs.map((d) => ({ replaceOne: { filter: { _id: d._id }, replacement: d, upsert: true } })));
  console.log(`  ${name}: ${docs.length} dokumen (baru ${res.upsertedCount}, diperbarui ${res.modifiedCount})`);
}
// adminUsers relies on a unique email index
await dst.db(dbName).collection("adminUsers").createIndex({ email: 1 }, { unique: true });
console.log("Selesai.");
await Promise.all([src.close(), dst.close()]);
