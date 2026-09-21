import type { BookChapter } from '../types';

export const statistics: BookChapter = {
  id: 'statistics',
  title: 'Statistics, counting, and probability',
  summary: 'Centre and spread, the normal distribution, permutations and combinations, and overlapping sets.',
  sections: [
    {
      id: 'centre',
      title: 'Measures of center',
      blocks: [
        {
          kind: 'ul',
          items: [
            '**Mean** = sum / count.',
            '**Median** = the middle value when ordered. With an even count, the average of the two middle values. Sort first; forgetting to sort is a top-five careless error.',
            '**Mode** = most frequent value. There can be more than one, or none.',
            '**Range** = largest − smallest.',
          ],
        },
        {
          kind: 'p',
          text: 'In a symmetric distribution, mean = median. When a distribution is skewed, the mean gets pulled toward the tail while the median stays put. So mean > median suggests a right skew (a few large outliers), and mean < median a left skew. The GRE likes this in Quantitative Comparison form.',
        },
        {
          kind: 'callout',
          tone: 'key',
          body: [
            'For evenly spaced sets, such as consecutive integers or arithmetic sequences, mean = median = (first + last)/2. This shortcut saves a lot of arithmetic.',
          ],
        },
      ],
    },
    {
      id: 'quartiles',
      title: 'Quartiles and interquartile range',
      blocks: [
        {
          kind: 'p',
          text: 'Q1, Q2 (the median), and Q3 divide sorted data into four equal parts. IQR = Q3 − Q1. Boxplots show minimum, Q1, median, Q3, and maximum.',
        },
      ],
    },
    {
      id: 'standard-deviation',
      title: 'Standard deviation',
      blocks: [
        {
          kind: 'p',
          text: 'You will essentially never need to compute a standard deviation by hand. You need to understand what it means: how spread out the data is from the mean.',
        },
        { kind: 'h', text: 'What is actually tested' },
        {
          kind: 'ul',
          items: [
            'Adding a constant to every value does **not** change the SD. The spread is identical, just shifted. It does change the mean.',
            'Multiplying every value by a constant k multiplies the SD by |k|.',
            'A set where all values are identical has SD = 0.',
            'Comparing two sets: the one whose values cluster more tightly around its mean has the smaller SD, regardless of the means themselves.',
          ],
        },
        {
          kind: 'example',
          title: 'Same mean, different spread',
          blocks: [
            {
              kind: 'p',
              text: 'Set A = {10, 20, 30, 40, 50}, Set B = {28, 29, 30, 31, 32}. Same mean of 30. B has the much smaller SD.',
            },
          ],
        },
      ],
    },
    {
      id: 'normal',
      title: 'The normal distribution',
      blocks: [
        {
          kind: 'p',
          text: 'Symmetric and bell-shaped. The one thing to memorize is the **68-95-99.7 rule**: about 68% of values fall within 1 SD of the mean, about 95% within 2 SDs, and about 99.7% within 3.',
        },
        {
          kind: 'p',
          text: 'Because it is symmetric, 34% lies between the mean and +1 SD, 13.5% between +1 and +2 SDs, and 2.35% between +2 and +3.',
        },
        {
          kind: 'example',
          title: 'Reading the tail',
          blocks: [
            {
              kind: 'p',
              text: 'Scores are normally distributed with mean 500 and SD 100. What percent score above 700?',
            },
            {
              kind: 'p',
              text: '700 is 2 SDs above. 95% lie within 2 SDs, so 5% lie outside, split evenly between tails. About **2.5%**.',
            },
          ],
        },
      ],
    },
    {
      id: 'counting',
      title: 'Counting',
      blocks: [
        {
          kind: 'p',
          text: '**The fundamental counting principle.** If one choice can be made m ways and an independent second choice n ways, together there are m × n outcomes. Most counting questions are this and nothing more.',
        },
        { kind: 'p', text: '**Permutations**, where order matters (arrangements, rankings, seatings):' },
        { kind: 'formula', lines: ['P(n,k) = n! / (n − k)!'] },
        { kind: 'p', text: '**Combinations**, where order does not matter (committees, selections, handshakes):' },
        { kind: 'formula', lines: ['C(n,k) = n! / (k!(n − k)!)'] },
        {
          kind: 'callout',
          tone: 'key',
          body: [
            'The question to ask every time: does order matter? "How many ways can 3 people be chosen from 8 to form a committee" is a combination: C(8,3) = 56. "How many ways can 3 people from 8 be assigned to president, VP, and treasurer" is a permutation: P(8,3) = 336.',
          ],
        },
        {
          kind: 'p',
          text: 'Useful: C(n,k) = C(n, n−k). Choosing 8 of 10 is the same as excluding 2 of 10. Also 0! = 1.',
        },
        {
          kind: 'p',
          text: '**Arrangements with repeated elements:** n! divided by the factorial of each repeat count. The letters of LEVEL arrange in 5!/(2!2!) = 30 ways, for two L’s and two E’s.',
        },
        {
          kind: 'p',
          text: '**Circular arrangements:** n objects in a circle arrange in (n−1)! ways, since rotations are identical.',
        },
      ],
    },
    {
      id: 'probability',
      title: 'Probability',
      blocks: [
        { kind: 'formula', lines: ['P(event) = favorable outcomes / total outcomes'] },
        { kind: 'p', text: 'Always between 0 and 1.' },
        {
          kind: 'p',
          text: '**Complement:** P(not A) = 1 − P(A). When a question says "at least one," compute the complement. It is almost always faster.',
        },
        {
          kind: 'example',
          title: 'At least one',
          blocks: [
            { kind: 'p', text: 'Flip a coin 4 times. P(at least one head)?' },
            { kind: 'formula', lines: ['P(no heads) = (1/2)⁴ = 1/16', 'P(at least one) = 15/16'] },
          ],
        },
        {
          kind: 'ul',
          items: [
            '**And** means multiply, for independent events: P(A and B) = P(A) × P(B).',
            '**Or** means add, then subtract the overlap: P(A or B) = P(A) + P(B) − P(A and B). If the events are mutually exclusive, the overlap is zero.',
          ],
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'With versus without replacement',
          body: [
            'This is the distinction that decides most GRE probability questions. Without replacement, the denominator shrinks each draw.',
          ],
        },
        {
          kind: 'example',
          title: 'Two marbles',
          blocks: [
            { kind: 'p', text: 'A bag has 5 red and 3 blue marbles. Draw two without replacement. P(both red)?' },
            {
              kind: 'formula',
              lines: [
                'without replacement: (5/8) × (4/7) = 20/56 = 5/14',
                'with replacement:    (5/8) × (5/8) = 25/64',
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'sets',
      title: 'Sets and overlapping groups',
      blocks: [
        { kind: 'p', text: 'For two overlapping sets:' },
        { kind: 'formula', lines: ['|A ∪ B| = |A| + |B| − |A ∩ B|'] },
        {
          kind: 'example',
          title: 'Biology and chemistry',
          blocks: [
            {
              kind: 'p',
              text: 'In a class of 30, 18 take biology, 15 take chemistry, and 5 take neither. How many take both?',
            },
            {
              kind: 'formula',
              lines: ['30 − 5 = 25 take at least one', '25 = 18 + 15 − both  →  both = 8'],
            },
          ],
        },
        {
          kind: 'callout',
          tone: 'key',
          body: [
            'For problems with two yes/no attributes, a 2×2 table beats a Venn diagram. Rows are one attribute, columns the other, with row and column totals. Fill in what you know and the rest follows.',
          ],
        },
      ],
    },
  ],
};
