# Blueprint — OneChat: Communication Hub + AI Assistant

> **Objective:** Turn OneChat from a polished simulation (Phase 0, done) into a *working*
> cross-platform communication **hub** — one unified inbox pooling the user's real accounts
> (Telegram → Gmail → SMS) **plus an integrated AI assistant** ("1 place for all + AI assistance").
>
> **Mode:** git + GitHub available → full branch/PR workflow. Repo:
> `github.com/MODOMison/OneChat`, default branch `main`. Stack locked: Expo (SDK 56) + Supabase.
> AI features use the latest Claude models (Opus 4.8 / Sonnet 4.6 / Haiku 4.5).
>
> **Audience:** solo student dev who gets overwhelmed by complexity. Every sprint is sized to
> **one PR / one focused session** and ends with a *visible, demoable win*. Do them in order.
> Authorized-use only: the user's own accounts, legitimate personal APIs, no ToS-violating scrapers.

---

## How to use this file

Each sprint below is a **self-contained context brief** — a fresh agent (or a future you) can open
any one sprint and execute it cold without reading the others. Each has: why, what to build,
files, verification, rollback, and an exit criterion. Work top to bottom. Open a branch per sprint,
PR it, merge, then start the next.

Branch naming: `sprint-N-short-name`. After merge, delete the branch.

---

## Dependency graph

```
S1 (Supabase + auth)
      │
S2 (inbox on Postgres + realtime)
      │
      ├──────────────► S3 (Telegram connector)  ◄── the keystone: first REAL messages
      │                       │
      │                       ▼
S4 (AI assist v1: summarize + draft reply) ──► depends on real-ish threads (S2 ok, better after S3)
      │
S5 (AI unified search + triage)
      │
S6 (Gmail connector)  ── parallel-capable with S5 once S3's connector pattern exists
      │
S7 (polish + signature UX + deploy)
      │
S8 (SMS, Android — STRETCH / later)
```

**Parallelizable:** S5 and S6 share no files once S3 lands the connector pattern (S6 = connector
worker, S5 = app + edge function). Everything else is serial.

**Model tier per sprint:** strongest (Opus) for design-heavy/risky sprints (S3 connector
architecture, S4 AI plumbing); default (Sonnet) for the rest.

---

## Invariants (must hold true after EVERY sprint)

1. `cd client && npx tsc --noEmit` exits 0.
2. The Expo web app still boots and bundles (`npx expo start --web`, fetch the bundle → 200).
3. No secrets committed. Tokens/keys live in `.env` (gitignored) or Supabase secrets, never in git.
4. Authorized-use only: no code that reads accounts the user doesn't own.
5. Message bodies are never written to logs.

---

## Sprint 1 — Stand up live Supabase + auth

**Model:** default · **Depends on:** Phase 0 (done) · **Branch:** `sprint-1-supabase-auth`

**Why:** Everything real needs a live backend. Today the app runs on an in-memory seed store; the
schema migration exists (`supabase/migrations/0001_init.sql`) but no project hosts it.

**Context brief:** Expo app in `client/`. `supabase/migrations/0001_init.sql` defines
accounts/contacts/threads/messages/attachments. No Supabase client wired into the app yet.

**Build:**
1. Create a Supabase project (free tier). Save the project URL + anon key.
2. Apply `0001_init.sql` to it (Supabase SQL editor or `supabase db push`).
3. Add **RLS policies**: every table row scoped to `auth.uid()` (owner-only read/write).
4. `npm i @supabase/supabase-js` in `client/`. Add `client/src/lib/supabase.ts` reading
   `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` from `.env`.
5. Add a minimal auth gate: email magic-link or email+password sign-in screen
   (`src/app/sign-in.tsx`), redirect to inbox when authed. Keep it ugly; it just needs to work.
6. Add `.env.example` documenting the two public vars. Confirm `.env` is gitignored.

**Verify:** Sign in on web → land on inbox. In Supabase dashboard, RLS is ON for all tables.
`npx tsc --noEmit` clean.

**Rollback:** Revert the branch. Supabase project can stay; it's external.

**Exit:** A real user can authenticate, and the database exists with RLS. (Inbox still on seed data — that's S2.)

---

## Sprint 2 — Move the inbox onto Postgres (realtime)

**Model:** default · **Depends on:** S1 · **Branch:** `sprint-2-inbox-on-postgres`

**Why:** Make the existing beautiful UI read/write real rows so connectors have somewhere to land.

**Context brief:** UI lives in `src/app/index.tsx` (inbox + search) and `src/app/chat/[id].tsx`
(big recipient header, send-guard, smart-replace, attach, undo). Data flows through
`src/data/store.tsx` (in-memory). `src/data/types.ts` is the message/thread shape — align it to the
SQL schema.

**Build:**
1. Write `supabase/seed.sql` (or a small TS script) that inserts the current `src/data/seed.ts`
   content into Postgres so the DB isn't empty.
2. Rewrite `src/data/store.tsx` to back onto Supabase: load threads/messages with queries,
   subscribe to realtime `postgres_changes` for live updates. Keep the same store API the screens
   already call, so `index.tsx` / `chat/[id].tsx` change as little as possible.
3. Send path: writing a message inserts a row with `status='pending'` and shows local echo.
   (No real delivery yet — that's the connectors.)

**Verify:** Inbox + chat render from Postgres. Open two browser tabs signed in as the same user;
a send in one appears in the other (realtime). `tsc` clean, app bundles.

**Rollback:** Revert branch → store falls back to in-memory seed.

**Exit:** The hub UI runs entirely on the real database in realtime.

---

## Sprint 3 — Telegram connector (THE KEYSTONE: first real messages)

**Model:** strongest (Opus) · **Depends on:** S2 · **Branch:** `sprint-3-telegram-connector`

**Why:** This is the moment OneChat stops being a demo. Real Telegram DMs flow in and you can reply.
Highest risk/most learning — budget the most care here. Consider splitting into **3a (login + inbound
sync)** and **3b (outbound send)** if it feels big.

**Context brief:** PLAN.md picks Telegram first because GramJS (MTProto) lets a user log into their
*own* account legitimately. MTProto needs a **persistent process**, so connectors live in a small
Node worker, NOT in Expo or an edge function. Schema: `accounts` stores the encrypted session;
`threads`/`messages` are the unified store the app already reads (S2).

**Build:**
1. New `connectors/telegram/` Node (TypeScript) worker. `npm i telegram` (GramJS).
2. Get a Telegram `api_id`/`api_hash` from my.telegram.org (user's own). Store in worker `.env`.
3. **Login flow (3a):** phone number → code → produce a **session string**. Encrypt it and store in
   `accounts` (platform='telegram'). A one-time CLI login script is fine for v1.
4. **Inbound sync (3a):** on start, pull recent DMs; normalize each into a `contact` + `thread` +
   `messages` rows (sender me/them, body, ts, platform='telegram'); subscribe for new messages and
   upsert them. The app (S2 realtime) shows them automatically.
5. **Outbound (3b):** worker polls/subscribes for `messages` rows with `status='pending'` and
   `platform='telegram'`, sends them via GramJS, then sets `status='sent'` (or `failed`).
6. Never log message bodies. Encrypt the session at rest.

**Verify:** Send yourself a Telegram DM from your phone → it appears in OneChat within seconds.
Reply from OneChat → it arrives in Telegram. `accounts.session` is encrypted, not plaintext.

**Rollback:** Stop the worker; revert branch. App still works on whatever rows exist.

**Exit:** End-to-end **real** Telegram messaging through OneChat. 🎉

---

## Sprint 4 — AI assistant v1: summarize + draft reply

**Model:** strongest (Opus) · **Depends on:** S2 (works on any threads; best demoed after S3)
· **Branch:** `sprint-4-ai-assist`

**Why:** The "+ AI assistance" half of the product. Start with two high-value, low-risk features
that fit the existing **smart-replace-with-consent** philosophy (AI suggests, user approves — never
acts silently).

**Context brief:** The app already has a "consent" pattern (the smart-replace "Fix" button in
`src/lib/smartReplace.ts` / chat screen). AI must never auto-send. Claude API key is a **secret** →
calls go through a Supabase **Edge Function**, never from the client. Default models: Sonnet 4.6 for
quality drafting/summary; Haiku 4.5 if cost matters.

**Build:**
1. Supabase Edge Function `ai-assist` (Deno). Reads `ANTHROPIC_API_KEY` from Supabase secrets.
   Two actions: `summarize_thread` (input: thread messages → short summary) and `draft_reply`
   (input: thread + optional intent → suggested reply text).
2. `src/lib/ai.ts` client helper that calls the edge function (authenticated).
3. UI in `chat/[id].tsx`: an **AI button** in the header → "Summarize thread" shows a summary card;
   a **"Draft reply"** chip → fills the composer with the suggestion as editable text the user must
   review and press send on (reuse send-guard).
4. Use the `claude-api` skill / reference for exact model IDs and request shape. Do NOT guess the API.

**Verify:** Open a thread with several messages → Summarize returns a coherent 1–2 sentence summary.
Draft reply produces a sensible editable draft; nothing sends without the user pressing send.
API key never appears in client bundle.

**Rollback:** Revert branch; remove the edge function. Hub still works without AI.

**Exit:** Tap-to-summarize and consent-based AI draft replies, end to end.

---

## Sprint 5 — AI unified search + inbox triage

**Model:** default · **Depends on:** S4 · **Branch:** `sprint-5-ai-search-triage`

**Why:** Deliver the study's "unified search" promise, supercharged: search across every platform's
messages, and let AI surface what needs attention. Parallelizable with S6.

**Build:**
1. Extend the `ai-assist` edge function (or add `ai-search`): given a query, rank/return matching
   messages across all platforms (start with keyword + Claude re-rank; add embeddings later if
   needed). Wire it to the existing single search bar in `index.tsx`.
2. **Triage:** a cheap pass (Haiku 4.5) tags inbox threads (e.g. `needs_reply`, `fyi`, `low`).
   Store the tag on `threads`; show a small badge in the inbox list. Re-run on new messages.
3. Keep it consent-friendly: triage is advisory, never hides or deletes anything.

**Verify:** Search a term that exists in two platforms → both surface, ranked sensibly. Inbox shows
triage badges that match reality. Costs stay reasonable (Haiku for triage).

**Rollback:** Revert branch; search falls back to plain text match.

**Exit:** One search bar across all platforms + AI triage badges in the inbox.

---

## Sprint 6 — Gmail connector

**Model:** default · **Depends on:** S3 (reuses connector pattern) · parallel with S5
· **Branch:** `sprint-6-gmail-connector`

**Why:** Second real platform. Email is the universal one. Reuses the S3 connector worker shape.

**Build:**
1. `connectors/gmail/` worker. Gmail API + OAuth (user's own Google account, authorized scopes).
2. Fetch threads/messages → normalize into the same `contacts`/`threads`/`messages` schema
   (platform='email'). Subscribe/poll for new mail.
3. Outbound: same `status='pending'` → send via Gmail API → mark `sent` pattern as Telegram.

**Verify:** A recent email thread appears in OneChat's unified inbox alongside Telegram; replying
from OneChat sends a real email. OAuth tokens encrypted at rest.

**Rollback:** Stop worker; revert branch.

**Exit:** Telegram **and** Gmail in one inbox — the hub thesis proven across two platforms.

---

## Sprint 7 — Signature UX polish + deploy

**Model:** default · **Depends on:** S5, S6 · **Branch:** `sprint-7-polish-deploy`

**Why:** Make it a thing you can show people. Harden the four Norman/HCI differentiators from the
paper and ship a live build.

**Build:**
1. Polish send-guard (big recipient confirm), undo/redo (one visible affordance), obvious attach
   via Supabase Storage (real upload, not seed). Cross-platform search polish.
2. Empty/loading/error states for real network conditions. Auth edge cases.
3. Deploy: web to Vercel (or Expo hosting); an EAS build for Android so it runs on a phone.
4. Update `README.md` (currently describes the OLD prototype) and `PLAN.md` to match reality,
   including the AI assistant. Add a short "authorized-use" note.

**Verify:** Fresh device: sign in, see real Telegram + Gmail, summarize a thread, send a guarded
reply, attach a file. Web build is live at a URL; Android build installs.

**Rollback:** Revert branch; previous sprint state remains deployable.

**Exit:** A demoable, deployed OneChat — real messages from two platforms + working AI assistant.

---

## Sprint 8 — SMS (Android) — STRETCH / later

**Model:** default · **Depends on:** S7 · **Branch:** `sprint-8-sms-android`

**Why:** Completes the v1 platform trio. Deferred because it needs a native module + Expo dev build
+ Android default-SMS-app permissions — fiddly, Android-only, and not needed to prove the hub.

**Build:** Expo dev build, native SMS read/receive module, `READ_SMS`/`RECEIVE_SMS` perms,
normalize into the same schema (platform='sms'), send via the SMS API. Same connector contract.

**Exit:** SMS threads in the unified inbox on an Android device.

---

## Plan mutation protocol

If a sprint turns out too big (likely S3), **split it** (3a/3b) and note it here. If a sprint
becomes unnecessary, mark it `SKIPPED — reason`. Don't silently drop scope; leave the audit trail
so future-you knows what happened and why.

## Anti-patterns to avoid (review checklist)

- ❌ Calling Claude or MTProto directly from the Expo client (leaks secrets). Use edge fn / worker.
- ❌ AI that acts without consent (auto-sends, silently edits). Everything is suggest-then-approve.
- ❌ Committing `.env`, session strings, OAuth tokens, or API keys.
- ❌ Logging message bodies.
- ❌ Reading accounts the user doesn't own / any ToS-violating scraper.
- ❌ A second architecture: every connector follows the S3 contract (normalize-in / pending-out).
- ❌ Boiling the ocean: each sprint ships one demoable win; resist bundling.
