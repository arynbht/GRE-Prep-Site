import { useId, type InputHTMLAttributes, type ReactNode } from 'react';

/**
 * Form fields.
 *
 * ANATOMY — every field, without exception
 *   Label                        always visible, never a placeholder
 *   ┌──────────────────────────┐
 *   │ control                  │
 *   └──────────────────────────┘
 *   Helper text or error        one or the other, never both
 *
 * WHY THE LABEL IS NEVER A PLACEHOLDER
 * A placeholder disappears the moment you type, so the field loses its name at
 * exactly the point you might want to check it. It also fails on autofill, on
 * translation, and for anyone returning to a half-filled form. This is the
 * single most common accessibility regression in a form system, so the label
 * is a required prop with no "hidden" option.
 */

interface FieldShellProps {
  id: string;
  label: string;
  helper?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}

function FieldShell({ id, label, helper, error, required, children }: FieldShellProps) {
  const helperId = id + '-helper';
  const errorId = id + '-error';
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-body-sm font-medium text-primary">
        {label}
        {required ? (
          <>
            <span aria-hidden="true"> *</span>
            <span className="sr-only"> (required)</span>
          </>
        ) : null}
      </label>
      {children}
      {error ? (
        <p id={errorId} className="vlm-field-message text-caption text-error" data-visible="true" role="alert">
          {error}
        </p>
      ) : helper ? (
        <p id={helperId} className="text-caption text-tertiary">
          {helper}
        </p>
      ) : null}
    </div>
  );
}

const CONTROL =
  'vlm-field w-full rounded-md border border-border-strong bg-surface-raised px-3 text-body text-primary ' +
  'placeholder:text-tertiary read-only:bg-surface-sunken disabled:opacity-50 disabled:cursor-not-allowed ' +
  'aria-[invalid=true]:border-error-border';

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className' | 'id'> {
  label: string;
  helper?: string;
  error?: string;
}

export function TextField({ label, helper, error, required, ...rest }: TextFieldProps) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} helper={helper} error={error} required={required}>
      <input
        {...rest}
        id={id}
        required={required}
        className={CONTROL + ' h-10'}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? id + '-error' : helper ? id + '-helper' : undefined}
      />
    </FieldShell>
  );
}

/**
 * Numeric entry for GRE free-response.
 *
 * `inputMode="decimal"` rather than `type="number"`: type=number brings spinner
 * buttons nobody wants on a test, silently discards input the browser considers
 * invalid, and on some Androids hides the minus sign. A text input with a
 * numeric keypad is the correct combination.
 */
export interface NumericEntryProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  helper?: string;
  error?: string;
  suffix?: string;
  disabled?: boolean;
}

export function NumericEntry({
  label,
  value,
  onValueChange,
  helper,
  error,
  suffix,
  disabled,
}: NumericEntryProps) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} helper={helper} error={error}>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          spellCheck={false}
          disabled={disabled}
          className={CONTROL + ' h-12 max-w-40 tabular text-center'}
          value={value}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? id + '-error' : helper ? id + '-helper' : undefined}
          onChange={(event) => onValueChange(event.target.value)}
        />
        {suffix ? (
          <span className="text-body text-secondary" aria-hidden="true">
            {suffix}
          </span>
        ) : null}
      </div>
    </FieldShell>
  );
}

/**
 * Fraction entry: two stacked fields with a rule between.
 *
 * The rule is a border on the wrapper, not a character, so it scales with the
 * fields and stays aligned at 200% zoom. Each field is separately labelled —
 * "numerator" and "denominator" — because a screen reader user landing in the
 * second box otherwise has no way to know which half they are in.
 */
export interface FractionEntryProps {
  label: string;
  numerator: string;
  denominator: string;
  onNumeratorChange: (value: string) => void;
  onDenominatorChange: (value: string) => void;
  helper?: string;
  error?: string;
  disabled?: boolean;
}

export function FractionEntry({
  label,
  numerator,
  denominator,
  onNumeratorChange,
  onDenominatorChange,
  helper,
  error,
  disabled,
}: FractionEntryProps) {
  const id = useId();
  const numeratorId = id + '-num';
  const denominatorId = id + '-den';

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-body-sm font-medium text-primary">{label}</legend>
      <div className="inline-flex w-fit flex-col items-stretch" role="group" aria-labelledby={id + '-legend'}>
        <label htmlFor={numeratorId} className="sr-only">
          Numerator
        </label>
        <input
          id={numeratorId}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          disabled={disabled}
          className={CONTROL + ' h-11 w-28 rounded-b-none text-center tabular'}
          value={numerator}
          aria-invalid={error ? true : undefined}
          onChange={(event) => onNumeratorChange(event.target.value)}
        />
        {/* The fraction rule. Shared border, so the two boxes read as one control. */}
        <div className="h-px bg-primary" aria-hidden="true" />
        <label htmlFor={denominatorId} className="sr-only">
          Denominator
        </label>
        <input
          id={denominatorId}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          disabled={disabled}
          className={CONTROL + ' h-11 w-28 rounded-t-none text-center tabular'}
          value={denominator}
          aria-invalid={error ? true : undefined}
          onChange={(event) => onDenominatorChange(event.target.value)}
        />
      </div>
      {error ? (
        <p className="vlm-field-message text-caption text-error" data-visible="true" role="alert">
          {error}
        </p>
      ) : helper ? (
        <p className="text-caption text-tertiary">{helper}</p>
      ) : null}
    </fieldset>
  );
}
