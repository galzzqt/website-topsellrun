// Usage: node --env-file=.env.local scripts/create-admin.mjs admin@topsell.id "password-kuat"
// Creates the admin, or resets the password if the email already exists.
import { randomBytes, scryptSync } from "node:crypto";
import { MongoClient } from "mongodb";

const [email, password] = process.argv.slice(2);
if (!email || !password || password.length < 10) {
  console.error("Usage: create-admin.mjs <email> <password (min 10 chars)>");
  process.exit(1);
}

// Must match hashPassword() in src/lib/auth.ts
const salt = randomBytes(16).toString("hex");
const passwordHash = `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;

const client = await new MongoClient(process.env.MONGODB_URI).connect();
const users = client.db(process.env.MONGODB_DB || "topsellrun").collection("adminUsers");
await users.createIndex({ email: 1 }, { unique: true });
await users.updateOne(
  { email: email.trim().toLowerCase() },
  { $set: { passwordHash, role: "admin", updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
  { upsert: true },
);
console.log(`Admin ${email} siap.`);
await client.close();
