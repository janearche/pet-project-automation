import { readSession } from '../auth.js';
import { sessionCookieName } from '../config.js';

function readCookie(header, name) {
  const prefix = `${name}=`;
  const item = (header || '').split(';').map((part) => part.trim()).find((part) => part.startsWith(prefix));
  if (!item) return null;
  try { return decodeURIComponent(item.slice(prefix.length)); }
  catch { return null; }
}

export function requireAuth(req, res, next) {
  const token = readCookie(req.headers.cookie, sessionCookieName);
  const session = readSession(token);
  if (!session) return res.status(401).json({ message: 'Please sign in to continue.' });
  req.user = { id: session.userId };
  next();
}

export { readCookie };
