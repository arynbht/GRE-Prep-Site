import type { Express } from 'express';
import { db } from './db.js';
import {
  SESSION_COOKIE,
  authenticate,
  clearSessionCookie,
  createSession,
  createUser,
  destroySession,
  normaliseEmail,
  readCookie,
  setSessionCookie,
  readTheme,
  validateCredentials,
} from './auth.js';
import { HttpError, text, wrap } from './http.js';

export function registerAuthRoutes(app: Express): void {
  app.post(
    '/api/auth/register',
    wrap(async (req, res) => {
      const body = req.body as { email?: unknown; password?: unknown; displayName?: unknown };
      const email = normaliseEmail(body.email);
      const password = typeof body.password === 'string' ? body.password : '';
      const displayName = text(body.displayName);
      validateCredentials(email, password, displayName);

      const user = await createUser(email, password, displayName);
      const { token, expiresAt } = await createSession(user.id);
      setSessionCookie(res, token, expiresAt);
      res.status(201).json({ user });
    }),
  );

  app.post(
    '/api/auth/login',
    wrap(async (req, res) => {
      const body = req.body as { email?: unknown; password?: unknown };
      const email = normaliseEmail(body.email);
      const password = typeof body.password === 'string' ? body.password : '';
      validateCredentials(email, password);

      const user = await authenticate(email, password);
      const { token, expiresAt } = await createSession(user.id);
      setSessionCookie(res, token, expiresAt);
      res.json({ user });
    }),
  );

  app.post(
    '/api/auth/logout',
    wrap(async (req, res) => {
      const token = readCookie(req, SESSION_COOKIE);
      if (token) await destroySession(token);
      clearSessionCookie(res);
      res.json({ ok: true });
    }),
  );

  app.get('/api/auth/me', (req, res) => {
    res.json({ user: req.user ?? null });
  });

  /** Persist the theme choice. The account is the cross-device source of
   *  truth; localStorage is only the cache that prevents a first-paint flash. */
  app.patch(
    '/api/auth/preferences',
    wrap(async (req, res) => {
      const user = req.user;
      if (!user) throw new HttpError(401, 'You need to be signed in to do that.');
      const theme = readTheme((req.body as { theme?: unknown }).theme);
      await db.execute({ sql: 'UPDATE users SET theme = ? WHERE id = ?', args: [theme, user.id] });
      res.json({ user: { ...user, theme } });
    }),
  );
}
