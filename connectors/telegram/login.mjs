// OneChat Telegram connector — one-time login.
// Logs into YOUR Telegram account via the official MTProto API (GramJS),
// then saves a reusable session string to session.txt. Run once:
//   cd connectors/telegram && npm install && npm run login
import "dotenv/config";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import input from "input";
import { writeFileSync } from "fs";

const apiId = Number(process.env.TG_API_ID);
const apiHash = process.env.TG_API_HASH;

if (!apiId || !apiHash) {
  console.error(
    "\nMissing TG_API_ID / TG_API_HASH.\n" +
      "Get them free at https://my.telegram.org -> 'API development tools',\n" +
      "then copy .env.example to .env and fill them in.\n",
  );
  process.exit(1);
}

const client = new TelegramClient(new StringSession(""), apiId, apiHash, {
  connectionRetries: 5,
});

await client.start({
  phoneNumber: async () =>
    await input.text("Your phone (with country code, e.g. +14155551234): "),
  password: async () =>
    await input.text("2FA password (press Enter if you have none): "),
  phoneCode: async () =>
    await input.text("The login code Telegram just sent you: "),
  onError: (err) => console.error(err),
});

const sessionString = client.session.save();
writeFileSync(new URL("./session.txt", import.meta.url), sessionString);

console.log("\n✓ Logged in. Session saved to connectors/telegram/session.txt");
console.log("  Now run:  npm run sync");
await client.disconnect();
process.exit(0);
