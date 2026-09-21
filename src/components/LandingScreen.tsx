import { Icon } from './Icon';
import { revealDelay } from '../lib/reveal';

interface Props {
  onSignIn: () => void;
  onSignUp: () => void;
}

/**
 * Landing page.
 *
 * Structure from the UI/UX Pro Max design system, pattern `hero-features-cta`:
 *   Hero with headline > Value prop > Key features (3-5) > CTA section > Footer
 * CTA placement: Hero (sticky) + Bottom.
 *
 * Style: Glassmorphism. Panels are translucent over the ambient field, so the
 * hero preview and the feature cards refract the wash behind them.
 */

const FEATURES = [
  {
    icon: Icon.Upload,
    title: 'Bring your own questions',
    body: 'Import a CSV and sit it as a timed, sectioned exam. Every GRE question type renders with the right input, from inline dropdowns to a two-column comparison box.',
  },
  {
    icon: Icon.Target,
    title: 'Scored the way the test scores',
    body: 'No partial credit on select-all or multi-blank questions. Numeric entry compares with tolerance, not string matching. You can see the rules, so you can trust the number.',
  },
  {
    icon: Icon.Spark,
    title: 'Written answers, graded locally',
    body: 'Short answer and essay questions are graded by a model on your own machine. Essays come back on the 0 to 6 band scale with feedback. Nothing leaves your computer.',
  },
  {
    icon: Icon.Clock,
    title: 'Every attempt kept',
    body: 'Retake an exam without re-uploading it. Reopen any past attempt to see your answer against the correct one, with the explanation and how long each section took.',
  },
  {
    icon: Icon.Book,
    title: 'A review book built in',
    body: 'Nineteen chapters covering test structure, study plans, every verbal question type, vocabulary and quant fundamentals. Searchable, with worked examples.',
  },
  {
    icon: Icon.Lock,
    title: 'Yours alone',
    body: 'Your account holds your own exams and attempts. Nobody else can see them, and the database credentials never reach the browser.',
  },
];

const STEPS = [
  {
    title: 'Import your questions',
    body: 'One row per question, with columns for section, type, prompt, options and the correct answer. Bad rows are reported with the line number and what to fix, so nothing fails silently.',
  },
  {
    title: 'Set your timing and sit the exam',
    body: 'Each section gets a suggested limit you can edit. During the section you get a countdown, a mark-for-review flag, and a jump panel showing what is answered. When time runs out it says so and lets you keep working.',
  },
  {
    title: 'Review what you got wrong',
    body: 'Scores appear per section the moment you submit. Open any question to see your answer, the correct one, and the explanation. Filter straight to what you missed.',
  },
];

export function LandingScreen({ onSignIn, onSignUp }: Props) {
  return (
    <div className="landing">
      {/* ------------------------------------------------------------ hero */}
      <section className="landing-hero reveal">
        <p className="landing-eyebrow">
          <Icon.Layers size={14} />
          GRE practice, on your own material
        </p>
        <h1>
          Turn a spreadsheet of questions into a <span className="landing-accent">real practice exam</span>.
        </h1>
        <p className="landing-lede">
          Upload a CSV, set a timer per section, and sit the thing properly. Get a scored breakdown with
          explanations at the end, keep every attempt, and study from a review book that lives in the same place.
        </p>
        <div className="landing-actions">
          <button type="button" className="btn btn-primary btn-large" onClick={onSignUp}>
            Create an account
            <Icon.ArrowRight size={18} />
          </button>
          <button type="button" className="btn btn-large btn-glass" onClick={onSignIn}>
            Sign in
          </button>
        </div>
        <p className="muted landing-note">Free, runs on your own machine, and takes about a minute to set up.</p>

        {/* A still of the product rather than a stock illustration. It is the
            only place glass gets a real subject to refract. */}
        <div className="hero-preview glass glass-strong reveal" style={revealDelay(1)} aria-hidden="true">
          <div className="hero-preview__bar">
            <span className="hero-preview__section">Verbal Reasoning</span>
            <span className="hero-preview__timer tabular">
              <Icon.Clock size={14} />
              17:42
            </span>
          </div>
          <div className="hero-preview__stem">
            Although the committee report was ostensibly ____, its conclusions were shaped by assumptions that few
            members were willing to examine.
          </div>
          <ul className="hero-preview__choices">
            {[
              { letter: 'A', text: 'impartial', state: 'selected' },
              { letter: 'B', text: 'derivative', state: 'idle' },
              { letter: 'C', text: 'exhaustive', state: 'idle' },
            ].map((choice) => (
              <li key={choice.letter} data-state={choice.state}>
                <span className="hero-preview__letter">{choice.letter}</span>
                {choice.text}
              </li>
            ))}
          </ul>
          <div className="hero-preview__meter">
            <div className="hero-preview__meter-fill" />
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- features */}
      <section className="landing-features">
        {FEATURES.map((feature, index) => (
          <article className="landing-card glass glass-interactive reveal" key={feature.title} style={revealDelay(index)}>
            <span className="landing-card__icon">
              <feature.icon size={20} />
            </span>
            <h3>{feature.title}</h3>
            <p>{feature.body}</p>
          </article>
        ))}
      </section>

      {/* --------------------------------------------------------- how it works */}
      <section className="landing-how">
        <h2 className="reveal">How it works</h2>
        <ol className="landing-steps">
          {STEPS.map((step, index) => (
            <li key={step.title} className="reveal" style={revealDelay(index)}>
              <span className="landing-step-number">{index + 1}</span>
              <div>
                <h4>{step.title}</h4>
                <p>{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* -------------------------------------------------------------- cta */}
      <section className="landing-cta glass glass-strong reveal">
        <h2>Start with the sample exam</h2>
        <p>
          A forty-question practice set ships with the app, covering every question type with a worked explanation
          for each. Create an account and you will see the whole flow in about five minutes.
        </p>
        <div className="landing-actions">
          <button type="button" className="btn btn-primary btn-large" onClick={onSignUp}>
            Create an account
            <Icon.ArrowRight size={18} />
          </button>
        </div>
      </section>

      <footer className="landing-footer">
        <span>GRE Practice</span>
        <span className="muted">Runs locally. Your questions, your attempts, your machine.</span>
      </footer>
    </div>
  );
}
