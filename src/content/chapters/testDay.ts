import type { BookChapter } from '../types';

export const testDay: BookChapter = {
  id: 'test-day',
  title: 'Test-day strategy',
  summary: 'Pacing checkpoints, the two-minute rule, guessing well, nerves, and the last 48 hours.',
  sections: [
    {
      id: 'pacing-checkpoints',
      title: 'Pacing',
      blocks: [
        {
          kind: 'p',
          text: 'You have roughly 1.5 minutes per Verbal question and 1.75 per Quant question. Rather than watching the clock constantly, set two checkpoints per section and glance only at those.',
        },
        {
          kind: 'table',
          head: ['Section', 'At the halfway mark you should be at'],
          rows: [
            ['Verbal, 12 questions / 18 min', 'question 6 with 9 minutes left'],
            ['Verbal, 15 questions / 23 min', 'question 8 with 11 minutes left'],
            ['Quant, 12 questions / 21 min', 'question 6 with 10 minutes left'],
            ['Quant, 15 questions / 26 min', 'question 8 with 13 minutes left'],
          ],
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'The two-minute rule',
          body: [
            'If a question has consumed two minutes and you are not close, you have already lost. Guess, mark it, move on.',
            'The most expensive mistake on the GRE is spending four minutes on a hard question and then rushing three easy ones you would have gotten right.',
          ],
        },
        {
          kind: 'p',
          text: '**All questions are worth the same.** There are no bonus points for difficulty. A hard question you solve in four minutes is worth exactly what an easy question you solve in forty seconds is worth.',
        },
      ],
    },
    {
      id: 'mark-review',
      title: 'Mark and review',
      blocks: [
        {
          kind: 'p',
          text: 'The interface lets you mark questions and return to them, and review your answers within the section before time expires. Use it deliberately:',
        },
        {
          kind: 'ol',
          items: [
            '**First pass:** answer everything you can comfortably. Skip anything that looks like it will take too long, but always fill in an answer before skipping, so a timer that runs out does not leave you with blanks.',
            '**Second pass:** return to marked questions with your remaining time, hardest-looking last.',
            '**Never leave anything blank.** There is no wrong-answer penalty.',
          ],
        },
      ],
    },
    {
      id: 'guessing',
      title: 'Guessing well',
      blocks: [
        {
          kind: 'ul',
          items: [
            '**Eliminate first.** Every choice you can rule out improves the odds substantially. Two eliminations on a five-choice question take you from 20% to 33%.',
            'On Quantitative Comparison, remember that **(D) is impossible when both quantities are purely numeric.**',
            'On Quant, eliminate answers with the wrong order of magnitude or the wrong sign. Answer choices that are the result of a common error, such as forgetting to halve or using the diameter instead of the radius, are deliberately included, so an answer that falls out too easily deserves a second look.',
            'On Verbal, eliminate on charge, positive or negative, before anything else.',
            'If you must guess blind, pick and move immediately. Deliberating over a blind guess is pure time loss.',
          ],
        },
      ],
    },
    {
      id: 'adaptive-reminder',
      title: 'Remember the adaptive structure',
      blocks: [
        {
          kind: 'p',
          text: 'The first Verbal and first Quant section set the difficulty of the second. Bring your best focus to them. This does not mean going slower. It means not letting the first few minutes go to settling in.',
        },
      ],
    },
    {
      id: 'nerves',
      title: 'Managing nerves',
      blocks: [
        {
          kind: 'ul',
          items: [
            '**A hard question means nothing about how you are doing.** Within a section, difficulty is fixed. A brutal question 4 is not a signal.',
            'If your mind goes blank, stop, put your pen down, take three slow breaths, and reread the question from the first word. Ten seconds spent resetting is cheaper than two minutes of spiraling.',
            'Finished a section badly? It is over. You cannot go back, and carrying it into the next section is the only way it can cost you more than it already has.',
            'The essay comes first and is the section you have the least control over. Write it, release it, move on.',
          ],
        },
      ],
    },
    {
      id: 'last-48',
      title: 'The last 48 hours',
      blocks: [
        {
          kind: 'p',
          text: '**Two days before.** Light review only: the formula sheet, your error log, vocabulary. No full practice tests. Cramming new content at this point produces anxiety, not points.',
        },
        {
          kind: 'p',
          text: '**The day before.** Stop studying by early afternoon. Confirm your test center location and travel time, or your at-home system check. Lay out your ID. It must match your registration name exactly, and a mismatch will get you turned away. Sleep matters more than any review you could do.',
        },
        { kind: 'p', text: '**Test day.**' },
        {
          kind: 'ul',
          items: [
            'Eat something with protein. The test runs two hours with no scheduled break.',
            'Arrive 30 minutes early. Rushing raises your baseline stress for the whole test.',
            'Bring your ID, your confirmation, and water and a snack for after.',
            'Do a couple of easy warm-up problems in the car or at home. Not to learn anything, just to get your brain into the right mode before question one.',
          ],
        },
      ],
    },
    {
      id: 'if-it-goes-badly',
      title: 'If it goes badly',
      blocks: [
        {
          kind: 'p',
          text: 'You will see your unofficial Verbal and Quant scores immediately, and you will be offered the choice to report or cancel. **Report them** unless something genuinely went wrong, because ScoreSelect means you control what schools see later, and a cancelled score gives you no information about where you stand.',
        },
        {
          kind: 'p',
          text: 'You can retake after 21 days, up to five times in a rolling year. Most people improve on a second attempt, partly from more study and largely from knowing what the room feels like.',
        },
      ],
    },
  ],
};
