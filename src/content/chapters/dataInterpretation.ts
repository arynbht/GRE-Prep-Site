import type { BookChapter } from '../types';

export const dataInterpretation: BookChapter = {
  id: 'data-interpretation',
  title: 'Data Interpretation',
  summary: 'Easy maths, hard reading. How to orient on a chart and where the traps are.',
  sections: [
    {
      id: 'di-read-first',
      title: 'Read the chart before the questions',
      blocks: [
        {
          kind: 'p',
          text: 'Each Quant section contains a set of two or three questions attached to one or more charts or tables. The math is easy: percentages, ratios, averages. The difficulty is entirely in reading the display correctly under time pressure.',
        },
        { kind: 'p', text: 'Spend 30 seconds orienting. Check:' },
        {
          kind: 'ul',
          items: [
            'What each axis measures and in what units. "Revenue in millions" versus "revenue in thousands" changes every answer.',
            'Whether the vertical axis starts at zero. A truncated axis makes small differences look dramatic.',
            'Whether values are absolute or percentages. A rising percentage share alongside a falling total can mean the absolute number fell.',
            'Footnotes. They exist to be tested.',
            'Whether a second chart uses a different scale or covers a different period than the first.',
          ],
        },
      ],
    },
    {
      id: 'di-patterns',
      title: 'The recurring question patterns',
      blocks: [
        {
          kind: 'ul',
          items: [
            '**Percent of total.** Take the part over the whole. Make sure the "whole" is what the question means: a single category’s total, or the grand total.',
            '**Percent change between two bars.** (new − old)/old. Always the earlier value in the denominator.',
            '**Ratio between two categories.** Read both values and divide. Estimate where possible.',
            '**Combining two displays.** The hardest questions require you to pull one number from a bar chart and another from a pie chart or table. For example, a pie chart gives the percentage breakdown of a total that a separate bar chart provides for each year. To get an absolute figure, multiply the year’s total by that year’s percentage.',
            '**"Approximately" questions.** When you see that word, estimate aggressively. Round 48.7% to 50%, 1,970 to 2,000. The answer choices will be far enough apart.',
            '**Could-not-be-determined questions.** Watch for questions asking about a subgroup the chart does not break out, or about causation the data cannot establish.',
          ],
        },
      ],
    },
    {
      id: 'di-estimation',
      title: 'Estimation technique',
      blocks: [
        {
          kind: 'callout',
          tone: 'key',
          body: ['This is where Data Interpretation time is won.'],
        },
        {
          kind: 'p',
          text: 'Instead of computing 3,847 / 18,206 exactly, see that it is a bit over 1/5, so roughly 21%. Check the answer choices: if they are 15%, 21%, 28%, 35%, and 42%, you are done without touching the calculator.',
        },
        {
          kind: 'p',
          text: 'Benchmarks worth having automatic: 1/3 ≈ 33%, 1/4 = 25%, 1/5 = 20%, 1/6 ≈ 17%, 1/8 = 12.5%, 1/7 ≈ 14%.',
        },
      ],
    },
    {
      id: 'di-traps',
      title: 'Common traps',
      blocks: [
        {
          kind: 'ul',
          items: [
            '**Percentage of a percentage.** If Region A is 30% of total sales and electronics are 40% of Region A’s sales, electronics in Region A are 12% of the total, not 70% or 10%.',
            '**Confusing a change in percentage points with a percent change.** A share going from 20% to 25% is a 5 percentage-point increase but a 25% relative increase. Questions exploit the ambiguity, so read which one is asked.',
            '**Reading the wrong bar in a grouped chart.** Check the legend every time. Under time pressure people grab the adjacent bar.',
            '**Assuming per-unit values from totals.** A company with the highest total revenue does not necessarily have the highest revenue per employee.',
            '**Cumulative versus annual.** Some line graphs show cumulative totals, where a flat segment means zero additions, not a steady rate.',
          ],
        },
      ],
    },
    {
      id: 'di-pacing',
      title: 'Pacing',
      blocks: [
        {
          kind: 'p',
          text: 'Budget about 5 to 6 minutes for a three-question set. The first question usually costs the most because it includes your orientation time; the second and third should be faster since you already understand the display.',
        },
        {
          kind: 'callout',
          tone: 'note',
          body: [
            'Do not abandon a Data Interpretation set after investing the reading time. The marginal questions are the cheapest points in the section.',
          ],
        },
      ],
    },
  ],
};
