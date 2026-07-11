import { z } from 'zod';

const email = z.string().email();
const password = z.string().min(8);

export const roleParamSchema = z.object({
  role: z.enum(['user', 'tenant']),
});

export const registerSchema = z.object({
  email,
});

export const verifySchema = z.object({
  token: z.string().min(10),
  password,
});

export const loginSchema = z.object({
  email,
  password,
});

export const emailOnlySchema = z.object({
  email,
});

export const resetSchema = z.object({
  token: z.string().min(10),
  password,
});

export const profileSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  photoUrl: z.string().url().optional(),
  email: z.string().email().optional(),
  phone: z.string().max(20).optional(),
});

export const changePasswordSchema = z.object({
  oldPassword: password,
  newPassword: password,
});
