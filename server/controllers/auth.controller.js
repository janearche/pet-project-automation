import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { createSession, readSession } from '../auth.js';
import {
  demoEmail,
  demoPasswordHash,
  sessionCookieName,
  sessionCookieSecure,
  sessionTtlSeconds,
} from '../config.js';
import { createUser, getPreferences, getUserByEmail, getUserById } from '../store.js';
import { readCookie } from '../middleware/require-auth.js';

const userId = 'demo-user';

function publicUser(id, email, name) {
  return { id, email, name };
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

function storedPasswordMatches(candidate, user) {
  if (typeof candidate !== 'string' || candidate.length < 1 || candidate.length > 256) return false;
  const candidateHash = scryptSync(candidate, user.passwordSalt, 64);
  const storedHash = Buffer.from(user.passwordHash, 'hex');
  return storedHash.length === candidateHash.length && timingSafeEqual(candidateHash, storedHash);
}

function issueSession(res, id) {
  setSessionCookie(res, createSession(id), sessionTtlSeconds);
}

export async function login(req, res) {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = req.body?.password;
  if (email === demoEmail) {
    if (!passwordMatches(password)) return res.status(401).json({ message: 'That email and password do not match.' });
    const preferences = await getPreferences(userId);
    issueSession(res, userId);
    return res.json({ user: publicUser(userId, demoEmail, preferences.displayName) });
  }
  const user = await getUserByEmail(email);
  if (!user || !storedPasswordMatches(password, user)) return res.status(401).json({ message: 'That email and password do not match.' });
  const preferences = await getPreferences(user.id);
  issueSession(res, user.id);
  res.json({ user: publicUser(user.id, user.email, preferences.displayName) });
}

export async function register(req, res) {
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = req.body?.password;
  if (!name || name.length > 50) return res.status(400).json({ message: 'Name must be 1 to 50 characters.' });
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: 'Enter a valid email address.' });
  if (typeof password !== 'string' || password.length < 8 || password.length > 128) return res.status(400).json({ message: 'Password must be 8 to 128 characters.' });
  if (email === demoEmail) return res.status(409).json({ message: 'An account with this email already exists.' });

  const passwordSalt = randomBytes(16).toString('hex');
  const passwordHash = scryptSync(password, passwordSalt, 64).toString('hex');
  const user = await createUser({ name, email, passwordSalt, passwordHash });
  if (!user) return res.status(409).json({ message: 'An account with this email already exists.' });
  issueSession(res, user.id);
  res.status(201).json({ user: publicUser(user.id, user.email, user.name) });
}

export function logout(_req, res) {
  setSessionCookie(res, '', 0);
  res.status(204).end();
}

export async function me(req, res) {
  const session = readSession(readCookie(req.headers.cookie, sessionCookieName));
  if (!session) return res.status(401).json({ message: 'Please sign in to continue.' });
  if (session.userId === userId) {
    const preferences = await getPreferences(userId);
    return res.json({ user: publicUser(userId, demoEmail, preferences.displayName) });
  }
  const user = await getUserById(session.userId);
  if (!user) return res.status(401).json({ message: 'Please sign in to continue.' });
  const preferences = await getPreferences(user.id);
  res.json({ user: publicUser(user.id, user.email, preferences.displayName) });
}
