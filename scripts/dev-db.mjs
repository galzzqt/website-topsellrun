// Local development MongoDB: `npm run db` (keep it running next to `npm run dev`).
// Data lives in .data/mongo (git-ignored) and survives restarts. Not for production — use a real
// MongoDB there (Dokploy service or Atlas) and point MONGODB_URI at it.
import { MongoMemoryServer } from "mongodb-memory-server";
import { mkdirSync } from "node:fs";

const dbPath = new URL("../.data/mongo", import.meta.url).pathname.replace(/^\/(\w:)/, "$1");
mkdirSync(dbPath, { recursive: true });
const m = await MongoMemoryServer.create({ instance: { port: 27018, dbPath, storageEngine: "wiredTiger" } });
console.log(`Dev MongoDB ready at ${m.getUri()} (data: ${dbPath}). Ctrl+C to stop.`);
process.on("SIGINT", async () => {
  await m.stop({ doCleanup: false }); // keep the data folder
  process.exit(0);
});
