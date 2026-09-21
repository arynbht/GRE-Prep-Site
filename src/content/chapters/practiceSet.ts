import type { BookChapter } from '../types';

export const practiceSet: BookChapter = {
  id: 'practice-set',
  title: 'Practice set: 40 questions',
  summary: 'A timed mixed set, 65 minutes, with worked solutions hidden until you ask for them.',
  sections: [
    {
      id: 'practice-instructions',
      title: 'Before you start',
      blocks: [
        {
          kind: 'callout',
          tone: 'key',
          body: [
            'Do these timed: 40 questions in 65 minutes. Solutions are at the end of each group, collapsed. Do not open them until you have finished.',
          ],
        },
      ],
    },
    {
      id: 'practice-qc',
      title: 'Quantitative Comparison (1 to 10)',
      blocks: [
        {
          kind: 'p',
          text: 'For each: **(A)** A is greater, **(B)** B is greater, **(C)** equal, **(D)** cannot be determined.',
        },
        {
          kind: 'table',
          head: ['#', 'Given', 'Quantity A', 'Quantity B'],
          rows: [
            ['1', 'x is an integer, x² = 49', 'x', '7'],
            ['2', '—', '0.2% of 4,000', '2% of 400'],
            ['3', 'n > 1', 'n²', 'n³'],
            ['4', '—', 'the number of prime numbers between 1 and 20', 'the number of factors of 36'],
            ['5', 'A triangle has two sides of length 6 and 10', 'the length of the third side', '16'],
            ['6', '—', '(−2)⁴', '−2⁴'],
            ['7', 'The average of 5 numbers is 20', 'the sum of the 5 numbers', '100'],
            ['8', '0 < x < 1', 'x²', '√x'],
            ['9', '—', 'the area of a circle with radius 3', 'the area of a square with side 5'],
            ['10', 'a and b are positive, a/b = 3/4', 'a', 'b'],
          ],
        },
        {
          kind: 'collapse',
          summary: 'Solutions, questions 1 to 10',
          blocks: [
            {
              kind: 'ol',
              items: [
                '**(D).** x² = 49 gives x = 7 or x = −7. Two relationships, so (D). The trap is assuming the positive root.',
                '**(C).** 0.002 × 4,000 = 8. 0.02 × 400 = 8. Equal.',
                '**(B).** For n > 1, multiplying by n increases, so n³ > n². Note this would be (D) if n could be between 0 and 1; the constraint matters.',
                '**(B).** Primes 2 to 20: 2, 3, 5, 7, 11, 13, 17, 19 = 8. Factors of 36 = 2²×3²: (2+1)(2+1) = 9.',
                '**(B).** Triangle inequality: the third side is between 10 − 6 = 4 and 10 + 6 = 16, exclusive. So it is less than 16.',
                '**(A).** (−2)⁴ = 16. But −2⁴ = −(2⁴) = −16; the exponent binds tighter than the negative sign.',
                '**(C).** Sum = average × count = 20 × 5 = 100.',
                '**(B).** For 0 < x < 1, squaring shrinks and square-rooting grows. Test x = 0.25: x² = 0.0625, √x = 0.5.',
                '**(A).** Circle area = 9π ≈ 28.3. Square area = 25. Estimate π as a bit over 3 and you do not need the calculator.',
                '**(B).** a/b = 3/4 means a is 3 parts to b’s 4 parts, and both are positive, so b > a.',
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'practice-mc',
      title: 'Multiple choice, Quant (11 to 25)',
      blocks: [
        { kind: 'question', stem: '11. If 3x − 7 = 14, what is the value of 6x + 2?', choices: ['14', '32', '42', '44', '46'] },
        {
          kind: 'question',
          stem: '12. A shirt is marked up 40% and then put on sale for 25% off the marked price. The final price is what percent of the original?',
          choices: ['95%', '100%', '105%', '110%', '115%'],
        },
        { kind: 'question', stem: '13. What is the units digit of 3¹⁰⁰?', choices: ['1', '3', '7', '9', '0'] },
        {
          kind: 'question',
          stem: '14. In a right triangle, one leg is 9 and the hypotenuse is 15. What is the area?',
          choices: ['36', '48', '54', '60', '67.5'],
        },
        {
          kind: 'question',
          stem: '15. A committee of 4 is chosen from 9 people. How many different committees are possible?',
          choices: ['36', '126', '252', '3,024', '6,561'],
        },
        {
          kind: 'question',
          stem: '16. If the average of 6 numbers is 15 and one number is removed, the average of the remaining 5 is 16. What number was removed?',
          choices: ['5', '10', '14', '16', '20'],
        },
        {
          kind: 'question',
          stem: '17. A car travels 120 miles at 40 mph and returns at 60 mph. What is the average speed for the round trip, in mph?',
          choices: ['45', '48', '50', '52', '55'],
        },
        {
          kind: 'question',
          stem: '18. If x² − 5x + 6 = 0, which of the following could be the value of x² + x?',
          choices: ['2', '6', '8', '10', '15'],
        },
        {
          kind: 'question',
          stem: '19. A bag holds 4 red, 5 green, and 3 blue marbles. Two are drawn without replacement. What is the probability both are green?',
          choices: ['5/33', '25/144', '5/12', '1/6', '5/66'],
        },
        {
          kind: 'question',
          stem: '20. The sum of the interior angles of a regular polygon is 1,080°. How many sides does it have?',
          choices: ['6', '7', '8', '9', '10'],
        },
        { kind: 'question', stem: '21. If 2^(x+3) = 32, what is x?', choices: ['1', '2', '3', '4', '5'] },
        {
          kind: 'question',
          stem: '22. A rectangle has perimeter 36 and length twice its width. What is its area?',
          choices: ['36', '54', '64', '72', '81'],
        },
        {
          kind: 'question',
          stem: '23. Set S = {3, 7, 7, 11, 14, 18}. Which is greatest?',
          choices: ['mean', 'median', 'mode', 'range', 'they are all equal'],
        },
        {
          kind: 'question',
          stem: '24. Working alone, a machine fills an order in 6 hours; a second machine takes 3 hours. How long do they take together, in hours?',
          choices: ['1.5', '2', '2.5', '4.5', '9'],
        },
        {
          kind: 'question',
          stem: '25. If n is a positive integer and 4n is a multiple of 6, which must be true? Select all that apply.',
          choices: ['n is even', 'n is a multiple of 3', '2n is a multiple of 3'],
        },
        {
          kind: 'collapse',
          summary: 'Solutions, questions 11 to 25',
          blocks: [
            {
              kind: 'ul',
              items: [
                '**11. (D).** 3x = 21, x = 7. 6x + 2 = 44. Faster: 6x = 2(3x) = 42, so 6x + 2 = 44.',
                '**12. (C).** 1.40 × 0.75 = 1.05, so 105%.',
                '**13. (A).** Units digits of powers of 3 cycle 3, 9, 7, 1 with period 4. 100 is divisible by 4, so it lands on the 4th position: 1.',
                '**14. (C).** 9-12-15 is a scaled 3-4-5 triple, so the other leg is 12. Area = (1/2)(9)(12) = 54.',
                '**15. (B).** Order does not matter: C(9,4) = 9!/(4!5!) = 126.',
                '**16. (B).** Original sum = 6 × 15 = 90. Remaining sum = 5 × 16 = 80. Removed = 10.',
                '**17. (B).** Time out = 3 hours, back = 2 hours. Total 240 miles in 5 hours = 48 mph. Not 50.',
                '**18. (B).** Factors to (x−2)(x−3) = 0, so x = 2 or 3. x = 2 gives 4 + 2 = 6; x = 3 gives 9 + 3 = 12. Only 6 is offered.',
                '**19. (A).** (5/12)(4/11) = 20/132 = 5/33.',
                '**20. (C).** (n − 2)180 = 1,080 → n − 2 = 6 → n = 8.',
                '**21. (B).** 32 = 2⁵, so x + 3 = 5, x = 2.',
                '**22. (D).** 2(w + 2w) = 36 → 6w = 36 → w = 6, length 12. Area = 72.',
                '**23. (D).** Mean = 60/6 = 10. Median = (7+11)/2 = 9. Mode = 7. Range = 18 − 3 = 15. Range is greatest.',
                '**24. (B).** 1/6 + 1/3 = 1/6 + 2/6 = 3/6 = 1/2 per hour, so 2 hours.',
                '**25. (B) and (C).** 4n divisible by 6 means 4n = 6k, so 2n = 3k, meaning 2n is a multiple of 3. Since 2 is not divisible by 3, n must be. (C) follows directly, and (B) is what forces it. (A) fails: n = 3 works and is odd.',
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'practice-tc',
      title: 'Text Completion (26 to 31)',
      blocks: [
        {
          kind: 'question',
          stem: '26. The findings were _______ enough that the researchers declined to publish until a second laboratory had replicated them.',
          choices: ['conclusive', 'provisional', 'exhaustive', 'meticulous', 'irrefutable'],
        },
        {
          kind: 'question',
          stem: '27. Critics initially dismissed the novel as hopelessly (i) _______; only decades later did readers come to see its refusal of conventional plotting as (ii) _______ rather than incompetent.',
          blanks: [
            { label: 'Blank (i)', choices: ['formulaic', 'inchoate', 'derivative'] },
            { label: 'Blank (ii)', choices: ['deliberate', 'accidental', 'fashionable'] },
          ],
        },
        {
          kind: 'question',
          stem: '28. Her willingness to revise long-held positions in light of new evidence struck colleagues as remarkable in a field where _______ is often mistaken for rigor.',
          choices: ['curiosity', 'obstinacy', 'precision', 'collaboration', 'diffidence'],
        },
        {
          kind: 'question',
          stem: '29. The treaty’s language was so _______ that both delegations left the negotiation convinced they had prevailed.',
          choices: ['equivocal', 'forthright', 'succinct', 'belligerent', 'cogent'],
        },
        {
          kind: 'question',
          stem: '30. Although the biography runs to nine hundred pages, it is curiously (i) _______; the author records what his subject did without ever venturing to explain (ii) _______.',
          blanks: [
            { label: 'Blank (i)', choices: ['exhaustive', 'uninformative', 'partisan'] },
            { label: 'Blank (ii)', choices: ['chronology', 'motive', 'consequence'] },
          ],
        },
        {
          kind: 'question',
          stem: '31. Far from being the (i) _______ he is often portrayed as, the reformer was a consummate political operator whose apparent (ii) _______ concealed years of careful coalition-building.',
          blanks: [
            { label: 'Blank (i)', choices: ['naif', 'tactician', 'demagogue'] },
            { label: 'Blank (ii)', choices: ['calculation', 'spontaneity', 'ruthlessness'] },
          ],
        },
        {
          kind: 'collapse',
          summary: 'Solutions, questions 26 to 31',
          blocks: [
            {
              kind: 'ul',
              items: [
                '**26. (B).** They would not publish without replication, so the findings were tentative: provisional. Conclusive and irrefutable are the opposite.',
                '**27. (B) and (D).** Blank (i) is the initial dismissal of a novel with unconventional plotting: inchoate, meaning formless. Blank (ii) contrasts with "incompetent," so the refusal was intentional: deliberate. Formulaic and derivative mean too conventional, which is backwards.',
                '**28. (B).** Revising positions is praised, so the thing mistaken for rigor is refusing to revise: obstinacy.',
                '**29. (A).** Both sides thought they had won, so the language was ambiguous: equivocal.',
                '**30. (B) and (E).** "Although nine hundred pages" sets up a contrast with length, and "records what he did without explaining" defines it: uninformative, and what is missing is motive.',
                '**31. (A) and (E).** "Far from" reverses: he is portrayed as an innocent but is actually a shrewd operator, so (i) is naif. His apparent quality concealed years of planning, so it looked unplanned: spontaneity.',
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'practice-se',
      title: 'Sentence Equivalence (32 to 36)',
      blocks: [
        {
          kind: 'question',
          stem: '32. The lecture was so _______ that several students in the back row visibly struggled to remain awake.',
          choices: ['soporific', 'contentious', 'rambling', 'enervating', 'provocative', 'succinct'],
        },
        {
          kind: 'question',
          stem: '33. His account of the expedition, though vivid, is too _______ to serve as a reliable historical source.',
          choices: ['embellished', 'laconic', 'meticulous', 'romanticized', 'pedestrian', 'technical'],
        },
        {
          kind: 'question',
          stem: '34. The new policy was intended to _______ the tensions between the two departments, but it only deepened them.',
          choices: ['exacerbate', 'assuage', 'mitigate', 'expose', 'aggravate', 'document'],
        },
        {
          kind: 'question',
          stem: '35. What the committee took for _______ was in fact a carefully considered refusal to endorse a plan its chair privately believed unworkable.',
          choices: ['indecision', 'sagacity', 'vacillation', 'prudence', 'hostility', 'candor'],
        },
        {
          kind: 'question',
          stem: '36. Scholarship on the period has been hampered by the _______ of surviving documents, most of which were destroyed in the fire of 1683.',
          choices: ['profusion', 'dearth', 'obscurity', 'paucity', 'irrelevance', 'antiquity'],
        },
        {
          kind: 'collapse',
          summary: 'Solutions, questions 32 to 36',
          blocks: [
            {
              kind: 'ul',
              items: [
                '**32. (A) and (D).** Students struggling to stay awake means sleep-inducing. Soporific and enervating (draining of energy) pair. Contentious and provocative form the decoy pair.',
                '**33. (A) and (D).** "Vivid but unreliable" means overstated: embellished and romanticized. Laconic and pedestrian do not fit vivid.',
                '**34. (B) and (C).** "Intended to... but only deepened them" means the intent was to reduce tension: assuage and mitigate. Exacerbate and aggravate are a decoy pair meaning the opposite.',
                '**35. (A) and (C).** The committee misread a deliberate refusal as an inability to decide: indecision and vacillation. Sagacity and prudence pair but are positive, contradicting "took for."',
                '**36. (B) and (D).** Documents were destroyed, so few survive: dearth and paucity. Profusion is the opposite.',
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'practice-rc',
      title: 'Reading Comprehension (37 to 40)',
      blocks: [
        {
          kind: 'p',
          text: 'Early theories of birdsong acquisition treated it as a straightforward instance of imitation: the juvenile hears an adult’s song and reproduces it. Laboratory work from the 1960s onward complicated this picture considerably. Juveniles of many species pass through a sensitive period during which they must be exposed to conspecific song, but they do not sing during this period; production begins weeks or months later, after the model is no longer available. The juvenile is therefore not copying in real time but matching its output against a stored template.',
        },
        {
          kind: 'p',
          text: 'More striking still is what happens to birds deafened after the sensitive period but before they begin to sing. These birds, which have heard and stored a normal song model, nonetheless produce highly abnormal songs. The template alone is insufficient; the bird must hear itself in order to converge on the model. This finding recast the problem as one of sensorimotor learning rather than of memory, and made birdsong an unexpectedly close analogue to human speech acquisition, in which deaf infants babble normally at first and then diverge.',
        },
        {
          kind: 'question',
          stem: '37. The primary purpose of the passage is to',
          choices: [
            'argue that birdsong acquisition is identical to human speech acquisition',
            'describe how experimental findings revised an initial account of birdsong learning',
            'explain why some birds fail to develop normal songs',
            'criticize early theorists for relying on imitation as an explanation',
            'establish the length of the sensitive period in songbirds',
          ],
        },
        {
          kind: 'question',
          stem: '38. According to the passage, the significance of the deafening experiments is that they',
          choices: [
            'demonstrated that the stored template is unnecessary for normal song',
            "showed that auditory feedback from the bird's own production is required",
            'proved that the sensitive period occurs earlier than previously believed',
            'established that birdsong is entirely innate',
            'revealed that juveniles sing during the sensitive period after all',
          ],
        },
        {
          kind: 'question',
          stem: '39. It can be inferred from the passage that a juvenile bird isolated from all conspecific song during its sensitive period but with hearing intact would most likely',
          choices: [
            'produce a normal song',
            'produce no song at all',
            'fail to produce a normal song, lacking a stored model',
            'produce a song identical to that of a deafened bird',
            'acquire the song of a different species',
          ],
        },
        {
          kind: 'question',
          stem: '40. The author mentions deaf infants primarily in order to',
          choices: [
            'argue that birdsong research should inform speech therapy',
            'illustrate the parallel that made the birdsong finding significant beyond ornithology',
            'question whether the birdsong model applies to humans',
            'suggest that babbling serves no developmental function',
            'compare the sensitive periods of birds and humans',
          ],
        },
        {
          kind: 'collapse',
          summary: 'Solutions, questions 37 to 40',
          blocks: [
            {
              kind: 'ul',
              items: [
                '**37. (B).** The passage moves from "early theories" through two rounds of experimental complication. (A) overstates: the passage says "close analogue," not identical. (D) mischaracterizes the tone, which is descriptive, not critical.',
                '**38. (B).** Stated directly: deafened birds with a stored template still sing abnormally, so the bird must hear itself. (A) reverses it; the template is necessary but not sufficient.',
                '**39. (C).** The passage establishes that exposure during the sensitive period creates the stored template, and that the template is necessary. Without exposure there is no template to match against. (B) is too strong; the passage never says such birds are silent, only that normal song requires a model.',
                '**40. (B).** The comparison appears in the final clause, introduced as what made the finding "unexpectedly" significant. It is an illustration of the parallel, not an argument about therapy (A) or a challenge to the model (C).',
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'practice-results',
      title: 'Reading your results',
      blocks: [
        {
          kind: 'callout',
          tone: 'key',
          body: [
            'More than 6 wrong in Quant, or more than 5 in Verbal, means go back to the relevant chapters rather than doing more practice questions.',
            'Below that, the issue is usually process rather than content. Check your error log categories.',
          ],
        },
      ],
    },
  ],
};
