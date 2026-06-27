# OneChat — AI Sprint Plan

> Sequenced build plan for OneChat's AI capabilities, derived from `ROADMAP.md`
> and grounded in the DSGN 1 origin study. Each sprint is self-contained with
> scope, guardrails, and acceptance criteria. Built on the existing AI seam
> (`client/src/lib/ai.ts` → server-side Edge Function holding the Anthropic key —
> **the key never ships to the client**).
>
> **Governing principle (from the study):** *preserve the user's original intent;
> automation is just a tool.* Every AI feature is suggest-then-approve by default.

---

## Sprint AI-0 — Foundation & provider seam `S`
**Goal:** one hardened path from app → AI, so every later sprint plugs in cleanly.
- Confirm `ai.ts` actions route through `EXPO_PUBLIC_AI_URL` (Supabase Edge Function); Anthropic key server-side only.
- `/status` health check; graceful "AI unavailable" empty state in the UI.
- Per-user usage metering + a hard monthly ceiling (cost guardrail).
- **Done when:** a round-trip `draftReply` works end-to-end with the key absent from the client bundle (grep the build to prove it).

## Sprint AI-1 — Smart-replace-with-consent `M` · *fixes study error #2*
**Goal:** fix "autocorrect against your will" (11/16 burned) — AI *suggests* a fix, never silently rewrites.
- Detect likely typos/garbles in the composer; surface a **"Fix"** chip with a preview diff.
- Apply **only on tap**; obvious spelling errors may auto-flag but still preview.
- Mirror the `smartReplace.ts` invariant: **NEVER rewrite silently.**
- **Done when:** typing a garbled phrase shows a consent preview; nothing changes without an explicit tap; reduced-motion respected.

## Sprint AI-2 — Voice-adaptive Ghostwriter `M` · *fixes study error #2 (its own AI prescription)*
**Goal:** AI drafts in *your* voice — the paper's literal "adapt to users' personal texting styles."
- Build a **style profile** from the user's own sent messages (`sender:'me'`), **keyed per-contact** (you text your mom ≠ your boss). Few-shot, **not** fine-tuning.
- Interaction ladder, lightest default first: **ghost text → suggestion chips → "help me write" → tone dial** (Warmer↔Plainer, Shorter↔Longer, Casual↔Formal).
- Draft always lands in the editable box; **send is always a separate human act.**
- Privacy: sample server-side under RLS; never persist transcripts in prompt logs; voice-profiling is **opt-in**; never mix one contact's words into another's draft.
- **Done when:** "help me write" produces a draft that visibly matches the user's register for that contact, fully editable before send.

## Sprint AI-3 — Thread summarize + Daily catch-up brief `S`
**Goal:** "what did I miss" across the pooled inbox.
- One-tap **summarize this thread** (extend existing `summarizeThread`).
- **Daily brief** surfaced on the desktop widget: a 30-sec digest across all channels since last open.
- **Done when:** the rail/drawer can show a morning "here's what you missed" card built from real thread data.

## Sprint AI-4 — Smart triage `M` · *net-new (high value)*
**Goal:** auto-bucket the pooled inbox so pooling *reduces* load instead of adding noise.
- Classify incoming into **Needs Reply / FYI / Low-priority / Newsletters** across Telegram+Gmail+SMS.
- A "Reply to these 5" focus view.
- **Done when:** the inbox shows correct buckets on seed + one live channel; misclassifications are one-tap correctable (the correction feeds back).

## Sprint AI-5 — Semantic / cross-platform search `M` · *extends study error #3*
**Goal:** "find the address Dana sent me" by **meaning**, across every channel.
- Embeddings over all messages (Supabase **pgvector**), RLS-scoped; server-side embedding via the Edge Function.
- Answer extraction ("It's 1422 Oak St"), not just a result list.
- **Done when:** a natural-language query returns the right message across platforms and extracts the answer.

## Sprint AI-6 — Relationship-Safe Mode + gated Autosend `L` · *highest-risk, ships last*
**Goal:** the powerful-but-dangerous automation, made safe.
- **Relationship-Safe Mode** (per-contact, on by default for partners/family/close):
  form-assist allowed (ghost text, tone dial), **emotional-message generation OFF, autosend hard-OFF** — a strong **adjustable** default, not a hard lock.
- **Tiered autonomy**, per-contact **allowlist (default off)**:
  Draft → **approval queue** → undo-window send (visible countdown) → narrow rule-based auto-reply.
- Every autosend routes through the **Send-Guard** (already shipped); **global kill-switch**; **daily "what I sent" digest**; full audit log (RLS).
- Intent classifier blocks sensitive categories (money/legal/conflict) from auto-send.
- **Done when:** no contact is autosend-eligible without explicit arming; partners are excluded by default; every autonomous send is logged, delayed, and undoable.

---

## Sequence & rationale
```
AI-0  Foundation
  └─ AI-1  Smart-replace-with-consent   (cheap, fixes error #2, builds trust)
  └─ AI-2  Voice Ghostwriter            (the paper's flagship AI idea)
  └─ AI-3  Summarize + Daily brief      (reuses existing assistant, high daily utility)
  └─ AI-4  Smart triage                 (makes the hub worth pooling)
  └─ AI-5  Semantic search              (the search superpower)
  └─ AI-6  Relationship-Safe + Autosend (only after everything above is solid)
```
**Ship trust-building, intent-preserving features first (AI-1, AI-2). Ship the
autonomous, high-stakes feature (AI-6) last, fully gated.** That order is both the
product strategy and the ethical line: *OneChat helps you communicate — it doesn't
impersonate you.*

## Cross-cutting guardrails (apply to every sprint)
- Suggest-then-approve by default; send is always a human act until AI-6's gated tiers.
- Anthropic key server-side only; usage metered with a hard ceiling.
- Never log message bodies; voice/embedding data RLS-scoped and opt-in.
- Respect `prefers-reduced-motion` and accessibility contrast on every AI surface.
