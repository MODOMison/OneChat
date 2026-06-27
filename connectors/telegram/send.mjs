// OneChat Telegram connector — send.
// Sends a REAL Telegram message to one of your synced threads. Live — this goes
// to an actual person immediately. Test against "Saved Messages" (yourself) first.
//   node send.mjs <threadId> <text...>
//   e.g. node send.mjs tg-777000 "hello from OneChat"
import "dotenv/config";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import { readFileSync } from "fs";

const apiId = Number(process.env.TG_API_ID);
const apiHash = process.env.TG_API_HASH;

const [, , threadId, ...rest] = process.argv;
const text = rest.join(" ");
if (!threadId || !text) {
  console.error('usage: node send.mjs <threadId> "<text>"');
  process.exit(1);
}

let sessionString = "";
try {
  sessionString = readFileSync(new URL("./session.txt", import.meta.url), "utf8").trim();
} catch {
  console.error("No session.txt — run `npm run login` first.");
  process.exit(1);
}

const client = new TelegramClient(new StringSession(sessionString), apiId, apiHash, {
  connectionRetries: 5,
});
await client.connect();

// Re-fetch dialogs so we hold a valid entity (access hash) for the peer — sending
// by bare id from a fresh process can fail without the cached entity.
const wantId = threadId.replace(/^tg-/, "");
const dialogs = await client.getDialogs({ limit: 50 });
const d = dialogs.find((x) => String(x.id) === wantId);
if (!d) {
  console.error(`Thread ${threadId} not found in your dialogs. Run \`npm run sync\` first.`);
  await client.disconnect();
  process.exit(1);
}

await client.sendMessage(d.entity, { message: text });
console.log(`✓ Sent to ${d.title || d.name || threadId} on Telegram`);
await client.disconnect();
process.exit(0);
