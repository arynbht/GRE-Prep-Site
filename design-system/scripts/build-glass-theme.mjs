/**
 * Builds the Glassmorphism theme from the UI/UX Pro Max design-system output.
 *
 *   node design-system/scripts/build-glass-theme.mjs
 *
 * Emits design-system/css/glass-theme.css, which REDEFINES the --vlm-* semantic
 * tokens. Because every component in the app reads those names rather than raw
 * colours, this re-skins the whole product without touching a component.
 *
 * It audits the skill's palette with the same maths used for Vellum, because
 * the skill's own pre-delivery checklist requires 4.5:1 body text, and shipping
 * a failing pair is a defect whatever its source.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { contrast, mix, firstPassing } from './color.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const glass = JSON.parse(fs.readFileSync(path.join(root, 'tokens/glass.json'), 'utf8'));
const { palette, ramp, glass: fx, motion } = glass;

const notes = [];

// ---------------------------------------------------------------- resolution

/** Text colours the skill supplied, checked and corrected only where they fail. */
function textOn(bg, preferred, fallbacks, label, required = 4.5) {
  const chosen = firstPassing([preferred, ...fallbacks], bg, required);
  if (chosen === null) {
    notes.push(`UNRESOLVED ${label}: nothing clears ${required}:1 on ${bg}`);
    return preferred;
  }
  if (chosen !== preferred) {
    notes.push(
      `${label}: skill value ${preferred} measured ${contrast(preferred, bg).toFixed(2)}:1 on ${bg}; ` +
        `using ${chosen} (${contrast(chosen, bg).toFixed(2)}:1)`,
    );
  }
  return chosen;
}

// The skill gives on-accent as #000000. Orange 600 is dark enough that black
// fails; check and correct rather than assume either way.
const onAccent = textOn(palette.accent, palette['on-accent'], ['#FFFFFF'], 'on-accent', 4.5);
const onPrimary = textOn(palette.primary, palette['on-primary'], ['#FFFFFF', '#000000'], 'on-primary', 4.5);

// Accent as TEXT on a light card, which is where a streak label lives.
const accentText = textOn(
  palette.card,
  palette.accent,
  [ramp.orange['700'], ramp.orange['800']],
  'accent-as-text (light)',
  4.5,
);

// Glass surfaces are translucent, so contrast is measured against the WORST
// case: the surface composited over the page background.
const glassLight = mix('#FFFFFF', palette.background, 0.72);
const glassDark = mix(ramp.slate['800'], ramp.slate['950'], 0.62);

const light = {
  surface: palette.background,
  'surface-raised': palette.card,
  'surface-sunken': palette.muted,
  'surface-overlay': palette.card,
  'surface-scrim': 'rgb(15 23 42 / 0.45)',

  'border-subtle': palette.border,
  'border-strong': textOn(palette.background, ramp.slate['400'], [ramp.slate['500']], 'border-strong (light)', 3),
  'border-interactive': ramp.slate['300'],

  'text-primary': palette.foreground,
  'text-secondary': palette['muted-foreground'],
  'text-tertiary': textOn(palette.card, ramp.slate['500'], [ramp.slate['600']], 'text-tertiary (light)'),
  'text-inverse': '#FFFFFF',
  'text-link': textOn(palette.card, palette.primary, [ramp.blue['700']], 'text-link (light)'),

  action: palette.primary,
  'action-hover': ramp.blue['700'],
  'action-pressed': ramp.blue['800'],
  'action-subtle': ramp.blue['50'],
  'action-subtle-hover': ramp.blue['100'],
  'action-border': palette.primary,
  'on-action': onPrimary,
  'focus-ring': palette.ring,

  accent: palette.accent,
  'accent-text': accentText,
  'accent-strong': ramp.orange['500'],
  'accent-subtle': ramp.orange['50'],
  'on-accent': onAccent,

  'answer-correct-fg': textOn('#ECFDF5', '#047857', ['#065F46'], 'correct (light)'),
  'answer-correct-bg': '#ECFDF5',
  'answer-correct-border': '#A7F3D0',
  'answer-incorrect-fg': textOn('#FEF2F2', palette.destructive, ['#B91C1C', '#991B1B'], 'incorrect (light)'),
  'answer-incorrect-bg': '#FEF2F2',
  'answer-incorrect-border': '#FECACA',
  'answer-skipped-fg': textOn(palette.muted, ramp.slate['500'], [ramp.slate['600']], 'skipped (light)'),
  'answer-skipped-bg': palette.muted,
  'answer-skipped-border': ramp.slate['300'],
  'answer-marked-fg': textOn(ramp.orange['50'], palette.accent, [ramp.orange['700']], 'marked (light)'),
  'answer-marked-bg': ramp.orange['50'],
  'answer-marked-border': ramp.orange['200'],

  'success-fg': textOn('#ECFDF5', '#047857', ['#065F46'], 'success (light)'),
  'success-bg': '#ECFDF5',
  'success-border': '#A7F3D0',
  'warning-fg': textOn(ramp.orange['50'], ramp.orange['700'], [ramp.orange['800']], 'warning (light)'),
  'warning-bg': ramp.orange['50'],
  'warning-border': ramp.orange['200'],
  'error-fg': textOn('#FEF2F2', palette.destructive, ['#B91C1C'], 'error (light)'),
  'error-bg': '#FEF2F2',
  'error-border': '#FECACA',
  'info-fg': textOn(ramp.blue['50'], palette.primary, [ramp.blue['700']], 'info (light)'),
  'info-bg': ramp.blue['50'],
  'info-border': ramp.blue['200'],

  'timer-calm-fg': palette['muted-foreground'],
  'timer-warning-fg': textOn(palette.card, ramp.orange['700'], [ramp.orange['800']], 'timer warning (light)'),
  'timer-urgent-fg': textOn(palette.card, palette.destructive, ['#B91C1C'], 'timer urgent (light)'),

  'elevation-raised': '0 1px 2px rgb(15 23 42 / 0.04), 0 1px 3px rgb(15 23 42 / 0.08)',
  'elevation-overlay': '0 4px 8px rgb(15 23 42 / 0.04), 0 12px 24px rgb(15 23 42 / 0.10)',
  'elevation-modal': '0 8px 16px rgb(15 23 42 / 0.06), 0 24px 48px rgb(15 23 42 / 0.14)',
  'elevation-raised-border': palette.border,
  'elevation-overlay-border': palette.border,
};

// The skill lists "dark mode by default" as an anti-pattern, not dark mode
// itself, and the product needs it. Derived by lightening interactive colours
// and tinting fills, per the skill's own colour-dark-mode rule.
const dark = {
  surface: ramp.slate['900'],
  'surface-raised': ramp.slate['850'],
  'surface-sunken': ramp.slate['950'],
  'surface-overlay': ramp.slate['850'],
  'surface-scrim': 'rgb(2 6 23 / 0.66)',

  'border-subtle': ramp.slate['800'],
  'border-strong': textOn(ramp.slate['900'], ramp.slate['500'], [ramp.slate['400']], 'border-strong (dark)', 3),
  'border-interactive': ramp.slate['700'],

  'text-primary': ramp.slate['50'],
  'text-secondary': ramp.slate['300'],
  'text-tertiary': textOn(ramp.slate['900'], ramp.slate['400'], [ramp.slate['300']], 'text-tertiary (dark)'),
  'text-inverse': ramp.slate['900'],
  'text-link': textOn(ramp.slate['900'], ramp.blue['300'], [ramp.blue['200']], 'text-link (dark)'),

  action: ramp.blue['400'],
  'action-hover': ramp.blue['300'],
  'action-pressed': ramp.blue['200'],
  'action-subtle': mix(ramp.blue['400'], ramp.slate['900'], 0.16),
  'action-subtle-hover': mix(ramp.blue['400'], ramp.slate['900'], 0.24),
  'action-border': ramp.blue['500'],
  'on-action': textOn(ramp.blue['400'], ramp.slate['950'], ['#FFFFFF'], 'on-action (dark)'),
  'focus-ring': ramp.blue['300'],

  accent: ramp.orange['400'],
  'accent-text': textOn(ramp.slate['850'], ramp.orange['300'], [ramp.orange['200']], 'accent-as-text (dark)'),
  'accent-strong': ramp.orange['300'],
  'accent-subtle': mix(ramp.orange['400'], ramp.slate['900'], 0.16),
  'on-accent': ramp.slate['950'],

  'answer-correct-fg': '#6EE7B7',
  'answer-correct-bg': mix('#6EE7B7', ramp.slate['900'], 0.14),
  'answer-correct-border': mix('#6EE7B7', ramp.slate['900'], 0.34),
  'answer-incorrect-fg': '#FCA5A5',
  'answer-incorrect-bg': mix('#F87171', ramp.slate['900'], 0.14),
  'answer-incorrect-border': mix('#F87171', ramp.slate['900'], 0.34),
  'answer-skipped-fg': ramp.slate['400'],
  'answer-skipped-bg': mix(ramp.slate['400'], ramp.slate['900'], 0.1),
  'answer-skipped-border': ramp.slate['700'],
  'answer-marked-fg': ramp.orange['300'],
  'answer-marked-bg': mix(ramp.orange['400'], ramp.slate['900'], 0.16),
  'answer-marked-border': mix(ramp.orange['400'], ramp.slate['900'], 0.34),

  'success-fg': '#6EE7B7',
  'success-bg': mix('#6EE7B7', ramp.slate['900'], 0.14),
  'success-border': mix('#6EE7B7', ramp.slate['900'], 0.34),
  'warning-fg': ramp.orange['300'],
  'warning-bg': mix(ramp.orange['400'], ramp.slate['900'], 0.14),
  'warning-border': mix(ramp.orange['400'], ramp.slate['900'], 0.34),
  'error-fg': '#FCA5A5',
  'error-bg': mix('#F87171', ramp.slate['900'], 0.14),
  'error-border': mix('#F87171', ramp.slate['900'], 0.34),
  'info-fg': ramp.blue['300'],
  'info-bg': mix(ramp.blue['400'], ramp.slate['900'], 0.14),
  'info-border': mix(ramp.blue['400'], ramp.slate['900'], 0.34),

  'timer-calm-fg': ramp.slate['300'],
  'timer-warning-fg': ramp.orange['300'],
  'timer-urgent-fg': '#FCA5A5',

  'elevation-raised': 'none',
  'elevation-overlay': 'none',
  'elevation-modal': 'none',
  'elevation-raised-border': ramp.slate['800'],
  'elevation-overlay-border': ramp.slate['700'],
};

// ------------------------------------------------------------------ audit

const PAIRS = [
  ['text-primary', 'surface', 4.5],
  ['text-primary', 'surface-raised', 4.5],
  ['text-secondary', 'surface', 4.5],
  ['text-secondary', 'surface-raised', 4.5],
  ['text-tertiary', 'surface-raised', 4.5],
  ['text-link', 'surface-raised', 4.5],
  ['on-action', 'action', 4.5],
  ['action', 'surface-raised', 4.5],
  ['action', 'action-subtle', 4.5],
  ['accent-text', 'surface-raised', 4.5],
  ['on-accent', 'accent', 4.5],
  ['answer-correct-fg', 'answer-correct-bg', 4.5],
  ['answer-incorrect-fg', 'answer-incorrect-bg', 4.5],
  ['answer-skipped-fg', 'answer-skipped-bg', 4.5],
  ['answer-marked-fg', 'answer-marked-bg', 4.5],
  ['success-fg', 'success-bg', 4.5],
  ['warning-fg', 'warning-bg', 4.5],
  ['error-fg', 'error-bg', 4.5],
  ['info-fg', 'info-bg', 4.5],
  ['timer-urgent-fg', 'surface-raised', 4.5],
  ['border-strong', 'surface', 3],
  ['focus-ring', 'surface', 3],
  ['focus-ring', 'surface-raised', 3],
  ['focus-ring', 'action-subtle', 3],
];

const results = [];
for (const [theme, tokens] of [['light', light], ['dark', dark]]) {
  for (const [fg, bg, required] of PAIRS) {
    const fgValue = tokens[fg];
    const bgValue = tokens[bg];
    if (!fgValue || !bgValue || fgValue.startsWith('rgb') || bgValue.startsWith('rgb')) continue;
    const ratio = contrast(fgValue, bgValue);
    results.push({ theme, fg, bg, fgValue, bgValue, required, ratio: Math.round(ratio * 100) / 100, pass: ratio >= required });
  }
}

// Text over a translucent glass panel, at its worst composite.
for (const [theme, tokens, composite] of [['light', light, glassLight], ['dark', dark, glassDark]]) {
  for (const token of ['text-primary', 'text-secondary', 'action']) {
    const ratio = contrast(tokens[token], composite);
    results.push({
      theme,
      fg: token,
      bg: 'glass-panel (composited)',
      fgValue: tokens[token],
      bgValue: composite,
      required: 4.5,
      ratio: Math.round(ratio * 100) / 100,
      pass: ratio >= 4.5,
    });
  }
}

const failures = results.filter((r) => !r.pass);

// --------------------------------------------------------------- CSS emit

const block = (tokens, indent = '  ') =>
  Object.entries(tokens)
    .map(([name, value]) => `${indent}--vlm-${name}: ${value};`)
    .join('\n');

const fxBlock = (mode) =>
  [
    `  --glass-blur: ${fx.blur};`,
    `  --glass-blur-strong: ${fx['blur-strong']};`,
    `  --glass-surface: ${fx[mode + '-surface']};`,
    `  --glass-surface-strong: ${fx[mode + '-surface-strong']};`,
    `  --glass-border: ${fx[mode + '-border']};`,
    `  --glass-edge: ${fx[mode + '-edge']};`,
    `  --glass-sheen: ${mode === 'light' ? fx.sheen : fx['sheen-dark']};`,
  ].join('\n');

const css = `/* GENERATED by design-system/scripts/build-glass-theme.mjs — do not edit by hand.
 * Source: design-system/tokens/glass.json
 *
 * Glassmorphism theme from the UI/UX Pro Max design-system query. This file
 * REDEFINES the --vlm-* semantic tokens, so it must load AFTER tokens.css.
 * No component changes are required: every component already reads these names.
 *
 * Contrast: ${results.length} pairs measured, ${failures.length} failing.
 */

:root {
${block(light)}

${fxBlock('light')}

  --reveal-duration: ${motion['reveal-duration']};
  --reveal-easing: ${motion['reveal-easing']};
  --reveal-offset: ${motion['reveal-offset']};
  --reveal-stagger: ${motion['reveal-stagger']};
}

[data-theme='dark'] {
${block(dark)}

${fxBlock('dark')}
}

[data-theme='light'] {
${block(light)}

${fxBlock('light')}
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) {
${block(dark, '    ')}

${fxBlock('dark').split('\n').map((l) => '  ' + l).join('\n')}
  }
}
`;

fs.writeFileSync(path.join(root, 'css/glass-theme.css'), css, 'utf8');

console.log('glass-theme.css written');
console.log('contrast: ' + results.length + ' pairs, ' + failures.length + ' failing');
if (notes.length) {
  console.log('\nCorrections applied to the skill palette:');
  for (const note of notes) console.log('  - ' + note);
}
if (failures.length) {
  console.log('\nFAILING:');
  for (const f of failures) {
    console.log('  ' + f.theme.padEnd(5) + ' ' + f.fg + ' on ' + f.bg + '  ' + f.ratio.toFixed(2) + ':1 (need ' + f.required + ')');
  }
  process.exit(1);
}
