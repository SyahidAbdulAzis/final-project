import type { Response } from 'express';
import type { ZodSchema } from 'zod';

export function badRequest(res: Response, message: string, errors?: unknown) {
  return res.status(400).json({ message, errors });
}

export function notFound(res: Response, message = 'Data tidak ditemukan') {
  return res.status(404).json({ message });
}

export function pickParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] || '';
  return value || '';
}

export function parseOrBad<T>(res: Response, schema: ZodSchema<T>, data: unknown): T | null {
  const parsed = schema.safeParse(data);
  if (parsed.success) return parsed.data;
  badRequest(res, 'Input tidak valid', parsed.error);
  return null;
}
