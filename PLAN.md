# OneChat — Build Plan

> A cross-platform messaging **hub**: pool your messaging accounts into one unified
> inbox, designed around the usability findings from the DSGN 1 "Analysis of Instant
> Messaging Apps" study (Atienza, Yum, Aftahi, Odom — FA24).

Origin: `Downloads/Project 3_ Analysis of Instant Messaging Apps.pdf`
Existing mock: `C:\Users\matto\OneChatPrototype\` (Windows WPF/PowerShell, fake data)

---

## 1. Product thesis

People juggle the same conversations across iMessage, Discord, WhatsApp, Gmail, and SMS.
That juggling causes the four errors the study documented:

1. **Messaging the wrong person** (14/16 interviewees had done it) — small recipient UI.
2. **Hidden search** — users scroll for 15s+ instead of finding the search bar.
3. **Autocorrect against your will** — 12/16 hit autocorrect slips, but still rely on it.
4. **Hidden edit/undo + attach** — shake-to-undo, 3-finger tap, buried attach buttons.

OneChat's answer: **one inbox, one search bar, and signifiers that are impossible to miss.**

### Signature UX (the differentiators — straight from the Norman analysis)
- **Big recipient header** — large name + photo + platform badge, "send guard" before send.
- **Unified search** — one bar searches every platform + history.
- **Smart-replace-with-consent** — corrections preview and ask before applying (the "Fix"
  button in the prototype), never overwrite silently.
- **One edit affordance** — single visible undo/redo, no hidden gestures.
- **Obvious attach** — clear paperclip near send, big-file/link support.

---

## 2. Decisions (locked 2026-06-21)

| Decision | Choice | Why |
|---|---|---|
| Ambition | **Real working hub** | Real messages flowing, no ToS landmines |
| v1 platforms | **Telegram → Email → SMS** | Only ones with legitimate personal APIs |
| Form factor | **Expo (React Native)** | One codebase → iOS + Android + web |
| Backend | **Supabase** | Reuses known stack (Postgres, auth, realtime, storage) |
| Overlay | **Deferred** | Android/desktop-only, fiddly; hub is the valuable core |

### Platform feasibility (why this order)
| Platform | Status | Approach |
|---|---|---|
| Telegram | ✅ Legit | MTProto client API (GramJS) with user's own account |
| Email | ✅ Legit | Gmail API (OAuth) first, generic IMAP/SMTP later |
| SMS | ✅ Android only | Native module, dev build, READ/RECEIVE_SMS perms |
| Discord | ⚠️ Bot API only | Personal DM reading violates ToS — bot/server mode only |
| WhatsApp | ⚠️ Ban risk | Unofficial libs only — defer / skip |
| iMessage | ❌ No API | Needs always-on Mac bridge (BlueBubbles) — defer / skip |

---

## 3. Architecture

```
┌─────────────────────────────────────────────┐
│  Expo app (iOS / Android / web)              │
│  - Unified inbox UI (port of prototype)      │
│  - Realtime subscription to message store    │
└───────────────┬─────────────────────────────┘
                │ Supabase client (auth + realtime)
┌───────────────▼─────────────────────────────┐
│  Supabase                                    │
│  - Postgres: unified message store           │
│  - Auth: user accounts                        │
│  - Storage: attachments                       │
│  - Edge Functions: connector webhooks/sends  │
└───────────────┬─────────────────────────────┘
                │ normalize in / send out
┌───────────────▼─────────────────────────────┐
│  Connectors (one per platform)               │
│  Telegram (GramJS) | Email (Gmail API) | SMS │
│  Each: fetch → normalize → store → realtime   │
│        and: app request → send via platform   │
└─────────────────────────────────────────────┘
```

**Core idea:** every connector normalizes platform messages into one schema. The app never
talks to a platform directly — it reads/writes the unified store and connectors sync both ways.

### Unified data model (Postgres)
- `accounts` — user's connected platform accounts (platform, encrypted tokens/session)
- `contacts` — normalized people; can merge one human across platforms later
- `threads` — a conversation (platform-scoped; optional cross-platform merge in a later phase)
- `messages` — id, thread_id, account_id, sender (me/them), body, ts, platform, status
- `attachments` — id, message_id, name, storage_path, size, mime

Security: tokens encrypted at rest; never log message bodies; OAuth where available;
authorized-use only (your own accounts).

---

## 4. Phased roadmap

### Phase 0 — Scaffold + UI shell (no real platforms yet)
- Expo + Expo Router + TypeScript project.
- Supabase project, schema above, RLS policies.
- Port the prototype's UI to mobile: inbox list, conversation view, big recipient
  header, search bar, attach, send. Drive it with **seed data** so the UI is real day one.
- Goal: a beautiful, working hub UI over fake data — the "polished simulation" as a milestone.

### Phase 1 — First real connector: Telegram
- GramJS auth (phone login, session string stored encrypted).
- Sync DMs → normalize → store. Realtime updates in app.
- Send from app → out via Telegram. **End-to-end real messages.**

### Phase 2 — Email (Gmail)
- Gmail OAuth, fetch threads, normalize, send. Generic IMAP/SMTP as a stretch.

### Phase 3 — Signature UX polish
- Send-guard, unified cross-platform search, smart-replace-with-consent, undo/redo.

### Phase 4 — SMS (Android)
- Expo dev build + native SMS module, permissions, default-SMS-app flow.

### Phase 5 — Later / exploratory
- Floating overlay (Android + desktop). WhatsApp / iMessage bridges (high cost).
- Cross-platform identity merge ("one human, many apps").

---

## 5. Open questions for later
- Self-hosted connectors vs. Supabase Edge Functions vs. a small always-on Node worker
  (Telegram MTProto sessions may want a persistent process).
- How aggressively to merge identities across platforms.
- Monetization / whether this becomes a product or stays portfolio + class artifact.

---

## 6. Next session
Start **Phase 0**: scaffold the Expo app and stand up the Supabase schema, then port the
prototype UI over seed data.
