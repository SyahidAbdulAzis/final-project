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

export function handleError(res: Response, error: unknown) {
  const msg = error instanceof Error ? error.message : 'Terjadi kesalahan';
  if (msg.includes('Foreign key') || msg.includes('constraint') || msg.includes('Prisma')) {
    return badRequest(res, 'Operasi gagal: data terkait masih digunakan atau input tidak valid');
  }
  const safeMessages = [
    'Email sudah terdaftar',
    'Akun tidak ditemukan',
    'Akun belum terverifikasi',
    'Password belum diatur',
    'Email atau password salah',
    'Token tidak valid atau kadaluarsa',
    'Akun tidak valid',
    'Reset password hanya untuk akun registrasi email',
    'Properti tidak ditemukan atau bukan milik Anda',
    'Input tidak valid',
  ];
  const isSafe = safeMessages.some((s) => msg === s);
  return badRequest(res, isSafe ? msg : 'Terjadi kesalahan, silakan coba lagi');
}
