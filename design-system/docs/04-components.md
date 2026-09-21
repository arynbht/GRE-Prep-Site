# Components

Reference implementations are in `design-system/components/` and are
typechecked with the app. Anatomy diagrams live in the file headers; this
document carries the props, states, ARIA contract and keyboard behaviour.

---

## Answer choice

The most important component in the product.

### Anatomy

```
┌──────────────────────────────────────────────────────────────┐
│ ┌────┐  ┌──────────────────────────────────┐  ┌───────────┐  │
│ │ A  │  │ choice text, 16px minimum,       │  │ ✓ Correct │  │
│ │    │  │ wraps to as many lines as needed │  │           │  │
│ └────┘  └──────────────────────────────────┘  └───────────┘  │
└──────────────────────────────────────────────────────────────┘
  letter          body                              mark
  fixed 32px      min-width: 0                      auto
  circle = single-select
  square = multi-select
```

Full row is the click target. The letter sits in a fixed-width leading slot so
a two-word choice and a three-line choice stay aligned.

### Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `index` | `number` | — | Drives the A–E letter |
| `name` | `string` | — | Shared across a single-select group |
| `checked` | `boolean` | — | |
| `state` | `AnswerState` | — | See below |
| `multi` | `boolean` | — | Switches semantics **and** slot shape |
| `disabled` | `boolean` | `false` | |
| `onChange` | `(index, checked) => void` | — | |

### States

| State | When | Visual |
| --- | --- | --- |
| `unselected` | Resting | Raised surface, interactive border |
| hover | Pointer over, unselected | Surface **sinks**, border strengthens. Never indigo |
| `selected` | Chosen, before submit | Indigo tint, indigo border, inner ring, filled slot |
| focus-visible | Keyboard focus | 2px indigo ring, 2px offset, over any fill |
| `correct` | Submitted, chosen, right | Green tint, ✓, "Correct" |
| `incorrect` | Submitted, chosen, wrong | Rose tint, ✕, "Your answer" |
| `revealed` | Submitted, not chosen, was right | Green tint, **dashed** border, no inner ring, "Correct answer" |
| `skipped` | Submitted, nothing chosen | Neutral tint |
| disabled after submit | Always, post-submit | Cursor default. **Never dimmed** — the user has to be able to read what they got wrong |

**Hover must never look like selected.** Hover sinks the surface and keeps the
border neutral; selected fills with indigo. A fast mouse crossing a list cannot
produce a false "this is chosen" reading, which is the bug this distinction
exists to prevent.

**`revealed` is deliberately quieter than `correct`.** Dashed edge, no inner
ring. It says "this was the answer", not "look what you missed".

### ARIA structure

```html
<fieldset>
  <legend>
    Question stem
    <span class="sr-only"> Select one answer. 5 choices.</span>
  </legend>
  <p>Select one answer.</p>            <!-- visible, not only for SR -->
  <ul>
    <li>
      <label class="vlm-answer" data-state="unselected" data-select="single">
        <input class="vlm-answer__input" type="radio" name="q4">
        <span class="vlm-answer__letter" aria-hidden="true">A</span>
        <span class="vlm-answer__body">…</span>
      </label>
    </li>
  </ul>
</fieldset>

<!-- outside the list -->
<div aria-live="polite" class="sr-only">Incorrect. The correct answer is B.</div>
```

A real `<input>` inside a `<label>`, not `role="radio"` on a div. The native
control gives arrow-key semantics, focus management and form participation for
free, and is announced as "radio button, 3 of 5, selected" without help.

**The list is never a live region.** Re-announcing five rows on every selection
is unusable. Correctness goes in a separate polite region that fires the
instant the verdict is known, not when the animation settles.

### Keyboard

| Key | Single-select | Multi-select |
| --- | --- | --- |
| `↓` `→` | Next choice **and select** (native radio) | Move focus only |
| `↑` `←` | Previous **and select** (native radio) | Move focus only |
| `1`–`9` | Select that choice | Toggle that choice |
| `A`–`J` | Select that choice | Toggle that choice |
| `Space` | Select | Toggle |
| `Tab` | Leave the group | Leave the group |

Arrows selecting on a radio group is correct ARIA behaviour, not a bug.
Checkboxes move focus without toggling, which is the documented checkbox
pattern.

---

## Button

### Props

| Prop | Type | Default |
| --- | --- | --- |
| `variant` | `primary \| secondary \| ghost \| destructive \| link` | `secondary` |
| `size` | `sm \| md \| lg` | `md` |
| `loading` | `boolean` | `false` |
| `loadingLabel` | `string` | label |
| `leadingIcon` / `trailingIcon` | `ReactNode` | — |

Sizes: `sm` 32px, `md` 40px, `lg` 48px. **`sm` is desktop-toolbar only** — it
is under the 44px touch minimum and must never be a primary action on mobile.

### States

Default, hover, active, focus-visible, disabled, loading. Active is
`translateY(1px)`, not a scale: a scale at these sizes reads as mushy.

**Loading preserves width.** The label stays in the DOM at `opacity: 0` and the
spinner is absolutely positioned over it. Removing the label collapses the
button to the spinner's width and shifts everything after it.

`aria-busy="true"` while loading. No live region — focus is already on the
control the user just pressed.

---

## Timer chip

### Anatomy

```
┌──────────────────────┐
│ [icon]  12:04  [eye] │
│   ▲       ▲      ▲   │
│   │       │      └─ hide toggle
│   │       └─ tabular, fixed width
│   └─ glyph changes at each threshold
└──────────────────────┘
```

### States

| Level | Threshold | Glyph | Weight | Colour |
| --- | --- | --- | --- | --- |
| `calm` | > 5 min | Clock with hands | 500 | `timer-calm-fg` (neutral) |
| `warning` | ≤ 5 min | Half-filled circle | 600 | `timer-warning-fg` (amber) |
| `urgent` | ≤ 2 min | Exclamation in circle | 600 | `timer-urgent-fg` (rose) |

Escalation is carried by **glyph and weight first, colour third**. Two of those
three are shape changes, which peripheral vision detects as a change in form
with nothing moving.

**No pulse.** A pulsing timer under two minutes is the most-requested and most
harmful timer feature: a repeating attention capture at exactly the moment
concentration matters most, and it cannot be un-seen. Omitted deliberately.

Hide mode keeps the box and hides the value with `visibility: hidden`, so
toggling never reflows the top bar mid-session.

### ARIA

`role="timer"` with **`aria-live="off"`**. Announcing every second is unusable.
A separate polite region announces "Five minutes remaining" and "Two minutes
remaining" once each, then clears.

---

## Explanation panel

Disclosure, not `<details>`. Native `<details>` cannot animate its open
transition in Safari without the same grid wrapper, and its `open` attribute
fights React.

```html
<h3>
  <button aria-expanded="false" aria-controls="exp-1">Why this answer</button>
</h3>
<div id="exp-1" class="vlm-explanation" role="region">
  <div class="vlm-explanation__inner">   <!-- overflow: hidden; min-height: 0 -->
    <div class="vlm-explanation__content">…</div>
  </div>
</div>
```

Both inner elements are required. Without `min-height: 0` the grid row refuses
to shrink below content height and nothing animates.

Not a live region: the panel opens because the user asked, or as part of the
submit sequence whose verdict is already announced.

---

## Question navigator

### States

| State | Shape | Colour |
| --- | --- | --- |
| `unanswered` | Hollow cell | Interactive border |
| `answered` | Filled cell | Indigo |
| `marked` | Corner triangle | Amber triangle |
| `answered-marked` | Filled + triangle | Both |
| current | 2px ring, 2px offset | Focus ring |

Four states, four shapes. Colour is redundant throughout, and the legend is
always visible rather than hidden behind a tooltip.

Not `role="listbox"`: these are jumps to questions, not options in a selection.
A plain list of buttons is honest and needs no custom selection semantics.

### Keyboard

`←` `→` move by one, `↑` `↓` move by a row (8 columns), `Home` / `End` jump to
the ends, `Enter` / `Space` navigate.

---

## Form fields

Every field: **visible label**, optional helper, error with message, disabled,
read-only.

**The label is a required prop with no "hidden" option.** A placeholder
disappears the moment you type, so the field loses its name exactly when you
want to check it; it also fails on autofill, on translation, and for anyone
returning to a half-filled form.

### Numeric entry

`inputMode="decimal"` on a `type="text"` input, never `type="number"`.
`type="number"` brings spinners nobody wants on a test, silently discards input
the browser considers invalid, and hides the minus sign on some Androids.

### Fraction entry

Two stacked fields with a **border** between them, not a slash character, so
the rule scales with the fields and stays aligned at 200% zoom. Each half is
separately labelled "Numerator" and "Denominator" — a screen-reader user
landing in the second box otherwise has no way to know which half they are in.

---

## Flashcard

Two faces stacked in one grid cell, `transform-style: preserve-3d` on the
wrapper, `backface-visibility: hidden` on each face. Exactly one face is ever
readable and the swap happens at 90° where both are edge-on.

Tap to flip on every device. Drag to flip on touch and pen only; a mouse user
gets tap. Commit threshold is a flick over 0.35 px/ms **or** a drag past 25% of
the card width, so both a decisive flick and a slow deliberate drag work.

Reduced motion replaces the rotation with a cross-fade and releases
`backface-visibility` so both faces composite.

---

## Progress bar and streak ring

Bar animates `transform: scaleX` on an inner fill, never `width`.

Ring animates `stroke-dashoffset`. This is a **justified exception** to the
transform/opacity-only rule: it paints but never lays out, on an SVG under
100px. The transform-only alternative needs two masked half-circles and breaks
past 50% — more code and more failure modes for no measurable frame-time gain.

**Both animate from the previous value for free**, because CSS transitions
interpolate from the current computed value. Two rules keep it that way:

1. Keep the React key stable across renders.
2. Set the value during render, never in a `useEffect` after mount.

A `useState(0)` seeded by an effect is exactly the bug that makes every bar
sweep from zero on every navigation.

Always pair with the number. A bar alone is not accessible to someone who
cannot judge proportion by eye.

---

## Toast

Politeness by intent:

| Tone | Region | Interrupts |
| --- | --- | --- |
| success, info | `aria-live="polite"` | No |
| warning, error | `role="alert"` | Yes |

**Both regions are always mounted and usually empty.** A live region that
mounts at the same time as its content is frequently not announced at all; the
region has to exist first.

A toast is never the only channel for something important. If the user must
act, use an inline message or a modal — a toast that times out while someone is
reading a passage has communicated nothing.
