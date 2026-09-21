import { useState } from 'react';
import { auth, type AuthUser } from '../lib/api';

export type AuthMode = 'login' | 'register';

interface Props {
  mode: AuthMode;
  onMode: (mode: AuthMode) => void;
  onAuthenticated: (user: AuthUser) => void;
  onBack: () => void;
}

export function AuthScreen({ mode, onMode, onAuthenticated, onBack }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isRegister = mode === 'register';

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const user = isRegister
        ? await auth.register({ email, password, displayName })
        : await auth.login({ email, password });
      onAuthenticated(user);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Something went wrong. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-screen">
      <form className="glass glass-strong auth-card reveal" onSubmit={(event) => void submit(event)}>
        <h1>{isRegister ? 'Create your account' : 'Welcome back'}</h1>
        <p className="muted">
          {isRegister
            ? 'Your exams and attempts are kept under your account and are not visible to anyone else.'
            : 'Sign in to pick up your exams and past attempts.'}
        </p>

        {error ? <p className="banner banner-error">{error}</p> : null}

        {isRegister ? (
          <label className="field">
            <span>Name</span>
            <input
              type="text"
              autoComplete="name"
              value={displayName}
              placeholder="What should we call you?"
              onChange={(event) => setDisplayName(event.target.value)}
            />
          </label>
        ) : null}

        <label className="field">
          <span>Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        <label className="field">
          <span>Password</span>
          <input
            type="password"
            required
            minLength={8}
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {isRegister ? <span className="field-hint">At least 8 characters.</span> : null}
        </label>

        <button type="submit" className="btn btn-primary btn-large" disabled={busy}>
          {busy ? 'Working…' : isRegister ? 'Create account' : 'Sign in'}
        </button>

        <p className="auth-switch">
          {isRegister ? 'Already have an account?' : 'No account yet?'}{' '}
          <button type="button" className="link-button" onClick={() => onMode(isRegister ? 'login' : 'register')}>
            {isRegister ? 'Sign in' : 'Create one'}
          </button>
        </p>
        <button type="button" className="link-button auth-back" onClick={onBack}>
          Back to the home page
        </button>
      </form>
    </div>
  );
}
