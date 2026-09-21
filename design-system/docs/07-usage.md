# Usage guidelines

Weighted toward the traps specific to this product. Generic advice is omitted;
these are the mistakes that will actually be made here.

## Colour

**Do not use amber for actions.** Amber means progress, streaks, milestones and
marked-for-review. An amber button reads as a warning, and worse, it teaches
the user that amber means "act", which then makes the marked-for-review flag
look like a to-do item. Actions are indigo. Always.

**Do not use semantic red for wrong answers.** `error-*` is for toasts,
validation and connectivity. Answer feedback uses rose. If a user sees the same
colour when they answer wrong and when the network drops, you have taught them
that being wrong is a malfunction. The build script fails on this.

**Do not reach into the primitive ramp.** `bg-surface-raised`, never
`bg-neutral-0`. The Tailwind theme deletes the stock palette so `bg-blue-500`
does not compile, but `var(--vlm-indigo-600)` will still work if you type it —
and it will be wrong in dark mode. There is a semantic token for what you need;
if there genuinely is not, add one.

**Do not tint a dark surface at full saturation.** Every dark feedback
background is 14% of its foreground blended into the surface. A full-strength
fill glows, and at 2am that is painful.

## Typography

**Do not shrink answer text on mobile.** 16px on every breakpoint. If five
choices do not fit, the user scrolls. A 14px answer on a phone is how people
misread a question they actually knew.

**Do not use proportional figures on anything that counts.** Timers, scores,
table cells, both quantities in a comparison. Add the `tabular` utility. A
timer with proportional digits visibly jitters as it counts down.

**Do not set the passage in the UI sans.** The serif at 18/30 is doing real
work — it slows reading, which is correct for a GRE passage. Changing it to
Inter to "match the rest of the app" removes a feature.

**Do not synthesise bold.** 400/500/600/700 only, from the real cuts.

**Do not fake a superscript** with `vertical-align` and a smaller font. It
breaks line height and selection, and screen readers announce `x5` rather than
"x to the fifth". Use KaTeX or a real superscript glyph — and only `² ³ ⁴`,
because coverage past that is unreliable.

## Forms

**Do not hide labels in placeholders.** Ever. The label is a required prop and
there is no hidden option. A placeholder disappears the moment you type, fails
on autofill, fails on translation, and abandons anyone returning to a
half-filled form.

**Do not use `type="number"` for numeric entry.** Spinners on a test, silently
discarded input, and a hidden minus sign on some Androids. Use `type="text"`
with `inputMode="decimal"`.

**Do not put helper text and an error message together.** One or the other.
Two messages under a field is one more than anyone reads under time pressure.

## The answer row

**Do not make hover look like selected.** Hover sinks the surface and keeps the
border neutral. Selected fills with indigo. A fast mouse crossing a list must
never produce a false "this is chosen" reading.

**Do not dim rows after submit.** The user needs to read what they got wrong.
Disable interaction, keep legibility.

**Do not animate row geometry on hover.** No lift, no scale, no translate. It
moves the text the user is reading. Colour is enough.

**Do not let `revealed` shout louder than `correct`.** The row the user chose
is the one they care about. The right answer they missed is a dashed edge and a
label, not a second celebration.

**Do not replace the native input with a div.** `role="radio"` on a div means
hand-writing arrow keys, focus management and form participation, and getting
one of them subtly wrong.

## Motion

**Do not animate the timer.** No pulse, no glow, no loop, at any threshold.
This will be requested. The answer is that it makes the product worse for
exactly the user it claims to help: a repeating attention capture at the moment
concentration matters most, which the user cannot opt out of noticing.

**Do not add a second animation to the incorrect reveal.** The chosen row and
the correct row overlap by 50ms on purpose so they read as one beat. Separating
them turns information into a scolding.

**Do not shimmer skeletons in the exam flow.** A looping animation in the
visual field while someone waits for a question. Static blocks read as
"loading" fine. The shimmer variant is for marketing pages.

**Do not animate `width`, `height`, `top` or `margin`.** Transform and opacity
only. The two documented exceptions are the explanation panel
(`grid-template-rows`, contained, user-initiated) and the streak ring
(`stroke-dashoffset`, paint-only, sub-100px SVG).

**Do not add `will-change` broadly.** The only warranted use is the flashcard
during a drag, added on pointer-down and removed on commit.

**Do not exceed the budget.** Nothing over 300ms except the goal celebration at
450ms. If an interaction needs longer, it is doing too much.

## Feedback and status

**Do not use a toast for something the user must act on.** A toast that times
out while someone is reading a passage has communicated nothing. Inline message
or modal.

**Do not put the answer list in a live region.** Re-announcing five rows on
every arrow key is unusable. Correctness goes in a separate polite region.

**Do not celebrate anything except the daily goal.** One moment of delight, 450
ms, once. A product that congratulates you for answering a question correctly
is a product that is nagging you.

## Layout

**Do not go below 56px on answer rows** or 44px on anything else interactive.

**Do not use arbitrary spacing.** Twelve steps. If the design calls for 18px,
the design is wrong or the scale needs a step — decide which, do not inline it.

**Do not let the reading column exceed 68ch.** Cap the text, not the panel, so
a split-view passage panel can still be wide.
