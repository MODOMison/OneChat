import type { ChatPlatform } from '@/constants/onechat';

/**
 * Unified data model. In Phase 0 this is fed by in-memory seed data; in later
 * phases the same shapes are filled by platform connectors via Supabase.
 */

export interface Contact {
  id: string;
  name: string;
  platform: ChatPlatform;
  initials: string;
}

export interface Message {
  id: string;
  contactId: string;
  sender: 'me' | 'them';
  text: string;
  /** ISO-ish "YYYY-MM-DD HH:mm" — matches the prototype's data file. */
  time: string;
  /** Set when this message is a file attachment (Phase 0 stub). */
  attachmentName?: string;
}

export interface SearchHit {
  message: Message;
  contact: Contact;
}
