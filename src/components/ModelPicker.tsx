import { useState } from 'react';
import { choiceToValue, valueToChoice, type LocalModel, type ModelChoice, type ProviderStatus } from '../lib/ai';

interface Props {
  models: LocalModel[];
  providers: ProviderStatus[];
  loading: boolean;
  choice: ModelChoice | null;
  onChange: (choice: ModelChoice | null) => void;
  onRefresh: () => void;
}

export function ModelPicker({ models, providers, loading, choice, onChange, onRefresh }: Props) {
  const [showHelp, setShowHelp] = useState(false);
  const grouped = new Map<string, LocalModel[]>();
  for (const model of models) {
    const list = grouped.get(model.provider) ?? [];
    list.push(model);
    grouped.set(model.provider, list);
  }

  const value = choice ? choiceToValue(choice) : '';
  const known = models.some((model) => choiceToValue(model) === value);

  return (
    <div className="model-picker">
      <label className="model-select">
        <span className="model-label">Local model</span>
        <select
          value={known ? value : ''}
          disabled={loading || models.length === 0}
          onChange={(event) => onChange(event.target.value ? valueToChoice(event.target.value) : null)}
        >
          <option value="">{loading ? 'Looking…' : models.length === 0 ? 'None found' : 'Off'}</option>
          {[...grouped.entries()].map(([provider, list]) => (
            <optgroup key={provider} label={provider === 'ollama' ? 'Ollama' : 'OpenAI-compatible'}>
              {list.map((model) => (
                <option key={choiceToValue(model)} value={choiceToValue(model)}>
                  {model.label}
                  {model.detail ? ' (' + model.detail + ')' : ''}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>
      <button type="button" className="btn btn-quiet btn-small" onClick={onRefresh} disabled={loading}>
        {loading ? '…' : 'Refresh'}
      </button>
      <button
        type="button"
        className="btn btn-quiet btn-small"
        aria-expanded={showHelp}
        onClick={() => setShowHelp((previous) => !previous)}
      >
        {showHelp ? 'Hide' : 'What is this?'}
      </button>

      {showHelp ? (
        <div className="model-help card">
          <h3>Local models</h3>
          <p className="muted">
            Optional. A model running on this machine grades short-answer and essay questions, writes new questions, and
            explains a question when you ask. Nothing is sent anywhere else, and the rest of the app works without one.
          </p>
          <ul className="provider-list">
            {providers.map((provider) => (
              <li key={provider.provider}>
                <span className={'dot ' + (provider.reachable ? 'dot-ok' : 'dot-off')} aria-hidden="true" />
                <div>
                  <strong>{provider.provider === 'ollama' ? 'Ollama' : 'OpenAI-compatible server'}</strong>
                  <div className="muted">{provider.baseUrl}</div>
                  <div className="muted">
                    {provider.reachable
                      ? provider.modelCount + ' model' + (provider.modelCount === 1 ? '' : 's') + ' available'
                      : 'not reachable: ' + (provider.error ?? 'unknown error')}
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <p className="muted">
            To get started with Ollama, install it, run <code>ollama serve</code>, then pull a model with{' '}
            <code>ollama pull llama3.1:8b</code> and press Refresh. Change the addresses with OLLAMA_BASE_URL and
            LOCAL_OPENAI_BASE_URL in .env.
          </p>
        </div>
      ) : null}
    </div>
  );
}
