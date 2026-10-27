import { scryptSync, timingSafeEqual } from 'node:crypto';
import { createSession, readSession } from '../auth.js';
import {
  demoEmail,
  demoPasswordHash,
  sessionCookieName,
  sessionCookieSecure,
  sessionTtlSeconds,
} from '../config.js';
import { getPreferences } from '../store.js';
import { readCookie } from '../middleware/require-auth.js';

const userId = 'demo-user';

function publicUser(preferences) {
  return { id: userId, email: demoEmail, name: preferences.displayName };
}

function setSessionCookie(res, token, maxAge) {
  const secure = sessionCookieSecure ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${sessionCookieName}=${encodeURIComponent(token)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${maxAge}${secure}`);
}

function passwordMatches(candidate) {
  if (typeof candidate !== 'string' || candidate.length < 1 || candidate.length > 256) return false;
  const salt = process.env.DEMO_PASSWORD_SALT || 'daymark-demo-salt';
  const candidateHash = scryptSync(candidate, salt, demoPasswordHash.length);
  return timingSafeEqual(candidateHash, demoPasswordHash);
}

export async function login(req, res) {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = req.body?.password;
  if (email !== demoEmail || !passwordMatches(password)) {
    return res.status(401).json({ message: 'That email and password do not match.' });
  }

  const token = createSession(userId);
  setSessionCookie(res, token, sessionTtlSeconds);
  const preferences = await getPreferences();
  res.json({ user: publicUser(preferences) });
}

export function logout(_req, res) {
  setSessionCookie(res, '', 0);
  res.status(204).end();
}

export async function me(req, res) {
  const session = readSession(readCookie(req.headers.cookie, sessionCookieName));
  if (!session) return res.status(401).json({ message: 'Please sign in to continue.' });
  const preferences = await getPreferences();
  res.json({ user: publicUser(preferences) });
}
