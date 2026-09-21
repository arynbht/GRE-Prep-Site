import { randomBytes, randomUUID, scrypt, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
import type { NextFunction, Request, Response } from 'express';
import { db } from './db.js';
import { HttpError } from './http.js';

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number,
) => Promise<Buffer>;

const KEY_LENGTH = 64;
const SESSION_DAYS = 30;
export const SESSION_COOKIE = 'gre_session';

export type ThemePreference = 'light' | 'dark' | 'system';

export interface SessionUser {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
  /** Source of truth across devices. localStorage is only a paint-time cache. */
  theme: ThemePreference;
}

export function readTheme(value: unknown): ThemePreference {
  return value === 'light' || value === 'dark' ? value : 'system';
}

declare module 'express-serve-static-core' {
  interface Request {
    /** Set by `attachUser` on every request; null when signed out. */
    user?: SessionUser | null;
  }
}

// --------------------------------------------------------------- passwords

/**
 * Hashes with scrypt from Node's standard library, so there is no native
 * dependency to build. The salt is stored alongside the hash.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await scryptAsync(password, salt, KEY_LENGTH);
  return 'scrypt$' + salt.toString('hex') + '$' + derived.toString('hex');
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
  const salt = Buffer.from(parts[1], 'hex');
  const expected = Buffer.from(parts[2], 'hex');
  if (expected.length !== KEY_LENGTH) return false;
  const derived = await scryptAsync(password, salt, KEY_LENGTH);
  return timingSafeEqual(derived, expected);
}

// ---------------------------------------------------------------- sessions

/**
 * The cookie carries a random token; only its SHA-256 is stored. A leaked
 * database row therefore cannot be replayed as a session.
 */
function tokenToId(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export async function createSession(userId: string): Promise<{ token: string; expiresAt: Date }> {
  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.execute({
    sql: 'INSERT INTO sessions (id, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)',
    args: [tokenToId(token), userId, new Date().toISOString(), expiresAt.toISOString()],
  });
  return { token, expiresAt };
}

export async function destroySession(token: string): Promise<void> {
  await db.execute({ sql: 'DELETE FROM sessions WHERE id = ?', args: [tokenToId(token)] });
}

async function userForToken(token: string): Promise<SessionUser | null> {
  const result = await db.execute({
    sql:
      'SELECT u.id, u.email, u.display_name, u.created_at, u.theme, s.expires_at ' +
      'FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.id = ?',
    args: [tokenToId(token)],
  });
  const row = result.rows[0];
  if (!row) return null;
  if (new Date(String(row.expires_at)).getTime() < Date.now()) {
    await destroySession(token);
    return null;
  }
  return {
    id: String(row.id),
    email: String(row.email),
    displayName: String(row.display_name),
    createdAt: String(row.created_at),
    theme: readTheme(row.theme),
  };
}

// ----------------------------------------------------------------- cookies

/** Minimal cookie parsing, so no extra dependency is needed. */
export function readCookie(req: Request, name: string): string | null {
  const header = req.headers.cookie;
  if (!header) return null;
  for (const part of header.split(';')) {
    const index = part.indexOf('=');
    if (index === -1) continue;
    if (part.slice(0, index).trim() !== name) continue;
    return decodeURIComponent(part.slice(index + 1).trim());
  }
  return null;
}

export function setSessionCookie(res: Response, token: string, expiresAt: Date): void {
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
    // Dev runs over plain http through the Vite proxy, so this is only set
    // where the app is actually served over https.
    secure: process.env.NODE_ENV === 'production',
  });
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE, { path: '/', sameSite: 'lax', httpOnly: true });
}

// -------------------------------------------------------------- middleware

/** Populates `req.user` on every request. Never rejects. */
export function attachUser(req: Request, _res: Response, next: NextFunction): void {
  const token = readCookie(req, SESSION_COOKIE);
  if (!token) {
    req.user = null;
    next();
    return;
  }
  userForToken(token)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch(next);
}

/** Rejects anonymous requests with 401. */
export function requireUser(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    next(new HttpError(401, 'You need to be signed in to do that.'));
    return;
  }
  next();
}

/** The signed-in user, for handlers that run behind `requireUser`. */
export function currentUser(req: Request): SessionUser {
  if (!req.user) throw new HttpError(401, 'You need to be signed in to do that.');
  return req.user;
}

// ------------------------------------------------------------------ users

export function normaliseEmail(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

const EMAIL_PATTERN = /^[^@\s]+@[^@\s.]+\.[^@\s]+$/;

export function validateCredentials(email: string, password: string, displayName?: string): void {
  if (!email) throw new HttpError(400, 'Enter your email address.');
  if (!EMAIL_PATTERN.test(email)) throw new HttpError(400, 'That does not look like an email address.');
  if (!password) throw new HttpError(400, 'Enter a password.');
  if (password.length < 8) throw new HttpError(400, 'Use a password of at least 8 characters.');
  if (password.length > 200) throw new HttpError(400, 'That password is too long.');
  if (displayName !== undefined && displayName.length > 80) {
    throw new HttpError(400, 'That name is too long.');
  }
}

export async function createUser(email: string, password: string, displayName: string): Promise<SessionUser> {
  const existing = await db.execute({ sql: 'SELECT id FROM users WHERE email = ?', args: [email] });
  if (existing.rows.length > 0) {
    throw new HttpError(409, 'An account already exists for that email address.');
  }
  const id = randomUUID();
  const createdAt = new Date().toISOString();
  const name = displayName || email.split('@')[0];
  await db.execute({
    sql: 'INSERT INTO users (id, email, display_name, password_hash, created_at) VALUES (?, ?, ?, ?, ?)',
    args: [id, email, name, await hashPassword(password), createdAt],
  });
  return { id, email, displayName: name, createdAt, theme: 'system' };
}

export async function authenticate(email: string, password: string): Promise<SessionUser> {
  const result = await db.execute({
    sql: 'SELECT id, email, display_name, password_hash, created_at, theme FROM users WHERE email = ?',
    args: [email],
  });
  const row = result.rows[0];
  // The same message for both failures, so this cannot be used to discover
  // which email addresses have accounts.
  const generic = new HttpError(401, 'That email address and password do not match an account.');
  if (!row) {
    // Spend comparable time either way rather than returning instantly.
    await hashPassword(password);
    throw generic;
  }
  const ok = await verifyPassword(password, String(row.password_hash));
  if (!ok) throw generic;
  return {
    id: String(row.id),
    email: String(row.email),
    displayName: String(row.display_name),
    createdAt: String(row.created_at),
    theme: readTheme(row.theme),
  };
}
