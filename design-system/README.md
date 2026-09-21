# Vellum design system

Written for: engineers and designers building the Vellum product.

Adaptive GRE test prep. The system's job is to look like a well-made
professional tool rather than a consumer study app, and to stay calm while
someone anxious uses it for three hours at a stretch.

**Restraint is the brand.** Where a choice is close, this system takes the
quieter option and says why.

## What is here

```
design-system/
  tokens/
    primitives.json      raw ramps and scales. Components never touch these.
    semantic.json        the only layer components consume. Both themes.
    resolved.json        GENERATED. Every semantic token flattened per theme.
  css/
    tokens.css           GENERATED. Custom properties, :root + [data-theme].
    theme.css            Tailwind v4 @theme mapping.
    utilities.css        what Tailwind cannot express.
    motion.css           all twelve interactions.
  components/            reference implementations, typechecked
  docs/
    01-color.md          palette, themes, and one deviation from the brief
    02-typography.md     three families, glyph coverage, loading
    03-spacing-layout.md scale, radii, elevation, grid, breakpoints
    04-components.md     anatomy, props, states, ARIA, keyboard
    05-accessibility.md  the WCAG position and how it is enforced
    06-motion.md         micro-interactions: timing, staging, performance
    07-usage.md          do's and don'ts, weighted to this product's traps
    08-implementation.md file structure, theming, fonts, migration
    contrast.md          GENERATED. Every measured ratio.
  scripts/
    build-tokens.mjs     tokens -> CSS + contrast audit
```

## Build

```bash
node design-system/scripts/build-tokens.mjs
```

Regenerates `css/tokens.css`, `tokens/resolved.json`, `docs/contrast.md` and
`docs/contrast.json`. Run it after any token change; the generated files are
committed so a reviewer can see the diff in measured contrast.

The script fails loudly on an unresolvable reference and reports two classes of
problem it will not fix for you:

- **Contrast failures.** Every text-on-surface and UI-on-surface pair, measured,
  with the required ratio.
- **Collisions.** Any answer-feedback colour that is byte-identical to a
  system-status colour in the same theme, which would make "you got this wrong"
  and "something broke" indistinguishable.

Current state: **82 pairs measured, 0 failing, 0 collisions.**

## The three rules that shape everything else

1. **Answer feedback and system status never share a colour.** A wrong answer
   is information about the question. A red toast is information about the
   software. Conflating them teaches the user that being wrong is a malfunction.

2. **Nothing moves unless the user asked it to.** No pulsing timer, no
   shimmering skeleton in the exam flow, no attention-seeking transitions. One
   celebration exists, for a completed daily goal, and it lasts 450ms.

3. **No component references a raw ramp value.** `bg-surface-raised`, never
   `bg-neutral-0`. This is what makes dark mode a data change rather than a
   rewrite, and the Tailwind theme deliberately deletes the stock palette so an
   off-system colour fails to compile.

## Reading order

New to the system: `01-color` → `02-typography` → `04-components` → `07-usage`.

Implementing it: `08-implementation` first, then `06-motion`.

Reviewing it for accessibility: `05-accessibility`, then `contrast.md`.
