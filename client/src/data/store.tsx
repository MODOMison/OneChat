import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

import type { Contact, Message, SearchHit } from './types';
import { seedContacts, seedMessages } from './seed';

/**
 * In-memory store driving the Phase 0 UI. Mirrors the prototype's behaviors
 * (send, undo last sent, unified search). Later phases swap this for a Supabase
 * realtime-backed store without changing the screens that consume it.
 */
interface StoreValue {
  contacts: Contact[];
  getContact: (id: string) => Contact | undefined;
  threadMessages: (id: string) => Message[];
  lastMessage: (id: string) => Message | undefined;
  /** Threads ordered by most recent activity. */
  orderedContacts: Contact[];
  send: (contactId: string, text: string) => void;
  attach: (contactId: string, fileName: string) => void;
  undoLast: (contactId: string) => boolean;
  search: (query: string) => SearchHit[];
}

const StoreContext = createContext<StoreValue | null>(null);

function now(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [contacts] = useState<Contact[]>(seedContacts);
  const [messages, setMessages] = useState<Message[]>(seedMessages);

  const getContact = useCallback(
    (id: string) => contacts.find((c) => c.id === id),
    [contacts],
  );

  const threadMessages = useCallback(
    (id: string) =>
      messages.filter((m) => m.contactId === id).sort((a, b) => a.time.localeCompare(b.time)),
    [messages],
  );

  const lastMessage = useCallback(
    (id: string) => {
      const items = threadMessages(id);
      return items.length ? items[items.length - 1] : undefined;
    },
    [threadMessages],
  );

  const orderedContacts = useMemo(() => {
    const lastTime = (id: string) => lastMessage(id)?.time ?? '';
    return [...contacts].sort((a, b) => lastTime(b.id).localeCompare(lastTime(a.id)));
  }, [contacts, lastMessage]);

  const send = useCallback((contactId: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((prev) => [
      ...prev,
      { id: uid(), contactId, sender: 'me', text: trimmed, time: now() },
    ]);
  }, []);

  const attach = useCallback((contactId: string, fileName: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: uid(),
        contactId,
        sender: 'me',
        text: `Attached file: ${fileName}`,
        time: now(),
        attachmentName: fileName,
      },
    ]);
  }, []);

  const undoLast = useCallback(
    (contactId: string) => {
      let undone = false;
      setMessages((prev) => {
        const mine = prev.filter((m) => m.contactId === contactId && m.sender === 'me');
        if (mine.length === 0) return prev;
        const last = mine.reduce((a, b) => (a.time.localeCompare(b.time) >= 0 ? a : b));
        undone = true;
        return prev.filter((m) => m.id !== last.id);
      });
      return undone;
    },
    [],
  );

  const search = useCallback(
    (query: string): SearchHit[] => {
      const q = query.trim().toLowerCase();
      if (!q) return [];
      const hits: SearchHit[] = [];
      for (const m of messages) {
        const c = getContact(m.contactId);
        if (!c) continue;
        const haystack = `${m.text} ${c.name} ${c.platform} ${m.time}`.toLowerCase();
        if (haystack.includes(q)) hits.push({ message: m, contact: c });
      }
      return hits;
    },
    [messages, getContact],
  );

  const value: StoreValue = {
    contacts,
    getContact,
    threadMessages,
    lastMessage,
    orderedContacts,
    send,
    attach,
    undoLast,
    search,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within a StoreProvider');
  return ctx;
}
