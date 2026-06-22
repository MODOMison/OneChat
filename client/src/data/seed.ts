import type { Contact, Message } from './types';

/**
 * Seed data ported from the prototype's onechat-data.json and expanded to cover
 * OneChat's v1 target platforms (Telegram, Gmail, SMS) so the unified inbox
 * shows real cross-platform variety on first launch.
 */

export const seedContacts: Contact[] = [
  { id: 'amelia', name: 'Amelia Yum', platform: 'iMessage', initials: 'AY' },
  { id: 'studio', name: 'Studio Group', platform: 'Discord', initials: 'SG' },
  { id: 'prof', name: 'Professor Lee', platform: 'Gmail', initials: 'PL' },
  { id: 'alex', name: 'Alex Atienza', platform: 'Instagram', initials: 'AA' },
  { id: 'elana', name: 'Elana Aftahi', platform: 'Telegram', initials: 'EA' },
  { id: 'mom', name: 'Mom', platform: 'SMS', initials: 'M' },
];

export const seedMessages: Message[] = [
  { id: 'm1', contactId: 'amelia', sender: 'them', text: 'Can you check the floating hub sketch?', time: '2026-06-21 08:30' },
  { id: 'm2', contactId: 'amelia', sender: 'me', text: 'Yes. The recipient area is larger so people do not message the wrong person.', time: '2026-06-21 08:32' },
  { id: 'm3', contactId: 'studio', sender: 'them', text: 'Upload the Project 3 deck here.', time: '2026-06-21 08:45' },
  { id: 'm4', contactId: 'prof', sender: 'them', text: 'I left feedback on your instant messaging analysis.', time: '2026-06-20 17:15' },
  { id: 'm5', contactId: 'elana', sender: 'them', text: 'omw to the studio, save me a seat!', time: '2026-06-21 09:02' },
  { id: 'm6', contactId: 'elana', sender: 'me', text: 'Got you a spot by the window.', time: '2026-06-21 09:03' },
  { id: 'm7', contactId: 'alex', sender: 'them', text: 'Design space chart is looking clean 🔥', time: '2026-06-19 21:40' },
  { id: 'm8', contactId: 'mom', sender: 'them', text: "Happy birthday sweetie! Call me when you're free.", time: '2026-06-18 07:10' },
  { id: 'm9', contactId: 'mom', sender: 'me', text: 'Thanks Mom! Will call after class 💙', time: '2026-06-18 07:25' },
];
