/**
 * OneChat brand palette and per-platform accent colors.
 * Kept separate from the template's `theme.ts` so the unified-inbox UI has a
 * single, consistent look regardless of light/dark system theme (Phase 0).
 */

export const Brand = {
  blue: '#2563EB',
  blueDark: '#1D4ED8',
  ink: '#172033',
  inkSoft: '#475467',
  inkFaint: '#667085',
  line: '#E1E7F0',
  bg: '#F5F8FC',
  card: '#FFFFFF',
  bubbleThem: '#F1F4F9',
  ok: '#0F9F6E',
  warn: '#D92D20',
} as const;

/** The messaging platforms OneChat pools. v1 targets: Telegram, Gmail, SMS. */
export type ChatPlatform =
  | 'iMessage'
  | 'Discord'
  | 'Gmail'
  | 'Instagram'
  | 'Telegram'
  | 'SMS'
  | 'WhatsApp'
  | 'Other';

export const PlatformColor: Record<ChatPlatform, string> = {
  iMessage: '#0F9F6E',
  Discord: '#5865F2',
  Gmail: '#D92D20',
  Instagram: '#C13584',
  Telegram: '#229ED9',
  SMS: '#2563EB',
  WhatsApp: '#25D366',
  Other: '#667085',
};

/** Stable per-contact avatar background, derived from the contact id. */
const AVATAR_COLORS = ['#2563EB', '#0F9F6E', '#C13584', '#229ED9', '#D97706', '#7C3AED'];
export function avatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}
