// Usage: node scripts/hash-password.mjs "your password"
// Prints the salted PBKDF2 record used for seeded accounts in src/store.jsx.
import { pbkdf2Sync, randomBytes } from "node:crypto";

const pw = process.argv[2];
if (!pw || pw.length < 10) {
  console.error('Usage: node scripts/hash-password.mjs "password of 10 or more characters"');
  process.exit(1);
}
const salt = randomBytes(16).toString("hex");
const hash = pbkdf2Sync(pw, salt, 150000, 32, "sha256").toString("hex");
console.log(JSON.stringify({ salt, hash }));
