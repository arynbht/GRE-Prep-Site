import { useState } from 'react';
import type { ParsedExam, SectionConfig } from '../types';
import { defaultSectionLimitSec, isQuantSection } from '../lib/timing';

interface Props {
  exam: ParsedExam;
  examName: string;
  busy: boolean;
  onStart: (configs: SectionConfig[]) => void;
  onCancel: () => void;
}

export function SectionSetup({ exam, examName, busy, onStart, onCancel }: Props) {
  const [minutes, setMinutes] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const section of exam.sections) {
      initial[section.name] = String(Math.round(defaultSectionLimitSec(section) / 60));
    }
    return initial;
  });

  const configs: SectionConfig[] = exam.sections.map((section) => {
    const parsed = Number(minutes[section.name]);
    const value = Number.isFinite(parsed) && parsed > 0 ? parsed : Math.round(defaultSectionLimitSec(section) / 60);
    return { name: section.name, limitSec: Math.round(value * 60) };
  });

  const totalMinutes = configs.reduce((sum, config) => sum + config.limitSec / 60, 0);

  return (
    <section className="glass glass-strong reveal">
      <h2>Section setup</h2>
      <p className="muted">
        {examName} · {exam.sections.length} sections · {exam.questions.length} questions
      </p>
      <table className="table">
        <thead>
          <tr>
            <th>Section</th>
            <th>Questions</th>
            <th>Pace</th>
            <th>Time limit (minutes)</th>
          </tr>
        </thead>
        <tbody>
          {exam.sections.map((section) => (
            <tr key={section.name}>
              <td>{section.name}</td>
              <td>{section.questions.length}</td>
              <td className="muted">{isQuantSection(section) ? 'quant' : 'verbal'}</td>
              <td>
                <input
                  className="minutes-input"
                  type="number"
                  min={1}
                  max={240}
                  value={minutes[section.name] ?? ''}
                  onChange={(event) =>
                    setMinutes((previous) => ({ ...previous, [section.name]: event.target.value }))
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3}>Total</td>
            <td>{Math.round(totalMinutes)} minutes</td>
          </tr>
        </tfoot>
      </table>
      <p className="muted">
        Sections run in the order they first appear in the file. Once you finish a section you cannot go back to it.
      </p>
      <div className="button-row">
        <button type="button" className="btn btn-primary" disabled={busy} onClick={() => onStart(configs)}>
          {busy ? 'Starting…' : 'Start ' + exam.sections[0]?.name}
        </button>
        <button type="button" className="btn" disabled={busy} onClick={onCancel}>
          Choose a different exam
        </button>
      </div>
    </section>
  );
}
