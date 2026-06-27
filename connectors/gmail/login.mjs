// OneChat Gmail connector — one-time login.
// Signs into YOUR Google account via OAuth (the same "Sign in with Google" flow
// users already know), then saves a reusable refresh token to token.json. Run once:
//   cd connectors/gmail && npm install && npm run login
//
// Uses the loopback/desktop-app OAuth flow: we open your browser to Google's
// consent screen, spin up a tiny localhost server to catch the redirect, and
// exchange the returned code for tokens. No secrets ever leave your machine.
import "dotenv/config";
import { google } from "googleapis";
import { createServer } from "http";
import { writeFileSync } from "fs";

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  console.error(
    "\nMissing GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET.\n" +
      "Create an OAuth client (Desktop app) at https://console.cloud.google.com,\n" +
      "then copy .env.example to .env and fill them in.\n",
  );
  process.exit(1);
}

// readonly powers the sync (reading threads); send powers replies from the
// widget. Both are requested up front so login is one step and Send just works.
const SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
];
const PORT = 5858;
const REDIRECT = `http://localhost:${PORT}/oauth2callback`;

const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, REDIRECT);

const authUrl = oAuth2Client.generateAuthUrl({
  access_type: "offline", // get a refresh token so we don't re-login every sync
  prompt: "consent",
  scope: SCOPES,
});

// Wait for Google to redirect back to our localhost server with the auth code.
const code = await new Promise((resolve, reject) => {
  const server = createServer((req, res) => {
    if (!req.url.startsWith("/oauth2callback")) {
      res.writeHead(404).end();
      return;
    }
    const params = new URL(req.url, REDIRECT).searchParams;
    const err = params.get("error");
    const authCode = params.get("code");
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(
      "<h2 style='font-family:system-ui'>OneChat: you can close this tab and return to the terminal.</h2>",
    );
    server.close();
    if (err) reject(new Error(err));
    else resolve(authCode);
  });
  server.listen(PORT, () => {
    console.log("\nOpen this URL in your browser to authorize OneChat:\n");
    console.log(authUrl + "\n");
    console.log("(Waiting for you to approve access…)");
  });
});

const { tokens } = await oAuth2Client.getToken(code);
writeFileSync(new URL("./token.json", import.meta.url), JSON.stringify(tokens, null, 2));

console.log("\n✓ Logged in. Token saved to connectors/gmail/token.json");
console.log("  Now run:  npm run sync");
process.exit(0);
