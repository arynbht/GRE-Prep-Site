import type { BookChapter } from '../types';

export const geometry: BookChapter = {
  id: 'geometry',
  title: 'Geometry',
  summary: 'Lines, triangles, polygons, circles and solids, plus the order to attack a figure in.',
  sections: [
    {
      id: 'geometry-figures',
      title: 'A note on figures',
      blocks: [
        { kind: 'p', text: 'The GRE tests plane geometry, basic solids, and coordinate geometry. No proofs, no trigonometry.' },
        {
          kind: 'callout',
          tone: 'warn',
          body: [
            'In standard multiple-choice questions, figures are drawn to scale unless the problem says otherwise, so eyeballing is a legitimate elimination tool. In Quantitative Comparison, figures are **not** necessarily to scale. Never trust the picture there.',
          ],
        },
      ],
    },
    {
      id: 'lines-angles',
      title: 'Lines and angles',
      blocks: [
        {
          kind: 'ul',
          items: [
            'Angles on a straight line sum to 180°. Angles around a point sum to 360°.',
            'Vertical angles, opposite each other at an intersection, are equal.',
            'When a transversal crosses parallel lines, eight angles form, but only two distinct values, and they sum to 180°. Any two angles are either equal or supplementary. That single fact solves nearly every parallel-lines question.',
          ],
        },
      ],
    },
    {
      id: 'triangles',
      title: 'Triangles',
      blocks: [
        { kind: 'h', text: 'The facts' },
        {
          kind: 'ul',
          items: [
            'Interior angles sum to 180°.',
            'An exterior angle equals the sum of the two remote interior angles.',
            'The largest angle is opposite the longest side, and vice versa.',
            '**Triangle inequality:** the length of any side is less than the sum and greater than the difference of the other two. With sides 5 and 9, the third side satisfies 4 < x < 14.',
            'Area = (1/2) × base × height. The height must be perpendicular to the base, and may fall outside the triangle.',
          ],
        },
        { kind: 'h', text: 'Special triangles' },
        {
          kind: 'callout',
          tone: 'key',
          body: ['Memorize these. They appear in the majority of GRE geometry questions.'],
        },
        {
          kind: 'ul',
          items: [
            '**Isosceles:** two equal sides, and the angles opposite them are equal.',
            '**Equilateral:** all sides equal, all angles 60°. Area = (s²√3)/4.',
            '**45-45-90:** sides in ratio 1 : 1 : √2. The hypotenuse is a leg times √2. This is the diagonal of a square.',
            '**30-60-90:** sides in ratio 1 : √3 : 2, with the shortest side opposite the 30° angle. This is half an equilateral triangle.',
          ],
        },
        { kind: 'p', text: '**Pythagorean theorem:** a² + b² = c², right triangles only.' },
        {
          kind: 'p',
          text: 'Pythagorean triples worth recognizing on sight, since they let you skip the arithmetic: 3-4-5, 5-12-13, 8-15-17, 7-24-25, and all their multiples (6-8-10, 9-12-15, 10-24-26).',
        },
        {
          kind: 'p',
          text: '**Similar triangles.** Equal angles give proportional sides. If the ratio of corresponding sides is k, the ratio of areas is k². This generalizes: for any similar figures, areas scale as the square of the linear ratio and volumes as the cube.',
        },
      ],
    },
    {
      id: 'quadrilaterals',
      title: 'Quadrilaterals and polygons',
      blocks: [
        {
          kind: 'table',
          head: ['Shape', 'Area'],
          rows: [
            ['Rectangle', 'length × width'],
            ['Square', 's² (also d²/2, where d is the diagonal)'],
            ['Parallelogram', 'base × height'],
            ['Trapezoid', '(1/2)(b₁ + b₂) × height'],
            ['Rhombus', '(1/2) d₁d₂'],
          ],
        },
        {
          kind: 'p',
          text: 'The sum of interior angles of an n-sided polygon is (n − 2) × 180°. For a regular polygon, each interior angle is that divided by n. The exterior angles of any polygon always sum to 360°.',
        },
        {
          kind: 'callout',
          tone: 'note',
          body: [
            'For a fixed perimeter, the rectangle with the maximum area is a square. For a fixed area, the square has the minimum perimeter.',
          ],
        },
      ],
    },
    {
      id: 'circles',
      title: 'Circles',
      blocks: [
        { kind: 'formula', lines: ['C = 2πr', 'A = πr²'] },
        {
          kind: 'ul',
          items: [
            'A central angle equals the arc it subtends. An inscribed angle is half the central angle subtending the same arc.',
            'Any angle inscribed in a semicircle is 90°. A triangle inscribed in a circle with one side as the diameter is right-angled.',
            'Arc length = (central angle/360) × circumference. Sector area = (central angle/360) × πr².',
            'A tangent line meets the radius at the point of tangency at 90°.',
          ],
        },
        {
          kind: 'example',
          title: 'A sector',
          blocks: [
            { kind: 'p', text: 'A sector with a 60° central angle in a circle of radius 6:' },
            {
              kind: 'formula',
              lines: ['arc length = (60/360)(12π) = 2π', 'area       = (60/360)(36π) = 6π'],
            },
          ],
        },
      ],
    },
    {
      id: 'solids',
      title: 'Three-dimensional solids',
      blocks: [
        {
          kind: 'table',
          head: ['Solid', 'Volume', 'Surface area'],
          rows: [
            ['Rectangular box', 'lwh', '2(lw + lh + wh)'],
            ['Cube', 's³', '6s²'],
            ['Cylinder', 'πr²h', '2πr² + 2πrh'],
            ['Sphere', '(4/3)πr³', '4πr²'],
            ['Cone', '(1/3)πr²h', 'πr² + πrl (l = slant height)'],
          ],
        },
        {
          kind: 'p',
          text: 'The sphere and cone formulas are given on the real test when needed, but knowing them saves time.',
        },
        {
          kind: 'p',
          text: 'The 3-D diagonal of a box is √(l² + w² + h²), the Pythagorean theorem applied twice. For a cube of side s, the long diagonal is s√3.',
        },
      ],
    },
    {
      id: 'geometry-approach',
      title: 'Approach',
      blocks: [
        {
          kind: 'ol',
          items: [
            'Redraw the figure on scratch paper, large, and label every value you know.',
            'Fill in everything derivable, even if it is not obviously needed. Angles especially. Geometry questions usually resolve once you have labeled enough of the diagram.',
            'Look for the special triangles. A 90° angle plus a side ratio near 1.73 means 30-60-90. A radius drawn to a tangent point makes a right angle you can use.',
            'Break complex shapes into simple ones. Shaded-region questions are almost always "big shape minus small shape."',
            'On Quantitative Comparison, test extreme cases. A figure that satisfies the constraints can often be redrawn stretched or squashed, and if the relationship changes, the answer is (D).',
          ],
        },
      ],
    },
  ],
};
