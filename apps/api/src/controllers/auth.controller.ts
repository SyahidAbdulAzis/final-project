import { Request, Response } from 'express';
import type { AuthRequest } from '../middlewares/auth.middleware.js';
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
import { sendEmail, verificationEmailTemplate, resetPasswordEmailTemplate } from '../utils/email.js';
import { badRequest, parseOrBad, pickParam } from '../utils/controller.utils.js';

export async function registerHandler(req: Request, res: Response) {
  const roleParsed = parseOrBad(res, roleParamSchema, req.params);
  const bodyParsed = parseOrBad(res, registerSchema, req.body);
  if (!roleParsed || !bodyParsed) return;
  try {
    const result = await registerAccount(bodyParsed.email, roleParsed.role);
    await sendEmail(bodyParsed.email, 'Verifikasi Akun StayEase', verificationEmailTemplate('', result.token));
    return res.status(201).json({ message: 'Registrasi berhasil. Silakan cek email untuk verifikasi.', token: result.token });
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
    const result = await loginAccount(bodyParsed.email, roleParsed.role, bodyParsed.password);
    return res.json(result);
  } catch (error) {
    return badRequest(res, (error as Error).message);
  }
}

export async function resendHandler(req: Request, res: Response) {
  const bodyParsed = parseOrBad(res, emailOnlySchema, req.body);
  if (!bodyParsed) return;
  try {
    const result = await resendVerification(bodyParsed.email);
    await sendEmail(bodyParsed.email, 'Verifikasi Akun StayEase', verificationEmailTemplate('', result.token));
    return res.json({ message: 'Email verifikasi telah dikirim ulang.', token: result.token });
  } catch (error) {
    return badRequest(res, (error as Error).message);
  }
}

export async function forgotPasswordHandler(req: Request, res: Response) {
  const bodyParsed = parseOrBad(res, emailOnlySchema, req.body);
  if (!bodyParsed) return;
  try {
    const result = await requestResetPassword(bodyParsed.email);
    await sendEmail(bodyParsed.email, 'Reset Password StayEase', resetPasswordEmailTemplate('', result.token));
    return res.json({ message: 'Email reset password telah dikirim.', token: result.token });
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

function forbidden(res: Response) {
  return res.status(403).json({ message: 'Akses ditolak' });
}

export async function profileGetHandler(req: AuthRequest, res: Response) {
  const email = pickParam(req.params.email);
  if (!email) return badRequest(res, 'Email wajib diisi');
  if (email.toLowerCase() !== req.user?.email.toLowerCase()) return forbidden(res);
  try {
    return res.json(await getProfile(email));
  } catch (error) {
    return badRequest(res, (error as Error).message);
  }
}

export async function profilePatchHandler(req: AuthRequest, res: Response) {
  const bodyParsed = parseOrBad(res, profileSchema, req.body);
  const email = pickParam(req.params.email);
  if (!email) return badRequest(res, 'Email wajib diisi');
  if (email.toLowerCase() !== req.user?.email.toLowerCase()) return forbidden(res);
  if (!bodyParsed) return;
  try {
    const result = await updateProfile(email, bodyParsed.fullName, bodyParsed.photoUrl, bodyParsed.email);
    if (result.verificationToken) {
      await sendEmail(result.email, 'Verifikasi Akun StayEase', verificationEmailTemplate('', result.verificationToken));
    }
    return res.json(result);
  } catch (error) {
    return badRequest(res, (error as Error).message);
  }
}

export async function changePasswordHandler(req: AuthRequest, res: Response) {
  const bodyParsed = parseOrBad(res, changePasswordSchema, req.body);
  const email = pickParam(req.params.email);
  if (!email) return badRequest(res, 'Email wajib diisi');
  if (email.toLowerCase() !== req.user?.email.toLowerCase()) return forbidden(res);
  if (!bodyParsed) return;
  try {
    return res.json(await changePassword(email, bodyParsed.oldPassword, bodyParsed.newPassword));
  } catch (error) {
    return badRequest(res, (error as Error).message);
  }
}
