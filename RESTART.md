# OneChat — Fast Restart

> Drop-in context to resume instantly. Last checkpoint: 2026-06-26.

## Where things stand
- **Desktop widget** runs: `cd desktop && npm start`. Frameless right-edge rail + drawer hub.
- **Telegram connector** is LIVE — logged in, real chats synced.
- **Gmail connector** is BUILT but not yet logged in (no `token.json` yet).
- **Two-way send is REAL now** (was a fake UI append before) for both channels —
  CLI + wired into the drawer's Send button. ⚠️ Live: a send goes to a real person.

## Resume the widget (30 sec)
```
cd desktop && npm start
```
Telegram chats appear automatically (reads `connectors/telegram/onechat-live.json`).

## Refresh Telegram data
```
cd connectors/telegram && npm run sync
```

## Turn on Gmail (first time — ~3 steps)
1. `connectors/gmail/.env` ← your Google OAuth client (see `.env.example`; "Desktop app" type).
2. `cd connectors/gmail && npm install && npm run login`  (browser → approve).
3. `npm run sync`  → real email shows in the widget next to Telegram.

## Test SENDING safely first
Don't test against a real contact. Use a safe target:
```
# Telegram — send to one of your synced threads (test on a throwaway/self first)
cd connectors/telegram && npm run send -- <threadId> "test from OneChat"
# Gmail — replies in-thread to that thread's sender
cd connectors/gmail && npm run send -- <gm-threadId> "test from OneChat"
```
threadIds are the `id` fields in each connector's `onechat-live.json`.
In the widget, Send now: dims the bubble while sending → turns red "not sent" on failure.

## Next up (priority order)
1. **Onboarding for non-technical users** — the open problem. Login is still a terminal
   step; the goal is in-app "Connect Telegram" / "Sign in with Google" buttons.
2. `RISKS.md` — honest platform headwinds (Telegram scale-flagging, Gmail CASA audit, SMS limits).
3. **Matrix** connector — cheapest *correct* 3rd channel (open protocol, no ToS risk).
4. AI sprints — start AI-0 (provider seam) → AI-2 (voice ghostwriter). See `plans/ai-sprints.md`.

## Map
- `desktop/` — Electron widget (main.js, preload.js, rail.html, drawer.html)
- `connectors/telegram/`, `connectors/gmail/` — login.mjs / sync.mjs / send.mjs each
- `connectors/LIBRARY.md` — full connector catalog + multi-tenant auth model
- `ROADMAP.md` — paper-grounded feature tiers · `plans/ai-sprints.md` — AI plan

## Never commit (gitignored, per-connector)
`.env`, `session.txt`, `token.json`, `onechat-live.json` — secrets + your real messages.
