# Spacing, elevation, layout

## Scale

4px base. Twelve steps, referenced by index, never by pixel value.

| Token | px | Typical use |
| --- | --- | --- |
| `space-0` | 0 | |
| `space-1` | 4 | Icon-to-label |
| `space-2` | 8 | Inside a chip, between tight siblings |
| `space-3` | 12 | Control padding, gap in a row |
| `space-4` | 16 | Card padding, answer-row padding, mobile gutter |
| `space-5` | 24 | **Between sibling blocks**, tablet gutter |
| `space-6` | 32 | Desktop gutter, answer letter-slot width |
| `space-7` | 40 | **Between sections** |
| `space-8` | 48 | |
| `space-9` | 64 | **Before a page-level divider** |
| `space-10` | 80 | |
| `space-11` | 96 | Page top and bottom on desktop |

No arbitrary values. The Tailwind theme clears the stock spacing scale, so
`p-[18px]` does not compile — which is the point.

### Vertical rhythm

24 between siblings, 40 between sections, 64 before a page divider. The `flow`
and `flow-section` utilities apply these as `margin-block-start` on adjacent
siblings, which avoids the collapsing-margin problems of setting both sides.

## Radii

| Token | px | Applies to |
| --- | --- | --- |
| `radius-sm` | 6 | Chips, badges, navigator cells, timer chip |
| `radius-md` | 10 | Buttons, inputs, selects |
| `radius-lg` | 14 | Cards, answer rows, panels |
| `radius-xl` | 20 | Modals, bottom sheets |
| `radius-full` | — | Avatars, pills, progress tracks, single-select letter slot |

The single-select letter slot is `radius-full` and the multi-select slot is
`radius-sm`. That shape difference is the at-a-glance signal for which
interaction model applies, and it is load-bearing — see `04-components.md`.

## Elevation

Four levels, two-layer shadows, all low contrast.

```css
--vlm-shadow-1: 0 1px 2px rgb(16 24 40 / 0.04), 0 1px 3px rgb(16 24 40 / 0.08);
--vlm-shadow-2: 0 2px 4px rgb(16 24 40 / 0.04), 0 4px 8px rgb(16 24 40 / 0.08);
--vlm-shadow-3: 0 4px 8px rgb(16 24 40 / 0.04), 0 12px 20px rgb(16 24 40 / 0.10);
--vlm-shadow-4: 0 8px 16px rgb(16 24 40 / 0.06), 0 24px 40px rgb(16 24 40 / 0.12);
```

**In dark mode these resolve to `none`.** Elevation there is a lightened
border, because a soft shadow over a dark surface reads as haze rather than
lift. Use the `elevated` utility and the swap is automatic:

```css
@utility elevated {
  background-color: var(--vlm-surface-raised);
  border: 1px solid var(--vlm-elevation-raised-border);
  box-shadow: var(--vlm-elevation-raised);  /* none in dark */
}
```

## Grid and breakpoints

12 columns. Max content width 1200px. Reading column 68ch.

| Breakpoint | Width | Gutter | Layout change |
| --- | --- | --- | --- |
| base | < 480 | 16 | Single column, bottom tab bar |
| `xs` | 480 | 16 | |
| `sm` | 768 | 24 | Two-column stat grids |
| `md` | 1024 | 32 | Split view: passage left, questions right |
| `lg` | 1280 | 32 | Sidebar + content + navigator |

The split view at `md` is the layout that matters most. Below it, the passage
becomes a collapsible panel above the questions rather than a side-by-side
column, because a 68ch measure and a question stack do not both fit under
1024px without shrinking one of them.

## Touch targets

| Element | Minimum |
| --- | --- |
| Everything interactive | 44 × 44 |
| **Answer choices** | **56 high** |
| Navigator cells | 44 × 44 |
| Icon buttons | 44 × 44, even with a 16px icon |

Answer rows get 56 rather than 44 because they are tapped rapidly and
repeatedly, often one-handed on a phone, and a mis-tap in a timed section costs
the question. The extra 12px is the cheapest accuracy the product can buy.

Spacing counts toward the target when the padding is part of the same
interactive element. A 16px icon in a button with `p-3` is a 40px target and
still fails; use `h-11 w-11`.
