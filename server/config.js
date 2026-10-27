import { randomBytes, scryptSync } from 'node:crypto';

export const port = Number(process.env.API_PORT || process.env.PORT || 4318);
export const demoEmail = (process.env.DEMO_EMAIL || 'demo@daymark.local').trim().toLowerCase();
export const demoPassword = process.env.DEMO_PASSWORD || 'daymark-demo-123';
export const sessionSecret = process.env.SESSION_SECRET || 'local-development-secret-change-before-deploying';
export const sessionTtlSeconds = 60 * 60 * 24 * 7;

const passwordSalt = process.env.DEMO_PASSWORD_SALT || 'daymark-demo-salt';
export const demoPasswordHash = scryptSync(demoPassword, passwordSalt, 64);
export const sessionCookieName = 'daymark_session';
export const sessionCookieSecure = process.env.NODE_ENV === 'production';

if (process.env.NODE_ENV === 'production' && !process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET is required in production.');
}

if (passwordSalt === 'daymark-demo-salt' && process.env.NODE_ENV === 'production') {
  throw new Error('DEMO_PASSWORD_SALT must be set in production.');
}

export function createPasswordSalt() {
  return randomBytes(24).toString('hex');
}
