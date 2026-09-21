# Motion

Implementation: `design-system/css/motion.css`. Everything below is built on
tokens; there are no literal millisecond values anywhere in the system.

## Tokens

| Duration | Value | Used for |
| --- | --- | --- |
| `instant` | 80ms | Press feedback, label/spinner swap |
| `fast` | 140ms | Selection, verdict, focus, cell state |
| `base` | 200ms | Panel entrance, toast, skeleton crossfade |
| `slow` | 280ms | Explanation expand, progress, flip |
| `celebrate` | 450ms | Daily goal only, once |

| Easing | Curve | Used for |
| --- | --- | --- |
| `ease-out` | `cubic-bezier(0.2, 0, 0, 1)` | Default. Entering |
| `ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Exiting |
| `ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | Moving between states |
| `ease-spring` | `cubic-bezier(0.2, 0.9, 0.2, 1.05)` | Celebration only |

## Budget

| Item | Budget | Actual |
| --- | --- | --- |
| JS for motion | < 15KB gzipped | ~1.1KB — flashcard drag, toast unmount timing, celebration flag |
| Motion library | — | **None.** Framer Motion is ~35KB gzipped and blows the budget on its own; WAAPI and CSS cover every interaction here |
| Continuous animation while a question is on screen | Zero | Zero |

Three components hold JS: the flashcard (pointer tracking for drag), the toast
(the element must leave the DOM, which CSS cannot do), and the streak ring (a
one-shot flag). Everything else is CSS and stays a server component.

---

## 1. Answer hover and selection

**Hover** sinks the surface to `surface-sunken` and strengthens the border.
**Selected** fills with `action-subtle` and adds an inset 1px ring.

The distinction survives a fast mouse because they change different things:
hover changes the surface *downward*, selection changes it *to indigo*. There
is no intermediate frame where one looks like the other.

Selection is `fast` (140ms) and **all properties settle together** — background,
border, ring and letter-slot fill share one transition declaration, so the
indicator and the row arrive as one event rather than in sequence.

```css
transition:
  background-color var(--vlm-duration-fast) var(--vlm-ease-out),
  border-color     var(--vlm-duration-fast) var(--vlm-ease-out),
  color            var(--vlm-duration-fast) var(--vlm-ease-out),
  box-shadow       var(--vlm-duration-fast) var(--vlm-ease-out);
```

The inset ring is `box-shadow`, not a wider border, so nothing reflows.

**Performance.** Paint only, no layout. `will-change` is **not** warranted:
promoting 5 rows per question to their own layers costs memory on a mid-range
Android for a 140ms colour change.

**Reduced motion.** Keeps the 140ms cross-fade. An instant repaint of a 56px
tinted surface is a flash, which is worse for a motion-sensitive user than a
short fade. Reduced motion is not zero motion.

---

## 2. Correct / incorrect reveal

The emotional centre of the product.

### Staging

| t | Event | Duration |
| --- | --- | --- |
| 0ms | `aria-live` announcement fires | — |
| 0ms | Chosen row begins verdict transition | 140ms |
| 90ms | Correct row begins revealing | 140ms |
| 200ms | Explanation panel begins expanding | 280ms |
| 480ms | Settled | |

The **90ms overlap** is the whole trick. A wrong answer that animates, stops,
then animates again reads as a scolding — two separate events, the second one
pointing at you. Overlapping by 50ms makes it one continuous beat that reads as
information arriving.

The announcement fires at **t=0**, never gated on animation.

### What each state does

- **Correct:** green tint, ✓, "Correct". No scale, no bounce, no pop. Affirming
  because it is unambiguous, not because it is loud.
- **Incorrect:** rose tint, ✕, "Your answer". **No shake, no buzz, no red
  flash.** Those read as punishment. Rose-crimson rather than red because this
  is information about the question, not a fault the user caused.
- **Revealed:** green tint, dashed border, no inner ring, "Correct answer".
  Quieter than `correct` so it does not compete with the row the user chose.

The verdict icon fades in at `fast`; `@starting-style` gives it an entry
opacity where supported and it simply appears where not.

**Performance.** Colour and opacity only. Nothing composites, nothing lays out.

**Reduced motion.** Delays drop to 0 and all three states appear at once, still
cross-faded. The information is identical; only the choreography is gone.

---

## 3. Explanation panel

`grid-template-rows: 0fr → 1fr`, with the inner element owning
`overflow: hidden; min-height: 0`.

**This is the one place the system animates a layout property**, and it is a
deliberate exception:

- It runs only on an explicit user action, never while a question is being read.
- `contain: layout paint` confines the reflow to the panel subtree.
- The alternative — animating `transform` on a JS-measured height — needs a
  ResizeObserver and breaks when content reflows at a different viewport width.

Where `interpolate-size: allow-keywords` is supported, a progressive
enhancement swaps to a real `block-size: 0 → auto` transition, which is
smoother still.

Collapse is `base` (200ms) with no delay: getting out of the way should feel
immediate. Expand is `slow` (280ms) after a 200ms delay, so it follows the
verdict rather than racing it.

Content fades in at 280ms so text is never legible while being squashed.

**Reduced motion.** Opens instantly; content still fades so text does not
appear mid-reflow.

---

## 4. Form field focus

`:focus-visible` only, so a mouse click never paints a ring the user did not
ask for. The ring itself appears instantly — only the border colour transitions,
at `fast`.

```css
.vlm-field:focus-visible {
  outline: 2px solid var(--vlm-focus-ring);
  outline-offset: 2px;
  border-color: var(--vlm-action-border);
}
```

**Error appearance is calm.** The border colour changes and the message
cross-fades in at `fast`. No shake, no slide. A validation message that jumps
reads as an accusation, and this audience is already anxious.

**When not to use.** Do not add a focus transition to the outline itself. A
ring that fades in is a ring that is briefly invisible, which defeats it.

---

## 5. Buttons

Hover: background at `fast`. Active: `translateY(1px)` at `instant` — a real
pressed feel, and a transform so nothing around it reflows.

Loading swaps label for spinner at `instant`, with the label held in flow at
`opacity: 0`. **Width never changes.**

The spinner is the **only permitted loop** in the system, and only because a
spinner that does not spin is not a spinner. It exists only while a request is
in flight.

**Reduced motion.** The press transform is removed; the spinner stops rotating
and the button still reads as busy via `aria-busy` and the disabled state.

---

## 6. Async question load

Skeletons match the real content's box exactly, from the same tokens, so the
swap is **CLS 0**. Both skeleton and content are stacked in one grid cell and
cross-fade at `base`.

### Recommendation: no shimmer in the exam flow

A shimmering placeholder is a looping animation in the user's visual field
while they wait for a question. Static blocks read as "loading" perfectly well.
`.vlm-skeleton--shimmer` exists for marketing surfaces; do not use it in a
session.

### Minimum duration rule

Two thresholds, both needed:

- **Do not show a skeleton before 200ms.** Most loads finish inside that, and a
  skeleton that flashes for 80ms is worse than nothing.
- **Once shown, hold for at least 400ms.** A skeleton that appears and vanishes
  in 120ms reads as a glitch.

```ts
// Show only if slow; once shown, stay.
const [showSkeleton, setShowSkeleton] = useState(false);
useEffect(() => {
  if (!loading) return;
  const show = setTimeout(() => setShowSkeleton(true), 200);
  return () => clearTimeout(show);
}, [loading]);
```

---

## 7. Timer thresholds

**Nothing animates except a 140ms cross-fade of colour and weight.** No pulse,
no glow, no loop.

The state change is perceptible because two things change at once — the glyph
silhouette and the numeral weight — and peripheral vision is good at detecting
a change in *form*. Nothing has to move for that to work.

This is the interaction most likely to be "improved" by someone later. The
reason to refuse: a timer that moves steals attention from the question, and
the user cannot opt out of noticing it. If an animated timer is ever requested,
the honest answer is that it makes the product worse for the exact user it
claims to help.

**Reduced motion.** Identical. There was never any motion to remove.

---

## 8. Question navigator

**Cell state change:** colour only, at `fast`. With 100+ cells, animating
geometry is both expensive and distracting — a grid that ripples when you
answer a question is pure noise.

**Panel entrance:** `translateY(8px) + opacity` at `base`, `ease-out`. This is
a deliberate, user-initiated overlay, so a short movement is orienting rather
than noisy.

**Performance.** The panel gets `transform` + `opacity`, which composites. The
cells get colour, which paints. Do not put `will-change` on 100 cells.

---

## 9. Flashcard flip

`rotateY` on an inner wrapper at `slow` (280ms), `ease-in-out`.

- `perspective: 1200px` on the outer wrapper.
- `transform-style: preserve-3d` on the inner.
- `backface-visibility: hidden` on both faces, so exactly one is readable and
  the swap happens at 90° where both are edge-on.
- Both faces occupy the same grid cell, so the card never changes size.

**Drag.** Touch and pen only; mouse gets tap. While dragging, JS writes `--flip`
directly and the transition is disabled via `data-dragging`, or every frame
fights the last one. Commit on a flick over **0.35 px/ms** or a drag past **25%**
of card width.

**Reduced motion.** Rotation becomes a cross-fade between faces;
`backface-visibility` is released so both composite. The card still flips —
the information is preserved, only the 3D is gone.

**Performance.** `transform` only. This is the one place `will-change: transform`
is warranted, because the drag produces continuous transform updates. Add it on
pointer-down and remove it on commit; leaving it on permanently keeps a layer
alive for every card in a deck.

---

## 10. Progress bar and ring

Bar: `transform: scaleX` with `transform-origin: left`, at `slow`.
Ring: `stroke-dashoffset`, at `slow`.

Both animate from the previous value automatically. The failure mode is a React
one, not a CSS one: remounting the element, or seeding the value at zero in an
effect. Keep the key stable, set the value during render.

**Reduced motion.** Both jump to the value. The number beside them is the real
information and is unaffected.

---

## 11. Daily-goal completion

The one permitted moment of delight.

| t | Event | Duration | Easing |
| --- | --- | --- | --- |
| 0ms | Arc closes to 100% | 280ms | `ease-out` |
| 280ms | Ring settles: scale 1 → 1.04 → 1 | 170ms | `ease-spring` |
| 450ms | Done | | |

450ms total, at the ceiling and not over it.

No confetti. No sound. No scale on the surrounding card. The emotion comes from
the arc arriving and the ring breathing once — **earned by timing, not by
volume**. A user who hits their goal at 1am does not want a party; they want an
acknowledgement they can close the laptop on.

Fires **once**, on the transition into completion, not on every render where
the goal happens to be met.

**Reduced motion.** The arc still fills (instantly) and the settle is removed
entirely. The state change is never dropped.

---

## 12. Toast

**Enter:** `translateY(12px) → 0` + opacity, `base`, `ease-out`.
**Exit:** fade in place, `fast`, `ease-in`. No translate on exit — a stack
where one member slides away appears to fall apart; fading keeps the rest still.

**Stacking:** remaining toasts move up via `transform` at `base`,
`ease-in-out`. Transform only, so no reflow.

`@starting-style` provides the entry state where supported; the two-frame
`requestAnimationFrame` in `Toast.tsx` is the fallback and is why this is a
client component.

**ARIA.** See `04-components.md`. The regions are always mounted; politeness is
chosen by intent, not by colour.

---

## Verifying in DevTools

1. **Rendering → Paint flashing.** Selecting an answer should flash the row
   only. If the whole question card flashes, something inherited a transition
   it should not have.
2. **Rendering → Layer borders.** The flashcard should gain a layer on
   pointer-down and lose it on commit. Answer rows should never have one.
3. **Performance panel, 6× CPU throttle.** Record a submit. Expect zero
   "Layout" entries between t=0 and t=480ms **except** inside the explanation
   panel's subtree after 200ms.
4. **Performance → Experience.** Record an async question load. Expect no
   layout-shift entries; the skeleton and content boxes must be identical.
5. **Emulate `prefers-reduced-motion: reduce`** and repeat 1–4. Every state
   change must still occur. A state that stops happening is a bug, not a
   preference.

---

## Interactions deliberately left out

Each of these demos well and costs the user during a timed section.

| Not built | Why |
| --- | --- |
| Pulsing or glowing timer under 2 minutes | Repeating attention capture at the moment concentration matters most. Cannot be un-seen |
| Shake or buzz on a wrong answer | Reads as punishment. The audience already finds quant intimidating |
| Confetti on goal completion | Wrong register for a professional tool, and the 450ms budget cannot hold it honestly |
| Animated number count-up on score reveal | Delays the one number the user opened the page for |
| Staggered entrance of answer choices | Adds 200–400ms before the user can read choice five, every question, forever |
| Page transitions between questions | In a timed section, any transition is latency the user pays for with no information returned |
| Progress bar that animates on every render | Draws the eye to a number that did not change |
| Hover lift (translateY) on answer rows | Moves the text the user is reading. Colour is enough |
