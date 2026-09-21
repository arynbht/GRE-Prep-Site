import type { BookChapter } from '../types';

export const algebra: BookChapter = {
  id: 'algebra',
  title: 'Algebra',
  summary: 'Factoring, systems, quadratics, inequalities, functions, sequences, and coordinate geometry.',
  sections: [
    {
      id: 'factoring',
      title: 'The three factoring patterns',
      blocks: [
        {
          kind: 'p',
          text: 'These appear constantly, usually as a shortcut the question is built around. Recognize them in both directions.',
        },
        {
          kind: 'formula',
          lines: [
            'x² − y²  = (x + y)(x − y)',
            '(x + y)² = x² + 2xy + y²',
            '(x − y)² = x² − 2xy + y²',
          ],
        },
        {
          kind: 'callout',
          tone: 'key',
          body: [
            'The difference of squares is the single most useful identity on the GRE. Whenever you see something squared minus something else squared, including numbers like 51² − 49², factor it.',
          ],
        },
        {
          kind: 'example',
          title: 'Difference of squares on numbers',
          blocks: [
            { kind: 'formula', lines: ['51² − 49² = (51 + 49)(51 − 49) = 100 × 2 = 200'] },
            { kind: 'p', text: 'No calculator needed.' },
          ],
        },
        {
          kind: 'callout',
          tone: 'note',
          title: 'A related trick',
          body: [
            'If a question gives you x + y and xy and asks for x² + y², use (x+y)² = x² + 2xy + y², so x² + y² = (x+y)² − 2xy. You never need to find x and y individually.',
          ],
        },
      ],
    },
    {
      id: 'linear-systems',
      title: 'Linear equations and systems',
      blocks: [
        {
          kind: 'p',
          text: 'One equation, one unknown: isolate. Two equations, two unknowns: substitute or eliminate.',
        },
        {
          kind: 'p',
          text: 'A system has **no solution** if the lines are parallel (same slope, different intercept) and **infinitely many** if the equations are multiples of each other. Watch for this in Quantitative Comparison: a system that looks solvable but is actually one equation written twice gives you (D).',
        },
        {
          kind: 'callout',
          tone: 'key',
          body: [
            'You do not always need both variables. If a question asks for x + y, look for a combination of the equations that produces x + y directly. Adding 3x + 2y = 11 and −2x − y = −6 gives x + y = 5 in one step.',
          ],
        },
      ],
    },
    {
      id: 'quadratics',
      title: 'Quadratics',
      blocks: [
        { kind: 'p', text: 'Set equal to zero, factor, set each factor to zero.' },
        { kind: 'formula', lines: ['x² − 7x + 12 = 0  →  (x − 3)(x − 4) = 0  →  x = 3 or 4'] },
        { kind: 'p', text: 'To factor x² + bx + c, find two numbers that multiply to c and add to b.' },
        { kind: 'p', text: 'When factoring fails, the quadratic formula:' },
        { kind: 'formula', lines: ['          −b ± √(b² − 4ac)', '    x = —————————————————', '                 2a'] },
        {
          kind: 'p',
          text: 'The **discriminant** b² − 4ac tells you how many real solutions there are: positive gives two, zero gives one, negative gives none.',
        },
        {
          kind: 'p',
          text: 'Also useful: for ax² + bx + c = 0, the sum of the roots is −b/a and the product is c/a.',
        },
      ],
    },
    {
      id: 'inequalities',
      title: 'Inequalities',
      blocks: [
        {
          kind: 'callout',
          tone: 'warn',
          body: [
            'Same rules as equations, with one exception that matters enormously: multiplying or dividing by a negative number **flips the inequality sign.**',
          ],
        },
        { kind: 'formula', lines: ['−3x > 12  →  x < −4'] },
        { kind: 'p', text: 'This is also why you cannot multiply an inequality by a variable of unknown sign.' },
        {
          kind: 'p',
          text: '**Compound inequalities:** operate on all three parts. If −2 < x < 5, then multiplying by 3 gives −6 < 3x < 15, but multiplying by −3 gives 6 > −3x > −15, that is, −15 < −3x < 6.',
        },
        {
          kind: 'p',
          text: 'When adding inequalities, they must point the same way. When you need the range of a product or difference, compute all four combinations of endpoints and take the extremes.',
        },
      ],
    },
    {
      id: 'absolute-value-algebra',
      title: 'Absolute value',
      blocks: [
        {
          kind: 'p',
          text: '|x| < a means −a < x < a, a band around zero. |x| > a means x > a or x < −a, two tails.',
        },
        {
          kind: 'formula',
          lines: ['|2x − 6| ≤ 4', '→ −4 ≤ 2x − 6 ≤ 4', '→  2 ≤ 2x ≤ 10', '→  1 ≤ x ≤ 5'],
        },
      ],
    },
    {
      id: 'functions',
      title: 'Functions',
      blocks: [
        {
          kind: 'p',
          text: 'f(x) is just a machine: put in x, get out f(x). f(3) means substitute 3 everywhere x appears.',
        },
        {
          kind: 'p',
          text: 'The GRE sometimes invents a symbol and defines it: "for all integers n, n♦ = 2n − 1." Do not be thrown. Just follow the definition.',
        },
        {
          kind: 'p',
          text: 'Nested functions work inside out: f(g(2)) means evaluate g(2), then feed that into f.',
        },
      ],
    },
    {
      id: 'sequences',
      title: 'Sequences',
      blocks: [
        { kind: 'p', text: '**Arithmetic** (constant difference d):' },
        { kind: 'formula', lines: ['aₙ = a₁ + (n − 1)d', '', '             n(a₁ + aₙ)', 'sum = ————————————', '                  2'] },
        { kind: 'p', text: '**Geometric** (constant ratio r):' },
        { kind: 'formula', lines: ['aₙ = a₁ · rⁿ⁻¹'] },
        {
          kind: 'p',
          text: 'The sum formula for an arithmetic sequence is just "number of terms times the average of first and last." That framing also handles the classic: the sum of the integers from 1 to 100 is 100 × (1+100)/2 = 5050.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'Counting terms in a range',
          body: [
            'The number of integers from a to b inclusive is b − a + 1. From 17 to 63 inclusive: 63 − 17 + 1 = 47. Forgetting the +1 is one of the most common careless errors on the test.',
          ],
        },
      ],
    },
    {
      id: 'coordinate-geometry',
      title: 'Coordinate geometry',
      blocks: [
        { kind: 'p', text: 'Slope between two points:' },
        { kind: 'formula', lines: ['       y₂ − y₁', 'm = ————————', '       x₂ − x₁'] },
        { kind: 'p', text: 'Slope-intercept form: y = mx + b, where b is the y-intercept.' },
        {
          kind: 'ul',
          items: [
            'Parallel lines have equal slopes.',
            'Perpendicular lines have slopes that are negative reciprocals: m₁ · m₂ = −1.',
            'Horizontal lines have slope 0; vertical lines have undefined slope.',
          ],
        },
        { kind: 'p', text: 'Distance between two points, which is just the Pythagorean theorem:' },
        { kind: 'formula', lines: ['d = √((x₂ − x₁)² + (y₂ − y₁)²)'] },
        {
          kind: 'p',
          text: 'Midpoint is the average of the coordinates: ((x₁+x₂)/2, (y₁+y₂)/2).',
        },
        {
          kind: 'p',
          text: 'Circle centered at (h, k) with radius r: (x − h)² + (y − k)² = r².',
        },
        {
          kind: 'p',
          text: '**Parabolas.** y = ax² + bx + c opens upward if a > 0, downward if a < 0. The vertex is at x = −b/(2a). You rarely need more than this.',
        },
        {
          kind: 'p',
          text: 'Quadrants run counterclockwise from upper right: I (+,+), II (−,+), III (−,−), IV (+,−).',
        },
      ],
    },
    {
      id: 'plug-in',
      title: 'When to plug in instead of solving',
      blocks: [
        {
          kind: 'p',
          text: 'If a multiple-choice question has **variables in the answer choices**, pick a number for the variable, compute the answer, then test which choice produces it. Choose numbers that are easy but not degenerate: avoid 0, 1, and any number already in the problem, since those often make several choices match.',
        },
        {
          kind: 'p',
          text: 'If the answer choices are **specific numbers** and the algebra is ugly, work backward from the choices. Start with (C), the middle value; if it is too big, you know which direction to go.',
        },
      ],
    },
  ],
};
