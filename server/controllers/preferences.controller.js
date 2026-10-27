import { demoEmail } from '../config.js';
import { getPreferences, getUserById, updatePreferences } from '../store.js';

const timezones = new Set(['Europe/Prague', 'Europe/London', 'America/New_York', 'America/Los_Angeles', 'UTC']);

export async function get(req, res) {
  const profile = req.user.id === 'demo-user' ? { email: demoEmail } : await getUserById(req.user.id);
  if (!profile) return res.status(401).json({ message: 'Please sign in to continue.' });
  res.json({ preferences: await getPreferences(req.user.id), email: profile.email });
}

export async function update(req, res) {
  const input = req.body || {};
  const values = {};
  if (Object.hasOwn(input, 'displayName')) {
    const displayName = typeof input.displayName === 'string' ? input.displayName.trim() : '';
    if (!displayName || displayName.length > 50) return res.status(400).json({ message: 'Name must be 1 to 50 characters.' });
    values.displayName = displayName;
  }
  if (Object.hasOwn(input, 'timezone')) {
    if (!timezones.has(input.timezone)) return res.status(400).json({ message: 'Choose a supported time zone.' });
    values.timezone = input.timezone;
  }
  if (Object.hasOwn(input, 'weekStartsMonday')) values.weekStartsMonday = Boolean(input.weekStartsMonday);
  res.json({ preferences: await updatePreferences(req.user.id, values) });
}
