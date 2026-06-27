// OneChat Gmail connector — send.
// Sends a REAL email reply within one of your synced threads. Live — this is
// delivered immediately. Requires the gmail.send scope (re-run `npm run login`
// once after the scope was added). Routing (recipient + subject + threadId)
// comes from the last sync, so run `npm run sync` first.
//   node send.mjs <threadId> <text...>
//   e.g. node send.mjs gm-18f2ab... "thanks, sounds good"
import "dotenv/config";
import { google } from "googleapis";
import { readFileSync } from "fs";

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

const [, , threadId, ...rest] = process.argv;
const text = rest.join(" ");
if (!threadId || !text) {
  console.error('usage: node send.mjs <threadId> "<text>"');
  process.exit(1);
}

let tokens;
try {
  tokens = JSON.parse(readFileSync(new URL("./token.json", import.meta.url), "utf8"));
} catch {
  console.error("No token.json — run `npm run login` first.");
  process.exit(1);
}

// Recipient + subject come from the synced thread, so we reply to the right person.
let live = [];
try {
  live = JSON.parse(readFileSync(new URL("./onechat-live.json", import.meta.url), "utf8"));
} catch {}
const thread = live.find((t) => t.id === threadId);
if (!thread || !thread.to) {
  console.error(`No routing for ${threadId} — run \`npm run sync\` first.`);
  process.exit(1);
}

const auth = new google.auth.OAuth2(clientId, clientSecret);
auth.setCredentials(tokens);
const gmail = google.gmail({ version: "v1", auth });

const baseSubject = thread.subject || "(no subject)";
const subject = /^re:/i.test(baseSubject) ? baseSubject : `Re: ${baseSubject}`;
const mime = [
  `To: ${thread.to}`,
  `Subject: ${subject}`,
  "Content-Type: text/plain; charset=UTF-8",
  "",
  text,
].join("\r\n");
const raw = Buffer.from(mime).toString("base64").replace(/\+/g, "-").replace(/\//g, "_");

await gmail.users.messages.send({
  userId: "me",
  requestBody: { raw, threadId: threadId.replace(/^gm-/, "") },
});
console.log(`✓ Sent to ${thread.to} on Gmail`);
process.exit(0);
