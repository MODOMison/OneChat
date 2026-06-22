/**
 * Smart text replacement — OneChat's answer to "autocorrect against your will".
 * The key design rule from the study: NEVER rewrite silently. This returns a
 * suggestion; the UI must show before/after and let the user accept or keep
 * their original text.
 */

const EXPANSIONS: { pattern: RegExp; replacement: string }[] = [
  { pattern: /\bomw\b/gi, replacement: 'On my way' },
  { pattern: /\bbrb\b/gi, replacement: 'be right back' },
  { pattern: /\bttyl\b/gi, replacement: 'talk to you later' },
  { pattern: /\bidk\b/gi, replacement: "I don't know" },
  { pattern: /\bu\b/g, replacement: 'you' },
  { pattern: /\bur\b/gi, replacement: 'your' },
];

export interface FixResult {
  changed: boolean;
  original: string;
  suggestion: string;
}

export function suggestFix(text: string): FixResult {
  let suggestion = text;
  for (const { pattern, replacement } of EXPANSIONS) {
    suggestion = suggestion.replace(pattern, replacement);
  }
  return { changed: suggestion !== text, original: text, suggestion };
}
