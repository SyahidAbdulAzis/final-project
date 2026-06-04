import { Request, Response } from 'express';
import {
  changePasswordSchema,
  emailOnlySchema,
  loginSchema,
  profileSchema,
  registerSchema,
  resetSchema,
  roleParamSchema,
  verifySchema,
} from '../validations/auth.validation.js';
import {
  changePassword,
  getProfile,
  loginAccount,
  registerAccount,
  requestResetPassword,
  resendVerification,
  resetPassword,
  updateProfile,
  verifyAccount,
} from '../services/auth.service.js';
import type { ZodTypeAny } from 'zod';

function badRequest(res: Response, message: string, errors?: unknown) {
  return res.status(400).json({ message, errors });
}

function parseOrBad<T>(res: Response, schema: ZodTypeAny, data: unknown) {
  const parsed = schema.safeParse(data);
  if (parsed.success) return parsed.data;
  badRequest(res, 'Input tidak valid', parsed.error);
  return null;
}

function pickParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] || '';
  return value || '';
}

export function registerHandler(req: Request, res: Response) {
  const roleParsed = parseOrBad(res, roleParamSchema, req.params);
  const bodyParsed = parseOrBad(res, registerSchema, req.body);
  if (!roleParsed || !bodyParsed) return;
  try {
    return res.status(201).json(registerAccount(bodyParsed.email, roleParsed.role));
  } catch (error) {
    return badRequest(res, (error as Error).message);
  }
}

export async function verifyHandler(req: Request, res: Response) {
  const bodyParsed = parseOrBad(res, verifySchema, req.body);
  if (!bodyParsed) return;
  try {
    return res.json(await verifyAccount(bodyParsed.token, bodyParsed.password));
  } catch (error) {
    return badRequest(res, (error as Error).message);
  }
}

export async function loginHandler(req: Request, res: Response) {
  const roleParsed = parseOrBad(res, roleParamSchema, req.params);
  const bodyParsed = parseOrBad(res, loginSchema, req.body);
  if (!roleParsed || !bodyParsed) return;
  try {
    return res.json(await loginAccount(bodyParsed.email, roleParsed.role, bodyParsed.password));
  } catch (error) {
    return badRequest(res, (error as Error).message);
  }
}

export function resendHandler(req: Request, res: Response) {
  const bodyParsed = parseOrBad(res, emailOnlySchema, req.body);
  if (!bodyParsed) return;
  try {
    return res.json(resendVerification(bodyParsed.email));
  } catch (error) {
    return badRequest(res, (error as Error).message);
  }
}

export function forgotPasswordHandler(req: Request, res: Response) {
  const bodyParsed = parseOrBad(res, emailOnlySchema, req.body);
  if (!bodyParsed) return;
  try {
    return res.json(requestResetPassword(bodyParsed.email));
  } catch (error) {
    return badRequest(res, (error as Error).message);
  }
}

export async function resetPasswordHandler(req: Request, res: Response) {
  const bodyParsed = parseOrBad(res, resetSchema, req.body);
  if (!bodyParsed) return;
  try {
    return res.json(await resetPassword(bodyParsed.token, bodyParsed.password));
  } catch (error) {
    return badRequest(res, (error as Error).message);
  }
}

export function profileGetHandler(req: Request, res: Response) {
  const email = pickParam(req.params.email);
  if (!email) return badRequest(res, 'Email wajib diisi');
  try {
    return res.json(getProfile(email));
  } catch (error) {
    return badRequest(res, (error as Error).message);
  }
}

export function profilePatchHandler(req: Request, res: Response) {
  const bodyParsed = parseOrBad(res, profileSchema, req.body);
  const email = pickParam(req.params.email);
  if (!email) return badRequest(res, 'Email wajib diisi');
  if (!bodyParsed) return;
  try {
    return res.json(updateProfile(email, bodyParsed.fullName, bodyParsed.photoUrl));
  } catch (error) {
    return badRequest(res, (error as Error).message);
  }
}

export async function changePasswordHandler(req: Request, res: Response) {
  const bodyParsed = parseOrBad(res, changePasswordSchema, req.body);
  const email = pickParam(req.params.email);
  if (!email) return badRequest(res, 'Email wajib diisi');
  if (!bodyParsed) return;
  try {
    return res.json(await changePassword(email, bodyParsed.oldPassword, bodyParsed.newPassword));
  } catch (error) {
    return badRequest(res, (error as Error).message);
  }
}
