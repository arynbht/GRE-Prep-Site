import type { BookChapter } from '../types';

export const verbalCore: BookChapter = {
  id: 'verbal-core',
  title: 'Verbal Reasoning: the core skill',
  summary: 'What the section is made of, the one habit that fixes everything, and how to read a GRE passage.',
  sections: [
    {
      id: 'verbal-mix',
      title: 'What the section is made of',
      blocks: [
        { kind: 'p', text: 'Each Verbal section is a mix of three question types, roughly in this proportion:' },
        {
          kind: 'table',
          head: ['Type', 'Approx. per section', 'What it tests'],
          rows: [
            ['Text Completion', '4 to 6', 'Vocabulary plus sentence logic'],
            ['Sentence Equivalence', '4', 'Vocabulary plus sentence logic'],
            ['Reading Comprehension', '5 to 7', 'Careful reading plus inference'],
          ],
        },
        {
          kind: 'p',
          text: 'So roughly half the section is vocabulary-driven and half is reading-driven. If your vocabulary is weak, you are capped at about 155 no matter how well you read. If your vocabulary is strong but you read sloppily, you are capped around the same place. You need both.',
        },
      ],
    },
    {
      id: 'predict-habit',
      title: 'The one habit that fixes everything',
      blocks: [
        {
          kind: 'callout',
          tone: 'key',
          body: ['Predict before you look at the answer choices.'],
        },
        {
          kind: 'p',
          text: 'This applies to every Verbal question type. The GRE’s answer choices are engineered to be attractive when you are uncertain. Wrong answers are not random. They are built from the specific ways a hurried reader misremembers a passage or misjudges a sentence’s logic. If you read the choices with an open mind, you will find several that feel plausible.',
        },
        {
          kind: 'p',
          text: 'So: for a Text Completion, decide what the blank means before reading any options. For a Reading Comprehension question, answer it in your own words first, then find the choice that matches. This costs a few seconds and saves you from the entire category of trap answers.',
        },
      ],
    },
    {
      id: 'reading-like',
      title: 'Reading like a GRE reader',
      blocks: [
        {
          kind: 'p',
          text: 'GRE passages are dense, academic, and deliberately dry. They come from biology, history, art criticism, literary theory, sociology, astronomy. You are not expected to know the subject. Everything you need is on the screen.',
        },
        { kind: 'p', text: 'What you are tracking as you read is **structure, not content.** Specifically:' },
        {
          kind: 'ul',
          items: [
            '**What is the author’s claim?** Every passage has one. Usually it arrives after a setup of "here is what people have traditionally thought."',
            '**Where does the passage turn?** Watch for *but, however, yet, although, nevertheless, on the other hand, in fact, surprisingly.* Questions cluster around these pivots. A passage that says "Scholars have long held X. However, recent evidence suggests Y" will be tested on the difference between X and Y, and on whether you can keep straight which one the author endorses.',
            '**Whose opinion is whose?** Passages routinely present two or three positions. The most common trap answer is a true statement attributed to the wrong person: the view the author is describing, not the view the author holds.',
            '**How strong are the claims?** *Suggests, may, tends to, in some cases* are weak. *Proves, always, establishes, invariably* are strong. Trap answers overstate. If the passage says a finding "suggests a possible link," an answer saying the finding "demonstrates a causal relationship" is wrong.',
          ],
        },
      ],
    },
    {
      id: 'signal-words',
      title: 'Signal words',
      blocks: [
        {
          kind: 'p',
          text: 'Memorize these three categories. They tell you the logical direction of a sentence, which is the entire skill for Text Completion and Sentence Equivalence.',
        },
        {
          kind: 'table',
          head: ['Direction', 'Words'],
          rows: [
            [
              'Continuation (blank agrees with the clue)',
              'and, moreover, furthermore, indeed, in fact, similarly, likewise, thus, therefore, consequently, since, because',
            ],
            [
              'Contrast (blank opposes the clue)',
              'but, however, yet, although, though, while, whereas, despite, in spite of, nevertheless, nonetheless, on the contrary, conversely, ironically, surprisingly, paradoxically, notwithstanding, rather than',
            ],
            ['Emphasis / degree', 'even, indeed, all the more, far from, hardly, scarcely, no less than'],
          ],
        },
        {
          kind: 'callout',
          tone: 'note',
          body: [
            'A few of these trip people up. *While* and *whereas* signal contrast. *Ironically, paradoxically,* and *surprisingly* signal that what follows cuts against what you would expect, which usually means contrast with the preceding clue. *Far from* reverses everything after it.',
          ],
        },
      ],
    },
    {
      id: 'verbal-pacing',
      title: 'Pacing',
      blocks: [
        { kind: 'p', text: 'At about 1.5 minutes per question, aim for:' },
        {
          kind: 'ul',
          items: [
            '**Text Completion:** 30 seconds for a one-blank, 60 to 90 seconds for a two- or three-blank',
            '**Sentence Equivalence:** 45 to 60 seconds',
            '**Reading Comprehension:** 2 to 3 minutes to read a short passage, then 60 seconds per question; 4 minutes for a long passage',
          ],
        },
        {
          kind: 'p',
          text: 'These are averages. Bank time on the short questions so you can spend it on the passages.',
        },
      ],
    },
  ],
};

export const textCompletion: BookChapter = {
  id: 'text-completion',
  title: 'Text Completion',
  summary: 'The six-step method, three worked examples from one to three blanks, and the common traps.',
  sections: [
    {
      id: 'tc-format',
      title: 'The format',
      blocks: [
        {
          kind: 'p',
          text: 'A passage of one to five sentences with one, two, or three blanks. One-blank questions give you five choices; two- and three-blank questions give you three choices per blank.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          body: [
            'There is no partial credit. On a three-blank question you must get all three right, which is why a three-blank question is worth the same as a one-blank question but takes three times as long.',
          ],
        },
      ],
    },
    {
      id: 'tc-method',
      title: 'The method',
      blocks: [
        {
          kind: 'ol',
          items: [
            '**Read the whole thing first, ignoring the blanks.** Get the gist. Do not try to fill anything in yet.',
            '**Find the clue.** Every blank has a clue elsewhere in the sentence, a word or phrase that determines what goes in. The GRE is not asking your opinion; the answer is forced by the text.',
            '**Find the direction.** Does the blank agree with the clue or oppose it? Signal words decide this.',
            '**Predict in your own words.** Use a simple word, even a clunky phrase. "Something like praised" is fine. You are not trying to guess their word, you are establishing the meaning and the sign, positive or negative.',
            '**Match against the choices.** Eliminate anything with the wrong sign first. That usually kills two or three options instantly.',
            '**Read it back.** Plug your answer in and read the full sentence.',
          ],
        },
        {
          kind: 'callout',
          tone: 'key',
          body: [
            'For multi-blank questions, start with the easiest blank, not the first one. The blank with the clearest clue is your entry point, and locking it in often constrains the others.',
          ],
        },
      ],
    },
    {
      id: 'tc-examples',
      title: 'Worked examples',
      blocks: [
        {
          kind: 'example',
          title: 'Example 1 — one blank',
          blocks: [
            {
              kind: 'question',
              stem: 'Although the committee’s report was widely praised for its thoroughness, several critics noted that its recommendations were disappointingly _______, offering little that had not been proposed a decade earlier.',
              choices: ['contentious', 'derivative', 'exhaustive', 'pragmatic', 'incendiary'],
            },
            {
              kind: 'p',
              text: '**Clue:** "offering little that had not been proposed a decade earlier." That phrase defines the blank directly: the recommendations repeat old ideas.',
            },
            {
              kind: 'p',
              text: '**Direction:** "Although" contrasts the praise with the criticism, and "disappointingly" tells you the blank is negative.',
            },
            { kind: 'p', text: '**Prediction:** something like "unoriginal" or "recycled."' },
            {
              kind: 'p',
              text: '**Match:** *Derivative* means unoriginal, copied from earlier sources. **(B)**. *Contentious* and *incendiary* mean provoking conflict, the wrong meaning. *Exhaustive* means thorough, which is what the report was praised for, not criticized for; it is the trap for someone who loses track of the contrast. *Pragmatic* is positive.',
            },
          ],
        },
        {
          kind: 'example',
          title: 'Example 2 — two blanks',
          blocks: [
            {
              kind: 'question',
              stem: 'The senator’s public persona was one of unflappable calm, but those who worked with her daily described a temperament far more (i) _______; her outward serenity, they suggested, was a carefully maintained (ii) _______.',
              blanks: [
                { label: 'Blank (i)', choices: ['mercurial', 'phlegmatic', 'sanguine'] },
                { label: 'Blank (ii)', choices: ['conviction', 'façade', 'reprieve'] },
              ],
            },
            {
              kind: 'p',
              text: '**Start with blank (i).** The clue is "unflappable calm" plus "but" and "far more" — the blank opposes calm. Prediction: "volatile." *Mercurial* means subject to sudden unpredictable changes of mood. **(A)**. *Phlegmatic* means calm and unemotional, the same direction as the clue, so it is the trap for anyone who missed the "but." *Sanguine* means cheerfully optimistic, not the opposite of calm.',
            },
            {
              kind: 'p',
              text: '**Blank (ii).** Now the sentence says the serenity was carefully maintained but not real. Prediction: "a front." *Façade* is exactly that. **(E)**. *Conviction* would mean she genuinely believed it, contradicting the sentence. *Reprieve* means a temporary relief from punishment, unrelated.',
            },
          ],
        },
        {
          kind: 'example',
          title: 'Example 3 — three blanks',
          blocks: [
            {
              kind: 'question',
              stem: 'Scientific consensus rarely shifts through a single decisive experiment. More often the change is (i) _______, as an accumulation of anomalous results gradually renders the prevailing framework (ii) _______. Only in retrospect does the transition appear (iii) _______, a clean break rather than the slow erosion it was.',
              blanks: [
                { label: 'Blank (i)', choices: ['abrupt', 'incremental', 'contentious'] },
                { label: 'Blank (ii)', choices: ['untenable', 'canonical', 'provisional'] },
                { label: 'Blank (iii)', choices: ['gradual', 'inevitable', 'sudden'] },
              ],
            },
            {
              kind: 'p',
              text: '**Blank (i) is the easiest.** "Rarely through a single decisive experiment" and "gradually" both point the same way. Prediction: "slow and piecemeal." **(B) incremental.** *Abrupt* is the direct opposite.',
            },
            {
              kind: 'p',
              text: '**Blank (ii).** Anomalous results pile up against the prevailing framework, so the framework becomes unsustainable. **(D) untenable**, not defensible. *Canonical* means accepted as standard, which is what it was before. *Provisional* is tempting but weaker than the sentence demands; the results do not make it merely tentative, they break it.',
            },
            {
              kind: 'p',
              text: '**Blank (iii).** "Only in retrospect" plus "a clean break rather than the slow erosion it was" means hindsight makes it look like the opposite of slow. **(I) sudden.** *Gradual* is the trap: it matches the true nature of the change, not the retrospective illusion the sentence is describing.',
            },
          ],
        },
      ],
    },
    {
      id: 'tc-traps',
      title: 'Common traps',
      blocks: [
        {
          kind: 'ul',
          items: [
            '**The echo.** A choice that repeats a word or idea from the sentence, which feels right but ignores the contrast signal. See *exhaustive* and *phlegmatic* above.',
            '**Right sign, wrong meaning.** Negative when you need negative, but the wrong flavor of negative. *Contentious* and *derivative* are both critical; only one fits.',
            '**Overshooting.** A word that is too extreme for the sentence’s register.',
            '**The secondary definition.** The GRE loves words used in their less common sense: *qualify* (to limit), *arrest* (to stop), *discriminating* (perceptive), *checked* (restrained), *economy* (concision), *exact* (to demand), *tender* (to offer), *involved* (complicated), *appreciate* (to increase in value), *retiring* (shy), *sanction* (which can mean either approve or penalize).',
          ],
        },
      ],
    },
  ],
};

export const sentenceEquivalence: BookChapter = {
  id: 'sentence-equivalence',
  title: 'Sentence Equivalence',
  summary: 'Why the answer is always a synonym pair, and why that is a check rather than a shortcut.',
  sections: [
    {
      id: 'se-structure',
      title: 'The structural insight',
      blocks: [
        {
          kind: 'p',
          text: 'One sentence, one blank, six answer choices. You pick two that both complete the sentence and produce sentences alike in meaning. No partial credit: both or nothing.',
        },
        {
          kind: 'p',
          text: 'Because you need two words that yield the same meaning, the correct pair is almost always a pair of near-synonyms. The six choices typically break down as: one correct pair, one decoy pair (two words that are synonyms of each other but do not fit the sentence), and two orphans (words that fit nothing or have no partner).',
        },
        {
          kind: 'p',
          text: 'This gives you a powerful check. If you have picked two words that are not roughly synonymous, you are wrong. And if a word has no synonym among the other five, it cannot be part of the answer.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'Do not invert the logic',
          body: [
            'The most common failure is to spot a synonym pair and select it without checking the sentence. The decoy pair exists specifically to catch that. The sentence decides, and synonymy confirms. Never the other way around.',
          ],
        },
        {
          kind: 'callout',
          tone: 'note',
          body: [
            'The words do not have to be dictionary synonyms, just close enough that the two resulting sentences mean the same thing. *Ubiquitous* and *pervasive* qualify. So sometimes do two words that are merely similar in context.',
          ],
        },
      ],
    },
    {
      id: 'se-method',
      title: 'The method',
      blocks: [
        { kind: 'p', text: 'Same as Text Completion, with one addition:' },
        {
          kind: 'ol',
          items: [
            'Read the sentence, find the clue, find the direction.',
            'Predict your own word.',
            'Go through all six choices, marking each as fits / does not fit / unsure.',
            'Among the fits, find the synonym pair.',
            'Read both back into the sentence and confirm they produce the same meaning.',
          ],
        },
      ],
    },
    {
      id: 'se-examples',
      title: 'Worked examples',
      blocks: [
        {
          kind: 'example',
          title: 'Example 1',
          blocks: [
            {
              kind: 'question',
              stem: 'Far from being the reclusive figure of legend, the composer was in fact _______, maintaining an extensive correspondence and hosting salons nearly every week.',
              choices: ['gregarious', 'prolific', 'sociable', 'irascible', 'meticulous', 'solitary'],
            },
            {
              kind: 'p',
              text: '**Clue:** "maintaining an extensive correspondence and hosting salons." **Direction:** "Far from" reverses "reclusive," so the blank is the opposite of reclusive. **Prediction:** "outgoing."',
            },
            {
              kind: 'p',
              text: '*Gregarious* **(A)** and *sociable* **(C)** both mean fond of company. That is the pair.',
            },
            {
              kind: 'p',
              text: '**Check the rest:** *Solitary* is a synonym for reclusive, the trap for anyone who missed "Far from." *Prolific* is tempting because of "extensive correspondence," but it means producing a lot of work, not enjoying company, and it has no partner here. *Irascible* means quick to anger. *Meticulous* means careful about detail. Neither has a partner.',
            },
          ],
        },
        {
          kind: 'example',
          title: 'Example 2',
          blocks: [
            {
              kind: 'question',
              stem: 'The new evidence did not overturn the theory so much as _______ it, forcing proponents to narrow its scope and concede several of its more ambitious claims.',
              choices: ['vindicate', 'circumscribe', 'invalidate', 'delimit', 'corroborate', 'supplant'],
            },
            {
              kind: 'p',
              text: '**Clue:** "forcing proponents to narrow its scope and concede several claims." **Direction:** "did not overturn... so much as" tells you the blank is something less than total destruction. **Prediction:** "limit" or "restrict."',
            },
            {
              kind: 'p',
              text: '*Circumscribe* **(B)** and *delimit* **(D)** both mean to set limits on.',
            },
            {
              kind: 'p',
              text: '**The decoys:** *vindicate* and *corroborate* form a synonym pair meaning to confirm or support, a perfect decoy pair, but wrong, since the evidence forced concessions. *Invalidate* and *supplant* are both too strong; the sentence explicitly says the theory was not overturned.',
            },
            {
              kind: 'p',
              text: 'Note that this question contains two synonym pairs plus two words. That is the harder construction, and it is why you check the sentence rather than hunting for pairs.',
            },
          ],
        },
        {
          kind: 'example',
          title: 'Example 3',
          blocks: [
            {
              kind: 'question',
              stem: 'Her prose style, admired for its _______, conveys in a single clause what lesser writers labor over for paragraphs.',
              choices: ['economy', 'opacity', 'grandeur', 'concision', 'affluence', 'obscurity'],
            },
            {
              kind: 'p',
              text: '**Clue:** "conveys in a single clause what lesser writers labor over for paragraphs." **Prediction:** "brevity."',
            },
            {
              kind: 'p',
              text: '*Economy* **(A)** here means concision of expression, its secondary sense, not the financial one. *Concision* **(D)** is the direct match.',
            },
            {
              kind: 'p',
              text: '*Affluence* is the trap for anyone who read *economy* in its money sense. They are synonyms in that register, and the question is built to punish that misreading. *Opacity* and *obscurity* form another synonym pair, both meaning hard to understand, which contradicts the admiring tone. *Grandeur* has no partner.',
            },
          ],
        },
      ],
    },
    {
      id: 'se-drilling',
      title: 'Drilling advice',
      blocks: [
        {
          kind: 'p',
          text: 'Sentence Equivalence is the question type where a weak vocabulary hurts most visibly, because you cannot work around an unknown word. You need to evaluate all six.',
        },
        {
          kind: 'p',
          text: 'When you miss one, ask which of the two failures happened: did you misread the sentence’s logic, or did you not know a word? Log them separately. They have different fixes.',
        },
      ],
    },
  ],
};

export const readingComprehension: BookChapter = {
  id: 'reading-comprehension',
  title: 'Reading Comprehension',
  summary: 'Mapping a passage, what each question type demands, and the short argument subtype.',
  sections: [
    {
      id: 'rc-formats',
      title: 'The three answer formats',
      blocks: [
        {
          kind: 'p',
          text: 'Passages run from one paragraph to about 450 words. Short passages carry one or two questions; long passages carry three or four.',
        },
        {
          kind: 'ul',
          items: [
            '**Standard multiple choice**, five options, one answer.',
            '**Select all that apply**, three options, one to three correct. No partial credit. Evaluate each choice independently; they are not competing with each other.',
            '**Select-in-passage**, where you click a sentence in the passage that fits a description.',
          ],
        },
      ],
    },
    {
      id: 'rc-mapping',
      title: 'Mapping the passage',
      blocks: [
        {
          kind: 'p',
          text: 'Do not try to memorize the passage. Read for structure and expect to return to the text for every detail question. Specifically, as you read, note:',
        },
        {
          kind: 'ul',
          items: [
            '**The main point**, usually one sentence, often near the start of the second paragraph after a setup, or at the very end.',
            '**The function of each paragraph.** Is it setting up a problem, presenting evidence, raising an objection, offering an alternative? Summarize each paragraph in four or five words.',
            '**The author’s attitude**: endorsing, skeptical, neutral-descriptive, qualified. Most GRE authors are qualified and measured. Answer choices describing an author as "contemptuous" or "unequivocally enthusiastic" are usually wrong.',
          ],
        },
        {
          kind: 'callout',
          tone: 'note',
          body: [
            'For a long passage, spend 3 to 4 minutes reading before you look at the first question. Trying to shortcut by reading questions first and skimming for answers works badly on the GRE, because most questions require the whole argument.',
          ],
        },
      ],
    },
    {
      id: 'rc-types',
      title: 'Question types and what each demands',
      blocks: [
        {
          kind: 'ul',
          items: [
            '**Main idea.** The answer must cover the whole passage, not one paragraph. Trap answers are true but too narrow, or too broad.',
            '**Detail.** Go back and find the line. Do not answer from memory. The correct answer is a paraphrase of something explicitly stated.',
            '**Inference.** The answer is something that *must* be true given the passage, not something that seems likely. This is the type where people overreach. Ask: could the passage be true and this answer false? If yes, it is wrong.',
            '**Function or purpose** ("the author mentions X primarily in order to"). Look at the sentence before and after X. The answer is about X’s role in the argument, not its content.',
            '**Vocabulary in context.** The tested word usually has a secondary meaning. Cover the word, read the sentence, predict a replacement.',
            '**Tone or attitude.** Look at the adjectives and adverbs the author chooses. Moderate answers beat extreme ones.',
          ],
        },
      ],
    },
    {
      id: 'rc-example',
      title: 'Worked example',
      blocks: [
        {
          kind: 'example',
          title: 'Passage — the Bronze Age collapse',
          blocks: [
            {
              kind: 'p',
              text: 'For decades, the prevailing explanation for the decline of the Bronze Age Mediterranean civilizations centered on invasion: the so-called Sea Peoples, whose raids are documented in Egyptian inscriptions, were held responsible for the collapse of a half-dozen interconnected states within roughly fifty years. More recent scholarship has complicated this account. Paleoclimatic data from sediment cores indicate a prolonged drought beginning around 1200 BCE, and archaeological evidence of grain shortages predates the recorded raids in several sites. Some researchers now argue that the Sea Peoples were themselves refugees of the climatic disruption rather than its cause.',
            },
            {
              kind: 'p',
              text: 'This revision, however, risks substituting one monocausal story for another. The Bronze Age Mediterranean was a system of unusual interdependence: palace economies that relied on long-distance trade in tin, copper, and grain. In such a system, a shock of moderate severity can propagate: a harvest failure in one region reduces trade, which weakens a neighbor’s capacity to absorb its own shortfall. Climate may have supplied the initial perturbation, but the magnitude of the collapse is better explained by the fragility of the network than by the severity of the shock.',
            },
            {
              kind: 'question',
              stem: 'Q1. The primary purpose of the passage is to',
              choices: [
                'refute the claim that the Sea Peoples caused the Bronze Age collapse',
                'present evidence that drought was the principal cause of the Bronze Age collapse',
                'argue that a proposed explanation, though an improvement, remains incomplete',
                'describe the trade networks of Bronze Age Mediterranean palace economies',
                'question the reliability of paleoclimatic sediment data',
              ],
            },
            {
              kind: 'p',
              text: '**(C).** The structure is: old view, then revision, then "This revision, however, risks...", then the author’s own account. The author accepts that the climate revision improved on the invasion theory but argues it is still monocausal and that network fragility is the better explanation. (A) is only the first paragraph’s work, and the author does not fully refute it either. (B) is the view the author critiques. (D) is a detail used as support, not the purpose. (E) is never suggested.',
            },
            {
              kind: 'question',
              stem: 'Q2. It can be inferred from the passage that the author would most likely agree with which of the following?',
              choices: [
                'The Sea Peoples played no role in the Bronze Age collapse.',
                'A relatively modest environmental shock can produce disproportionate consequences in a highly interconnected economy.',
                'Paleoclimatic evidence is generally more reliable than textual evidence from inscriptions.',
                'Palace economies are inherently less stable than decentralized economies.',
                'The collapse would not have occurred without the drought of 1200 BCE.',
              ],
            },
            {
              kind: 'p',
              text: '**(B).** This restates the passage’s central mechanism almost directly. (A) overreaches; the author never denies the Sea Peoples mattered, only reframes them. (C) is a comparison the passage never makes. (D) generalizes far beyond the Bronze Age case; the passage is about one system, not a universal claim. (E) is the kind of necessary-condition claim the passage’s argument against monocausality specifically resists.',
            },
            {
              kind: 'question',
              stem: 'Q3. The author mentions "tin, copper, and grain" primarily in order to',
              choices: [
                'specify which commodities were most affected by the drought',
                'illustrate the extent of the interdependence that made the system vulnerable',
                'suggest that trade in metals was more important than trade in food',
                'contrast Bronze Age economies with later Iron Age economies',
                'identify the goods the Sea Peoples sought to seize',
              ],
            },
            {
              kind: 'p',
              text: '**(B).** Read the sentence: "a system of unusual interdependence: palace economies that relied on long-distance trade in tin, copper, and grain." The list is an example supporting "interdependence." Every other choice imports a purpose the passage does not have.',
            },
          ],
        },
      ],
    },
    {
      id: 'rc-argument',
      title: 'The argument subtype',
      blocks: [
        {
          kind: 'p',
          text: 'A few Reading Comprehension questions are short logic problems: a brief argument followed by "which of the following, if true, most weakens or strengthens the argument" or "the argument depends on which assumption."',
        },
        {
          kind: 'p',
          text: 'For these, separate the evidence from the conclusion, then find the gap between them.',
        },
        {
          kind: 'ul',
          items: [
            '**Weaken** = attack the gap. Often by offering an alternative cause, or showing the evidence does not transfer to the conclusion’s population.',
            '**Strengthen** = close the gap. Rule out an alternative explanation.',
            '**Assumption** = the unstated thing that must be true for the leap to work. Test it by negating the answer choice: if negating it destroys the argument, it is the assumption.',
          ],
        },
        {
          kind: 'p',
          text: 'The most common argument flaws on the GRE: confusing correlation with causation, assuming a sample represents a whole, assuming that because two things happened in sequence one caused the other, and comparing percentages when the underlying totals differ.',
        },
      ],
    },
  ],
};
