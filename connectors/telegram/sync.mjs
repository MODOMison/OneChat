// OneChat Telegram connector — sync.
// Pulls your real recent Telegram conversations + messages and writes them,
// normalized into OneChat's shape, to onechat-live.json. The desktop widget
// reads that file and shows your REAL chats. Run after login:
//   npm run sync     (re-run to refresh)
import "dotenv/config";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import { readFileSync, writeFileSync } from "fs";

const apiId = Number(process.env.TG_API_ID);
const apiHash = process.env.TG_API_HASH;

let sessionString = "";
try {
  sessionString = readFileSync(new URL("./session.txt", import.meta.url), "utf8").trim();
} catch {
  console.error("No session.txt — run `npm run login` first.");
  process.exit(1);
}

function initialsOf(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const client = new TelegramClient(new StringSession(sessionString), apiId, apiHash, {
  connectionRetries: 5,
});
await client.connect();

const dialogs = await client.getDialogs({ limit: 20 });
const threads = [];

for (const d of dialogs) {
  const name = (d.title || d.name || "Unknown").toString();
  try {
    const messages = await client.getMessages(d.entity, { limit: 12 });
    const msgs = messages
      .filter((m) => m.message)
      .reverse()
      .map((m) => ({ s: m.out ? "me" : "them", t: m.message }));
    if (msgs.length === 0) continue;
    threads.push({
      id: `tg-${d.id}`,
      name,
      app: "Telegram",
      initials: initialsOf(name),
      msgs,
    });
  } catch (err) {
    // Skip channels/chats we can't read; keep going.
  }
}

writeFileSync(
  new URL("./onechat-live.json", import.meta.url),
  JSON.stringify(threads, null, 2),
);
console.log(`\n✓ Synced ${threads.length} real Telegram threads -> onechat-live.json`);
console.log("  Open the widget (cd ../../desktop && npm start) to see them.");
await client.disconnect();
process.exit(0);
