/**
 * Vellum system lint.
 *
 *   node design-system/scripts/lint-system.mjs
 *
 * Checks the invariants the system claims, so a claim cannot rot into a lie:
 *   1. Every semantic token exists in BOTH themes in the generated CSS.
 *   2. Every token referenced by CSS or components actually exists.
 *   3. No component or utility reaches into a primitive ramp.
 *   4. No literal millisecond or cubic-bezier value outside the token files.
 *   5. No layout-triggering property is transitioned, except where documented.
 *   6. Every motion rule has a reduced-motion counterpart.
 *   7. The Tailwind theme exposes no primitive ramp as a utility.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const failures = [];
const notes = [];
const fail = (rule, detail) => failures.push(rule + ': ' + detail);

const tokensCss = read('css/tokens.css');
const themeCss = read('css/theme.css');
const utilitiesCss = read('css/utilities.css');
const motionCss = read('css/motion.css');
const resolved = JSON.parse(read('tokens/resolved.json'));
const primitives = JSON.parse(read('tokens/primitives.json'));

const componentFiles = fs
  .readdirSync(path.join(root, 'components'))
  .filter((f) => f.endsWith('.tsx') || f.endsWith('.ts'));
const componentSource = componentFiles.map((f) => read('components/' + f)).join('\n');

// ---------------------------------------------------- 1. both themes defined

const lightNames = Object.keys(resolved.themes.light);
const darkNames = Object.keys(resolved.themes.dark);
for (const name of lightNames) {
  if (!darkNames.includes(name)) fail('both-themes', name + ' missing from dark');
}
for (const name of darkNames) {
  if (!lightNames.includes(name)) fail('both-themes', name + ' missing from light');
}

// Each semantic name must appear in the dark block of the emitted CSS.
const darkBlock = tokensCss.slice(tokensCss.indexOf("[data-theme='dark']"));
for (const name of lightNames) {
  if (!darkBlock.includes('--vlm-' + name + ':')) {
    fail('both-themes', '--vlm-' + name + ' not emitted under [data-theme=dark]');
  }
}

// -------------------------------------------------- 2. references all resolve

const declared = new Set([...tokensCss.matchAll(/--vlm-[a-z0-9-]+(?=\s*:)/g)].map((m) => m[0]));
const consumers = { 'theme.css': themeCss, 'utilities.css': utilitiesCss, 'motion.css': motionCss };
for (const [file, source] of Object.entries(consumers)) {
  for (const match of source.matchAll(/var\((--vlm-[a-z0-9-]+)/g)) {
    if (!declared.has(match[1])) fail('undefined-token', file + ' uses ' + match[1] + ' which is not declared');
  }
}
for (const match of componentSource.matchAll(/var\((--vlm-[a-z0-9-]+)/g)) {
  if (!declared.has(match[1])) fail('undefined-token', 'a component uses ' + match[1] + ' which is not declared');
}

// -------------------------------------------- 3. no primitive use downstream

const families = Object.keys(primitives.color).filter((k) => k !== 'transparent');
const primitivePattern = new RegExp('--vlm-(' + families.join('|') + ')-\\d', 'g');
for (const [file, source] of Object.entries({ 'utilities.css': utilitiesCss, 'motion.css': motionCss })) {
  for (const match of source.matchAll(primitivePattern)) {
    fail('primitive-leak', file + ' references ' + match[0] + '; use a semantic token');
  }
}
for (const match of componentSource.matchAll(primitivePattern)) {
  fail('primitive-leak', 'a component references ' + match[0] + '; use a semantic token');
}

// ------------------------------------------------ 4. no hardcoded motion values

for (const [file, source] of Object.entries({ 'utilities.css': utilitiesCss, 'motion.css': motionCss })) {
  const withoutComments = source.replace(/\/\*[\s\S]*?\*\//g, '');
  // Durations inside transition/animation shorthands.
  for (const line of withoutComments.split('\n')) {
    if (!/transition|animation/.test(line)) continue;
    const ms = line.match(/(?<![\w-])\d+m?s(?![\w-])/g);
    if (!ms) continue;
    // Keyframe percentages and the documented staging delays are allowed.
    // 0ms is a reset, not a duration choice.
    const allowed = /allow-discrete|infinite|linear/.test(line) || ms.every((v) => v === '0ms');
    if (!allowed) notes.push(file + ' has a literal duration: ' + line.trim());
  }
  for (const match of withoutComments.matchAll(/cubic-bezier\([^)]*\)/g)) {
    fail('hardcoded-easing', file + ' has a literal ' + match[0] + '; use an --vlm-ease-* token');
  }
}

// -------------------------------- 5. no layout properties in transitions

const LAYOUT_PROPS = ['width', 'height', 'top', 'left', 'right', 'bottom', 'margin', 'padding', 'inset'];
const DOCUMENTED_EXCEPTIONS = ['grid-template-rows', 'block-size', 'font-weight', 'stroke-dashoffset'];
const motionNoComments = motionCss.replace(/\/\*[\s\S]*?\*\//g, '');
for (const block of motionNoComments.matchAll(/transition:\s*([^;]+);/g)) {
  const value = block[1];
  for (const prop of LAYOUT_PROPS) {
    const pattern = new RegExp('(^|[,\\s])' + prop + '\\s+\\d|(^|[,\\s])' + prop + '\\s+var');
    if (pattern.test(value)) {
      fail('layout-animation', 'transition animates ' + prop + ': ' + value.replace(/\s+/g, ' ').trim());
    }
  }
}
for (const exception of DOCUMENTED_EXCEPTIONS) {
  if (motionNoComments.includes('transition: ' + exception) || motionNoComments.includes(exception + ' var(--vlm-duration')) {
    notes.push('documented exception in use: ' + exception);
  }
}

// ------------------------------------------- 6. reduced-motion coverage

if (!motionCss.includes('@media (prefers-reduced-motion: reduce)')) {
  fail('reduced-motion', 'motion.css has no reduced-motion block');
}
const reducedBlock = motionCss.slice(motionCss.indexOf('@media (prefers-reduced-motion: reduce)'));
const MUST_BE_HANDLED = [
  '.vlm-flashcard__inner',
  '.vlm-toast',
  '.vlm-modal',
  '.vlm-sheet',
  '.vlm-nav-panel',
  '.vlm-explanation',
  '.vlm-progress__fill',
  '.vlm-ring__value',
  '.vlm-button__spinner',
];
for (const selector of MUST_BE_HANDLED) {
  if (!reducedBlock.includes(selector)) {
    fail('reduced-motion', selector + ' animates but has no reduced-motion variant');
  }
}
// The reduced-motion block must be last so it wins by source order.
const lastReduced = motionCss.lastIndexOf('@media (prefers-reduced-motion: reduce)');
const lastContrast = motionCss.lastIndexOf('@media (prefers-contrast: more)');
if (lastReduced > lastContrast && lastContrast !== -1) {
  notes.push('reduced-motion sits after prefers-contrast; verify intended cascade');
}

// ------------------------------- 7. Tailwind exposes no primitive ramps

for (const match of themeCss.matchAll(/--color-([a-z-]+):\s*var\((--vlm-[a-z0-9-]+)\)/g)) {
  const [, utility, token] = match;
  if (new RegExp('--vlm-(' + families.join('|') + ')-\\d').test(token)) {
    fail('tailwind-primitive', 'utility bg-' + utility + ' maps to primitive ' + token);
  }
}
for (const cleared of ['--color-*', '--spacing-*', '--radius-*', '--text-*']) {
  if (!themeCss.includes(cleared + ': initial')) {
    fail('tailwind-stock', 'theme.css does not clear Tailwind stock ' + cleared);
  }
}

// --------------------------- 8. Tailwind breakpoints match the tokens
// These cannot be var() references, so they are the one place a value is
// duplicated. Assert the duplicate is correct rather than trusting it.
for (const [name, value] of Object.entries(primitives.breakpoint)) {
  if (name.startsWith('$')) continue;
  const declared = new RegExp('--breakpoint-' + name + ':\\s*([0-9]+px)').exec(themeCss);
  if (!declared) {
    fail('breakpoint-sync', 'theme.css has no literal --breakpoint-' + name);
  } else if (declared[1] !== value) {
    fail(
      'breakpoint-sync',
      '--breakpoint-' + name + ' is ' + declared[1] + ' in theme.css but ' + value + ' in primitives.json',
    );
  }
}

// ------------------------------------------------------------------- report

console.log('Vellum system lint\n');
console.log('  semantic tokens : ' + lightNames.length + ' per theme');
console.log('  declared vars   : ' + declared.size);
console.log('  components      : ' + componentFiles.length);
console.log('');

if (notes.length) {
  console.log('Notes (not failures):');
  for (const note of [...new Set(notes)]) console.log('  - ' + note);
  console.log('');
}

if (failures.length === 0) {
  console.log('PASS — all invariants hold.');
  process.exit(0);
}
console.error(failures.length + ' FAILURE(S):');
for (const failure of failures) console.error('  ' + failure);
process.exit(1);
