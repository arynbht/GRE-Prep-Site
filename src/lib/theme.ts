/**
 * Theming: three-way override (light / dark / system), persisted per account.
 *
 * THE FLASH PROBLEM
 * If the theme is applied by React after hydration, a dark-mode user sees a
 * white page for one frame. At 2am that is genuinely unpleasant, and it is the
 * single most visible quality defect a themed app can ship.
 *
 * The fix has two halves and needs both:
 *   1. `tokens.css` resolves `prefers-color-scheme` in CSS, so a user with no
 *      stored preference is correct before any JS runs at all.
 *   2. `THEME_INIT_SCRIPT` runs synchronously in <head>, before first paint,
 *      to apply a stored OVERRIDE. It reads localStorage, not the account, so
 *      it never waits on a network round trip.
 *
 * The account value is the source of truth across devices; localStorage is a
 * cache written on every change and on login. When they disagree, the account
 * wins and the cache is corrected — on the next paint, not this one.
 */

export type ThemePreference = 'light' | 'dark' | 'system';

export const THEME_STORAGE_KEY = 'vellum.theme';

/**
 * Inline this in <head> BEFORE any stylesheet link, with no `defer` and no
 * `async`. In Next.js: `<script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />`
 * inside the document head. In Vite: paste it into index.html.
 *
 * It is deliberately tiny and dependency-free; anything that needs bundling has
 * already lost the race with first paint.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t)}}catch(e){}})();`;

/** Reads the stored override. Returns 'system' when nothing is stored. */
export function readThemePreference(): ThemePreference {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return stored === 'light' || stored === 'dark' ? stored : 'system';
  } catch {
    return 'system';
  }
}

/**
 * Applies a preference to the document and caches it.
 *
 * 'system' REMOVES the attribute rather than setting it to the current system
 * value. That matters: if the attribute were pinned, a user who changes their
 * OS theme mid-session would not follow, because the media query in tokens.css
 * is guarded by `:root:not([data-theme='light'])`.
 */
export function applyThemePreference(preference: ThemePreference): void {
  const root = document.documentElement;
  if (preference === 'system') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', preference);
  }
  try {
    if (preference === 'system') window.localStorage.removeItem(THEME_STORAGE_KEY);
    else window.localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // A blocked storage API costs the user the flash-free reload, nothing more.
  }
}

/** What the user is actually looking at right now. For an icon, not for CSS. */
export function resolvedTheme(preference: ThemePreference): 'light' | 'dark' {
  if (preference !== 'system') return preference;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Subscribes to OS changes. Only meaningful while the preference is 'system';
 * call the returned function to unsubscribe.
 */
export function onSystemThemeChange(handler: (theme: 'light' | 'dark') => void): () => void {
  const query = window.matchMedia('(prefers-color-scheme: dark)');
  const listener = (event: MediaQueryListEvent) => handler(event.matches ? 'dark' : 'light');
  query.addEventListener('change', listener);
  return () => query.removeEventListener('change', listener);
}
