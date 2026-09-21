import type { BookChapter } from '../types';

export const wordProblems: BookChapter = {
  id: 'word-problems',
  title: 'Word problems',
  summary: 'Translation, percents, ratios, rates, work, mixtures, interest, and averages.',
  sections: [
    {
      id: 'translation',
      title: 'Translation',
      blocks: [
        {
          kind: 'callout',
          tone: 'key',
          body: [
            'The difficulty in word problems is almost never the arithmetic. It is the translation. Slow down at setup, define your variables in writing, and the rest usually falls out.',
          ],
        },
        {
          kind: 'table',
          head: ['English', 'Math'],
          rows: [
            ['is, was, will be', '='],
            ['of', '×'],
            ['percent', '/100'],
            ['what, a number', 'the variable'],
            ['more than, greater than', '+'],
            ['less than', '− (and note the reversal: "5 less than x" is x − 5)'],
            ['per, for each', '÷'],
            ['twice, double', '× 2'],
          ],
        },
      ],
    },
    {
      id: 'percents',
      title: 'Percents',
      blocks: [
        { kind: 'p', text: 'The core translation: "x percent of y" = (x/100) × y.' },
        {
          kind: 'p',
          text: '**Percent change** = (new − old) / old × 100. The denominator is always the original value. This is where most percent errors come from.',
        },
        {
          kind: 'p',
          text: '**Percent increase and decrease as multipliers.** A 20% increase means multiply by 1.20. A 20% decrease means multiply by 0.80. This makes successive changes easy.',
        },
        {
          kind: 'example',
          title: 'Successive changes do not cancel',
          blocks: [
            { kind: 'p', text: 'A price rises 20%, then falls 20%. Net effect?' },
            { kind: 'formula', lines: ['1.20 × 0.80 = 0.96  →  a 4% decrease'] },
            {
              kind: 'p',
              text: 'Percent changes do not cancel. This is tested constantly. Similarly, a quantity that increases 50% and then 40% ends at 1.50 × 1.40 = 2.10, a 110% increase, not 90%.',
            },
          ],
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'Percent of versus percent greater than',
          body: [
            '"A is 150% of B" means A = 1.5B. "A is 150% greater than B" means A = 2.5B. Read carefully.',
          ],
        },
        {
          kind: 'p',
          text: '**Working backward.** If a price after a 25% discount is $60, the original is 60 / 0.75 = $80. Divide by the multiplier; do not add the percentage back.',
        },
      ],
    },
    {
      id: 'ratios',
      title: 'Ratios',
      blocks: [
        {
          kind: 'p',
          text: 'A ratio of 3:5 means the quantities are 3k and 5k for some k. **Introducing that k is the key move**: it turns a ratio into an equation.',
        },
        {
          kind: 'example',
          title: 'Ratio to counts',
          blocks: [
            { kind: 'p', text: 'A jar has red and blue marbles in a 3:5 ratio, 48 marbles total.' },
            { kind: 'formula', lines: ['3k + 5k = 48  →  8k = 48  →  k = 6', 'So 18 red and 30 blue.'] },
            {
              kind: 'p',
              text: 'Note that the parts must sum to a multiple of (3 + 5) = 8. Questions often exploit this: "which of the following could be the total?"',
            },
          ],
        },
        {
          kind: 'p',
          text: '**Combining ratios.** If A:B = 2:3 and B:C = 4:5, make B match. Scale the first by 4 and the second by 3: A:B = 8:12 and B:C = 12:15. So A:B:C = 8:12:15.',
        },
        {
          kind: 'p',
          text: '**Proportions.** Set up equal ratios and cross-multiply. Keep units consistent on both sides; this is the most common failure.',
        },
      ],
    },
    {
      id: 'rates',
      title: 'Rates',
      blocks: [
        { kind: 'formula', lines: ['distance = rate × time'] },
        {
          kind: 'p',
          text: 'Everything about rates follows from this. Draw a small table with rows for each traveler and columns for rate, time, distance.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'Average speed is not the average of the speeds',
          body: ['It is total distance over total time.'],
        },
        {
          kind: 'example',
          title: 'Average speed',
          blocks: [
            { kind: 'p', text: 'You drive 60 miles at 30 mph and return the same 60 miles at 60 mph. Average speed?' },
            {
              kind: 'p',
              text: 'Time out = 2 hours, time back = 1 hour. Total: 120 miles in 3 hours = **40 mph**, not 45.',
            },
          ],
        },
        {
          kind: 'p',
          text: '**Two objects moving.** If they move toward each other, add the rates. If one chases the other, subtract the rates to get the closing speed.',
        },
        {
          kind: 'p',
          text: 'Two trains 300 miles apart move toward each other at 40 mph and 60 mph. Closing speed 100 mph, so they meet in 3 hours.',
        },
      ],
    },
    {
      id: 'work',
      title: 'Work',
      blocks: [
        {
          kind: 'p',
          text: 'Work problems are rate problems where the "distance" is one completed job. The key is that **rates add.**',
        },
        {
          kind: 'p',
          text: 'If A finishes a job in a hours, A’s rate is 1/a jobs per hour. Together with B:',
        },
        { kind: 'formula', lines: ['1/a + 1/b = 1/t'] },
        {
          kind: 'example',
          title: 'Two painters',
          blocks: [
            { kind: 'p', text: 'Alice paints a room in 4 hours, Bob in 6. Together?' },
            {
              kind: 'formula',
              lines: ['1/4 + 1/6 = 3/12 + 2/12 = 5/12 jobs per hour', 'Time = 12/5 = 2.4 hours'],
            },
            {
              kind: 'p',
              text: '**Sanity check:** the combined time must be less than the faster person’s solo time. If your answer is bigger than 4, you inverted something.',
            },
          ],
        },
        {
          kind: 'p',
          text: 'For someone working against the job, such as a drain emptying a tub while a tap fills it, subtract that rate.',
        },
      ],
    },
    {
      id: 'mixtures',
      title: 'Mixtures',
      blocks: [
        {
          kind: 'p',
          text: 'Track the component, not the total. Set up (amount of substance) = (concentration) × (total volume), then add the amounts.',
        },
        {
          kind: 'example',
          title: 'Diluting an acid solution',
          blocks: [
            {
              kind: 'p',
              text: 'How many liters of pure water must be added to 10 liters of a 40% acid solution to make it 25% acid?',
            },
            {
              kind: 'formula',
              lines: [
                'Acid stays constant: 0.40 × 10 = 4 liters',
                'After adding x liters of water:',
                '4 = 0.25 × (10 + x)  →  16 = 10 + x  →  x = 6 liters',
              ],
            },
          ],
        },
        {
          kind: 'callout',
          tone: 'key',
          body: ['The move that makes these easy: identify the quantity that does not change.'],
        },
      ],
    },
    {
      id: 'interest',
      title: 'Interest',
      blocks: [
        {
          kind: 'p',
          text: '**Simple interest:** I = Prt, where P is principal, r the annual rate as a decimal, and t the years.',
        },
        { kind: 'p', text: '**Compound interest:**' },
        { kind: 'formula', lines: ['A = P(1 + r/n)^(nt)'] },
        {
          kind: 'p',
          text: 'where n is compoundings per year. On the GRE, compound interest problems are almost always short enough to compute year by year rather than using the formula, and the question usually asks for the difference between simple and compound, which is small.',
        },
      ],
    },
    {
      id: 'averages',
      title: 'Averages',
      blocks: [
        {
          kind: 'p',
          text: 'Average = sum / count. Rearranged, **sum = average × count**, which is the more useful form. Most average problems are solved by finding the sum.',
        },
        {
          kind: 'example',
          title: 'Raising an average',
          blocks: [
            {
              kind: 'p',
              text: 'A student’s average on 4 tests is 82. What must she score on a 5th to raise the average to 85?',
            },
            {
              kind: 'formula',
              lines: ['Current sum = 4 × 82 = 328', 'Needed sum  = 5 × 85 = 425', 'She needs 97.'],
            },
          ],
        },
        {
          kind: 'p',
          text: '**Weighted averages.** When groups differ in size, weight by size. The result always falls between the two group averages, and closer to the larger group’s, which is a useful check and often enough to eliminate answers.',
        },
        {
          kind: 'example',
          title: 'Two classes',
          blocks: [
            { kind: 'p', text: 'A class of 20 averages 70; a class of 30 averages 80.' },
            {
              kind: 'formula',
              lines: ['(20×70 + 30×80) / 50 = (1400 + 2400) / 50 = 76'],
            },
            { kind: 'p', text: 'Note it is 76, not 75: pulled toward the larger class.' },
          ],
        },
      ],
    },
  ],
};
