import { createHmac, timingSafeEqual } from 'node:crypto';
import { sessionSecret, sessionTtlSeconds } from './config.js';

function sign(value) {
  return createHmac('sha256', sessionSecret).update(value).digest('base64url');
}

export function createSession(userId) {
  const payload = Buffer.from(JSON.stringify({
    userId,
    expiresAt: Math.floor(Date.now() / 1000) + sessionTtlSeconds,
  })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function readSession(token) {
  if (!token || typeof token !== 'string') return null;
  const [payload, signature, extra] = token.split('.');
  if (!payload || !signature || extra) return null;

  const expected = Buffer.from(sign(payload));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;

  try {
    const value = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!value.userId || value.expiresAt <= Math.floor(Date.now() / 1000)) return null;
    return value;
  } catch {
    return null;
  }
}
