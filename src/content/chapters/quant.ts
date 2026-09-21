import type { BookChapter } from '../types';

export const quantFormats: BookChapter = {
  id: 'quant-formats',
  title: 'Quantitative Reasoning: formats and Quantitative Comparison',
  summary: 'The four question formats, the on-screen calculator, and the strategy for the half of Quant that is comparison.',
  sections: [
    {
      id: 'quant-four-formats',
      title: 'The four question formats',
      blocks: [
        {
          kind: 'table',
          head: ['Format', 'Description', 'Share of section'],
          rows: [
            ['Quantitative Comparison', 'Compare Quantity A to Quantity B', 'about 7 to 8 per section'],
            ['Multiple choice, one answer', 'Five choices', 'about 4 to 5'],
            ['Multiple choice, select all', 'Up to about 8 choices, one or more correct, no partial credit', 'about 1 to 2'],
            ['Numeric entry', 'Type the number; no choices at all', 'about 1 to 2'],
          ],
        },
        {
          kind: 'callout',
          tone: 'warn',
          body: [
            'On numeric entry there is nothing to eliminate and nothing to work backward from, so setup errors are fatal. Double-check what the question asks for: a number of items, a percentage, a fraction in lowest terms. If a fraction box appears, you do not need to reduce.',
          ],
        },
      ],
    },
    {
      id: 'calculator',
      title: 'The calculator',
      blocks: [
        {
          kind: 'p',
          text: 'You get a basic on-screen calculator: four functions, square root, percent, memory. It has no exponent button and no parentheses beyond simple ordering.',
        },
        {
          kind: 'p',
          text: 'Use it sparingly. It is slow, since mouse-clicking digits takes longer than writing, and reaching for it usually means you skipped a simplification that would have made the arithmetic trivial. Good uses: long division, awkward decimals, square roots of non-perfect squares. Bad uses: anything you could cancel, estimate, or do in your head.',
        },
        {
          kind: 'callout',
          tone: 'key',
          body: [
            'One real risk: the calculator invites you to compute the wrong thing accurately. Set the problem up on paper first.',
          ],
        },
      ],
    },
    {
      id: 'qc-choices',
      title: 'Quantitative Comparison: the four fixed choices',
      blocks: [
        { kind: 'p', text: 'About half your Quant questions. The answer choices are always the same four:' },
        {
          kind: 'ul',
          items: [
            '**(A)** Quantity A is greater',
            '**(B)** Quantity B is greater',
            '**(C)** The two quantities are equal',
            '**(D)** The relationship cannot be determined from the information given',
          ],
        },
        { kind: 'p', text: 'Memorize these so you never re-read them.' },
        {
          kind: 'callout',
          tone: 'key',
          title: 'The single most important rule',
          body: [
            'If both quantities are pure numbers with no variables, (D) is impossible. Two specific numbers have a definite relationship. If you find yourself tempted by (D) on a question with no variables, you have made an error.',
          ],
        },
      ],
    },
    {
      id: 'qc-strategy',
      title: 'The strategy',
      blocks: [
        {
          kind: 'p',
          text: 'You do not need to know the values. You only need the relationship. This licenses moves you would never make in ordinary algebra.',
        },
        { kind: 'h', text: '1. Simplify both sides in parallel' },
        {
          kind: 'p',
          text: 'You can add or subtract the same thing from both quantities, and multiply or divide both by the same positive number, without changing the relationship. **Never multiply or divide by a variable that could be negative or zero** — that is the classic trap.',
        },
        {
          kind: 'example',
          title: 'Parallel simplification',
          blocks: [
            { kind: 'formula', lines: ['Quantity A:  3x + 7', 'Quantity B:  5x + 7', 'where x > 0'] },
            {
              kind: 'p',
              text: 'Subtract 7 from both: 3x vs 5x. Divide both by x (safe, since x > 0): 3 vs 5. **(B)**.',
            },
          ],
        },
        { kind: 'h', text: '2. Plug in numbers strategically' },
        {
          kind: 'p',
          text: 'When variables are involved, test cases. Your goal is to break an apparent pattern. Always try, in this order: 1, 0, a negative, a fraction between 0 and 1, and a large number. If two different test cases give two different relationships, the answer is (D) and you stop immediately.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          body: [
            'The fraction and the negative are where most people get caught. For 0 < x < 1: x² < x, √x > x, and 1/x > 1. All three reverse your intuition.',
          ],
        },
        {
          kind: 'example',
          title: 'Two cases, two relationships',
          blocks: [
            { kind: 'formula', lines: ['Quantity A:  x²', 'Quantity B:  x³'] },
            {
              kind: 'p',
              text: 'x = 2: 4 vs 8, B greater. x = 0.5: 0.25 vs 0.125, A greater. Two relationships, so **(D)**. No further work.',
            },
          ],
        },
        { kind: 'h', text: '3. Look for the comparison, not the computation' },
        {
          kind: 'example',
          title: 'Difference of squares in disguise',
          blocks: [
            { kind: 'formula', lines: ['Quantity A:  47 × 53', 'Quantity B:  50²'] },
            {
              kind: 'p',
              text: 'Do not multiply. Note that 47 × 53 = (50 − 3)(50 + 3) = 50² − 9. **(B)**.',
            },
          ],
        },
        {
          kind: 'example',
          title: 'Comparing fractions',
          blocks: [
            { kind: 'formula', lines: ['Quantity A:  7/13', 'Quantity B:  9/17'] },
            {
              kind: 'p',
              text: 'Cross-multiply (both denominators positive): 7 × 17 = 119 vs 9 × 13 = 117. **(A)**.',
            },
          ],
        },
        { kind: 'h', text: '4. Estimate' },
        {
          kind: 'p',
          text: 'Often you only need to know which side of a landmark each quantity falls on.',
        },
        {
          kind: 'example',
          title: 'Radicals',
          blocks: [
            { kind: 'formula', lines: ['Quantity A:  √80 + √20', 'Quantity B:  √180'] },
            {
              kind: 'p',
              text: '√80 = 4√5 and √20 = 2√5, so A = 6√5. √180 = 6√5. **(C)**.',
            },
            {
              kind: 'p',
              text: 'Worth knowing: √a + √b ≠ √(a+b) in general. That is the trap this question is built on.',
            },
          ],
        },
      ],
    },
    {
      id: 'qc-traps',
      title: 'Common QC traps',
      blocks: [
        {
          kind: 'ul',
          items: [
            '**Assuming variables are positive integers.** Unless the problem says so, x could be −4, 0, or 2/3.',
            '**Assuming figures are drawn to scale.** In QC, geometric figures are *not* necessarily to scale. In regular multiple-choice Quant they generally are, unless labeled otherwise. Never measure; use the given values.',
            '**Forgetting zero.** Zero is even, neither positive nor negative, and makes products vanish.',
            '**Falling for (C) on the first test case.** One case proving equality proves nothing. Try at least two more.',
            '**Multiplying both sides by a variable.** If x could be negative, this flips the inequality.',
          ],
        },
      ],
    },
    {
      id: 'qc-pacing',
      title: 'Pacing on QC',
      blocks: [
        {
          kind: 'p',
          text: 'QC questions should take less time than average, not more, roughly 60 to 75 seconds. They are designed to be answerable without full computation. If you have been grinding a QC question for two minutes, you have almost certainly missed the shortcut. Make your best guess and move on.',
        },
      ],
    },
  ],
};

export const arithmetic: BookChapter = {
  id: 'arithmetic',
  title: 'Arithmetic and number properties',
  summary: 'The vocabulary the GRE assumes, divisibility, prime factorization, remainders, exponents, and roots.',
  sections: [
    {
      id: 'number-vocab',
      title: 'Vocabulary the GRE assumes',
      blocks: [
        {
          kind: 'ul',
          items: [
            '**Integers** include negatives and zero. "Number" does not mean "integer" unless stated.',
            '**Prime:** an integer greater than 1 divisible only by 1 and itself. 2 is the only even prime. 1 is not prime. The primes under 50: 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47.',
            '**Factor** (or divisor) divides evenly into a number. A **multiple** is the number times an integer.',
            '**Consecutive integers** differ by 1. Consecutive even integers differ by 2.',
          ],
        },
      ],
    },
    {
      id: 'odds-evens',
      title: 'Odds, evens, positives, negatives',
      blocks: [
        {
          kind: 'p',
          text: 'Do not memorize tables, reconstruct with small numbers. But these are worth having instant:',
        },
        {
          kind: 'formula',
          lines: [
            'even × anything = even        odd × odd = odd',
            'even ± even = even           odd ± odd = even',
            'even ± odd = odd',
            '',
            'an even number of negative factors → positive product',
            'an odd number of negative factors  → negative product',
            '',
            '0 is even, and is neither positive nor negative',
          ],
        },
      ],
    },
    {
      id: 'divisibility',
      title: 'Divisibility rules',
      blocks: [
        {
          kind: 'table',
          head: ['Divisible by', 'Test'],
          rows: [
            ['2', 'Last digit is even'],
            ['3', 'Digit sum divisible by 3'],
            ['4', 'Last two digits form a number divisible by 4'],
            ['5', 'Ends in 0 or 5'],
            ['6', 'Divisible by both 2 and 3'],
            ['8', 'Last three digits divisible by 8'],
            ['9', 'Digit sum divisible by 9'],
            ['10', 'Ends in 0'],
          ],
        },
      ],
    },
    {
      id: 'prime-factorization',
      title: 'Prime factorization, the workhorse',
      blocks: [
        {
          kind: 'p',
          text: 'Many number-property questions dissolve once you factor. Write every number as a product of primes: 360 = 2³ × 3² × 5.',
        },
        {
          kind: 'p',
          text: '**Counting factors.** Take the prime factorization, add 1 to each exponent, multiply. 360 has (3+1)(2+1)(1+1) = 24 factors.',
        },
        {
          kind: 'p',
          text: '**GCF** (greatest common factor): take each shared prime to its lowest power. **LCM** (least common multiple): take every prime appearing in either, to its highest power.',
        },
        {
          kind: 'formula',
          lines: [
            '12 = 2² × 3      18 = 2 × 3²',
            'GCF = 2 × 3   = 6',
            'LCM = 2² × 3² = 36',
            '',
            'Useful identity:  GCF × LCM = the product of the two numbers',
            '                  6 × 36 = 216 = 12 × 18',
          ],
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'Divisibility through factors',
          body: [
            'If a number is divisible by 12, it is divisible by every factor of 12 (1, 2, 3, 4, 6, 12). But a number divisible by 4 and by 6 is *not* necessarily divisible by 24 — it is divisible by their LCM, 12.',
          ],
        },
      ],
    },
    {
      id: 'remainders',
      title: 'Remainders and cycles',
      blocks: [
        {
          kind: 'p',
          text: 'When n divided by d leaves remainder r, you can write n = dq + r, where 0 ≤ r < d.',
        },
        {
          kind: 'p',
          text: 'For questions like "what is the remainder when 7⁴³ is divided by 5," find the cycle. Powers of 7 mod 5 go 2, 4, 3, 1, 2, 4, 3, 1, a cycle of 4. Since 43 = 4(10) + 3, the answer matches the 3rd position: 3.',
        },
        {
          kind: 'p',
          text: 'The units digit of a power works the same way. Units digits cycle with period 1, 2, or 4:',
        },
        {
          kind: 'table',
          head: ['Base ends in', 'Cycle of units digits'],
          rows: [
            ['0, 1, 5, 6', 'always the same digit'],
            ['4, 9', 'period 2 (4, 6 / 9, 1)'],
            ['2', '2, 4, 8, 6'],
            ['3', '3, 9, 7, 1'],
            ['7', '7, 9, 3, 1'],
            ['8', '8, 4, 2, 6'],
          ],
        },
      ],
    },
    {
      id: 'exponents',
      title: 'Exponents',
      blocks: [
        { kind: 'p', text: 'These rules are non-negotiable:' },
        {
          kind: 'formula',
          lines: [
            'xᵃ · xᵇ = xᵃ⁺ᵇ',
            'xᵃ / xᵇ = xᵃ⁻ᵇ',
            '(xᵃ)ᵇ  = xᵃᵇ',
            '(xy)ᵃ  = xᵃ yᵃ',
            'x⁰     = 1            (x ≠ 0)',
            'x⁻ᵃ    = 1 / xᵃ',
            'x^(a/b) = the b-th root of xᵃ',
          ],
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'The error everyone makes',
          body: [
            'There is no rule for *adding* exponential terms. x³ + x³ = 2x³, not x⁶. And (x + y)² = x² + 2xy + y², not x² + y².',
          ],
        },
        {
          kind: 'p',
          text: 'To compare or combine exponentials, get a common base. 4⁵ vs 2¹¹ becomes 4⁵ = (2²)⁵ = 2¹⁰ < 2¹¹.',
        },
        {
          kind: 'p',
          text: 'To solve an equation with variables in the exponent, get the bases equal and set the exponents equal: 3^(2x) = 27 → 3^(2x) = 3³ → 2x = 3 → x = 1.5.',
        },
      ],
    },
    {
      id: 'square-roots',
      title: 'Roots',
      blocks: [
        {
          kind: 'p',
          text: '√x means the non-negative root. √16 = 4, not ±4. But the *equation* x² = 16 has two solutions, x = ±4. That distinction is tested.',
        },
        {
          kind: 'formula',
          lines: ['√(xy) = √x · √y', '√(x/y) = √x / √y', '√(x²) = |x|'],
        },
        {
          kind: 'p',
          text: 'There is no rule for √(x + y). Simplify by pulling out perfect squares: √72 = √(36 × 2) = 6√2.',
        },
        {
          kind: 'p',
          text: 'Rationalize denominators by multiplying by the conjugate: 1/(3 − √2) × (3 + √2)/(3 + √2) = (3 + √2)/7.',
        },
        {
          kind: 'callout',
          tone: 'note',
          body: ['Worth memorizing: √2 ≈ 1.41, √3 ≈ 1.73, √5 ≈ 2.24.'],
        },
      ],
    },
    {
      id: 'fractions',
      title: 'Fractions, decimals, percents',
      blocks: [
        { kind: 'p', text: 'Know these conversions instantly, because they save real time:' },
        {
          kind: 'table',
          head: ['Fraction', 'Decimal', 'Percent'],
          rows: [
            ['1/8', '0.125', '12.5%'],
            ['1/6', '0.1667', '16.67%'],
            ['1/5', '0.2', '20%'],
            ['1/4', '0.25', '25%'],
            ['1/3', '0.333', '33.33%'],
            ['3/8', '0.375', '37.5%'],
            ['2/5', '0.4', '40%'],
            ['5/8', '0.625', '62.5%'],
            ['2/3', '0.667', '66.67%'],
            ['3/4', '0.75', '75%'],
            ['7/8', '0.875', '87.5%'],
          ],
        },
        {
          kind: 'p',
          text: 'To compare fractions quickly, cross-multiply (with positive denominators) or compare each to a benchmark like 1/2.',
        },
      ],
    },
    {
      id: 'order-abs',
      title: 'Order of operations and absolute value',
      blocks: [
        {
          kind: 'p',
          text: 'PEMDAS, with multiplication and division left to right, same for addition and subtraction.',
        },
        {
          kind: 'p',
          text: '|x| is the distance from zero, always non-negative. To solve |x − 3| = 5, split: x − 3 = 5 or x − 3 = −5, giving x = 8 or x = −2.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          body: [
            'Always check both solutions against the original equation. Absolute value equations can produce extraneous roots.',
          ],
        },
      ],
    },
  ],
};
