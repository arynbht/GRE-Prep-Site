/**
 * Talks to model servers running on this machine.
 *
 * Two provider shapes are supported, both entirely optional:
 *   - `ollama`  — Ollama's native API (default port 11434)
 *   - `openai`  — any OpenAI-compatible server: LM Studio (1234), llama.cpp,
 *                 vLLM, text-generation-webui
 *
 * Nothing here ever leaves the machine, and no API keys are involved. If no
 * server is listening, discovery returns an empty list and the app carries on
 * without the feature.
 */

export type ProviderId = 'ollama' | 'openai';

export interface LocalModel {
  provider: ProviderId;
  /** The id to send back when calling this model. */
  model: string;
  /** What to show in the picker. */
  label: string;
  /** Parameter size or file size, when the provider reports one. */
  detail: string | null;
}

export interface ProviderStatus {
  provider: ProviderId;
  label: string;
  baseUrl: string;
  reachable: boolean;
  modelCount: number;
  error: string | null;
}

const OLLAMA_BASE = (process.env.OLLAMA_BASE_URL ?? 'http://127.0.0.1:11434').replace(/\/+$/, '');
const OPENAI_BASE = (process.env.LOCAL_OPENAI_BASE_URL ?? 'http://127.0.0.1:1234/v1').replace(/\/+$/, '');
const TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS ?? 180000);
/**
 * Ollama's default context window is small enough to truncate a multi-question
 * generation mid-JSON, so the window and the output budget are set explicitly.
 */
const CONTEXT_TOKENS = Number(process.env.AI_CONTEXT_TOKENS ?? 8192);
/** Discovery must stay snappy: the picker refreshes on every page load. */
const DISCOVERY_TIMEOUT_MS = 2500;

export const PROVIDER_LABELS: Record<ProviderId, string> = {
  ollama: 'Ollama',
  openai: 'OpenAI-compatible (LM Studio, llama.cpp, vLLM)',
};

export function baseUrlFor(provider: ProviderId): string {
  return provider === 'ollama' ? OLLAMA_BASE : OPENAI_BASE;
}

async function fetchJson(url: string, init: RequestInit, timeoutMs: number): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    const body = await response.text();
    if (!response.ok) {
      const detail = body.slice(0, 300).trim();
      throw new Error('HTTP ' + response.status + (detail ? ': ' + detail : ''));
    }
    return body ? JSON.parse(body) : null;
  } catch (cause) {
    if (cause instanceof Error && cause.name === 'AbortError') {
      throw new Error('timed out after ' + Math.round(timeoutMs / 1000) + 's');
    }
    // Node wraps connection failures as "fetch failed"; the useful code is nested.
    if (cause instanceof Error && cause.message === 'fetch failed') {
      const inner = (cause as { cause?: { code?: string; message?: string } }).cause;
      const code = inner?.code ?? '';
      const origin = new URL(url).origin;
      if (code === 'ECONNREFUSED') throw new Error('nothing is listening on ' + origin);
      throw new Error('could not reach ' + origin + (code ? ' (' + code + ')' : ''));
    }
    throw cause;
  } finally {
    clearTimeout(timer);
  }
}

function humanSize(bytes: unknown): string | null {
  const value = Number(bytes);
  if (!Number.isFinite(value) || value <= 0) return null;
  const gb = value / 1024 ** 3;
  return gb >= 1 ? gb.toFixed(1) + ' GB' : Math.round(value / 1024 ** 2) + ' MB';
}

async function listOllama(): Promise<LocalModel[]> {
  const body = (await fetchJson(OLLAMA_BASE + '/api/tags', { method: 'GET' }, DISCOVERY_TIMEOUT_MS)) as {
    models?: { name?: string; size?: number; details?: { parameter_size?: string } }[];
  } | null;
  return (body?.models ?? [])
    .filter((entry) => typeof entry.name === 'string' && entry.name.length > 0)
    .map((entry) => ({
      provider: 'ollama' as const,
      model: entry.name as string,
      label: entry.name as string,
      detail: entry.details?.parameter_size ?? humanSize(entry.size),
    }));
}

async function listOpenAi(): Promise<LocalModel[]> {
  const body = (await fetchJson(OPENAI_BASE + '/models', { method: 'GET' }, DISCOVERY_TIMEOUT_MS)) as {
    data?: { id?: string }[];
  } | null;
  return (body?.data ?? [])
    .filter((entry) => typeof entry.id === 'string' && entry.id.length > 0)
    .map((entry) => ({
      provider: 'openai' as const,
      model: entry.id as string,
      label: entry.id as string,
      detail: null,
    }));
}

/** Probes both providers in parallel. A provider that is not running is not an error. */
export async function discoverModels(): Promise<{ models: LocalModel[]; providers: ProviderStatus[] }> {
  const probes: [ProviderId, string, () => Promise<LocalModel[]>][] = [
    ['ollama', OLLAMA_BASE, listOllama],
    ['openai', OPENAI_BASE, listOpenAi],
  ];

  const settled = await Promise.all(
    probes.map(async ([provider, baseUrl, list]): Promise<{ status: ProviderStatus; models: LocalModel[] }> => {
      try {
        const models = await list();
        return {
          status: {
            provider,
            label: PROVIDER_LABELS[provider],
            baseUrl,
            reachable: true,
            modelCount: models.length,
            error: null,
          },
          models,
        };
      } catch (cause) {
        return {
          status: {
            provider,
            label: PROVIDER_LABELS[provider],
            baseUrl,
            reachable: false,
            modelCount: 0,
            error: cause instanceof Error ? cause.message : String(cause),
          },
          models: [],
        };
      }
    }),
  );

  return {
    models: settled.flatMap((entry) => entry.models),
    providers: settled.map((entry) => entry.status),
  };
}

interface OllamaChatResponse {
  message?: { content?: string; thinking?: string };
  done?: boolean;
  done_reason?: string;
}

/**
 * Thrown when a local model starts an answer and then wedges. With Ollama's
 * JSON mode this happens when the model emits a raw double quote inside a
 * string: the constrained decoder closes the value, cannot recover, and returns
 * `done: false` with the reply padded out in spaces.
 */
export class UnfinishedReplyError extends Error {
  partial: string;
  constructor(partial: string) {
    super('the model started an answer and then stopped without finishing it');
    this.name = 'UnfinishedReplyError';
    this.partial = partial;
  }
}

export interface ChatOptions {
  provider: ProviderId;
  model: string;
  system: string;
  user: string;
  /** Ask the server to constrain output to JSON where it supports that. */
  json?: boolean;
  temperature?: number;
  /** Upper bound on generated tokens. Long JSON replies need a large budget. */
  maxTokens?: number;
}

/** Sends one non-streaming chat completion and returns the raw text reply. */
export async function chat(options: ChatOptions): Promise<string> {
  const { provider, model, system, user, json = false, temperature = 0.2, maxTokens = 1024 } = options;
  const messages = [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];

  if (provider === 'ollama') {
    const send = async (disableThinking: boolean) => {
      return (await fetchJson(
        OLLAMA_BASE + '/api/chat',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model,
            messages,
            stream: false,
            // Reasoning models spend their whole token budget on hidden
            // thinking and return empty content, so it is turned off.
            ...(disableThinking ? { think: false } : {}),
            ...(json ? { format: 'json' } : {}),
            options: { temperature, num_predict: maxTokens, num_ctx: CONTEXT_TOKENS },
          }),
        },
        TIMEOUT_MS,
      )) as OllamaChatResponse | null;
    };

    let body: OllamaChatResponse | null;
    try {
      body = await send(true);
    } catch (cause) {
      // Older Ollama builds reject the `think` field outright.
      const message = cause instanceof Error ? cause.message : String(cause);
      if (!/think/i.test(message)) throw cause;
      body = await send(false);
    }

    const content = body?.message?.content?.trim() ?? '';
    // `done: false` means the generation wedged rather than completed.
    if (body && body.done === false) throw new UnfinishedReplyError(content);
    if (content) return content;
    // If thinking could not be disabled, the answer may be inside it.
    return body?.message?.thinking?.trim() ?? '';
  }

  const body = (await fetchJson(
    OPENAI_BASE + '/chat/completions',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer local' },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        stream: false,
        max_tokens: maxTokens,
        ...(json ? { response_format: { type: 'json_object' } } : {}),
      }),
    },
    TIMEOUT_MS,
  )) as { choices?: { message?: { content?: string } }[] } | null;
  return body?.choices?.[0]?.message?.content ?? '';
}

/**
 * Asks for JSON and parses it, retrying once when the model wedges or returns
 * something unusable. The retry raises the temperature so a deterministic model
 * takes a different path instead of failing the same way twice.
 */
export async function chatJson<T>(options: ChatOptions): Promise<T> {
  const attempt = async (temperature: number, extraRule: boolean): Promise<T> => {
    const reply = await chat({
      ...options,
      json: true,
      temperature,
      system: extraRule ? options.system + ' ' + NO_QUOTES_RULE : options.system,
    });
    return extractJson<T>(reply);
  };

  try {
    return await attempt(options.temperature ?? 0, false);
  } catch (first) {
    const recoverable =
      first instanceof UnfinishedReplyError || (first instanceof Error && /usable JSON|cut off/i.test(first.message));
    if (!recoverable) throw first;
    try {
      return await attempt(0.5, true);
    } catch (second) {
      if (second instanceof UnfinishedReplyError) {
        throw new Error(
          'the model kept breaking its own JSON, usually by putting a quote mark inside a value. ' +
            'Try a different local model.',
        );
      }
      throw second;
    }
  }
}

/** Appended on a retry: the usual cause of a wedged JSON reply. */
const NO_QUOTES_RULE =
  'Write every string value as plain prose. Never put a double quote character inside a string value; ' +
  'use single quotes if you need to quote something.';

/**
 * Pulls the first JSON value out of a model reply. Small local models like to
 * wrap JSON in prose or a fenced block, so a plain JSON.parse is not enough.
 */
export function extractJson<T>(text: string): T {
  const trimmed = text.trim();
  if (!trimmed) throw new Error('the model returned an empty reply');

  const candidates: string[] = [];
  const fenced = /```(?:json)?\s*([\s\S]*?)```/i.exec(trimmed);
  if (fenced) candidates.push(fenced[1]);
  candidates.push(trimmed);

  for (const candidate of candidates) {
    const source = candidate.trim();
    try {
      return JSON.parse(source) as T;
    } catch {
      // Fall through to brace matching.
    }
    for (const [open, close] of [
      ['{', '}'],
      ['[', ']'],
    ]) {
      const start = source.indexOf(open);
      const end = source.lastIndexOf(close);
      if (start !== -1 && end > start) {
        try {
          return JSON.parse(source.slice(start, end + 1)) as T;
        } catch {
          // Try the next shape.
        }
      }
    }
  }
  // A reply that opens a JSON value but never closes it was cut off, which is
  // the usual failure on a small context window rather than a formatting slip.
  const opensJson = trimmed.startsWith('{') || trimmed.startsWith('[');
  const closed = trimmed.endsWith('}') || trimmed.endsWith(']');
  if (opensJson && !closed) {
    throw new Error(
      'the model ran out of room and its reply was cut off mid-answer. Ask for fewer questions, ' +
        'or raise AI_CONTEXT_TOKENS in .env (currently ' +
        CONTEXT_TOKENS +
        '). The reply began: ' +
        trimmed.slice(0, 160),
    );
  }
  throw new Error('the model did not return usable JSON. It replied: ' + trimmed.slice(0, 200));
}
