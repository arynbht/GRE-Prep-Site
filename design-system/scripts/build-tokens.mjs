/**
 * Vellum token build.
 *
 *   node design-system/scripts/build-tokens.mjs
 *
 * Reads primitives.json + semantic.json and emits:
 *   design-system/css/tokens.css        CSS custom properties, :root + [data-theme]
 *   design-system/tokens/resolved.json  every semantic token flattened per theme
 *   design-system/docs/contrast.md      measured WCAG ratios, failures flagged
 *
 * Dark-mode tints are blended here rather than with runtime color-mix(), so the
 * shipped value is a static hex that can be contrast-checked and does not depend
 * on color-mix() support (iOS Safari only gained it in 16.2).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

const primitives = JSON.parse(fs.readFileSync(path.join(root, 'tokens/primitives.json'), 'utf8'));
const semantic = JSON.parse(fs.readFileSync(path.join(root, 'tokens/semantic.json'), 'utf8'));
const THEMES = semantic.$themes;

// ----------------------------------------------------------------- colour maths

function parseHex(hex) {
  const clean = hex.replace('#', '').trim();
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
}

const toHex = (rgb) => '#' + rgb.map((v) => Math.round(v).toString(16).padStart(2, '0').toUpperCase()).join('');

/** Blend `amount` of `top` into `base`, in sRGB, the way a flat overlay reads. */
function mix(top, base, amount) {
  const a = parseHex(top);
  const b = parseHex(base);
  return toHex(a.map((v, i) => v * amount + b[i] * (1 - amount)));
}

function relativeLuminance(hex) {
  const [r, g, b] = parseHex(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

// ------------------------------------------------------------------ resolution

function lookup(reference) {
  const pathParts = reference.replace(/[{}]/g, '').split('.');
  let node = primitives;
  for (const part of pathParts) {
    node = node?.[part];
    if (node === undefined) throw new Error('Unknown primitive reference: ' + reference);
  }
  if (typeof node !== 'string') throw new Error('Reference does not resolve to a value: ' + reference);
  return node;
}

function resolve(value) {
  if (typeof value === 'string') {
    return value.startsWith('{') ? lookup(value) : value;
  }
  if (value && typeof value === 'object' && Array.isArray(value.mix)) {
    const [top, base] = value.mix.map(resolve);
    return mix(top, base, value.amount);
  }
  throw new Error('Cannot resolve token value: ' + JSON.stringify(value));
}

/** Flattens the semantic tree into { theme: { 'group-name': value } }. */
function resolveAll() {
  const out = Object.fromEntries(THEMES.map((t) => [t, {}]));
  for (const [group, entries] of Object.entries(semantic)) {
    if (group.startsWith('$')) continue;
    for (const [name, token] of Object.entries(entries)) {
      if (name.startsWith('$')) continue;
      for (const theme of THEMES) {
        const raw = token[theme];
        if (raw === undefined) throw new Error('Token ' + group + '.' + name + ' has no ' + theme + ' value');
        out[theme][group === 'color' ? name : group + '-' + name] = resolve(raw);
      }
    }
  }
  return out;
}

const resolved = resolveAll();

// ------------------------------------------------------------------- CSS emit

function primitiveBlock() {
  const lines = [];
  for (const [family, ramp] of Object.entries(primitives.color)) {
    if (typeof ramp === 'string') continue;
    for (const [stop, value] of Object.entries(ramp)) {
      if (stop.startsWith('$')) continue;
      lines.push(`  --vlm-${family}-${stop}: ${value};`);
    }
  }
  const scalar = (group, prefix) => {
    for (const [key, value] of Object.entries(primitives[group])) {
      if (key.startsWith('$')) continue;
      if (typeof value === 'object') {
        for (const [sub, subValue] of Object.entries(value)) {
          if (sub.startsWith('$')) continue;
          lines.push(`  --vlm-${prefix}-${key}-${sub}: ${subValue};`);
        }
      } else {
        lines.push(`  --vlm-${prefix}-${key}: ${value};`);
      }
    }
  };
  lines.push('');
  scalar('space', 'space');
  lines.push('');
  scalar('radius', 'radius');
  lines.push('');
  scalar('size', 'size');
  lines.push('');
  scalar('layout', 'layout');
  lines.push('');
  scalar('shadow', 'shadow');
  lines.push('');
  scalar('duration', 'duration');
  lines.push('');
  scalar('stagger', 'stagger');
  lines.push('');
  scalar('breakpoint', 'breakpoint');
  lines.push('');
  scalar('easing', 'ease');
  lines.push('');
  scalar('z', 'z');
  lines.push('');
  for (const [key, value] of Object.entries(primitives.font.family)) {
    lines.push(`  --vlm-font-${key}: ${value};`);
  }
  for (const [key, value] of Object.entries(primitives.font.weight)) {
    lines.push(`  --vlm-weight-${key}: ${value};`);
  }
  for (const [key, value] of Object.entries(primitives.font.size)) {
    lines.push(`  --vlm-text-${key}-size: ${value};`);
    lines.push(`  --vlm-text-${key}-leading: ${primitives.font['line-height'][key]};`);
  }
  for (const [key, value] of Object.entries(primitives.font.tracking)) {
    lines.push(`  --vlm-tracking-${key}: ${value};`);
  }
  return lines.join('\n');
}

function semanticBlock(theme, indent = '  ') {
  return Object.entries(resolved[theme])
    .map(([name, value]) => `${indent}--vlm-${name}: ${value};`)
    .join('\n');
}

const css = `/* GENERATED by design-system/scripts/build-tokens.mjs — do not edit by hand.
 * Source of truth: design-system/tokens/primitives.json + semantic.json
 *
 * Layer 1 (--vlm-<family>-<stop>) is primitives. Do not use these in components.
 * Layer 2 (--vlm-<semantic-name>) is what components consume. Both themes define
 * the same names, so no component ever branches on theme.
 */

:root {
  color-scheme: light;

${primitiveBlock()}

  /* ---- semantic: light ---- */
${semanticBlock('light')}
}

/* Explicit override wins over the media query below. */
[data-theme='dark'] {
  color-scheme: dark;

${semanticBlock('dark')}
}

[data-theme='light'] {
  color-scheme: light;

${semanticBlock('light')}
}

/* System preference, only when the user has not chosen explicitly. */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) {
    color-scheme: dark;

${semanticBlock('dark', '    ')}
  }
}
`;

fs.mkdirSync(path.join(root, 'css'), { recursive: true });
fs.writeFileSync(path.join(root, 'css/tokens.css'), css, 'utf8');
fs.writeFileSync(
  path.join(root, 'tokens/resolved.json'),
  JSON.stringify({ $generated: true, themes: resolved }, null, 2) + '\n',
  'utf8',
);

// -------------------------------------------------------------- contrast audit

/** [foreground token, background token, required ratio, why it matters] */
const PAIRS = [
  ['text-primary', 'surface', 4.5, 'Body copy on the page'],
  ['text-primary', 'surface-raised', 4.5, 'Body copy in a card or answer row'],
  ['text-primary', 'surface-sunken', 4.5, 'Body copy in a well or passage panel'],
  ['text-secondary', 'surface', 4.5, 'Supporting copy'],
  ['text-secondary', 'surface-raised', 4.5, 'Supporting copy in a card'],
  ['text-secondary', 'surface-sunken', 4.5, 'Supporting copy in a well'],
  ['text-tertiary', 'surface', 4.5, 'Captions and metadata (13px, so still 4.5)'],
  ['text-tertiary', 'surface-raised', 4.5, 'Captions in a card'],
  ['text-link', 'surface', 4.5, 'Inline link'],
  ['text-link', 'surface-raised', 4.5, 'Link in a card'],
  ['on-action', 'action', 4.5, 'Primary button label'],
  ['action', 'surface', 4.5, 'Ghost and link button label'],
  ['action', 'surface-raised', 4.5, 'Action text in a card'],
  ['action', 'action-subtle', 4.5, 'Selected answer row label'],
  ['accent-text', 'surface-raised', 4.5, 'Streak and milestone text'],
  ['accent-text', 'accent-subtle', 4.5, 'Accent text on its own tint'],
  ['accent', 'surface-raised', 3, 'Progress arc and streak ring stroke (graphic, 1.4.11)'],

  ['answer-correct-fg', 'answer-correct-bg', 4.5, 'Correct answer row'],
  ['answer-correct-fg', 'surface-raised', 4.5, 'Correct icon on a plain card'],
  ['answer-incorrect-fg', 'answer-incorrect-bg', 4.5, 'Incorrect answer row'],
  ['answer-incorrect-fg', 'surface-raised', 4.5, 'Incorrect icon on a plain card'],
  ['answer-skipped-fg', 'answer-skipped-bg', 4.5, 'Skipped answer row'],
  ['answer-marked-fg', 'answer-marked-bg', 4.5, 'Marked-for-review row'],

  ['success-fg', 'success-bg', 4.5, 'Success toast'],
  ['warning-fg', 'warning-bg', 4.5, 'Warning toast'],
  ['error-fg', 'error-bg', 4.5, 'Error toast and validation message'],
  ['info-fg', 'info-bg', 4.5, 'Info toast'],
  ['error-fg', 'surface-raised', 4.5, 'Field error message under an input'],

  ['timer-calm-fg', 'surface-raised', 4.5, 'Timer, normal'],
  ['timer-warning-fg', 'surface-raised', 4.5, 'Timer, under 5 minutes'],
  ['timer-urgent-fg', 'surface-raised', 4.5, 'Timer, under 2 minutes'],

  ['border-strong', 'surface', 3, 'Input border (UI component)'],
  ['border-strong', 'surface-raised', 3, 'Control border in a card'],
  ['action-border', 'surface-raised', 3, 'Selected answer row border'],

  ['focus-ring', 'surface', 3, 'Focus ring on the page'],
  ['focus-ring', 'surface-raised', 3, 'Focus ring on a card'],
  ['focus-ring', 'surface-sunken', 3, 'Focus ring in a well'],
  ['focus-ring', 'action-subtle', 3, 'Focus ring inside a selected row'],
  ['focus-ring', 'answer-correct-bg', 3, 'Focus ring inside a correct row'],
  ['focus-ring', 'answer-incorrect-bg', 3, 'Focus ring inside an incorrect row'],
  ['focus-ring', 'answer-marked-bg', 3, 'Focus ring inside a marked row'],
];

const results = [];
for (const theme of THEMES) {
  for (const [fg, bg, required, why] of PAIRS) {
    const fgValue = resolved[theme][fg];
    const bgValue = resolved[theme][bg];
    if (!fgValue || !bgValue) throw new Error('Missing token in ' + theme + ': ' + fg + ' / ' + bg);
    if (fgValue.startsWith('rgb') || bgValue.startsWith('rgb')) continue;
    const ratio = contrast(fgValue, bgValue);
    results.push({ theme, fg, bg, fgValue, bgValue, required, ratio: Math.round(ratio * 100) / 100, why, pass: ratio >= required });
  }
}

// Answer feedback and system status must not share a colour in the same theme.
const collisions = [];
for (const theme of THEMES) {
  const answerTokens = ['answer-correct-fg', 'answer-incorrect-fg'];
  const systemTokens = ['success-fg', 'warning-fg', 'error-fg', 'info-fg'];
  for (const a of answerTokens) {
    for (const sys of systemTokens) {
      if (resolved[theme][a].toUpperCase() === resolved[theme][sys].toUpperCase()) {
        collisions.push({ theme, a, sys, value: resolved[theme][a] });
      }
    }
  }
}

const failures = results.filter((r) => !r.pass);

const mdRows = (theme) =>
  results
    .filter((r) => r.theme === theme)
    .map(
      (r) =>
        `| \`${r.fg}\` | \`${r.bg}\` | ${r.fgValue} on ${r.bgValue} | **${r.ratio.toFixed(2)}:1** | ${r.required}:1 | ${
          r.pass ? 'pass' : '**FAIL**'
        } | ${r.why} |`,
    )
    .join('\n');

const report = `# Contrast audit

GENERATED by \`design-system/scripts/build-tokens.mjs\`. Re-run after any token change.

Ratios are WCAG 2.x relative-luminance contrast, computed from the resolved
static hex of each token. Dark-mode tinted backgrounds are measured at their
blended value, not at the untinted primitive.

**Summary — ${results.length} pairs measured, ${failures.length} failing.**

${
  collisions.length === 0
    ? 'No collision between answer-feedback and system-status colours.'
    : '**Collisions found between answer feedback and system status:**\n\n' +
      collisions.map((c) => `- \`${c.theme}\`: \`${c.a}\` and \`${c.sys}\` are both \`${c.value}\`.`).join('\n')
}

## Light

| Foreground | Background | Values | Measured | Required | Result | Used for |
| --- | --- | --- | --- | --- | --- | --- |
${mdRows('light')}

## Dark

| Foreground | Background | Values | Measured | Required | Result | Used for |
| --- | --- | --- | --- | --- | --- | --- |
${mdRows('dark')}
`;

fs.mkdirSync(path.join(root, 'docs'), { recursive: true });
fs.writeFileSync(path.join(root, 'docs/contrast.md'), report, 'utf8');
fs.writeFileSync(
  path.join(root, 'docs/contrast.json'),
  JSON.stringify({ $generated: true, results, collisions }, null, 2) + '\n',
  'utf8',
);

console.log('tokens.css      ' + css.split('\n').length + ' lines');
console.log('resolved.json   ' + Object.keys(resolved.light).length + ' semantic tokens per theme');
console.log('contrast        ' + results.length + ' pairs, ' + failures.length + ' failing');
for (const f of failures) {
  console.log('  FAIL ' + f.theme.padEnd(5) + ' ' + f.fg + ' on ' + f.bg + '  ' + f.ratio.toFixed(2) + ':1 (need ' + f.required + ':1)');
}
for (const c of collisions) {
  console.log('  COLLISION ' + c.theme + ': ' + c.a + ' === ' + c.sys + ' (' + c.value + ')');
}
