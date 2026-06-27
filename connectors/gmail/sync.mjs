// OneChat Gmail connector — sync.
// Pulls your real recent Gmail threads and writes them, normalized into
// OneChat's shape, to onechat-live.json. The desktop widget reads that file
// and shows your REAL email alongside Telegram. Run after login:
//   npm run sync     (re-run to refresh)
import "dotenv/config";
import { google } from "googleapis";
import { readFileSync, writeFileSync } from "fs";

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

let tokens;
try {
  tokens = JSON.parse(
    readFileSync(new URL("./token.json", import.meta.url), "utf8"),
  );
} catch {
  console.error("No token.json — run `npm run login` first.");
  process.exit(1);
}

const auth = new google.auth.OAuth2(clientId, clientSecret);
auth.setCredentials(tokens);
const gmail = google.gmail({ version: "v1", auth });

function initialsOf(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// "Display Name <user@host>" -> { name, email }
function parseFrom(header) {
  const m = header && header.match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/);
  if (m) return { name: m[1].trim() || m[2].trim(), email: m[2].trim().toLowerCase() };
  const e = (header || "").trim().toLowerCase();
  return { name: e || "Unknown", email: e };
}

const { data: profile } = await gmail.users.getProfile({ userId: "me" });
const myEmail = (profile.emailAddress || "").toLowerCase();

// Recent threads in the inbox; skip promos/social noise.
const { data: list } = await gmail.users.threads.list({
  userId: "me",
  maxResults: 15,
  q: "in:inbox -category:promotions -category:social",
});

const threads = [];

for (const t of list.threads || []) {
  try {
    const { data: thread } = await gmail.users.threads.get({
      userId: "me",
      id: t.id,
      format: "metadata",
      metadataHeaders: ["From", "Subject"],
    });
    const messages = thread.messages || [];
    if (messages.length === 0) continue;

    const headersOf = (msg) =>
      Object.fromEntries(
        (msg.payload?.headers || []).map((h) => [h.name.toLowerCase(), h.value]),
      );

    // Thread name = the other party (first sender who isn't me), else the subject.
    let other = null;
    for (const msg of messages) {
      const from = parseFrom(headersOf(msg).from);
      if (from.email && from.email !== myEmail) {
        other = from;
        break;
      }
    }
    const subject = headersOf(messages[0]).subject || "(no subject)";
    const name = (other?.name || subject).toString();

    const msgs = messages.map((msg) => {
      const from = parseFrom(headersOf(msg).from);
      return {
        s: from.email === myEmail ? "me" : "them",
        t: (msg.snippet || "").trim(),
      };
    });

    threads.push({
      id: `gm-${t.id}`,
      name,
      app: "Gmail",
      initials: initialsOf(name),
      // Routing for send.mjs: reply to the other party, in-thread, same subject.
      to: other?.email || "",
      subject,
      msgs,
    });
  } catch {
    // Skip threads we can't read; keep going.
  }
}

writeFileSync(
  new URL("./onechat-live.json", import.meta.url),
  JSON.stringify(threads, null, 2),
);
console.log(`\n✓ Synced ${threads.length} real Gmail threads -> onechat-live.json`);
console.log("  Open the widget (cd ../../desktop && npm start) to see them.");
process.exit(0);
