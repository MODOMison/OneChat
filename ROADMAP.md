# OneChat — Feature Roadmap

> Grounded in the origin study: Atienza, Yum, Aftahi, Odom — *"Analysis of Instant
> Messaging Apps,"* DSGN 1 FA24. That paper's "Design Space & Redesign" section
> literally coins "OneChat" and prescribes its feature DNA. The roadmap is ordered
> by that paper's documented error severity/frequency — **build the thesis before
> the bets.**

## The 5 documented errors (the ranking yardstick)

| # | Error | Evidence | Paper's prescribed fix |
|---|-------|----------|------------------------|
| 1 | **Wrong recipient** | 14/16 — "supersedes demographics… faulty design" | Large recipient name + profile photo, prompted early + recurring reminder |
| 2 | **Autocorrect against will** | 11/16 burned, yet 12/16 rely on it | AI adapts to personal texting style; ask before applying changes |
| 3 | **Hidden search** | 10/16 scrolled (avg 15.42s); only 6/16 found search | One unified search bar |
| 4 | **Hidden undo** | 9/16 didn't know shake-to-undo; 1/16 knew 3-finger tap | One synthesized undo/redo menu, no hidden gestures |
| 5 | **Attachments** | 6/16 couldn't complete on preferred non-iMessage platform | Obvious attach symbol near send |

---

## Tier A — the paper's 5 fixes (cheap, mandated, build FIRST)

1. **Send-Guard** — *fixes #1.* Big recipient name + **photo larger than the name**
   (face recognition is pre-attentive). Reminder fires only at **risk moments**
   (recipient switch, post-paste/attach, thread jump), never every send — a banner
   that repeats identically habituates into banner-blindness within days. `S`
   — *In progress on `feature/send-guard` (desktop widget `drawer.html`).*
2. **Voice-adaptive smart-replace / Ghostwriter** — *fixes #2.* Ghost-text → chips →
   tone dial; consent before applying. Few-shot from the user's own sent messages,
   keyed per-contact. **Academically mandated**, not a nice-to-have. `M`
3. **Single unified search bar** — *fixes #3.* Basic first, semantic later. `S`/`M`
4. **One synthesized undo/redo menu** — *fixes #4.* Always-visible signifier, zero
   gesture-only affordances (or OneChat reproduces the exact error it exists to fix). `S`
5. **Obvious attach affordance** — *fixes #5.* Clear symbol by send. `S`

## Tier B — thesis-extending hub intelligence

- **Cross-platform thread merge** ("Mom on SMS = Mom on Telegram") — the moat;
  the paper's literal "consolidate into one conversation, stop the juggling." `M`
- **Semantic search** — answers the paper's unsolved efficiency-vs-accuracy gap. `M`
- **Smart occlusion-aware placement** — Win32 `EnumWindows`/`GetForegroundWindow`
  (NOT cv2/OpenCV — the paper itself names compute cost as a tradeoff). Weight the
  **active window**, keep position **sticky**, animate relocations. `S`/`M`
- **Anchor options** — `right | bottom-corner` (avoid full bottom bar; it fights
  the OS taskbar). `S`
- **Unified DND / focus mode** with smart breakthrough. `S`/`M`

## Tier C — net-new bets (honestly labeled: NOT in the paper)

Smart triage · Relationship Memory (CRM-lite) · schedule-send + nudges · daily brief ·
privacy vault · task/commitment extraction · **AI autosend** (gated last).

---

## The AI + relationships call

Positioning + ethics line, converged by all reviewers:
**"OneChat helps you communicate; it doesn't impersonate you."**

- Per-contact **Relationship-Safe Mode**: form-assist on (ghost-text, tone dial),
  full emotional-message generation + autosend **off** for partners/family — as a
  strong **adjustable default**, not a hard lock (respects the paper's user-control ethos).
- **Autosend** (if ever shipped): tiered (Draft → approval queue → undo-window send →
  narrow auto-reply), per-contact allowlist, partners blocklisted by default, every
  send routes through the Send-Guard, global kill-switch, daily "what I sent" digest.

Faithful to the study's repeated principle: *preserve the user's original intent;
automation is just a tool.*

---

## Provenance
Synthesized from a 3-lens ECC agent review (architecture/feasibility, cognitive &
perceptual design, product/UX + AI ethics), each grounded against the source paper.
