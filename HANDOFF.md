# OneChat Handoff

Last checked: 2026-06-24

## Repos and branches

- Active repo: `C:\Users\matto\OneChat`
- Remote: `https://github.com/MODOMison/OneChat.git`
- Current branch: `sprint-1-supabase-auth`
- Current commit: `7e2af16 Sprint 1: live Supabase client + email auth + route guard`
- Branch is clean and tracks `origin/sprint-1-supabase-auth`.

Older prototype repo:

- Path: `C:\Users\matto\OneChatPrototype`
- Remote: `https://github.com/MODOMison/OneChat.git`
- Pushed commit: `e66dee2 Merge remote-tracking branch 'origin/main'`
- Contains the PowerShell/WPF mini hub prototype.
- Local-only untracked prototype files remain there: `index.html`, `OneChatApp.ps1`, `OneChatOverlay.ps1`.

## What exists now

`C:\Users\matto\OneChat` is the later Expo/Supabase version. It includes:

- Expo app in `client/`
- Supabase migration in `supabase/migrations/0001_init.sql`
- Product/build plan in `PLAN.md`
- Expanded sprint blueprint in `plans/onechat-hub-and-ai-build.md`
- Legacy PowerShell mini app files at repo root

Current app state:

- Phase 0 UI scaffold exists.
- Sprint 1 auth branch exists and is pushed.
- Supabase client is wired in `client/src/lib/supabase.ts`.
- Auth context is in `client/src/data/auth.tsx`.
- Sign-in/sign-up screen is in `client/src/app/sign-in.tsx`.
- Protected app routes are under `client/src/app/(app)/`.
- `.env.example` documents `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
- `npx.cmd tsc --noEmit` passes from `client/`.

Important limitation:

- The inbox/chat data store is still in-memory seed data in `client/src/data/store.tsx`.
- Real Postgres-backed inbox/realtime work has not been done yet.
- Telegram, Gmail, SMS, and AI assistant connector work has not started in code.

## Next step

Continue with Sprint 2 from `plans/onechat-hub-and-ai-build.md`:

1. Seed the Supabase database with the current seed contacts/messages.
2. Rewrite `client/src/data/store.tsx` to use Supabase tables and realtime subscriptions while keeping the same store API.
3. Insert sent messages into Postgres with pending/sent status.
4. Verify two signed-in browser tabs update in realtime.
5. Run `cd client && npx.cmd tsc --noEmit`.

## Notes for future agents

- Use `git -c safe.directory=C:/Users/matto/OneChat ...` if Git complains about dubious ownership in the sandbox.
- PowerShell blocks `npx.ps1`; use `npx.cmd` instead.
- Do not commit secrets. Keep real Supabase keys in `client/.env`.
- Root `README.md` still describes the old PowerShell mini app and should be updated once the Expo app becomes the main path.
- `client/README.md` is still the default Expo README.
