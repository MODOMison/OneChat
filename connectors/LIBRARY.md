# OneChat — Comm-App Connector Library

> The catalog of messaging platforms OneChat can pool, with the **legitimate**
> integration path for each, auth model, two-way support, and effort. Ordered by
> feasibility. **Rule: your own accounts only — no ToS-violating scrapers.**
>
> Every connector normalizes into the unified schema (`accounts`, `contacts`,
> `threads`, `messages`, `attachments`) so the app never talks to a platform
> directly — it reads/writes the unified store and connectors sync both ways.

## Legend
- **2-way** — ✅ read + send · 📥 read only · 📤 send only
- **Auth** — how the user authorizes their own account
- **Effort** — `S` small · `M` medium · `L` large · `XL` very large
- **Status** — 🟢 build now · 🟡 viable, later · 🔴 high-cost / deferred · ⛔ ToS landmine

---

## Tier 1 — Legitimate personal APIs (build first)

| Platform | Approach | Auth | 2-way | Effort | Status |
|----------|----------|------|:-----:|:------:|:------:|
| **Telegram** | MTProto client API via **GramJS** (user account, not bot) | Phone login → encrypted session string | ✅ | `M` | 🟢 *started — `connectors/telegram/`* |
| **Email (Gmail)** | **Gmail API** (OAuth) — threads, send | Google OAuth | ✅ | `M` | 🟢 |
| **Email (generic)** | **IMAP/SMTP** — any provider | App password / OAuth | ✅ | `M` | 🟡 |
| **SMS (Android)** | Native module, dev build, `READ_SMS`/`RECEIVE_SMS`/default-SMS-app | OS permission grant | ✅ | `L` | 🟡 *Android only* |

**Why these first:** each has a real, sanctioned way to access *your own* account, so
there's no ban risk. Telegram + Email + SMS is the v1 set locked in `PLAN.md`.

---

## Tier 2 — Viable via official APIs (with caveats)

| Platform | Approach | Auth | 2-way | Effort | Status | Caveat |
|----------|----------|------|:-----:|:------:|:------:|--------|
| **Matrix** | Open federated protocol; mature client SDKs | Homeserver login / access token | ✅ | `M` | 🟡 | Easiest to do *right* — open protocol, no ToS risk |
| **Slack** | Web API + Socket Mode / Events API | OAuth (workspace) | ✅ | `M` | 🟡 | Per-workspace; great for work hubs |
| **Discord** | **Bot API only** (servers + bot DMs) | Bot token + OAuth | ✅ | `M` | 🟡 | Reading your *personal* DMs via a user token = ⛔ ToS ban. Bot/server mode only. |
| **Signal** | `signal-cli` bridge (unofficial but tolerated) | Link as a secondary device (QR) | ✅ | `L` | 🟡 | No official API; needs a persistent local process |
| **WhatsApp (official)** | **WhatsApp Business / Cloud API** | Meta business verification | ✅ | `L` | 🟡 | Business numbers only; not personal accounts |

---

## Tier 3 — Hard / deferred (no clean personal API)

| Platform | Reality | Approach if pursued | Effort | Status |
|----------|---------|---------------------|:------:|:------:|
| **iMessage** | No API at all | Always-on **Mac bridge** (e.g. BlueBubbles) relaying to OneChat | `XL` | 🔴 |
| **Instagram DM** | Personal DM access not offered | **Graph API** only covers *Business/Creator* accounts + Messenger inbox | `L` | 🔴 |
| **Facebook Messenger** | Personal inbox closed | **Graph API** for *Pages* only (business messaging) | `L` | 🔴 |
| **WhatsApp (personal)** | Unofficial libs = ban risk | Web-reverse libs (`whatsapp-web.js` etc.) — fragile, against ToS | `L` | ⛔ |
| **SMS (iOS)** | Sandbox blocks SMS access | None — Apple offers no API | — | ⛔ |

---

## Out of scope (not real messaging connectors)
The origin study's app list also ranked **Zoom Chat**, **ChatGPT**, and bare web
mail — these are either meeting-bound chat (Zoom) or not interpersonal messaging
(ChatGPT). Not connector targets; listed only because the study polled them.

---

## Recommended integration order
1. **Telegram** — already in progress; the proof of the whole hub thesis (end-to-end real messages).
2. **Gmail** — highest-value second channel; OAuth is well-trodden.
3. **Matrix** — the cheapest *correct* third channel (open protocol, no ToS tightrope) — good for demoing breadth.
4. **SMS (Android)** — completes the `PLAN.md` v1 trio; needs a dev build.
5. **Slack / Discord(bot)** — work-context expansion once personal channels are solid.
6. Defer iMessage / Instagram / FB Messenger / WhatsApp-personal until the core hub is proven — each is `L`/`XL` and/or a ToS minefield.

## Architecture note
Telegram (MTProto) and Signal (`signal-cli`) want a **persistent process** to hold
the session — so the connector layer likely needs a small always-on Node worker
rather than only Supabase Edge Functions (this is the open question flagged in
`PLAN.md §5`). Tokens/sessions encrypted at rest; never log message bodies.

---

## Multi-tenant auth model (mass users)

**The critical distinction: one *app* credential per platform (owned by OneChat),
plus one *account* credential per user (owned by the user).** Mass users never
register their own developer keys — they just authorize their own account in-app.

| Platform | App-level credential (OneChat owns, **server-side, 1 total**) | Per-user credential (created at login) | What the user does |
|----------|---------------------------------------------------------------|----------------------------------------|--------------------|
| **Telegram** | `api_id` / `api_hash` (identifies the *app* to Telegram) | **Session string** (the real per-user secret) | Enter phone → SMS code → 2FA, in-app |
| **Gmail** | OAuth client ID/secret | OAuth access/refresh token | "Sign in with Google" |
| **Slack** | App OAuth credentials | Per-workspace token | "Add to Slack" |
| **SMS (Android)** | — | OS permission grant | Approve the permission prompt |

**Rules:**
- App credentials live **only** in the server/Edge Function — **never shipped to the client**.
- Per-user secrets (Telegram session, OAuth tokens) are stored **encrypted at rest** in
  Supabase under RLS, scoped to that user — never in a local file (the connector CLI's
  local `session.txt` / `onechat-live.json` are **dev prototype only**).
- The terminal login flow (`login.mjs`) becomes an **in-app** phone→code→2FA screen in production.
- ⚠️ A single Telegram `api_id` serving many accounts can be rate-limited or flagged —
  a real launch needs per-user rate limits and possibly registering the `api_id` with Telegram.

**For local dev/testing:** use your own `api_id`/`api_hash` in `connectors/telegram/.env`
to prove the connector end-to-end. That same pair becomes the app-level server credential
at launch; users then just log in with their phone.
