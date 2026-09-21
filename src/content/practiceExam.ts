import type { RawQuestionRow } from '../types';

/**
 * The 40-question practice set from the review book, in the same row shape the
 * CSV importer produces, so it can be sat as a real timed exam.
 *
 * Answers and explanations are taken from the solutions in the "Practice set"
 * chapter. If you change one, change the other.
 */
export const PRACTICE_EXAM_NAME = 'GRE Practice Set (from the review book)';
export const PRACTICE_EXAM_ID = 'built-in-practice-set';

const QUANT = 'Quantitative Reasoning';
const VERBAL = 'Verbal Reasoning';

const BIRDSONG_PASSAGE =
  '<p>Early theories of birdsong acquisition treated it as a straightforward instance of imitation: the juvenile ' +
  'hears an adult’s song and reproduces it. Laboratory work from the 1960s onward complicated this picture ' +
  'considerably. Juveniles of many species pass through a sensitive period during which they must be exposed to ' +
  'conspecific song, but they do not sing during this period; production begins weeks or months later, after the ' +
  'model is no longer available. The juvenile is therefore not copying in real time but matching its output against ' +
  'a stored template.</p>' +
  '<p>More striking still is what happens to birds deafened after the sensitive period but before they begin to ' +
  'sing. These birds, which have heard and stored a normal song model, nonetheless produce highly abnormal songs. ' +
  'The template alone is insufficient; the bird must hear itself in order to converge on the model. This finding ' +
  'recast the problem as one of sensorimotor learning rather than of memory, and made birdsong an unexpectedly ' +
  'close analogue to human speech acquisition, in which deaf infants babble normally at first and then diverge.</p>';

function row(
  id: string,
  section: string,
  type: string,
  prompt: string,
  options: string,
  correct: string,
  explanation: string,
  passageId = '',
  passageText = '',
): RawQuestionRow {
  return {
    id,
    section,
    type,
    passage_id: passageId,
    passage_text: passageText,
    prompt,
    options,
    correct,
    explanation,
  };
}

export const practiceExamRows: RawQuestionRow[] = [
  // ------------------------------------------------ Quantitative Comparison
  row(
    'ps01', QUANT, 'qc',
    'x is an integer, and x² = 49.||x||7',
    '', '3',
    'x² = 49 gives x = 7 or x = −7. Two different relationships are possible, so the relationship cannot be determined. The trap is assuming the positive root.',
  ),
  row(
    'ps02', QUANT, 'qc',
    '0.2% of 4,000||2% of 400',
    '', '2',
    '0.002 × 4,000 = 8 and 0.02 × 400 = 8. The two quantities are equal.',
  ),
  row(
    'ps03', QUANT, 'qc',
    'n > 1||n²||n³',
    '', '1',
    'For n > 1, multiplying by n increases the value, so n³ > n². Note this would be indeterminate if n could lie between 0 and 1; the constraint matters.',
  ),
  row(
    'ps04', QUANT, 'qc',
    'The number of prime numbers between 1 and 20||The number of factors of 36',
    '', '1',
    'Primes from 2 to 20 are 2, 3, 5, 7, 11, 13, 17, 19, so eight of them. 36 = 2² × 3² has (2+1)(2+1) = 9 factors. Quantity B is greater.',
  ),
  row(
    'ps05', QUANT, 'qc',
    'A triangle has two sides of length 6 and 10.||The length of the third side||16',
    '', '1',
    'By the triangle inequality the third side lies strictly between 10 − 6 = 4 and 10 + 6 = 16, so it is always less than 16.',
  ),
  row(
    'ps06', QUANT, 'qc',
    '(−2)⁴||−2⁴',
    '', '0',
    '(−2)⁴ = 16, but −2⁴ = −(2⁴) = −16. The exponent binds more tightly than the negative sign.',
  ),
  row(
    'ps07', QUANT, 'qc',
    'The average of 5 numbers is 20.||The sum of the 5 numbers||100',
    '', '2',
    'Sum = average × count = 20 × 5 = 100. The quantities are equal.',
  ),
  row(
    'ps08', QUANT, 'qc',
    '0 < x < 1||x²||√x',
    '', '1',
    'Between 0 and 1, squaring shrinks a number and taking the square root grows it. Test x = 0.25: x² = 0.0625 while √x = 0.5.',
  ),
  row(
    'ps09', QUANT, 'qc',
    'The area of a circle with radius 3||The area of a square with side 5',
    '', '0',
    'The circle has area 9π ≈ 28.3; the square has area 25. Estimating π as a bit more than 3 settles it without a calculator.',
  ),
  row(
    'ps10', QUANT, 'qc',
    'a and b are positive, and a/b = 3/4.||a||b',
    '', '1',
    'a/b = 3/4 means a is 3 parts to b’s 4 parts. Since both are positive, b is greater.',
  ),

  // ------------------------------------------------------- Quant, multiple choice
  row(
    'ps11', QUANT, 'mc',
    'If 3x − 7 = 14, what is the value of 6x + 2?',
    '14|32|42|44|46', '3',
    '3x = 21 so x = 7, and 6x + 2 = 44. Faster still: 6x is twice 3x, so 6x = 42 and 6x + 2 = 44.',
  ),
  row(
    'ps12', QUANT, 'mc',
    'A shirt is marked up 40% and then put on sale for 25% off the marked price. The final price is what percent of the original?',
    '95%|100%|105%|110%|115%', '2',
    'Successive percent changes multiply: 1.40 × 0.75 = 1.05, so the final price is 105% of the original. The changes do not cancel.',
  ),
  row(
    'ps13', QUANT, 'mc',
    'What is the units digit of 3^100?',
    '1|3|7|9|0', '0',
    'Units digits of powers of 3 cycle 3, 9, 7, 1 with period 4. Since 100 is divisible by 4, it lands on the fourth position, which is 1.',
  ),
  row(
    'ps14', QUANT, 'mc',
    'In a right triangle, one leg is 9 and the hypotenuse is 15. What is the area?',
    '36|48|54|60|67.5', '2',
    '9-12-15 is a scaled 3-4-5 triple, so the other leg is 12. Area = (1/2)(9)(12) = 54.',
  ),
  row(
    'ps15', QUANT, 'mc',
    'A committee of 4 is chosen from 9 people. How many different committees are possible?',
    '36|126|252|3,024|6,561', '1',
    'Order does not matter, so this is a combination: C(9,4) = 9!/(4!5!) = 126. The 3,024 answer is the permutation P(9,4), the trap for treating order as significant.',
  ),
  row(
    'ps16', QUANT, 'mc',
    'If the average of 6 numbers is 15 and one number is removed, the average of the remaining 5 is 16. What number was removed?',
    '5|10|14|16|20', '1',
    'Original sum = 6 × 15 = 90 and the remaining sum = 5 × 16 = 80, so the removed number is 10.',
  ),
  row(
    'ps17', QUANT, 'mc',
    'A car travels 120 miles at 40 mph and returns at 60 mph. What is the average speed for the round trip, in miles per hour?',
    '45|48|50|52|55', '1',
    'Time out is 3 hours and back is 2 hours, so 240 miles in 5 hours, which is 48 mph. Average speed is total distance over total time, never the average of the two speeds, which would wrongly give 50.',
  ),
  row(
    'ps18', QUANT, 'mc',
    'If x² − 5x + 6 = 0, which of the following could be the value of x² + x?',
    '2|6|8|10|15', '1',
    'The equation factors to (x − 2)(x − 3) = 0, so x = 2 or x = 3. Those give x² + x = 6 and 12 respectively, and only 6 appears among the choices.',
  ),
  row(
    'ps19', QUANT, 'mc',
    'A bag holds 4 red, 5 green, and 3 blue marbles. Two are drawn without replacement. What is the probability that both are green?',
    '5/33|25/144|5/12|1/6|5/66', '0',
    'Without replacement the denominator shrinks: (5/12)(4/11) = 20/132 = 5/33. The 25/144 answer is the with-replacement result.',
  ),
  row(
    'ps20', QUANT, 'mc',
    'The sum of the interior angles of a regular polygon is 1,080 degrees. How many sides does it have?',
    '6|7|8|9|10', '2',
    '(n − 2) × 180 = 1,080 gives n − 2 = 6, so n = 8.',
  ),
  row(
    'ps21', QUANT, 'mc',
    'If 2^(x+3) = 32, what is the value of x?',
    '1|2|3|4|5', '1',
    'Write 32 as 2⁵. With equal bases the exponents match, so x + 3 = 5 and x = 2.',
  ),
  row(
    'ps22', QUANT, 'mc',
    'A rectangle has perimeter 36 and its length is twice its width. What is its area?',
    '36|54|64|72|81', '3',
    '2(w + 2w) = 36 gives 6w = 36, so w = 6 and the length is 12. Area = 72.',
  ),
  row(
    'ps23', QUANT, 'mc',
    'For the set S = {3, 7, 7, 11, 14, 18}, which of the following is greatest?',
    'the mean|the median|the mode|the range|they are all equal', '3',
    'Mean = 60/6 = 10, median = (7+11)/2 = 9, mode = 7, and range = 18 − 3 = 15. The range is greatest.',
  ),
  row(
    'ps24', QUANT, 'mc',
    'Working alone, one machine fills an order in 6 hours and a second machine takes 3 hours. Working together, how many hours do they take?',
    '1.5|2|2.5|4.5|9', '1',
    'Rates add: 1/6 + 1/3 = 1/2 of the job per hour, so 2 hours. Sanity check: the combined time must be less than the faster machine’s 3 hours.',
  ),
  row(
    'ps25', QUANT, 'mcm',
    'If n is a positive integer and 4n is a multiple of 6, which of the following must be true? Indicate all that apply.',
    'n is even|n is a multiple of 3|2n is a multiple of 3', '1,2',
    '4n divisible by 6 means 4n = 6k, so 2n = 3k and 2n is a multiple of 3. Since 2 is not divisible by 3, n itself must be. n does not have to be even: n = 3 works and is odd.',
  ),

  // ----------------------------------------------------------- Text Completion
  row(
    'ps26', VERBAL, 'tc',
    'The findings were ___1___ enough that the researchers declined to publish until a second laboratory had replicated them.',
    'conclusive|provisional|exhaustive|meticulous|irrefutable', '1',
    'Refusing to publish without replication signals that the findings were tentative, so "provisional" fits. "Conclusive" and "irrefutable" say the opposite.',
  ),
  row(
    'ps27', VERBAL, 'tc',
    'Critics initially dismissed the novel as hopelessly ___1___; only decades later did readers come to see its refusal of conventional plotting as ___2___ rather than incompetent.',
    'formulaic|inchoate|derivative;;deliberate|accidental|fashionable', '1;0',
    'The first blank is the initial dismissal of a book that refuses conventional plotting, so "inchoate", meaning formless, fits; "formulaic" and "derivative" mean too conventional, which is backwards. The second blank contrasts with "incompetent", so the refusal was intentional: deliberate.',
  ),
  row(
    'ps28', VERBAL, 'tc',
    'Her willingness to revise long-held positions in light of new evidence struck colleagues as remarkable in a field where ___1___ is often mistaken for rigor.',
    'curiosity|obstinacy|precision|collaboration|diffidence', '1',
    'Revising positions is what earns praise, so the quality mistaken for rigor is the refusal to revise: obstinacy.',
  ),
  row(
    'ps29', VERBAL, 'tc',
    'The treaty’s language was so ___1___ that both delegations left the negotiation convinced they had prevailed.',
    'equivocal|forthright|succinct|belligerent|cogent', '0',
    'Both sides believing they won means the wording could be read two ways: equivocal. "Forthright" and "cogent" would make the meaning clear, which is the opposite.',
  ),
  row(
    'ps30', VERBAL, 'tc',
    'Although the biography runs to nine hundred pages, it is curiously ___1___; the author records what his subject did without ever venturing to explain ___2___.',
    'exhaustive|uninformative|partisan;;chronology|motive|consequence', '1;1',
    '"Although nine hundred pages" sets up a contrast with length, and "records what he did without explaining" defines the gap: the book is uninformative, and what is missing is motive.',
  ),
  row(
    'ps31', VERBAL, 'tc',
    'Far from being the ___1___ he is often portrayed as, the reformer was a consummate political operator whose apparent ___2___ concealed years of careful coalition-building.',
    'naif|tactician|demagogue;;calculation|spontaneity|ruthlessness', '0;1',
    '"Far from" reverses the portrayal: he is painted as an innocent but was actually shrewd, so the first blank is naif. His apparent quality hid years of planning, so it looked unplanned: spontaneity.',
  ),

  // ------------------------------------------------------ Sentence Equivalence
  row(
    'ps32', VERBAL, 'se',
    'The lecture was so _____ that several students in the back row visibly struggled to remain awake.',
    'soporific|contentious|rambling|enervating|provocative|succinct', '0,3',
    'Students fighting sleep points to something sleep-inducing and draining: soporific and enervating. Contentious and provocative form the decoy pair, and neither fits the clue.',
  ),
  row(
    'ps33', VERBAL, 'se',
    'His account of the expedition, though vivid, is too _____ to serve as a reliable historical source.',
    'embellished|laconic|meticulous|romanticized|pedestrian|technical', '0,3',
    'Vivid but unreliable points to overstatement: embellished and romanticized. Laconic and pedestrian contradict "vivid".',
  ),
  row(
    'ps34', VERBAL, 'se',
    'The new policy was intended to _____ the tensions between the two departments, but it only deepened them.',
    'exacerbate|assuage|mitigate|expose|aggravate|document', '1,2',
    '"Intended to ... but only deepened them" means the aim was to reduce tension: assuage and mitigate. Exacerbate and aggravate are a decoy pair meaning the opposite.',
  ),
  row(
    'ps35', VERBAL, 'se',
    'What the committee took for _____ was in fact a carefully considered refusal to endorse a plan its chair privately believed unworkable.',
    'indecision|sagacity|vacillation|prudence|hostility|candor', '0,2',
    'The committee misread a deliberate refusal as an inability to decide: indecision and vacillation. Sagacity and prudence pair but are positive, which contradicts "took for".',
  ),
  row(
    'ps36', VERBAL, 'se',
    'Scholarship on the period has been hampered by the _____ of surviving documents, most of which were destroyed in the fire of 1683.',
    'profusion|dearth|obscurity|paucity|irrelevance|antiquity', '1,3',
    'Most documents were destroyed, so few survive: dearth and paucity. Profusion means the opposite.',
  ),

  // ---------------------------------------------------- Reading Comprehension
  row(
    'ps37', VERBAL, 'rc',
    'The primary purpose of the passage is to',
    'argue that birdsong acquisition is identical to human speech acquisition|describe how experimental findings revised an initial account of birdsong learning|explain why some birds fail to develop normal songs|criticize early theorists for relying on imitation as an explanation|establish the length of the sensitive period in songbirds',
    '1',
    'The passage moves from early theories through two rounds of experimental complication. The first choice overstates, since the passage says "close analogue" rather than identical, and the fourth mischaracterizes a descriptive tone as critical.',
    'ps-birdsong', BIRDSONG_PASSAGE,
  ),
  row(
    'ps38', VERBAL, 'rc',
    'According to the passage, the significance of the deafening experiments is that they',
    'demonstrated that the stored template is unnecessary for normal song|showed that auditory feedback from the bird’s own production is required|proved that the sensitive period occurs earlier than previously believed|established that birdsong is entirely innate|revealed that juveniles sing during the sensitive period after all',
    '1',
    'Stated directly: deafened birds that have stored a normal template still sing abnormally, so the bird must hear itself. The first choice reverses the finding, since the template is necessary but not sufficient.',
    'ps-birdsong',
  ),
  row(
    'ps39', VERBAL, 'rc',
    'It can be inferred from the passage that a juvenile bird isolated from all conspecific song during its sensitive period, but with hearing intact, would most likely',
    'produce a normal song|produce no song at all|fail to produce a normal song, lacking a stored model|produce a song identical to that of a deafened bird|acquire the song of a different species',
    '2',
    'Exposure during the sensitive period is what creates the stored template, and the template is necessary for normal song. Without exposure there is nothing to match against. "Produce no song at all" is too strong; the passage never says such birds are silent.',
    'ps-birdsong',
  ),
  row(
    'ps40', VERBAL, 'rc',
    'The author mentions deaf infants primarily in order to',
    'argue that birdsong research should inform speech therapy|illustrate the parallel that made the birdsong finding significant beyond ornithology|question whether the birdsong model applies to humans|suggest that babbling serves no developmental function|compare the sensitive periods of birds and humans',
    '1',
    'The comparison appears in the final clause, introduced as what made the finding "unexpectedly" significant. It illustrates a parallel rather than arguing about therapy or challenging the model.',
    'ps-birdsong',
  ),
];
