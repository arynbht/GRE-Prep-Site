# Accessibility

Target: **WCAG 2.2 AA**. Body text ≥ 4.5:1, large text and UI components ≥ 3:1.

## Contrast

Every text-on-surface and UI-on-surface pair is measured by
`scripts/build-tokens.mjs` and published in `contrast.md`. Dark-mode tinted
backgrounds are measured at their **blended** value, not at the untinted
primitive, because the blend is what ships.

**Current: 82 pairs, 0 failing.** Regenerate after any token change.

Four tokens moved during the audit rather than being waived:

| Token | Was | Measured | Now |
| --- | --- | --- | --- |
| `accent` as text | amber-600 | 3.62:1 | split into `accent-text` at amber-700 |
| `answer-skipped-fg` | neutral-500 | 4.28:1 | neutral-600 |
| `answer-marked-fg` | amber-600 | 3.47:1 | amber-700 |
| `border-strong` | neutral-400 / 600 | 2.49 / 2.34:1 | neutral-500 both themes |

### What is deliberately not measured

Feedback-row borders against their own fill. WCAG 1.4.11 is about
distinguishing a component from its **surroundings**, not about internal
decoration. State on an answer row is carried by the icon, the text label and
the foreground colour — all three measured and passing. See `01-color.md`.

## Focus

One definition, in `utilities.css`, applied through the `focus-ring` utility:

```css
outline: 2px solid var(--vlm-focus-ring);
outline-offset: 2px;
```

`:focus-visible` so a mouse click never paints a ring. **Never removed, never
overridden.** `focus-ring-inset` exists for controls whose ring would be
clipped by an ancestor's overflow; it uses a negative offset rather than
dropping the ring.

The ring is measured against every surface it can appear on, including inside
filled answer rows:

| Inside | Light | Dark |
| --- | --- | --- |
| `surface` | 7.17:1 | 7.38:1 |
| `surface-raised` | 7.56:1 | 6.77:1 |
| `action-subtle` (selected row) | 6.70:1 | 5.78:1 |
| `answer-correct-bg` | 7.16:1 | — |
| `answer-incorrect-bg` | 6.88:1 | — |
| `answer-marked-bg` | 7.24:1 | — |

## Text sizing and zoom

- 16px floor for body and **all answer content**, on every breakpoint.
- 13px floor for captions and metadata only.
- Everything survives 200% browser zoom and a 24px root font size without
  clipping or horizontal scroll.

The type scale is in px rather than rem by deliberate choice, with one
consequence handled: px sizes do not respond to a user's browser font-size
setting. The system compensates by making every container height, padding and
touch target `min-height` rather than fixed `height`, so a larger root size
grows the box instead of clipping it. If you need the full rem behaviour,
`03-spacing-layout.md` has the conversion; it is a one-line change in the token
build.

**Test at 200% zoom on the split view first.** Passage plus questions side by
side at 1024px is where a layout breaks, and it breaks by forcing horizontal
scroll rather than stacking.

## Never colour alone

Four places carry meaning, four redundancies:

| Meaning | Colour | Plus shape | Plus text |
| --- | --- | --- | --- |
| Correct | green | ✓ icon | "Correct" |
| Incorrect | rose | ✕ icon | "Your answer" |
| Correct, not chosen | green | ✓ + **dashed** border | "Correct answer" |
| Marked for review | amber | corner triangle | in the accessible name |
| Timer urgency | amber / rose | glyph change + weight | announced at thresholds |
| Navigator: answered | indigo | filled vs hollow | in the accessible name |
| Single vs multi select | — | **circle vs square** slot | visible instruction line |

The single-versus-multi distinction is the one people forget. Picking the wrong
interaction model costs the user the question, so it is carried by slot shape,
by a visible instruction, **and** by native radio/checkbox semantics.

## Keyboard

Full keyboard operation of a practice session, no exceptions.

| Key | Action |
| --- | --- |
| `↑` `↓` | Move between answer choices |
| `1`–`5` or `A`–`E` | Select that choice |
| `Enter` | Submit |
| `M` | Mark for review |
| `N` | Next question |
| `P` | Previous question |
| `?` | Open the shortcut dialog |

Two rules the implementation enforces (`useSessionShortcuts.ts`):

1. **Shortcuts never fire while typing.** A numeric-entry or essay field would
   otherwise eat `5` as a selection and `N` as navigation.
2. **Modifiers pass through.** `Cmd+N` still opens a window.

`SESSION_SHORTCUTS` is exported from the same module the handler uses, so the
dialog cannot drift from the behaviour.

The dialog itself is a modal with a focus trap, `aria-modal="true"`, a visible
heading, and Escape to close. It is reachable from `?`, from the top bar, and
from the session menu — a shortcut list only discoverable by a shortcut is not
discoverable.

## Screen readers

### Question and choices

The fieldset legend carries the stem plus the choice count and the interaction
model: *"Question stem. Select one answer. 5 choices."* Native radio/checkbox
inside a label gives "radio button, 3 of 5, selected" without help.

### Correctness

A **separate** `aria-live="polite"` region outside the list, announcing at the
moment the verdict is known:

> "Incorrect. The correct answer is B."

The answer list itself is **never** a live region — re-announcing five rows on
every arrow keypress is unusable.

### The timer

**`aria-live="off"`.** Announcing every second is unusable, and it is the
single most common accessibility defect in timed test software.

A separate polite region announces each threshold once — "Five minutes
remaining", "Two minutes remaining" — then clears itself after two seconds so
the region is quiet.

### Toasts

Both regions mounted permanently and usually empty. A live region that mounts
with its content is frequently not announced at all. Politeness by intent:
success and info are `polite`, warning and error are `role="alert"`.

## Motion and contrast preferences

`prefers-reduced-motion: reduce` has a variant for every interaction. The rule
is **preserve the information, remove the movement** — cross-fades and instant
state changes replace transforms, and no state change is ever silently dropped.
A state that stops happening under reduced motion is a bug.

Notably, reduced motion **keeps** the 140ms answer-row cross-fade: an instant
repaint of a 56px tinted surface is a flash, which is worse for a
motion-sensitive user than a short fade. Reduced motion is not zero motion.

`prefers-contrast: more` thickens answer-row borders to 2px, doubles the inner
ring, and outlines the timer chip, so state survives when tints are unreliable.

## What to test, in order

1. Tab through a full question with the mouse unplugged. Every control
   reachable, ring visible on every surface, no trap.
2. Submit with a screen reader running. The verdict is announced once; the
   timer is silent; the explanation is not read over the verdict.
3. Zoom to 200% on the split view at 1024px. No horizontal scroll.
4. Set `prefers-reduced-motion`. Submit again. Every state still changes.
5. Grayscale the display. Correct, incorrect, revealed, marked and
   single-vs-multi are all still distinguishable.
6. Run `node design-system/scripts/build-tokens.mjs`. Zero failures, zero
   collisions.
