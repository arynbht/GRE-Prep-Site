# Typography

## Three families, three jobs

| Family | Used for | Fallback |
| --- | --- | --- |
| **Inter** (variable) | All UI, and every number | `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` |
| **Literata** | Reading passages only | `Georgia, "Times New Roman", serif` |
| **JetBrains Mono** | Code and inline formulas outside KaTeX | `ui-monospace, "SF Mono", Menlo, monospace` |
| **KaTeX stack** | Rendered mathematics | `"Latin Modern Math", "STIX Two Math", Cambria Math, serif` |

**Literata over Source Serif 4.** Literata was drawn for long-session screen
reading and has a larger x-height, so at 18px in a 68ch column it holds the line
better; Source Serif is the more elegant face and the wrong tool for someone
reading a dense passage at midnight.

## The passage serif is a feature, not decoration

Long-form academic prose in a reading-optimised serif at 18px/1.7 measurably
slows readers down. That is **correct for this task**: a GRE passage rewards
careful reading, and a UI that encourages skimming costs the user the question.
Everything else in the product is sans and can be scanned.

Reading column is capped at 68ch. The cap is on the text, not the panel, so a
split-view passage panel can be wider than its measure.

## Tabular numerals everywhere they matter

```css
font-variant-numeric: tabular-nums lining-nums;
```

Apply via the `tabular` utility to: the timer, every score, every table cell,
both quantities in a comparison, and the answer-row letter slot.

Proportional figures have different widths per digit, so a counting-down timer
visibly jitters as the glyphs change. For an anxious user watching the clock,
that is the last thing the interface should do. This is the highest-value
one-line rule in the type system.

## Scale

| Token | Size / line | Weight | Tracking | Notes |
| --- | --- | --- | --- | --- |
| `display` | 40 / 44 | 600 | −0.02em | Score reveal and marketing only |
| `h1` | 32 / 38 | 600 | −0.02em | |
| `h2` | 26 / 32 | 600 | −0.01em | |
| `h3` | 21 / 28 | 600 | −0.01em | |
| `h4` | 18 / 26 | 600 | 0 | |
| `passage` | 18 / 30 | 400 | 0 | Serif. Max-width 68ch |
| `body` | 16 / 26 | 400 | 0 | **Floor for all answer content** |
| `body-sm` | 14 / 22 | 400 | 0 | |
| `caption` | 13 / 18 | 500 | 0.01em | Metadata only |
| `overline` | 12 / 16 | 600 | 0.06em | Uppercase |

Weights: 400, 500, 600, 700. Never synthesise bold — a faux-bold Inter at 600
is visibly worse than the real cut and breaks tabular alignment. Never go below
400 for body text.

**Answer-choice text is 16px on every breakpoint.** It does not scale down on
mobile to fit more choices on screen. If five choices do not fit, the user
scrolls; a 14px answer on a phone at 2am is how people misread the question
they actually knew.

## Glyph coverage

Required: `√ π ∑ ≤ ≥ ≈ ≠ ∞ °`, superscripts `² ³ ⁴`, Greek `μ σ θ Δ`.

| Glyph set | Inter | Literata | JetBrains Mono | Strategy |
| --- | --- | --- | --- | --- |
| `≤ ≥ ≈ ≠ ° ±` | yes | yes | yes | Use directly |
| `√ ∑ ∞ ∆` | yes | yes | yes | Use directly |
| `π μ σ θ` (Greek) | yes | yes | yes | Use directly |
| `² ³ ⁴` superscripts | yes | yes | partial | See below |
| `⁵ ⁶ ⁷ ⁸ ⁹` superscripts | partial | partial | no | **Do not use** |

**Verify before shipping.** These are the published coverage claims for the
full font files, and a subset built with `pyftsubset` will drop anything you
did not ask for. The check belongs in CI:

```bash
# Fails the build if a required codepoint is missing from a subset.
python -c "
from fontTools.ttLib import TTFont
import sys
required = '√π∑≤≥≈≠∞°²³⁴μσθΔ'
for path in sys.argv[1:]:
    cmap = TTFont(path).getBestCmap()
    missing = [c for c in required if ord(c) not in cmap]
    print(path, 'MISSING:' + ''.join(missing) if missing else 'ok')
    if missing: sys.exit(1)
" public/fonts/*.woff2
```

### The fallback strategy

Three layers, in order:

1. **Subset to include the required set.** Add `U+00B0,U+00B1,U+00D7,U+00F7,
   U+0394,U+03B8,U+03BC,U+03C0,U+03C3,U+00B2,U+00B3,U+2074,U+2211,U+221A,
   U+221E,U+2248,U+2260,U+2264,U+2265` to the unicode-range of the primary
   subset. This is the fix for almost every gap.

2. **Declare a math fallback in the stack**, so an uncovered glyph falls to a
   face that has it rather than to `.notdef`:

   ```css
   --vlm-font-sans: 'Inter var', Inter, 'STIX Two Math', -apple-system, …;
   ```

   Placing the math face after Inter means it is only consulted for glyphs
   Inter lacks, so it never affects normal text.

3. **Render real maths with KaTeX.** Anything beyond a lone symbol in a
   sentence — a fraction, a radical with an index, an exponent above 4, a
   summation with bounds — goes through KaTeX rather than Unicode. Superscripts
   past `⁴` are the clearest case: coverage is unreliable and `x⁵` in Unicode
   will eventually render as a box on someone's Android.

**Never** synthesise a superscript with `vertical-align` and a smaller
`font-size`. It breaks line height, it breaks selection, and it is announced as
a separate number by screen readers: `x5`, not `x to the fifth`.
