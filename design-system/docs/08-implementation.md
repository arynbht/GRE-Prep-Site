# Implementation

## File structure

```
src/
  styles/
    index.css              the only stylesheet the app imports
  components/ui/           app-facing wrappers over design-system/components
  ...
design-system/             the system itself; see README.md
```

`src/styles/index.css`, in this order — the order is load-bearing:

```css
@import '../../design-system/css/tokens.css';   /* generated; must be first */
@import 'tailwindcss';
@import '../../design-system/css/theme.css';    /* @theme consumes the tokens */
@import '../../design-system/css/utilities.css';
@import '../../design-system/css/motion.css';   /* reduced-motion block last */
```

`tokens.css` must precede `@theme` because Tailwind resolves `var()` at build
time for some utilities. `motion.css` must be last because its
`prefers-reduced-motion` block wins by source order rather than `!important`.

## Theming

Three-way override, persisted per account. Two halves, both required.

### Half one: CSS handles the system preference

`tokens.css` already emits:

```css
@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) { /* dark tokens */ }
}
```

A user with no stored override is correct **before any JavaScript runs**.

### Half two: an inline script handles the override

Flash of wrong theme happens when React applies the theme after hydration. At
2am a white flash is the most visible quality defect a themed app can ship.

Paste into `index.html`, in `<head>`, **before any stylesheet link**, with no
`defer` and no `async`:

```html
<script>
  (function () {
    try {
      var t = localStorage.getItem('vellum.theme');
      if (t === 'light' || t === 'dark') document.documentElement.setAttribute('data-theme', t);
    } catch (e) {}
  })();
</script>
```

Exported as `THEME_INIT_SCRIPT` from `design-system/components/theme.ts` so it
cannot drift from the storage key the app uses.

### The account is the source of truth

localStorage is a cache, written on every change and on login. When they
disagree the account wins and the cache is corrected — on the **next** paint,
not this one. Never block first paint on a network round trip to learn the
theme.

### Choosing "system" removes the attribute

It does not pin the current system value. If it were pinned, a user who changes
their OS theme mid-session would not follow, because the media query is guarded
by `:root:not([data-theme='light'])`.

## Font loading

Three families, three different urgencies.

### Inter — needed immediately, everywhere

Variable, subset to Latin plus the maths glyphs from `02-typography.md`.

```html
<link rel="preload" href="/fonts/inter-var-subset.woff2" as="font"
      type="font/woff2" crossorigin>
```

```css
@font-face {
  font-family: 'Inter var';
  src: url('/fonts/inter-var-subset.woff2') format('woff2-variations');
  font-weight: 400 700;
  font-display: swap;
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+2000-206F, U+2074,
                 U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215,
                 U+00B0, U+00B1, U+00D7, U+00F7,
                 U+0394, U+03B8, U+03BC, U+03C0, U+03C3,
                 U+00B2, U+00B3, U+2211, U+221A, U+221E,
                 U+2248, U+2260, U+2264, U+2265;
}
```

`font-display: swap` rather than `optional`: the fallback stack is metrically
close enough that the swap is barely visible, and `optional` means a user on a
slow connection may never get tabular figures, which the timer depends on.

### Literata — preload only on routes that use it

The serif is used by passages and nothing else. Preloading it globally costs
every vocabulary drill on a phone a font download it will never render.

```tsx
// Route-level, in the reading-comprehension route only.
export function PassageFontPreload() {
  return (
    <link rel="preload" href="/fonts/literata-var-subset.woff2"
          as="font" type="font/woff2" crossOrigin="anonymous" />
  );
}
```

With Vite, put it behind the route component. With a framework that supports
route-level `<head>`, use that. The `@font-face` itself can live in the global
stylesheet — declaring a face does not download it; only using it does.

### JetBrains Mono and KaTeX — lazy

Mono appears in code and inline formula fallbacks. KaTeX ships its own faces.
Neither is preloaded; both use `font-display: swap`.

### Subsetting

```bash
pyftsubset Inter-Variable.ttf \
  --output-file=inter-var-subset.woff2 --flavor=woff2 \
  --layout-features='kern,liga,tnum,lnum,calt' \
  --unicodes="U+0000-00FF,U+2018-201F,U+2026,U+00B0,U+00B1,U+00D7,U+00F7,U+0394,U+03B8,U+03BC,U+03C0,U+03C3,U+00B2,U+00B3,U+2074,U+2211,U+221A,U+221E,U+2248,U+2260,U+2264,U+2265"
```

`tnum` and `lnum` must be kept or the `tabular` utility silently does nothing.
That is the subsetting mistake that will be made; put the glyph-coverage check
from `02-typography.md` in CI.

## React notes

### Keep components on the server where you can

These are server components and should stay that way: `AnswerChoice` (the row
itself), `Button`, `ExplanationPanel`, `ProgressBar`, `StreakRing` (without
celebration), field primitives.

These must be client components, and the reason is specific:

| Component | Why |
| --- | --- |
| `AnswerList` | Selection state and keyboard handling |
| `TimerChip` | `setInterval` and threshold announcements |
| `Flashcard` | Pointer tracking for drag |
| `Toast` | Must remove itself from the DOM |
| `QuestionNavigator` | Roving focus |

Everything else is CSS, which is the point of putting the state machine in
`utilities.css` rather than in JSX.

### Progress that animates from the previous value

```tsx
// Right: value set during render, stable key.
<ProgressBar value={answered} max={total} label="Answered" />

// Wrong: seeds at zero, sweeps from empty on every mount.
const [v, setV] = useState(0);
useEffect(() => setV(answered), [answered]);
```

## Migration from the current plain styles

The app today has a single hand-written `src/styles.css` with its own
`:root` / `prefers-color-scheme` variables. Migrate in five steps, each
shippable on its own.

### Step 1 — tokens underneath, nothing visual changes

Import `tokens.css` above the existing stylesheet and alias the old names:

```css
:root {
  --bg: var(--vlm-surface);
  --surface: var(--vlm-surface-raised);
  --surface-alt: var(--vlm-surface-sunken);
  --border: var(--vlm-border-subtle);
  --border-strong: var(--vlm-border-strong);
  --text: var(--vlm-text-primary);
  --muted: var(--vlm-text-secondary);
  --accent: var(--vlm-action);
  --accent-soft: var(--vlm-action-subtle);
  --ok: var(--vlm-answer-correct-fg);
  --ok-soft: var(--vlm-answer-correct-bg);
  --bad: var(--vlm-answer-incorrect-fg);
  --bad-soft: var(--vlm-answer-incorrect-bg);
  --flag: var(--vlm-answer-marked-fg);
}
```

Delete the old `@media (prefers-color-scheme: dark)` block — `tokens.css`
already handles it, and leaving both means two sources of truth.

Colours shift slightly (the palette is genuinely different). Nothing breaks.

### Step 2 — the answer row

Replace the hand-rolled `.choice` rules with `.vlm-answer` and add the
`data-state` attribute in `QuestionCard.tsx`. This is the highest-value single
change: it brings correct/incorrect/revealed/skipped states, the
circle-vs-square interaction signal, the 56px target, and the icon-plus-label
redundancy that the current implementation does not have.

### Step 3 — theme control

Add the inline script, the `theme.ts` helpers, and a three-way control in the
top bar. Persist to the account alongside the existing user row.

### Step 4 — Tailwind

Add Tailwind v4 and `theme.css`. Convert screen by screen, newest first. The
old stylesheet and Tailwind coexist; nothing needs a big-bang rewrite. Delete
rules from `styles.css` as each screen is converted.

### Step 5 — motion

Import `motion.css` last and add the `data-*` hooks. This is last because it is
the only step with no fallback value — a half-migrated motion layer is worse
than none.

### What to leave alone

The review-book reader already has its own well-scoped styles and is not part
of the exam flow. Migrate it last, or never; it costs nothing to leave it on
the old stylesheet once the tokens underneath are shared.
