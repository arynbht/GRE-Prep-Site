# Colour

## The four families and why they are separate

| Family | Job | Never used for |
| --- | --- | --- |
| Indigo | Every interactive element: buttons, links, selected rows, focus | Progress, celebration |
| Amber | Progress, streaks, milestones, marked-for-review | Any action, any button |
| Green / rose | Answer correctness only | System status |
| Teal / red / blue | System status only: toasts, validation, connectivity | Answer correctness |

The green/rose versus teal/red split is the one that carries real weight. A
person who has just answered wrong should not see the same colour the app uses
when the network drops. Rose-crimson rather than true red is deliberate:
incorrect is information about the question, not a fault the user caused.

The build script enforces this. If an answer colour ever equals a status colour
in the same theme, the build prints a collision.

## One deviation from the brief

The brief specified `#FDA29B` for dark-mode incorrect. That value is `red-300`,
and it is byte-identical to dark-mode `error-fg`. Shipping it would have made
the dark theme violate the brief's own rule that the two must never be
confusable, and the audit would have reported a permanent collision.

**Shipped instead: `rose-300` `#FEA3B4`**, which keeps incorrect in the rose
family in both themes and measures 7.69:1 on its own tint.

To revert, in `tokens/semantic.json`:

```json
"answer-incorrect-fg": { "light": "{color.rose.700}", "dark": "{color.red.300}" }
```

and expect `node design-system/scripts/build-tokens.mjs` to report:

```
COLLISION dark: answer-incorrect-fg === error-fg (#FDA29B)
```

## Two tokens the brief did not anticipate

**`accent-text`.** Amber-600 measures 3.62:1 on white. That passes for a
progress arc (WCAG 1.4.11 wants 3:1 for a graphic) and fails for a label (1.4.3
wants 4.5:1). One token cannot honestly serve both, so `accent` is the fill and
`accent-text` is the label, at amber-700.

**`border-strong` moved a stop.** At neutral-400 it measured 2.49:1 on the page,
failing the 3:1 that 1.4.11 requires for a control boundary. It is now
neutral-500 in both themes.

Two more values moved for the same reason: `answer-skipped-fg` (4.28:1, now
neutral-600) and `answer-marked-fg` (3.47:1, now amber-700).

## Answer-row borders are decorative, on purpose

The audit deliberately does **not** measure a feedback border against its own
fill. That test is meaningless: 1.4.11 is about telling a component apart from
its surroundings, not about internal decoration.

What carries the state on an answer row is the **icon, the text label and the
foreground colour**, and all three are measured and pass. The border is
reinforcement. If you are reviewing this system for compliance, that is the
answer to the question you are about to ask.

## Semantic tokens

Every one exists in both themes under the same name. A component never branches
on theme.

| Token | Light | Dark |
| --- | --- | --- |
| `surface` | neutral-50 | neutral-900 `#15181F` |
| `surface-raised` | neutral-0 | neutral-850 `#1C2029` |
| `surface-sunken` | neutral-100 | neutral-950 `#0C0E13` |
| `border-subtle` | neutral-200 | neutral-800 |
| `border-strong` | neutral-500 | neutral-500 |
| `border-interactive` | neutral-300 | neutral-700 |
| `text-primary` | neutral-900 | neutral-50 |
| `text-secondary` | neutral-600 | neutral-300 |
| `text-tertiary` | neutral-500 | neutral-400 |
| `text-inverse` | neutral-0 | neutral-900 |
| `action` | indigo-600 | indigo-300 |
| `action-hover` | indigo-700 | indigo-200 |
| `action-pressed` | indigo-800 | indigo-100 |
| `action-subtle` | indigo-50 | indigo-300 at 14% |
| `focus-ring` | indigo-600 | indigo-300 |

No pure black anywhere. The darkest surface is `#0C0E13`.

## Dark mode is not inverted light mode

Three things change beyond the swap:

1. **Interactive colours get lighter, not darker.** Indigo-600 on a dark
   surface is nearly invisible; indigo-300 reads as the same "this is
   clickable" signal that 600 does on white.

2. **Filled states are tinted, not saturated.** Every dark feedback background
   is its foreground mixed into the surface at 14%, and every border at 34%.
   A full-strength green fill on a dark surface glows.

3. **Elevation stops being shadow.** `--vlm-elevation-raised` resolves to
   `none` in dark, and the `elevated` utility leans on a lightened border
   instead. A soft shadow on a dark surface reads as haze, not as lift.

The tints are blended **at build time** into static hex values rather than with
runtime `color-mix()`. Two reasons: the shipped value can be contrast-checked,
and iOS Safari only gained `color-mix()` in 16.2 while the support target is 16.

## Theme selection

Three-way: light / dark / system, persisted per account.

- CSS resolves `prefers-color-scheme` on its own, so a user with no stored
  override is correct before any JavaScript runs.
- An explicit override sets `data-theme` on `<html>`, which wins because the
  media query is guarded by `:root:not([data-theme='light'])`.
- Choosing "system" **removes** the attribute rather than pinning the current
  value, so a user who changes their OS theme mid-session follows along.

Flash prevention is in `08-implementation.md`.
