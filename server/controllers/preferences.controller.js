import { demoEmail } from '../config.js';
import { getPreferences, updatePreferences } from '../store.js';

const timezones = new Set(['Europe/Prague', 'Europe/London', 'America/New_York', 'America/Los_Angeles', 'UTC']);

export async function get(_req, res) {
  res.json({ preferences: await getPreferences(), email: demoEmail });
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
  res.json({ preferences: await updatePreferences(values) });
}
