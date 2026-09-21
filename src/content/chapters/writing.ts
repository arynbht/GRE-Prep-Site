import type { BookChapter } from '../types';

export const analyticalWriting: BookChapter = {
  id: 'analytical-writing',
  title: 'Analytical Writing: the Issue essay',
  summary: 'What graders reward, a reusable structure, practice prompts, and a full scored example.',
  sections: [
    {
      id: 'aw-task',
      title: 'The task',
      blocks: [
        {
          kind: 'p',
          text: 'One task, 30 minutes. You are given a claim about a broad issue (education, technology, government, the role of the individual) plus specific instructions about how to respond. Those instructions vary and they matter:',
        },
        {
          kind: 'ul',
          items: [
            '...discuss the extent to which you agree or disagree, and explain your reasoning',
            '...address the most compelling reasons or examples that could be used to challenge your position',
            '...describe specific circumstances in which adopting the recommendation would or would not be advantageous',
            '...discuss which view more closely aligns with your own position',
          ],
        },
        {
          kind: 'callout',
          tone: 'warn',
          body: [
            'Read the instructions and follow them literally. If they ask you to address counterarguments, an essay without counterarguments loses points no matter how well written.',
          ],
        },
      ],
    },
    {
      id: 'aw-rewards',
      title: 'What graders actually reward',
      blocks: [
        {
          kind: 'p',
          text: 'Essays are scored 0 to 6 by a trained human reader and an automated system, with a second human if they disagree. Each is read in a couple of minutes. What moves the score:',
        },
        {
          kind: 'ol',
          items: [
            '**A clear, specific position, stated early.** Not "there are many sides to this issue." Take a side. A nuanced position is fine, such as "this is true in domain X but fails in domain Y," as long as it is definite.',
            '**Developed examples.** One example explored across five sentences beats three named in passing. Specificity is the single biggest differentiator between a 4 and a 5.',
            '**Engagement with the other side.** Even when not required, one paragraph acknowledging and answering the strongest objection is what separates a 5 from a 6.',
            '**Logical structure.** Obvious paragraphing, clear transitions. Graders reading fast need to see the skeleton.',
            '**Competent prose.** Minor errors are explicitly tolerated. Clarity matters more than elegance.',
          ],
        },
        {
          kind: 'p',
          text: 'What does **not** move the score: length beyond about 500 to 600 words, vocabulary for its own sake, or made-up statistics. Personal, historical, literary, and hypothetical examples are all acceptable. Graders do not fact-check, but a transparently invented statistic reads as filler.',
        },
      ],
    },
    {
      id: 'aw-time',
      title: 'Time budget',
      blocks: [
        {
          kind: 'table',
          head: ['Minutes', 'Activity'],
          rows: [
            ['0 to 4', 'Read prompt carefully, decide position, jot 2 to 3 examples'],
            ['4 to 26', 'Write'],
            ['26 to 30', 'Proofread'],
          ],
        },
        {
          kind: 'callout',
          tone: 'key',
          body: [
            'Four minutes of planning feels like a lot when the clock is running. Do it anyway. Essays that start writing at minute one usually wander.',
          ],
        },
      ],
    },
    {
      id: 'aw-structure',
      title: 'A reusable structure',
      blocks: [
        {
          kind: 'ul',
          items: [
            '**Paragraph 1, introduction** (3 to 4 sentences). Frame the issue in one sentence. State your position clearly. Preview your reasoning.',
            '**Paragraph 2, strongest supporting argument.** Topic sentence stating the reason. A concrete, developed example. Explicit explanation of how the example supports your claim; do not make the grader do that work.',
            '**Paragraph 3, second supporting argument.** Same shape, different angle. Ideally a different kind of reason than paragraph 2: if paragraph 2 was practical, make this one principled.',
            '**Paragraph 4, counterargument and response.** State the strongest objection honestly, then explain why your position survives it, usually by limiting the scope of the objection rather than denying it.',
            '**Paragraph 5, conclusion** (2 to 3 sentences). Restate your position with the added nuance the essay earned. Do not introduce new arguments.',
          ],
        },
      ],
    },
    {
      id: 'aw-prompts',
      title: 'Practice prompts',
      blocks: [
        { kind: 'p', text: 'Write at least three of these under strict 30-minute timing before test day.' },
        {
          kind: 'ol',
          items: [
            'Governments should focus their spending on preserving cultural heritage rather than on scientific research. Discuss the extent to which you agree or disagree, addressing the most compelling reasons that could challenge your position.',
            'The best way to understand a society is to study its popular entertainment rather than its formal institutions. Discuss the extent to which you agree or disagree.',
            'Universities should require every student to take courses outside their field of specialization. Describe specific circumstances in which adopting this policy would or would not be advantageous, and explain how these examples shape your position.',
            'Technological progress tends to create more problems than it solves. Discuss the extent to which you agree or disagree with the claim and the reasoning on which it is based.',
            'Leaders are made by the demands of their circumstances, not by innate qualities of character. Discuss which view more closely aligns with your own position.',
          ],
        },
      ],
    },
    {
      id: 'aw-sample',
      title: 'A sample high-scoring response',
      blocks: [
        {
          kind: 'example',
          title: 'Prompt',
          blocks: [
            {
              kind: 'p',
              text: 'Universities should require every student to take courses outside their field of specialization. Describe specific circumstances in which adopting this policy would or would not be advantageous.',
            },
          ],
        },
        {
          kind: 'p',
          text: 'The case for distribution requirements rests on a claim about transfer: that studying an unfamiliar discipline produces habits of mind that travel back into a student’s specialization. This claim is defensible, but its strength depends almost entirely on how the requirement is designed. Where outside courses are substantive and methodologically distinct from a student’s field, the requirement is clearly advantageous; where they are watered-down surveys taken to satisfy a checkbox, it wastes time that specialization genuinely needs.',
        },
        {
          kind: 'p',
          text: 'Consider the advantageous case first. A student of computer science who takes a serious course in moral philosophy encounters something her major cannot supply: a discipline in which arguments are evaluated by standards other than whether the code runs. Questions about algorithmic fairness, data consent, and automation’s effects on labor are not technical questions, and a programmer who has never been trained to reason about competing obligations will handle them badly, often without noticing that she is handling them at all. The value here is not general "well-roundedness." It is the acquisition of a specific analytical tool the major does not contain. The same holds for the history student who takes statistics and discovers that the evidentiary claims in the secondary literature she reads can be checked.',
        },
        {
          kind: 'p',
          text: 'The unfavorable case follows from the same logic. Many distribution requirements are satisfied by large introductory courses designed to be survivable by the uninterested. A physics major who fulfills a humanities requirement with a lecture course on film, attended sporadically and passed on the strength of a curve, has acquired no new method of reasoning. She has spent a semester’s worth of tuition and roughly a hundred hours to produce a line on a transcript. In fields with dense technical prerequisites, such as engineering, nursing, and music performance, those hours have a real opportunity cost, and the argument from transfer cannot justify the expense when no transfer occurs.',
        },
        {
          kind: 'p',
          text: 'The strongest objection to my position is that it asks too much of eighteen-year-olds. Students often cannot tell in advance which outside courses will prove generative, and a requirement that only counts rigorous, methodologically distinct courses may simply push them toward whichever rigorous course is easiest to schedule. This is a fair concern, and it suggests that the requirement should be paired with advising rather than left to student judgment alone. But it does not rescue the checkbox model. That students choose poorly under a badly designed requirement is an argument for designing it better, not for accepting the version that reliably produces nothing.',
        },
        {
          kind: 'p',
          text: 'Universities should therefore require outside coursework, but the requirement should be specified in terms of methodological distance rather than departmental label. A student should have to demonstrate that she has learned to reason in a way her major does not teach, which is, after all, the only thing the policy was ever meant to accomplish.',
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'Why this scores well',
          body: [
            'It takes a clear position in the first paragraph and immediately qualifies it in a way the essay then develops. Each body paragraph does one job. The examples are specific and carried through rather than named.',
            'The counterargument is stated at full strength, not as a straw man, and answered by narrowing rather than dismissing. The conclusion adds the refinement the argument earned. Roughly 520 words, which is plenty.',
          ],
        },
      ],
    },
    {
      id: 'aw-practical',
      title: 'Practical advice',
      blocks: [
        {
          kind: 'ul',
          items: [
            'Type in the GRE’s plain text box. No spell-check, no grammar-check, no formatting. Practice in a plain text editor so you are not surprised.',
            'Indent or skip a line between paragraphs so the structure is visible.',
            'If you run short on time, always write a conclusion, even a two-sentence one. An essay that stops mid-argument reads as incomplete in a way that costs more than a thin final paragraph.',
            'Do not memorize an essay. Graders recognize canned material, and prompts vary too much for a memorized response to fit.',
          ],
        },
      ],
    },
  ],
};
