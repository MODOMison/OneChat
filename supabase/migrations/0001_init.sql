-- OneChat unified message store (Phase 0 schema).
-- Not yet wired to the app — the client runs on in-memory seed data for now.
-- Connectors (Telegram, Gmail, SMS) will populate these tables in later phases.

-- Each connected platform account belongs to a OneChat user.
create table if not exists accounts (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  platform     text not null check (platform in
                 ('telegram','gmail','sms','imessage','discord','instagram','whatsapp','other')),
  display_name text,
  -- Encrypted connector credentials/session. Never store plaintext tokens.
  secret_ref   text,
  created_at   timestamptz not null default now()
);

-- Normalized people. One human may later be merged across platforms.
create table if not exists contacts (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  account_id   uuid references accounts (id) on delete set null,
  name         text not null,
  initials     text,
  platform     text not null,
  created_at   timestamptz not null default now()
);

-- A conversation (platform-scoped; cross-platform merge is a later phase).
create table if not exists threads (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  contact_id   uuid not null references contacts (id) on delete cascade,
  account_id   uuid references accounts (id) on delete set null,
  platform     text not null,
  last_at      timestamptz,
  created_at   timestamptz not null default now()
);

create table if not exists messages (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  thread_id    uuid not null references threads (id) on delete cascade,
  sender       text not null check (sender in ('me','them')),
  body         text not null default '',
  platform     text not null,
  status       text not null default 'sent' check (status in ('sending','sent','failed')),
  sent_at      timestamptz not null default now()
);

create table if not exists attachments (
  id           uuid primary key default gen_random_uuid(),
  message_id   uuid not null references messages (id) on delete cascade,
  name         text not null,
  storage_path text not null,
  size_bytes   bigint,
  mime         text
);

create index if not exists idx_threads_user_last on threads (user_id, last_at desc);
create index if not exists idx_messages_thread_sent on messages (thread_id, sent_at);

-- Row-level security: a user only ever sees their own data.
alter table accounts    enable row level security;
alter table contacts    enable row level security;
alter table threads     enable row level security;
alter table messages    enable row level security;
alter table attachments enable row level security;

create policy "own accounts" on accounts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own contacts" on contacts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own threads" on threads
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own messages" on messages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own attachments" on attachments
  for all using (
    exists (
      select 1 from messages m
      where m.id = attachments.message_id and m.user_id = auth.uid()
    )
  );
