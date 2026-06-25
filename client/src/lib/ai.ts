/**
 * OneChat AI assistant (Sprint 4, started).
 *
 * Two consent-based actions over a conversation: summarize it, and draft a
 * reply. Everything here is suggest-then-approve — the AI never sends.
 *
 * Provider seam:
 *  - PRODUCTION: set EXPO_PUBLIC_AI_URL to a server endpoint (a Supabase Edge
 *    Function) that holds the Anthropic key and calls the latest Claude model.
 *    The key is NEVER shipped to the client — required for a customer product.
 *  - NOW (no endpoint yet): a local heuristic stands in so the UX works and is
 *    demoable today. Swapping to real Claude is a config change, not a rewrite.
 */
import type { Contact, Message } from '@/data/types';

const AI_URL = process.env.EXPO_PUBLIC_AI_URL ?? '';

/** 'live' once a server endpoint (real Claude) is configured; else 'demo'. */
export const aiMode: 'live' | 'demo' = AI_URL ? 'live' : 'demo';

export type AiAction = 'summarize' | 'draft_reply';

interface AiRequest {
  action: AiAction;
  contact: Contact;
  messages: Message[];
}

async function callEndpoint(req: AiRequest): Promise<string> {
  const res = await fetch(AI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(`AI endpoint ${res.status}`);
  const data = (await res.json()) as { text?: string };
  if (!data.text) throw new Error('AI endpoint returned no text');
  return data.text;
}

const firstName = (c: Contact) => c.name.split(' ')[0];
const truncate = (s: string, n = 90) => (s.length > n ? `${s.slice(0, n)}…` : s);

/** Local stand-in summary — replaced by real Claude when AI_URL is set. */
function localSummarize(contact: Contact, messages: Message[]): string {
  if (messages.length === 0) return `No messages with ${contact.name} yet.`;
  const last = messages[messages.length - 1];
  const who = last.sender === 'me' ? 'you' : firstName(contact);
  const fromThem = messages.filter((m) => m.sender === 'them').length;
  const openQuestion = [...messages]
    .reverse()
    .find((m) => m.sender === 'them' && m.text.includes('?'));
  const lead =
    `${messages.length} message${messages.length === 1 ? '' : 's'} with ` +
    `${contact.name} on ${contact.platform} (${fromThem} from them). ` +
    `Last, from ${who}: “${truncate(last.text)}”.`;
  return openQuestion
    ? `${lead} Open question to answer: “${truncate(openQuestion.text)}”`
    : lead;
}

/** Local stand-in draft reply — replaced by real Claude when AI_URL is set. */
function localDraftReply(contact: Contact, messages: Message[]): string {
  const lastThem = [...messages].reverse().find((m) => m.sender === 'them');
  if (!lastThem) return `Hi ${firstName(contact)}, `;
  const t = lastThem.text.trim();
  if (t.endsWith('?')) return `Good question — `;
  if (/thank|thanks|appreciate/i.test(t)) return `Of course! Happy to help.`;
  if (/birthday|congrats|congratulations/i.test(t)) return `Thank you so much! 💙`;
  if (/upload|send|share|deck|file|attach/i.test(t)) return `On it — sending that over now.`;
  if (/meet|call|seat|spot|3\b|time/i.test(t)) return `Sounds good — see you then.`;
  return `Got it, thanks ${firstName(contact)} — `;
}

export async function summarizeThread(
  contact: Contact,
  messages: Message[],
): Promise<string> {
  if (aiMode === 'live') {
    return callEndpoint({ action: 'summarize', contact, messages });
  }
  return localSummarize(contact, messages);
}

export async function draftReply(
  contact: Contact,
  messages: Message[],
): Promise<string> {
  if (aiMode === 'live') {
    return callEndpoint({ action: 'draft_reply', contact, messages });
  }
  return localDraftReply(contact, messages);
}
