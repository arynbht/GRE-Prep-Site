import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { AnswerValue, ExamResults, ParsedExam, RawQuestionRow, SectionConfig } from './types';
import { buildExam } from './lib/questions';
import { isCorrect, needsGrading, scoreSection, serializeAnswer } from './lib/scoring';
import { buildReviewFromSession } from './lib/review';
import {
  ApiError,
  api,
  auth,
  type AttemptSummary,
  type AuthUser,
  type ExamSummary,
  type ThemePreference,
} from './lib/api';
import {
  ai,
  loadModelChoice,
  saveModelChoice,
  type LocalModel,
  type ModelChoice,
  type ProviderStatus,
} from './lib/ai';
import { clearSession, loadSession, saveSession, type SessionState } from './lib/storage';
import { ImportScreen } from './components/ImportScreen';
import { SectionSetup } from './components/SectionSetup';
import { TestScreen } from './components/TestScreen';
import { ResultsScreen, type GradingState, type SaveState } from './components/ResultsScreen';
import { HistoryScreen } from './components/HistoryScreen';
import { ReviewScreen } from './components/ReviewScreen';
import { ModelPicker } from './components/ModelPicker';
import { LandingScreen } from './components/LandingScreen';
import { AuthScreen, type AuthMode } from './components/AuthScreen';
import { DashboardScreen } from './components/DashboardScreen';
import { ReviewBookScreen } from './components/ReviewBookScreen';
import { ThemeToggle } from './components/ThemeToggle';
import { applyThemePreference } from './lib/theme';

type Tab = 'dashboard' | 'exam' | 'review' | 'book';
type PublicView = 'landing' | 'auth';

const TABS: { id: Tab; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'exam', label: 'Take an Exam' },
  { id: 'review', label: 'Past Exams' },
  { id: 'book', label: 'Review Book' },
];

function errorText(cause: unknown, fallback: string): string {
  return cause instanceof Error && cause.message ? cause.message : fallback;
}

function newSession(partial: Partial<SessionState> & { rows: RawQuestionRow[]; examName: string }): SessionState {
  return {
    version: 1,
    examId: null,
    sourceFilename: null,
    attemptId: null,
    phase: 'setup',
    sectionConfigs: [],
    currentSection: 0,
    sectionStartedAt: null,
    timeUsed: {},
    answers: {},
    flags: {},
    completedAt: null,
    saved: false,
    ...partial,
  };
}

const IDLE_GRADING: GradingState = { pending: 0, total: 0, done: 0, active: false, error: null };

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [publicView, setPublicView] = useState<PublicView>('landing');
  const [authMode, setAuthMode] = useState<AuthMode>('login');

  const [tab, setTab] = useState<Tab>('dashboard');
  const [reviewAttemptId, setReviewAttemptId] = useState<string | null>(null);
  const [session, setSession] = useState<SessionState | null>(() => loadSession());

  const [exams, setExams] = useState<ExamSummary[]>([]);
  const [examsLoading, setExamsLoading] = useState(false);
  const [examsError, setExamsError] = useState<string | null>(null);

  const [attempts, setAttempts] = useState<AttemptSummary[]>([]);
  const [attemptsLoading, setAttemptsLoading] = useState(false);
  const [attemptsError, setAttemptsError] = useState<string | null>(null);

  const [models, setModels] = useState<LocalModel[]>([]);
  const [providers, setProviders] = useState<ProviderStatus[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelChoice, setModelChoice] = useState<ModelChoice | null>(() => loadModelChoice());

  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>(() => (loadSession()?.saved ? 'saved' : 'idle'));
  const [saveError, setSaveError] = useState<string | null>(null);
  const [grading, setGrading] = useState<GradingState>(IDLE_GRADING);

  /** Always the newest session, for async work that must not close over stale state. */
  const sessionRef = useRef<SessionState | null>(session);
  useEffect(() => {
    sessionRef.current = session;
    if (session) saveSession(session);
    else clearSession();
  }, [session]);

  /** A 401 means the session expired; drop back to the landing page. */
  const handleUnauthorized = useCallback((cause: unknown) => {
    if (cause instanceof ApiError && cause.status === 401) {
      setUser(null);
      setPublicView('landing');
      return true;
    }
    return false;
  }, []);

  // ------------------------------------------------------------------ auth

  useEffect(() => {
    auth
      .me()
      .then((found) => setUser(found))
      .catch(() => setUser(null))
      .finally(() => setAuthChecked(true));
  }, []);

  // The account is the cross-device source of truth. The inline script in
  // index.html has already applied the cached value, so this only corrects a
  // disagreement — and it corrects it on the next paint, never blocking the
  // first one on a network round trip.
  useEffect(() => {
    if (user) applyThemePreference(user.theme);
  }, [user]);

  async function chooseTheme(next: ThemePreference) {
    applyThemePreference(next);
    setUser((previous) => (previous ? { ...previous, theme: next } : previous));
    try {
      await auth.setTheme(next);
    } catch {
      // The local change already took effect; it just will not follow to
      // another device until the next successful save.
    }
  }

  function resetWorkspace() {
    setSession(null);
    setExams([]);
    setAttempts([]);
    setReviewAttemptId(null);
    setSaveState('idle');
    setSaveError(null);
    setGrading(IDLE_GRADING);
    setNotice(null);
    setTab('dashboard');
  }

  function handleAuthenticated(next: AuthUser) {
    setUser(next);
    setPublicView('landing');
    resetWorkspace();
  }

  async function handleLogout() {
    try {
      await auth.logout();
    } catch {
      // Signing out locally matters more than the request succeeding.
    }
    setUser(null);
    setPublicView('landing');
    resetWorkspace();
  }

  // ------------------------------------------------------------ loading

  const refreshExams = useCallback(async () => {
    setExamsLoading(true);
    try {
      setExams(await api.listExams());
      setExamsError(null);
    } catch (cause) {
      if (!handleUnauthorized(cause)) {
        setExamsError(errorText(cause, 'Could not load previously imported exams.'));
      }
    } finally {
      setExamsLoading(false);
    }
  }, [handleUnauthorized]);

  const refreshAttempts = useCallback(async () => {
    setAttemptsLoading(true);
    try {
      setAttempts(await api.listAttempts());
      setAttemptsError(null);
    } catch (cause) {
      if (!handleUnauthorized(cause)) {
        setAttemptsError(errorText(cause, 'Could not load past attempts.'));
      }
    } finally {
      setAttemptsLoading(false);
    }
  }, [handleUnauthorized]);

  const refreshModels = useCallback(async () => {
    setModelsLoading(true);
    try {
      const found = await ai.discover();
      setModels(found.models);
      setProviders(found.providers);
      setModelChoice((previous) => {
        if (!previous) return previous;
        const stillThere = found.models.some(
          (model) => model.provider === previous.provider && model.model === previous.model,
        );
        return stillThere ? previous : null;
      });
    } catch {
      setModels([]);
      setProviders([]);
    } finally {
      setModelsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    void refreshExams();
    void refreshAttempts();
    void refreshModels();
  }, [user, refreshExams, refreshAttempts, refreshModels]);

  function chooseModel(choice: ModelChoice | null) {
    setModelChoice(choice);
    saveModelChoice(choice);
  }

  // ------------------------------------------------------------- derived

  const rows = session?.rows;
  const exam: ParsedExam | null = useMemo(() => {
    if (!rows) return null;
    return buildExam(rows, 0).exam;
  }, [rows]);

  const currentSection = exam && session ? exam.sections[session.currentSection] : undefined;
  const currentConfig: SectionConfig | undefined =
    session && currentSection
      ? session.sectionConfigs.find((config) => config.name === currentSection.name)
      : undefined;

  const results: ExamResults | null = useMemo(() => {
    if (!exam || !session || session.phase !== 'results' || !session.completedAt) return null;
    const sections = exam.sections.map((section) => {
      const config = session.sectionConfigs.find((entry) => entry.name === section.name);
      return scoreSection(section, session.answers, config?.limitSec ?? null, session.timeUsed[section.name] ?? null);
    });
    return {
      examId: session.examId,
      examName: session.examName,
      attemptId: session.attemptId,
      completedAt: session.completedAt,
      sections,
      score: sections.reduce((sum, section) => sum + section.score, 0),
      total: sections.reduce((sum, section) => sum + section.total, 0),
    };
  }, [exam, session]);

  const reviewModel = useMemo(() => {
    if (!exam || !session || !results) return null;
    return buildReviewFromSession(exam, session.answers, session.flags, results);
  }, [exam, session, results]);

  const pendingGrades = useMemo(() => {
    if (!exam || !session) return 0;
    return exam.questions.filter((question) => needsGrading(question, session.answers[question.id])).length;
  }, [exam, session]);

  // ------------------------------------------------------------ persistence

  const submitAttempt = useCallback(
    async (state: SessionState, parsed: ParsedExam) => {
      if (!state.attemptId) {
        setSaveState('error');
        setSaveError('This attempt was never registered with the server, so it cannot be saved.');
        return;
      }
      setSaveState('saving');
      setSaveError(null);
      const sections = parsed.sections.map((section) => {
        const config = state.sectionConfigs.find((entry) => entry.name === section.name);
        return scoreSection(section, state.answers, config?.limitSec ?? null, state.timeUsed[section.name] ?? null);
      });
      try {
        await api.completeAttempt(state.attemptId, {
          sectionResults: sections,
          answers: parsed.questions.map((question) => ({
            questionId: question.id,
            userAnswer: serializeAnswer(state.answers[question.id]),
            isCorrect: isCorrect(question, state.answers[question.id]),
            flagged: Boolean(state.flags[question.id]),
          })),
        });
        setSaveState('saved');
        setSession((previous) => (previous ? { ...previous, saved: true } : previous));
        void refreshAttempts();
      } catch (cause) {
        if (handleUnauthorized(cause)) return;
        setSaveState('error');
        setSaveError(errorText(cause, 'Could not save this attempt.'));
      }
    },
    [handleUnauthorized, refreshAttempts],
  );

  // --------------------------------------------------------------- grading

  const gradeWritten = useCallback(async (parsed: ParsedExam, choice: ModelChoice) => {
    const state = sessionRef.current;
    if (!state) return;
    const pending = parsed.questions.filter((question) => needsGrading(question, state.answers[question.id]));
    if (pending.length === 0) {
      setGrading({ ...IDLE_GRADING });
      return;
    }

    setGrading({ pending: pending.length, total: pending.length, done: 0, active: true, error: null });
    let firstError: string | null = null;
    let done = 0;

    for (const question of pending) {
      const answer = sessionRef.current?.answers[question.id];
      if (!answer || answer.kind !== 'text') continue;
      try {
        const grade = await ai.grade(choice, question, answer.text);
        setSession((previous) => {
          if (!previous) return previous;
          const current = previous.answers[question.id];
          if (!current || current.kind !== 'text') return previous;
          return { ...previous, answers: { ...previous.answers, [question.id]: { ...current, grade } } };
        });
      } catch (cause) {
        firstError = firstError ?? errorText(cause, 'Grading failed.');
      }
      done += 1;
      setGrading((previous) => ({ ...previous, done }));
    }

    setGrading((previous) => ({ ...previous, active: false, error: firstError }));
  }, []);

  const gradeThenSave = useCallback(
    async (parsed: ParsedExam, choice: ModelChoice) => {
      await gradeWritten(parsed, choice);
      const latest = sessionRef.current;
      if (latest) await submitAttempt(latest, parsed);
    },
    [gradeWritten, submitAttempt],
  );

  // ------------------------------------------------------------------ import

  async function handleStartImported(payload: {
    rows: RawQuestionRow[];
    name: string;
    sourceFilename: string | null;
  }) {
    setBusy(true);
    setNotice(null);
    let examId: string | null = null;
    try {
      const created = await api.createExam({
        name: payload.name,
        sourceFilename: payload.sourceFilename,
        rows: payload.rows,
      });
      examId = created.examId;
      void refreshExams();
    } catch (cause) {
      if (handleUnauthorized(cause)) {
        setBusy(false);
        return;
      }
      setNotice(
        errorText(cause, 'Could not save this exam.') +
          ' You can still take the test — results just will not be stored.',
      );
    }
    setSession(
      newSession({
        rows: payload.rows,
        examName: payload.name,
        sourceFilename: payload.sourceFilename,
        examId,
      }),
    );
    setSaveState('idle');
    setSaveError(null);
    setGrading(IDLE_GRADING);
    setBusy(false);
  }

  async function handleRetake(examId: string) {
    setBusy(true);
    setNotice(null);
    try {
      const { exam: summary, rows: stored } = await api.getExamQuestions(examId);
      const built = buildExam(stored, 0);
      if (!built.exam) {
        setNotice('The stored questions for this exam could not be read: ' + (built.issues[0]?.message ?? 'unknown'));
        setBusy(false);
        return;
      }
      setSession(
        newSession({
          rows: stored,
          examName: summary.name,
          sourceFilename: summary.sourceFilename,
          examId,
        }),
      );
      setSaveState('idle');
      setSaveError(null);
      setGrading(IDLE_GRADING);
      setTab('exam');
    } catch (cause) {
      if (!handleUnauthorized(cause)) setNotice(errorText(cause, 'Could not load that exam.'));
    } finally {
      setBusy(false);
    }
  }

  // -------------------------------------------------------------------- test

  async function handleStartTest(configs: SectionConfig[]) {
    if (!session) return;
    setBusy(true);
    let attemptId: string | null = null;
    if (session.examId) {
      try {
        const created = await api.createAttempt(session.examId);
        attemptId = created.attemptId;
      } catch (cause) {
        if (handleUnauthorized(cause)) {
          setBusy(false);
          return;
        }
        setNotice(
          errorText(cause, 'Could not start a stored attempt.') +
            ' The test will run, but this attempt will not be saved.',
        );
      }
    }
    setSession({
      ...session,
      attemptId,
      sectionConfigs: configs,
      phase: 'test',
      currentSection: 0,
      sectionStartedAt: Date.now(),
      timeUsed: {},
      answers: {},
      flags: {},
      completedAt: null,
      saved: false,
    });
    setGrading(IDLE_GRADING);
    setBusy(false);
  }

  function handleAnswer(questionId: string, value: AnswerValue) {
    setSession((previous) =>
      previous ? { ...previous, answers: { ...previous.answers, [questionId]: value } } : previous,
    );
  }

  function handleFlag(questionId: string, flagged: boolean) {
    setSession((previous) =>
      previous ? { ...previous, flags: { ...previous.flags, [questionId]: flagged } } : previous,
    );
  }

  function handleFinishSection(timeUsedSec: number) {
    if (!session || !exam || !currentSection) return;
    const timeUsed = { ...session.timeUsed, [currentSection.name]: timeUsedSec };
    const isLast = session.currentSection >= exam.sections.length - 1;

    if (!isLast) {
      setSession({
        ...session,
        timeUsed,
        currentSection: session.currentSection + 1,
        sectionStartedAt: Date.now(),
      });
      window.scrollTo({ top: 0 });
      return;
    }

    const finished: SessionState = {
      ...session,
      timeUsed,
      sectionStartedAt: null,
      phase: 'results',
      completedAt: new Date().toISOString(),
    };
    sessionRef.current = finished;
    setSession(finished);
    window.scrollTo({ top: 0 });

    void (async () => {
      await submitAttempt(finished, exam);
      if (modelChoice) await gradeThenSave(exam, modelChoice);
    })();
  }

  function handleRestartSection() {
    if (!session || !currentSection) return;
    const answers = { ...session.answers };
    const flags = { ...session.flags };
    for (const question of currentSection.questions) {
      delete answers[question.id];
      delete flags[question.id];
    }
    setSession({ ...session, answers, flags, sectionStartedAt: Date.now() });
    window.scrollTo({ top: 0 });
  }

  // ----------------------------------------------------------------- results

  function handleNewExam() {
    setSession(null);
    setSaveState('idle');
    setSaveError(null);
    setGrading(IDLE_GRADING);
    setNotice(null);
    void refreshExams();
  }

  function handleRetakeSame() {
    if (!session) return;
    if (session.examId) {
      void handleRetake(session.examId);
      return;
    }
    setSession(newSession({ rows: session.rows, examName: session.examName, sourceFilename: session.sourceFilename }));
    setSaveState('idle');
    setSaveError(null);
    setGrading(IDLE_GRADING);
  }

  // -------------------------------------------------------------------- view

  function renderExamTab() {
    if (!session || !exam) {
      return (
        <ImportScreen
          exams={exams}
          examsLoading={examsLoading}
          examsError={examsError}
          busy={busy}
          modelChoice={modelChoice}
          onStartImported={(payload) => void handleStartImported(payload)}
          onRetake={(examId) => void handleRetake(examId)}
          onStartBuiltIn={(payload) =>
            void handleStartImported({ rows: payload.rows, name: payload.name, sourceFilename: null })
          }
        />
      );
    }

    if (session.phase === 'setup') {
      return (
        <SectionSetup
          exam={exam}
          examName={session.examName}
          busy={busy}
          onStart={(configs) => void handleStartTest(configs)}
          onCancel={handleNewExam}
        />
      );
    }

    if (session.phase === 'test' && currentSection && session.sectionStartedAt !== null) {
      return (
        <TestScreen
          section={currentSection}
          sectionIndex={session.currentSection}
          totalSections={exam.sections.length}
          examName={session.examName}
          limitSec={currentConfig?.limitSec ?? 30 * 60}
          startedAt={session.sectionStartedAt}
          answers={session.answers}
          flags={session.flags}
          onAnswer={handleAnswer}
          onFlag={handleFlag}
          onFinish={handleFinishSection}
          onRestartSection={handleRestartSection}
        />
      );
    }

    if (session.phase === 'results' && reviewModel) {
      return (
        <ResultsScreen
          model={reviewModel}
          saveState={saveState}
          saveError={saveError}
          grading={{ ...grading, pending: pendingGrades }}
          modelChoice={modelChoice}
          examKey={session.examId ?? session.examName}
          onGrade={() => {
            if (modelChoice) void gradeThenSave(exam, modelChoice);
          }}
          onRetrySave={() => {
            if (sessionRef.current) void submitAttempt(sessionRef.current, exam);
          }}
          onRetakeSame={handleRetakeSame}
          onNewExam={handleNewExam}
        />
      );
    }

    return (
      <section className="card">
        <h2>That session could not be restored</h2>
        <p className="muted">Start again from the import screen.</p>
        <button type="button" className="btn btn-primary" onClick={handleNewExam}>
          Back to import
        </button>
      </section>
    );
  }

  function renderTab() {
    if (!user) return null;
    switch (tab) {
      case 'dashboard':
        return (
          <DashboardScreen
            user={user}
            exams={exams}
            attempts={attempts}
            loading={examsLoading || attemptsLoading}
            hasSessionInProgress={session !== null && session.phase === 'test'}
            onTakeExam={() => setTab('exam')}
            onResume={() => setTab('exam')}
            onReview={() => {
              setReviewAttemptId(null);
              setTab('review');
            }}
            onOpenAttempt={(attemptId) => {
              setReviewAttemptId(attemptId);
              setTab('review');
            }}
            onStudy={() => setTab('book')}
          />
        );
      case 'exam':
        return renderExamTab();
      case 'review':
        return reviewAttemptId === null ? (
          <HistoryScreen
            attempts={attempts}
            loading={attemptsLoading}
            error={attemptsError}
            onOpen={(attemptId) => setReviewAttemptId(attemptId)}
            onReload={() => void refreshAttempts()}
          />
        ) : (
          <ReviewScreen
            attemptId={reviewAttemptId}
            modelChoice={modelChoice}
            onBack={() => setReviewAttemptId(null)}
          />
        );
      case 'book':
        return <ReviewBookScreen />;
    }
  }

  // ---------------------------------------------------------------- shells

  if (!authChecked) {
    return (
      <div className="boot">
        <p className="muted">Loading…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="app">
        <div className="glass-field" aria-hidden="true" />
        <header className="topbar glass-bar">
          <button type="button" className="brand brand-button" onClick={() => setPublicView('landing')}>
            GRE Practice
          </button>
          <div className="topbar-right">
            <button
              type="button"
              className="btn btn-quiet"
              onClick={() => {
                setAuthMode('login');
                setPublicView('auth');
              }}
            >
              Sign in
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setAuthMode('register');
                setPublicView('auth');
              }}
            >
              Create account
            </button>
          </div>
        </header>
        <main className="content">
          {publicView === 'landing' ? (
            <LandingScreen
              onSignIn={() => {
                setAuthMode('login');
                setPublicView('auth');
              }}
              onSignUp={() => {
                setAuthMode('register');
                setPublicView('auth');
              }}
            />
          ) : (
            <AuthScreen
              mode={authMode}
              onMode={setAuthMode}
              onAuthenticated={handleAuthenticated}
              onBack={() => setPublicView('landing')}
            />
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Glass needs something behind it to refract. Fixed and inert. */}
      <div className="glass-field" aria-hidden="true" />
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="topbar glass-bar">
        <div className="brand">GRE Practice</div>
        <nav className="tabs" aria-label="Sections">
          {TABS.map((entry) => (
            <button
              key={entry.id}
              type="button"
              className={'tab' + (tab === entry.id ? ' is-active' : '')}
              onClick={() => {
                setTab(entry.id);
                if (entry.id === 'review') setReviewAttemptId(null);
              }}
            >
              {entry.label}
            </button>
          ))}
        </nav>
        <div className="topbar-right">
          <ModelPicker
            models={models}
            providers={providers}
            loading={modelsLoading}
            choice={modelChoice}
            onChange={chooseModel}
            onRefresh={() => void refreshModels()}
          />
          <ThemeToggle value={user.theme} onChange={(next) => void chooseTheme(next)} />
          <div className="account">
            <span className="account-name" title={user.email}>
              {user.displayName}
            </span>
            <button type="button" className="btn btn-quiet btn-small" onClick={() => void handleLogout()}>
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="content" id="main" tabIndex={-1}>
        {notice ? (
          <div className="banner banner-warn" role="status">
            <span>{notice}</span>
            <button type="button" className="btn btn-quiet" onClick={() => setNotice(null)}>
              Dismiss
            </button>
          </div>
        ) : null}
        {renderTab()}
      </main>
    </div>
  );
}
