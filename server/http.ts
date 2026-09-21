import type { NextFunction, Request, Response } from 'express';

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export type Handler = (req: Request, res: Response) => Promise<void>;

/** Forwards rejected promises to the error middleware. */
export function wrap(handler: Handler) {
  return (req: Request, res: Response, next: NextFunction) => {
    handler(req, res).catch(next);
  };
}

/** Express types route params loosely; normalise to a single string. */
export function param(req: Request, name: string): string {
  const value = (req.params as Record<string, string | string[]>)[name];
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}

export function text(value: unknown): string {
  if (typeof value === 'string') return value.trim();
  if (value == null) return '';
  return String(value).trim();
}

export function nullableText(value: unknown): string | null {
  const result = text(value);
  return result.length > 0 ? result : null;
}

export function nullableInt(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.round(parsed) : null;
}
