import type { BookChapter } from '../types';

export const formulaSheet: BookChapter = {
  id: 'formula-sheet',
  title: 'Appendix: the night-before sheet',
  summary: 'Everything worth having in short-term memory on test day, in one place.',
  sections: [
    {
      id: 'sheet-numbers',
      title: 'Number facts',
      blocks: [
        {
          kind: 'ul',
          items: [
            'Primes under 50: 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47. 2 is the only even prime; 1 is not prime.',
            '0 is even, neither positive nor negative.',
            'Factor count: add 1 to each prime exponent, multiply.',
            'GCF × LCM = product of the two numbers.',
            'Integers from a to b inclusive: b − a + 1.',
            '√2 ≈ 1.41, √3 ≈ 1.73, √5 ≈ 2.24.',
          ],
        },
      ],
    },
    {
      id: 'sheet-algebra',
      title: 'Algebra',
      blocks: [
        {
          kind: 'formula',
          lines: [
            'x² − y²   = (x + y)(x − y)',
            '(x ± y)² = x² ± 2xy + y²',
            'x² + y²  = (x + y)² − 2xy',
            '',
            '          −b ± √(b² − 4ac)',
            '    x = —————————————————',
            '                 2a',
          ],
        },
        {
          kind: 'ul',
          items: [
            'x^a · x^b = x^(a+b) · (x^a)^b = x^(ab) · x^(−a) = 1/x^a · x⁰ = 1',
            'Dividing an inequality by a negative flips the sign.',
            '√(x²) = |x|, and √x is always non-negative, but x² = 16 has two solutions.',
          ],
        },
      ],
    },
    {
      id: 'sheet-geometry',
      title: 'Geometry',
      blocks: [
        {
          kind: 'ul',
          items: [
            'Triangle angles sum to 180°; polygon of n sides sums to (n − 2)·180°; exterior angles always sum to 360°.',
            'Triangle inequality: difference < third side < sum.',
            '45-45-90: 1 : 1 : √2. 30-60-90: 1 : √3 : 2.',
            'Triples: 3-4-5, 5-12-13, 8-15-17, 7-24-25.',
            'Equilateral area = s²√3 / 4. Trapezoid = (1/2)(b₁+b₂)h.',
            'Similar figures: areas scale as k², volumes as k³.',
            'Circle: C = 2πr, A = πr². Arc = (θ/360)·C. Sector = (θ/360)·A.',
            'Inscribed angle = half the central angle. Angle in a semicircle = 90°.',
            'Cylinder V = πr²h. Sphere V = (4/3)πr³. Cone V = (1/3)πr²h.',
            'Box diagonal = √(l² + w² + h²); cube diagonal = s√3.',
            'Slope = Δy/Δx. Perpendicular slopes multiply to −1.',
            'Distance = √((x₂−x₁)² + (y₂−y₁)²). Circle: (x−h)² + (y−k)² = r².',
          ],
        },
      ],
    },
    {
      id: 'sheet-word-problems',
      title: 'Word problems',
      blocks: [
        {
          kind: 'ul',
          items: [
            'd = rt. Average speed = total distance / total time, never the average of the speeds.',
            'Work: 1/a + 1/b = 1/t. Combined time is always less than the faster solo time.',
            'Percent change = (new − old)/old. Increases multiply: +20% then −20% = ×0.96.',
            'Sum = average × count.',
            'Weighted average lands between the two means, nearer the bigger group.',
            'Ratio 3:5 gives 3k and 5k. Total must be a multiple of 8.',
          ],
        },
      ],
    },
    {
      id: 'sheet-statistics',
      title: 'Statistics and probability',
      blocks: [
        {
          kind: 'ul',
          items: [
            'Sort before finding the median.',
            'Adding a constant to every value leaves SD unchanged; multiplying by k multiplies SD by |k|.',
            'Normal: 68 / 95 / 99.7 within 1 / 2 / 3 SDs.',
            'Evenly spaced set: mean = median = (first + last)/2.',
            'C(n,k) = n! / (k!(n−k)!) when order does not matter; P(n,k) = n!/(n−k)! when it does.',
            'P(at least one) = 1 − P(none).',
            'Without replacement, the denominator shrinks each draw.',
            '|A ∪ B| = |A| + |B| − |A ∩ B|.',
          ],
        },
      ],
    },
    {
      id: 'sheet-verbal',
      title: 'Verbal reminders',
      blocks: [
        {
          kind: 'ul',
          items: [
            'Predict before reading the choices. Every question type.',
            'Contrast signals: but, however, yet, although, while, whereas, despite, nevertheless, ironically, paradoxically, surprisingly, far from.',
            'Sentence Equivalence: two answers, and the sentence decides before synonymy confirms. Watch for the decoy pair.',
            'Reading Comprehension: inference means **must be true**, not probably true. If the passage could be true while the answer is false, the answer is wrong.',
          ],
        },
        {
          kind: 'callout',
          tone: 'note',
          title: 'One line was cut off here',
          body: [
            'The supplied text ended mid-sentence at "inference means must be true, not probab", so the final verbal reminders after that point are reconstructed from the Reading Comprehension chapter rather than quoted. Paste the remaining lines to replace them.',
          ],
        },
      ],
    },
  ],
};
