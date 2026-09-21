import type { BookChapter } from '../types';

export const howToUse: BookChapter = {
  id: 'how-to-use',
  title: 'How to use this book',
  summary: 'What the test rewards, what counts as a good score, and how to read the chapters.',
  sections: [
    {
      id: 'how-to-use-intro',
      title: 'Preparation beats cleverness',
      blocks: [
        {
          kind: 'p',
          text: 'The GRE rewards preparation more than intelligence, which is good news: the content is fixed, narrow, and knowable. Almost everything tested in Quant stops at roughly 10th-grade math. The Verbal section tests vocabulary and careful reading, both of which respond to drilling. The people who score well are usually the ones who learned the question formats cold, not the ones who are cleverest.',
        },
        {
          kind: 'p',
          text: 'This book covers the whole test. Read it front to back once to see the shape of the thing, then use it as a reference while you do practice problems from official material.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'The one warning that matters most',
          body: [
            'This book is not a substitute for official practice questions. Third-party questions, including the ones written here, approximate the real test but never match its exact flavor.',
            'ETS publishes free material: the two PowerPrep practice tests (free, and the closest thing to the real exam), the Official Guide to the GRE General Test, and the separate Verbal Reasoning and Quantitative Reasoning practice question books.',
            'Do every official question you can get your hands on. Use this book to learn the methods, then apply them to ETS’s questions.',
          ],
        },
      ],
    },
    {
      id: 'good-score',
      title: 'What counts as a good score',
      blocks: [
        {
          kind: 'p',
          text: '**Good** depends entirely on where you are applying. Verbal and Quant are each scored 130 to 170 in one-point increments; Analytical Writing is 0 to 6 in half-point increments. Rough percentile landmarks:',
        },
        {
          kind: 'table',
          head: ['Score', 'Verbal percentile', 'Quant percentile'],
          rows: [
            ['170', '99', '96'],
            ['165', '96', '84'],
            ['160', '85', '69'],
            ['155', '68', '52'],
            ['150', '45', '34'],
            ['145', '25', '18'],
          ],
        },
        {
          kind: 'p',
          text: 'Notice that Quant percentiles run lower than Verbal at the same score. A 160 Quant is much more common than a 160 Verbal, because the Quant pool is full of engineers and economists.',
        },
        {
          kind: 'p',
          text: 'Check your target programs’ published medians rather than chasing a round number. Humanities programs often care about Verbal and barely glance at Quant; the reverse holds for most STEM and economics programs.',
        },
        {
          kind: 'callout',
          tone: 'note',
          body: [
            'Percentiles shift slightly year to year, so treat the table as approximate and verify current figures on the ETS score interpretation tables.',
          ],
        },
      ],
    },
    {
      id: 'how-to-read',
      title: 'How to read the chapters',
      blocks: [
        {
          kind: 'p',
          text: 'Each content chapter follows the same pattern: the rules or facts you need to have memorized, then the method for attacking that question type, then worked examples where the reasoning is spelled out.',
        },
        {
          kind: 'callout',
          tone: 'key',
          body: [
            'Read the worked examples with a pencil and try them before reading the explanation. Reading someone else’s solution feels like learning and mostly is not.',
          ],
        },
        {
          kind: 'p',
          text: 'The last two chapters, a 40-question mixed practice set and a one-page formula sheet, are the ones you will come back to. The formula sheet is designed to be reviewed the night before and the morning of.',
        },
      ],
    },
  ],
};

export const theTest: BookChapter = {
  id: 'the-test',
  title: 'The test itself',
  summary: 'Structure, section-level adaptivity, scoring, and the logistics worth knowing early.',
  sections: [
    {
      id: 'structure',
      title: 'Structure and timing',
      blocks: [
        {
          kind: 'p',
          text: 'The GRE General Test runs about 1 hour 58 minutes with no scheduled break. It was shortened substantially in September 2023: the old Argument essay and the unscored experimental section were both removed, so any prep material written before then describes a longer test.',
        },
        {
          kind: 'table',
          head: ['Section', 'Questions', 'Time'],
          rows: [
            ['Analytical Writing ("Analyze an Issue")', '1 essay', '30 min'],
            ['Verbal Reasoning, section 1', '12', '18 min'],
            ['Quantitative Reasoning, section 1', '12', '21 min'],
            ['Verbal Reasoning, section 2', '15', '23 min'],
            ['Quantitative Reasoning, section 2', '15', '26 min'],
          ],
        },
        {
          kind: 'p',
          text: 'The essay always comes first. The four multiple-choice sections can appear in either order after that. You might get Verbal, Quant, Verbal, Quant, or Quant, Verbal, Quant, Verbal. Do not let the order rattle you.',
        },
        {
          kind: 'p',
          text: 'That works out to roughly 1.5 minutes per Verbal question and 1.75 minutes per Quant question. Those averages matter; see the pacing guidance in each chapter.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          body: [
            'Verify the current structure on the ETS site before test day. This book is written from information current as of mid-2026.',
          ],
        },
      ],
    },
    {
      id: 'adaptivity',
      title: 'Section-level adaptivity',
      blocks: [
        {
          kind: 'p',
          text: 'This is the single mechanical fact most test-takers misunderstand. **The GRE adapts between sections, not within them.** Your performance on Verbal section 1 determines the difficulty of Verbal section 2, and likewise for Quant. Within any one section, question difficulty is fixed and unrelated to how you are doing.',
        },
        { kind: 'h', text: 'Three consequences' },
        {
          kind: 'ol',
          items: [
            '**The first section of each subject carries extra weight.** It sets the ceiling. A weak first Verbal section routes you to an easier second section, and easier sections cap your possible score. Spend your freshest attention there.',
            '**Within a section, order does not signal difficulty.** Question 3 is not necessarily easier than question 11. Move freely; skip anything that is not cooperating.',
            '**There is no penalty for wrong answers.** Never leave a question blank. With five answer choices, a blind guess is worth 20 percent, and an educated guess is worth much more.',
          ],
        },
      ],
    },
    {
      id: 'scoring',
      title: 'How raw performance becomes a score',
      blocks: [
        {
          kind: 'p',
          text: 'ETS does not publish an exact conversion, and it varies by test form. The rough relationship: your raw number correct across both sections, weighted by which second section you were routed into, maps onto the 130 to 170 scale. Getting into the harder second section is what makes high scores reachable at all.',
        },
        {
          kind: 'p',
          text: 'You can use the on-screen calculator on Quant. You cannot use one on Verbal, and you will not need one.',
        },
      ],
    },
    {
      id: 'logistics',
      title: 'Logistics worth knowing early',
      blocks: [
        {
          kind: 'ul',
          items: [
            '**Where.** At a Prometric test center or at home with the at-home proctored option. The at-home version has strict room and equipment requirements. Read them well in advance, not the night before.',
            '**Scratch paper.** You get physical scratch paper at a test center; at home you use an erasable whiteboard or a transparent sheet protector with a marker. Practice on whatever you will actually use. Writing on a small whiteboard is genuinely different from writing on paper.',
            '**Scores.** Unofficial Verbal and Quant scores appear on screen immediately after you finish. Official scores, including Analytical Writing, arrive in about 8 to 10 days.',
            '**ScoreSelect.** You choose which test administrations to send to schools. Schools do not have to see every attempt.',
            '**Retaking.** You can take the GRE once every 21 days, up to five times in any rolling 12-month period.',
            '**Validity.** Scores are reportable for five years.',
          ],
        },
        {
          kind: 'callout',
          tone: 'note',
          body: ['Registration fees and exact policies change; check ETS directly.'],
        },
      ],
    },
  ],
};

export const studyPlans: BookChapter = {
  id: 'study-plans',
  title: 'Study plans',
  summary: 'Four, eight, and twelve week schedules, the error log, and vocabulary cadence.',
  sections: [
    {
      id: 'baseline',
      title: 'Start with a cold diagnostic',
      blocks: [
        {
          kind: 'p',
          text: 'Start by taking a full, timed PowerPrep test cold, before you study anything. It will be unpleasant and it is the most useful two hours you will spend.',
        },
        {
          kind: 'p',
          text: 'You need a baseline to know where the gap is between where you are and where you need to be, and you need to know which section is actually costing you points. Most people guess wrong about this.',
        },
        { kind: 'p', text: 'Then pick the plan that matches your runway.' },
      ],
    },
    {
      id: 'plan-4',
      title: 'The 4-week plan (roughly 10 to 12 hours a week)',
      blocks: [
        {
          kind: 'p',
          text: 'This is triage. You will not master everything. Concentrate on the highest-yield material and accept gaps.',
        },
        {
          kind: 'table',
          head: ['Week', 'Focus'],
          rows: [
            [
              '1',
              'Diagnostic test. Quant fundamentals: arithmetic, number properties, algebra. Start vocabulary (20 words a day, every day, no exceptions).',
            ],
            ['2', 'Quant: word problems, geometry, statistics. Verbal: Text Completion and Sentence Equivalence method plus drills.'],
            ['3', 'Quant: Quantitative Comparison strategy, Data Interpretation. Verbal: Reading Comprehension. Write two practice essays.'],
            [
              '4',
              'Full timed practice test on day 1 of the week. Spend the rest of the week reviewing every question you missed. Light review only for the last two days.',
            ],
          ],
        },
      ],
    },
    {
      id: 'plan-8',
      title: 'The 8-week plan (roughly 8 to 10 hours a week)',
      blocks: [
        {
          kind: 'p',
          text: 'The realistic sweet spot for most people. Enough time to fix real weaknesses without burning out.',
        },
        {
          kind: 'ul',
          items: [
            '**Weeks 1 to 2.** Diagnostic. Quant fundamentals: arithmetic, number properties, exponents, roots, algebra. Vocabulary begins day one and never stops.',
            '**Weeks 3 to 4.** Quant word problems and geometry. Verbal: Text Completion and Sentence Equivalence, drilled until the method is automatic.',
            '**Week 5.** Statistics, counting, probability. Reading Comprehension method. Practice test #2 at the end of the week.',
            '**Week 6.** Quantitative Comparison and Data Interpretation. Analytical Writing: learn the template, write three essays under time.',
            '**Week 7.** Practice test #3. Then targeted work on whatever the test exposed. This is the week to fix one specific recurring weakness, not to review everything.',
            '**Week 8.** Practice test #4 early in the week, full review of errors, then taper. Do almost nothing the day before.',
          ],
        },
      ],
    },
    {
      id: 'plan-12',
      title: 'The 12-week plan (roughly 6 to 8 hours a week)',
      blocks: [
        {
          kind: 'p',
          text: 'Same arc as the 8-week plan, stretched. Add a fourth and fifth practice test, and spend the extra weeks on the section with the lower diagnostic score.',
        },
        {
          kind: 'p',
          text: 'If you are starting from a low Quant base and need a high Quant score, spend eight of the twelve weeks on Quant alone.',
        },
      ],
    },
    {
      id: 'error-log',
      title: 'The error log',
      blocks: [
        {
          kind: 'callout',
          tone: 'key',
          body: [
            'Keep one. This is the highest-return habit in test prep and almost nobody does it.',
          ],
        },
        {
          kind: 'p',
          text: 'For every question you get wrong, and every question you got right but were not sure about, write down the question, the answer you chose, the correct answer, and, most importantly, why you went wrong. Categorize the reason:',
        },
        {
          kind: 'ol',
          items: [
            '**Content gap.** You did not know the rule or the word. Fix: learn it.',
            '**Process error.** You knew the content but set the problem up wrong or misread a step. Fix: slow down at setup, write more on scratch paper.',
            '**Careless error.** You knew everything and still fumbled arithmetic or misread "least" as "greatest." Fix: build a checking habit.',
            '**Timing.** You rushed, or you ran out of time and guessed. Fix: pacing drills.',
          ],
        },
        {
          kind: 'p',
          text: 'Review the log weekly. Patterns emerge fast. Most people find that one or two categories account for the majority of their lost points, and those are cheap to fix compared to learning new content.',
        },
      ],
    },
    {
      id: 'vocab-cadence',
      title: 'How much vocabulary',
      blocks: [
        {
          kind: 'p',
          text: 'If your Verbal score matters, 20 words a day using spaced repetition (Anki or the equivalent) from day one. This is non-negotiable and it compounds.',
        },
        {
          kind: 'p',
          text: 'Someone who starts vocabulary in week 6 of an 8-week plan has largely wasted the opportunity. The words need time to stick.',
        },
      ],
    },
  ],
};
